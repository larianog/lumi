import { createHash, randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  getFamilyForSession,
  getStudyMaterialsByFamily,
  getStudyMaterialsByProfile,
  markStudyMaterialFailed,
  markStudyMaterialReady,
  reserveStudyMaterial,
  updateDb,
} from '@/lib/db';
import { calculateAge } from '@/lib/age';
import {
  analyzeMaterial,
  defaultLiteracyLevel,
  getExtractionModel,
  LITERACY_LEVELS,
  MATERIAL_EXTRACTION_PROMPT_VERSION,
  MaterialExtractionError,
} from '@/lib/material-extraction';
import { getSessionToken } from '@/lib/lumi-session';
import type { LiteracyLevel } from '@/types/database';
import { storeMaterialFile, SUPPORTED_MATERIAL_MIME_TYPES } from '@/lib/material-storage';
import {
  cleanupExpiredStudyMaterialContent,
  getDemoSessionScope,
  toStudyMaterialDto,
} from '@/lib/study-materials';

export const runtime = 'nodejs';
// Vision analysis of a multi-page PDF can take a while.
export const maxDuration = 60;

const MAX_MATERIAL_SIZE_BYTES = 10 * 1024 * 1024;
const DEFAULT_RETENTION_HOURS = 24 * 7;

function retentionHours() {
  const configured = Number(process.env.LUMI_MATERIAL_RETENTION_HOURS);
  if (!Number.isFinite(configured)) return DEFAULT_RETENTION_HOURS;
  return Math.min(24 * 30, Math.max(1, Math.floor(configured)));
}

function safeFileName(name: string) {
  return name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 160) || 'material';
}

function matchesFileSignature(bytes: Buffer, mimeType: string) {
  if (mimeType === 'application/pdf') {
    return bytes.length >= 5 && bytes.subarray(0, 5).toString('ascii') === '%PDF-';
  }
  if (mimeType === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mimeType === 'image/webp') {
    return bytes.length >= 12
      && bytes.subarray(0, 4).toString('ascii') === 'RIFF'
      && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  return false;
}

export async function GET(request: NextRequest) {
  try {
    await cleanupExpiredStudyMaterialContent();
    const token = getSessionToken(request);
    const result = await getFamilyForSession(token);
    if (!result) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });

    const profileId = request.nextUrl.searchParams.get('profileId');
    const familyScope = request.nextUrl.searchParams.get('scope') === 'family';
    const demoSessionId = getDemoSessionScope(result.session);

    if (profileId) {
      const ownsProfile = result.family.profiles.some((profile) => profile.id === profileId);
      if (!ownsProfile) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
      const materials = await getStudyMaterialsByProfile(result.family.id, profileId, demoSessionId);
      return NextResponse.json(materials.map((material) => toStudyMaterialDto(material)));
    }

    if (familyScope) {
      const materials = await getStudyMaterialsByFamily(result.family.id, demoSessionId);
      return NextResponse.json(materials.map((material) => toStudyMaterialDto(material)));
    }

    return NextResponse.json({ error: 'Informe profileId ou scope=family.' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching study materials:', error);
    return NextResponse.json({ error: 'Não foi possível carregar os materiais.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let reservedMaterialId: string | undefined;
  let storageKey: string | undefined;
  let uploadedPdf = false;

  try {
    await cleanupExpiredStudyMaterialContent();
    const token = getSessionToken(request);
    const result = await getFamilyForSession(token);
    if (!result) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });

    const formData = await request.formData();
    const profileId = formData.get('profileId');
    const file = formData.get('file');
    const requestedLiteracy = formData.get('literacyLevel');
    if (typeof profileId !== 'string' || !(file instanceof File)) {
      return NextResponse.json({ error: 'Envie um perfil e um arquivo.' }, { status: 400 });
    }

    const profile = result.family.profiles.find((candidate) => candidate.id === profileId);
    if (!profile || profile.type !== 'child') {
      return NextResponse.json({ error: 'Perfil infantil não encontrado.' }, { status: 404 });
    }
    if (requestedLiteracy !== null
      && (typeof requestedLiteracy !== 'string' || !LITERACY_LEVELS.includes(requestedLiteracy as LiteracyLevel))) {
      return NextResponse.json({ error: 'Escolha como a criança lê hoje.' }, { status: 400 });
    }
    if (!SUPPORTED_MATERIAL_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Use uma foto (JPG, PNG, WebP) ou um PDF.' }, { status: 415 });
    }
    if (file.size <= 0 || file.size > MAX_MATERIAL_SIZE_BYTES) {
      return NextResponse.json({ error: 'O arquivo deve ter no máximo 10 MB.' }, { status: 413 });
    }

    uploadedPdf = file.type === 'application/pdf';
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!matchesFileSignature(bytes, file.type)) {
      return NextResponse.json({ error: 'O conteúdo do arquivo não corresponde ao formato informado.' }, { status: 415 });
    }

    const age = calculateAge(profile.birthDate);
    const literacyLevel = (requestedLiteracy as LiteracyLevel | null) ?? defaultLiteracyLevel(age);
    const model = getExtractionModel();
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const now = Date.now();

    const reservation = await reserveStudyMaterial({
      id: randomUUID(),
      familyId: result.family.id,
      profileId,
      demoSessionId: getDemoSessionScope(result.session),
      originalName: safeFileName(file.name),
      mimeType: file.type,
      size: file.size,
      sha256,
      literacyLevel,
      extractionModel: model,
      promptVersion: MATERIAL_EXTRACTION_PROMPT_VERSION,
      expiresAt: new Date(now + retentionHours() * 60 * 60 * 1000).toISOString(),
    });
    reservedMaterialId = reservation.material.id;

    if (!reservation.created) {
      return NextResponse.json({
        material: toStudyMaterialDto(reservation.material, reservation.material.extractionStatus === 'ready'),
        cached: true,
      });
    }

    storageKey = await storeMaterialFile(reservation.material.id, file.type, bytes);
    const extraction = await analyzeMaterial(bytes, file.type, { age, literacyLevel });

    // For non-didactic materials, assign to parent's profile
    const targetProfileId = extraction.analysis?.isDidactic === false
      ? result.family.profiles.find((p) => p.type === 'adult')?.id || profileId
      : profileId;

    // If we need to change the profile, update the reservation
    if (targetProfileId !== profileId) {
      await updateDb((db) => {
        const material = db.materials.find((candidate) => candidate.id === reservedMaterialId);
        if (material) material.profileId = targetProfileId;
      });
    }

    const material = await markStudyMaterialReady(
      reservation.material.id,
      storageKey,
      extraction.text,
      extraction.analysis,
      extraction.analysis?.isDidactic,
    );
    return NextResponse.json({
      material: toStudyMaterialDto(material, true),
      profileId: targetProfileId,
      isDidactic: extraction.analysis?.isDidactic,
      cached: false,
    }, { status: 201 });
  } catch (error) {
    if (reservedMaterialId) {
      const errorCode = error instanceof MaterialExtractionError ? error.code : 'INTERNAL';
      await markStudyMaterialFailed(reservedMaterialId, errorCode, storageKey).catch(() => {});
    }

    if (error instanceof MaterialExtractionError) {
      const responses: Record<MaterialExtractionError['code'], [number, string]> = {
        CONFIGURATION: [503, 'A leitura de lições ainda não foi configurada (OPENAI_API_KEY).'],
        TIMEOUT: [504, 'A leitura demorou demais. Tente uma foto menor ou menos páginas.'],
        UNREADABLE: [422, uploadedPdf
          ? `${error.message} Se for uma apostila, envie só as páginas da lição (um PDF de poucas páginas ou uma foto).`
          : error.message],
        EMPTY_RESPONSE: [422, 'Não encontrei questões nessa atividade. Tente uma foto mais nítida.'],
        PROVIDER: [502, 'Não foi possível ler a atividade agora. Tente novamente.'],
      };
      if (error.code === 'CONFIGURATION') console.error('Material analysis is not configured:', error.message);
      const [status, message] = responses[error.code];
      return NextResponse.json({ error: message, materialId: reservedMaterialId }, { status });
    }

    console.error('Error processing study material:', error);
    return NextResponse.json({ error: 'Não foi possível processar o material.' }, { status: 500 });
  }
}

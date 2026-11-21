import { createHash, randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  getFamilyForSession,
  getStudyMaterialsByFamily,
  getStudyMaterialsByProfile,
  hasAdultAccess,
  markStudyMaterialFailed,
  markStudyMaterialReady,
  reserveStudyMaterial,
} from '@/lib/db';
import {
  extractTextFromMaterial,
  getFeitaModel,
  MATERIAL_EXTRACTION_PROMPT_VERSION,
  MaterialExtractionError,
} from '@/lib/feita-extraction';
import { getSessionToken } from '@/lib/lumi-session';
import { storeMaterialFile, SUPPORTED_MATERIAL_MIME_TYPES } from '@/lib/material-storage';
import {
  cleanupExpiredStudyMaterialContent,
  getDemoSessionScope,
  toStudyMaterialDto,
} from '@/lib/study-materials';

export const runtime = 'nodejs';

const MAX_MATERIAL_SIZE_BYTES = 8 * 1024 * 1024;
const DEFAULT_RETENTION_HOURS = 24 * 7;

function retentionHours() {
  const configured = Number(process.env.LUMI_MATERIAL_RETENTION_HOURS);
  if (!Number.isFinite(configured)) return DEFAULT_RETENTION_HOURS;
  return Math.min(24 * 30, Math.max(1, Math.floor(configured)));
}

function safeFileName(name: string) {
  return name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 160) || 'material';
}

function matchesImageSignature(bytes: Buffer, mimeType: string) {
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
      if (!(await hasAdultAccess(token))) {
        return NextResponse.json({ error: 'Confirme a senha do responsável.' }, { status: 403 });
      }
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

  try {
    await cleanupExpiredStudyMaterialContent();
    const result = await getFamilyForSession(getSessionToken(request));
    if (!result) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });

    const formData = await request.formData();
    const profileId = formData.get('profileId');
    const file = formData.get('file');
    if (typeof profileId !== 'string' || !(file instanceof File)) {
      return NextResponse.json({ error: 'Envie um perfil e um arquivo.' }, { status: 400 });
    }

    const profile = result.family.profiles.find((candidate) => candidate.id === profileId);
    if (!profile || profile.type !== 'child') {
      return NextResponse.json({ error: 'Perfil infantil não encontrado.' }, { status: 404 });
    }
    if (!SUPPORTED_MATERIAL_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Use uma imagem JPG, PNG ou WebP.' }, { status: 415 });
    }
    if (file.size <= 0 || file.size > MAX_MATERIAL_SIZE_BYTES) {
      return NextResponse.json({ error: 'A imagem deve ter no máximo 8 MB.' }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (!matchesImageSignature(bytes, file.type)) {
      return NextResponse.json({ error: 'O conteúdo do arquivo não corresponde ao formato informado.' }, { status: 415 });
    }

    const model = getFeitaModel();
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
    const extraction = await extractTextFromMaterial(bytes, file.type);
    const material = await markStudyMaterialReady(reservation.material.id, storageKey, extraction.text);
    return NextResponse.json({
      material: toStudyMaterialDto(material, true),
      cached: false,
    }, { status: 201 });
  } catch (error) {
    if (reservedMaterialId) {
      const errorCode = error instanceof MaterialExtractionError ? error.code : 'INTERNAL';
      await markStudyMaterialFailed(reservedMaterialId, errorCode, storageKey).catch(() => {});
    }

    if (error instanceof MaterialExtractionError) {
      const status = error.code === 'CONFIGURATION'
        ? 500
        : error.code === 'TIMEOUT'
          ? 504
          : error.code === 'EMPTY_RESPONSE'
            ? 422
            : 502;
      return NextResponse.json({
        error: error.code === 'EMPTY_RESPONSE'
          ? 'Não encontramos texto legível nessa imagem.'
          : 'Não foi possível extrair o texto agora. Tente novamente.',
        materialId: reservedMaterialId,
      }, { status });
    }

    console.error('Error processing study material:', error);
    return NextResponse.json({ error: 'Não foi possível processar o material.' }, { status: 500 });
  }
}

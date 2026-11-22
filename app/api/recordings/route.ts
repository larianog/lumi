import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  getFamilyForSession,
  getRecordingsByFamily,
  getStudyMaterial,
  saveRecording,
} from '@/lib/db';
import { getSessionToken } from '@/lib/lumi-session';
import { baseMimeType, storeRecordingFile, SUPPORTED_RECORDING_MIME_TYPES } from '@/lib/recording-storage';
import { cleanupExpiredRecordings, recordingRetentionHours, toRecordingDto } from '@/lib/recordings';
import { getDemoSessionScope, ownsStudyMaterial } from '@/lib/study-materials';
import type { RecordingTurn } from '@/types/database';

export const runtime = 'nodejs';

const MAX_RECORDING_BYTES = 30 * 1024 * 1024;
const MAX_TURNS = 300;
const MAX_TURN_CHARS = 1000;

function parseTranscript(value: FormDataEntryValue | null): RecordingTurn[] {
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((turn): turn is { speaker: string; text: string } =>
        typeof turn === 'object' && turn !== null
        && (turn.speaker === 'child' || turn.speaker === 'lumi')
        && typeof turn.text === 'string')
      .slice(0, MAX_TURNS)
      .map((turn) => ({ speaker: turn.speaker as RecordingTurn['speaker'], text: turn.text.trim().slice(0, MAX_TURN_CHARS) }))
      .filter((turn) => turn.text);
  } catch {
    return [];
  }
}

/** Parent area: list the family's session recordings. */
export async function GET(request: NextRequest) {
  try {
    await cleanupExpiredRecordings();
    const token = getSessionToken(request);
    const result = await getFamilyForSession(token);
    if (!result) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
    const recordings = await getRecordingsByFamily(result.family.id, getDemoSessionScope(result.session));
    return NextResponse.json(recordings.map(toRecordingDto));
  } catch (error) {
    console.error('Error listing recordings:', error);
    return NextResponse.json({ error: 'Não foi possível carregar as gravações.' }, { status: 500 });
  }
}

/** Child's device: upload the audio of a session that just ended. */
export async function POST(request: NextRequest) {
  try {
    const result = await getFamilyForSession(getSessionToken(request));
    if (!result) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });

    const form = await request.formData();
    const profileId = form.get('profileId');
    const file = form.get('file');
    const profile = result.family.profiles.find((candidate) => candidate.id === profileId);
    if (!profile || profile.type !== 'child') {
      return NextResponse.json({ error: 'Perfil infantil não encontrado.' }, { status: 404 });
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Envie o áudio da sessão.' }, { status: 400 });
    }
    if (file.size > MAX_RECORDING_BYTES) {
      return NextResponse.json({ error: 'A gravação é muito grande.' }, { status: 413 });
    }
    const mimeType = baseMimeType(file.type);
    if (!SUPPORTED_RECORDING_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: 'Formato de áudio não suportado.' }, { status: 415 });
    }

    const demoSessionId = getDemoSessionScope(result.session);
    // Link to a study material only if it belongs to the same child and scope.
    const requestedMaterialId = form.get('materialId');
    let materialId: string | undefined;
    if (typeof requestedMaterialId === 'string' && requestedMaterialId) {
      const material = await getStudyMaterial(requestedMaterialId);
      if (material && material.profileId === profile.id && ownsStudyMaterial(material, result.family.id, result.session)) {
        materialId = material.id;
      }
    }

    const startedAtValue = form.get('startedAt');
    const startedAt = typeof startedAtValue === 'string' && !Number.isNaN(Date.parse(startedAtValue))
      ? new Date(startedAtValue).toISOString()
      : new Date().toISOString();
    const durationMs = Math.max(0, Math.min(Number(form.get('durationMs')) || 0, 6 * 60 * 60 * 1000));
    const titleValue = form.get('title');
    const title = (typeof titleValue === 'string' ? titleValue.trim().slice(0, 120) : '') || 'Conversa com o Lumi';

    const id = randomUUID();
    const storageKey = await storeRecordingFile(id, mimeType, Buffer.from(await file.arrayBuffer()));
    const now = Date.now();
    const recording = await saveRecording({
      id,
      familyId: result.family.id,
      profileId: profile.id,
      demoSessionId,
      materialId,
      title,
      mimeType,
      size: file.size,
      durationMs,
      storageKey,
      transcript: parseTranscript(form.get('transcript')),
      startedAt,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + recordingRetentionHours() * 60 * 60 * 1000).toISOString(),
    });
    return NextResponse.json({ id: recording.id }, { status: 201 });
  } catch (error) {
    console.error('Error saving recording:', error);
    return NextResponse.json({ error: 'Não foi possível salvar a gravação.' }, { status: 500 });
  }
}

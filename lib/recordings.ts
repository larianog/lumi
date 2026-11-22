import { purgeExpiredRecordings } from '@/lib/db';
import { deleteRecordingFiles } from '@/lib/recording-storage';
import type { SessionRecording } from '@/types/database';
import type { SessionRecordingDto } from '@/types/recordings';

const DEFAULT_RETENTION_HOURS = 24 * 7;

/** Hours to keep session audio; `LUMI_RECORDING_RETENTION_HOURS`, 1–720, default 168. */
export function recordingRetentionHours() {
  const configured = Number(process.env.LUMI_RECORDING_RETENTION_HOURS);
  if (!Number.isFinite(configured)) return DEFAULT_RETENTION_HOURS;
  return Math.min(24 * 30, Math.max(1, Math.floor(configured)));
}

export function toRecordingDto(recording: SessionRecording): SessionRecordingDto {
  return {
    id: recording.id,
    profileId: recording.profileId,
    materialId: recording.materialId,
    title: recording.title,
    mimeType: recording.mimeType,
    size: recording.size,
    durationMs: recording.durationMs,
    transcript: recording.transcript,
    startedAt: recording.startedAt,
    createdAt: recording.createdAt,
    expiresAt: recording.expiresAt,
  };
}

export async function cleanupExpiredRecordings() {
  const storageKeys = await purgeExpiredRecordings();
  if (storageKeys.length === 0) return;
  try {
    await deleteRecordingFiles(storageKeys);
  } catch {
    console.warn('Could not remove one or more expired recording files.');
  }
}

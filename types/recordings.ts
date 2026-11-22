import type { RecordingTurn } from './database';

/** What the parent area sees about a session recording (no storage paths). */
export type SessionRecordingDto = {
  id: string;
  profileId: string;
  materialId?: string;
  title: string;
  mimeType: string;
  size: number;
  durationMs: number;
  transcript: RecordingTurn[];
  startedAt: string;
  createdAt: string;
  expiresAt: string;
};

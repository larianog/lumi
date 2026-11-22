import { promises as fs } from 'node:fs';
import path from 'node:path';

/** Private audio of Lumi sessions. Never under public/; served only to adults. */
const RECORDING_DIR = path.join(process.cwd(), 'data', 'recordings');

const extensionByMimeType: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
};

export const SUPPORTED_RECORDING_MIME_TYPES = Object.keys(extensionByMimeType);

/** "audio/webm;codecs=opus" → "audio/webm". */
export function baseMimeType(mimeType: string) {
  return mimeType.split(';')[0].trim().toLowerCase();
}

export async function storeRecordingFile(id: string, mimeType: string, bytes: Buffer) {
  const extension = extensionByMimeType[baseMimeType(mimeType)];
  if (!extension) throw new Error('UNSUPPORTED_RECORDING_TYPE');
  await fs.mkdir(RECORDING_DIR, { recursive: true });
  const storageKey = `${id}.${extension}`;
  await fs.writeFile(path.join(RECORDING_DIR, storageKey), bytes, { flag: 'wx' });
  return storageKey;
}

export function recordingFilePath(storageKey: string) {
  if (path.basename(storageKey) !== storageKey) throw new Error('INVALID_STORAGE_KEY');
  return path.join(RECORDING_DIR, storageKey);
}

export async function deleteRecordingFiles(storageKeys: string[]) {
  await Promise.all(storageKeys.map(async (storageKey) => {
    if (path.basename(storageKey) !== storageKey) return;
    await fs.unlink(path.join(RECORDING_DIR, storageKey)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }));
}

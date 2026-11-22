import { deletePrivateFiles, readPrivateFile, storePrivateFile } from '@/lib/private-file-storage';

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
  const storageKey = `${id}.${extension}`;
  return storePrivateFile('recordings', storageKey, baseMimeType(mimeType), bytes);
}

export function readRecordingFile(storageKey: string) {
  return readPrivateFile('recordings', storageKey);
}

export async function deleteRecordingFiles(storageKeys: string[]) {
  await deletePrivateFiles('recordings', storageKeys);
}

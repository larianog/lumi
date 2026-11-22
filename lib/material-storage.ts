import { deletePrivateFiles, readPrivateFile, storePrivateFile } from '@/lib/private-file-storage';

const extensionByMimeType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

export const SUPPORTED_MATERIAL_MIME_TYPES = Object.keys(extensionByMimeType);

export async function storeMaterialFile(id: string, mimeType: string, bytes: Buffer) {
  const extension = extensionByMimeType[mimeType];
  if (!extension) throw new Error('UNSUPPORTED_MATERIAL_TYPE');

  const storageKey = `${id}.${extension}`;
  return storePrivateFile('material-cache', storageKey, mimeType, bytes);
}

export function readMaterialFile(storageKey: string) {
  return readPrivateFile('material-cache', storageKey);
}

export async function deleteMaterialFiles(storageKeys: string[]) {
  await deletePrivateFiles('material-cache', storageKeys);
}

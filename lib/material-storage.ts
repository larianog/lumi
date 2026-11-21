import { promises as fs } from 'node:fs';
import path from 'node:path';

const MATERIAL_CACHE_DIR = path.join(process.cwd(), 'data', 'material-cache');

const extensionByMimeType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const SUPPORTED_MATERIAL_MIME_TYPES = Object.keys(extensionByMimeType);

export async function storeMaterialFile(id: string, mimeType: string, bytes: Buffer) {
  const extension = extensionByMimeType[mimeType];
  if (!extension) throw new Error('UNSUPPORTED_MATERIAL_TYPE');

  await fs.mkdir(MATERIAL_CACHE_DIR, { recursive: true });
  const storageKey = `${id}.${extension}`;
  await fs.writeFile(path.join(MATERIAL_CACHE_DIR, storageKey), bytes, { flag: 'wx' });
  return storageKey;
}

export async function deleteMaterialFiles(storageKeys: string[]) {
  await Promise.all(storageKeys.map(async (storageKey) => {
    if (path.basename(storageKey) !== storageKey) return;
    await fs.unlink(path.join(MATERIAL_CACHE_DIR, storageKey)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }));
}

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { del, get, put } from '@vercel/blob';
import { usesHostedStorage } from '@/lib/storage-backend';

type FileKind = 'material-cache' | 'recordings';

function validStorageKey(key: string) {
  return path.basename(key) === key && /^[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/.test(key);
}

function localPath(kind: FileKind, key: string) {
  return path.join(process.cwd(), 'data', kind, key);
}

function blobPath(kind: FileKind, key: string) {
  return `${kind}/${key}`;
}

export async function storePrivateFile(kind: FileKind, key: string, mimeType: string, bytes: Buffer) {
  if (!validStorageKey(key)) throw new Error('INVALID_STORAGE_KEY');
  if (usesHostedStorage()) {
    await put(blobPath(kind, key), new Blob([new Uint8Array(bytes)]), {
      access: 'private',
      addRandomSuffix: false,
      contentType: mimeType,
    });
  } else {
    await fs.mkdir(path.dirname(localPath(kind, key)), { recursive: true });
    await fs.writeFile(localPath(kind, key), bytes, { flag: 'wx' });
  }
  return key;
}

export async function readPrivateFile(kind: FileKind, key: string): Promise<Buffer | null> {
  if (!validStorageKey(key)) throw new Error('INVALID_STORAGE_KEY');
  if (usesHostedStorage()) {
    const result = await get(blobPath(kind, key), { access: 'private' });
    if (!result || result.statusCode !== 200) return null;
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  }
  try {
    return await fs.readFile(localPath(kind, key));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

export async function deletePrivateFiles(kind: FileKind, keys: string[]) {
  await Promise.all(keys.filter(validStorageKey).map(async (key) => {
    if (usesHostedStorage()) {
      await del(blobPath(kind, key));
    } else {
      await fs.unlink(localPath(kind, key)).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
  }));
}

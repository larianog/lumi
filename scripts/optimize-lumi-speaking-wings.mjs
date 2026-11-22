import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const source = fileURLToPath(new URL('../public/assets/lumi/states/lummi-falando-asas-preservadas.webp', import.meta.url));
const target = fileURLToPath(new URL('../public/assets/lumi/states/lummi-falando-asas-web-v1.webp', import.meta.url));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sourceHash = '66ce77d7d9c28e5fef3d7a0bf1c406542a2bb8a7bfcadb916988fe96600d5c41';
assert.equal(hash(await readFile(source)), sourceHash, 'Preserve the supplied master');
const original = await sharp(source, { animated: true }).metadata();
// Compress color for web playback, without cropping, resizing or dropping frames.
await sharp(source, { animated: true })
  .webp({ quality: 85, alphaQuality: 100, effort: 4, loop: original.loop, delay: original.delay })
  .toFile(target);
const output = await sharp(target, { animated: true }).metadata();
assert.equal(output.width, original.width);
assert.equal(output.pageHeight, original.pageHeight);
assert.equal(output.pages, original.pages);
assert.equal(output.hasAlpha, true);
assert.equal(output.loop, original.loop);
assert.deepEqual(output.delay, original.delay);
assert.equal(hash(await readFile(source)), sourceHash);
console.log(JSON.stringify({ target, bytes: (await stat(target)).size, frames: output.pages, width: output.width,
  height: output.pageHeight, durationMs: output.delay.reduce((total, delay) => total + delay, 0) }));

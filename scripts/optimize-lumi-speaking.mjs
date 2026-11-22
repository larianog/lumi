import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Reuse Next's installed image encoder; this is an offline asset build only.
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const source = fileURLToPath(new URL('../public/assets/lumi/states/lummi-animacao-transparente-1.webp', import.meta.url));
const target = fileURLToPath(new URL('../public/assets/lumi/states/lummi-falando-otimizada.webp', import.meta.url));
const sourceHash = '66cb7486d2c4ab90ef3452a2be7a424074fdc67023463014560b69ad5c3005c4';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
assert.equal(hash(await readFile(source)), sourceHash, 'Keep the supplied original unchanged');

const input = sharp(source, { animated: true, limitInputPixels: false });
const original = await input.metadata();
// Match the existing 12:13 centered cover crop at slightly above desktop size.
// Keep every frame and its delay; reducing frame rate would make motion jerkier.
await input.resize(600, 650, { fit: 'cover', position: 'centre' })
  .webp({ quality: 82, alphaQuality: 100, effort: 4, loop: original.loop, delay: original.delay })
  .toFile(target);

const optimized = await sharp(target, { animated: true }).metadata();
assert.equal(optimized.width, 600);
assert.equal(optimized.pageHeight, 650);
assert.equal(optimized.hasAlpha, true);
assert.equal(optimized.pages, original.pages);
assert.equal(optimized.loop, original.loop);
assert.deepEqual(optimized.delay, original.delay);
assert.equal(hash(await readFile(source)), sourceHash);
console.log(JSON.stringify({ target, bytes: (await stat(target)).size, frames: optimized.pages,
  durationMs: optimized.delay.reduce((total, delay) => total + delay, 0), encoder: sharp.versions }, null, 2));
console.log('Update BUNDLED_LUMI_VIDEO_CLIPS size if regenerating with a different encoder version.');

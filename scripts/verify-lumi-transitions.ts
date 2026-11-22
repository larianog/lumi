import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { isLumiRestingAgentState, nextLumiAnimationState } from '../lib/lumi-animation-transition';
import { readWebPAnimationTiming } from '../lib/lumi-webp-timing';
import { BUNDLED_LUMI_VIDEO_CLIPS } from '../lib/lumi-video-states';

export async function verifyLumiTransitions() {
  // Agora can finish a response in SILENT, not just IDLE/LISTENING.
  for (const resting of [null, 'idle', 'listening', 'silent'] as const) {
    assert.equal(isLumiRestingAgentState(resting), true, `${resting} must allow the inactivity countdown`);
  }
  for (const busy of ['thinking', 'speaking'] as const) {
    assert.equal(isLumiRestingAgentState(busy), false, `${busy} must not sleep while preparing or delivering a response`);
  }
  let state = nextLumiAnimationState('idle', 'listening', false);
  assert.equal(state, 'listening');
  state = nextLumiAnimationState(state, 'idle', true);
  assert.equal(state, 'listening', 'Ending user speech must not cut the listening cycle');
  state = nextLumiAnimationState(state, 'speaking', true);
  assert.equal(state, 'speaking', 'Agent speech must interrupt listening immediately');
  state = nextLumiAnimationState(state, 'listening', true);
  assert.equal(state, 'speaking', 'Speaking must finish before listening resumes');
  state = nextLumiAnimationState(state, 'idle', true);
  assert.equal(state, 'speaking', 'A later request must not cut the remaining cycle');
  state = nextLumiAnimationState(state, 'idle', false);
  assert.equal(state, 'idle', 'At the boundary use the latest request, not stale listening');
  assert.equal(nextLumiAnimationState('listening', 'idle', false), 'idle', 'Pause/disconnect/failed playback must never wait for a cycle');

  assert.equal(nextLumiAnimationState('idle', 'sleeping', false), 'sleeping');
  for (const wakeState of ['idle', 'listening', 'speaking'] as const) {
    assert.equal(nextLumiAnimationState('sleeping', wakeState, true), wakeState, 'Interaction must wake Lumi without waiting for the sleeping cycle');
  }
  assert.equal(nextLumiAnimationState('speaking', 'sleeping', true), 'speaking', 'Do not cut an unfinished speaking cycle to sleep');
  for (const next of ['listening', 'speaking', 'sleeping'] as const) {
    assert.equal(nextLumiAnimationState('idle', next, true), next, 'Idle playback must yield immediately to an action');
  }
  const bundledDurations: Record<string, number> = { idle: 4033, listening: 7999, speaking: 5957, reading: 3933, sleeping: 4033 };
  for (const [id, clip] of Object.entries(BUNDLED_LUMI_VIDEO_CLIPS)) {
    const file = await readFile(`public${clip.url}`);
    const bytes = new Uint8Array(file).buffer;
    const timing = readWebPAnimationTiming(bytes);
    assert.equal(file.byteLength, clip.file.size, 'Bundled registry must match the supplied file');
    assert.ok(timing);
    assert.equal(timing.durationMs, bundledDurations[id], 'Bundled cycle timing must come from the supplied frames');
    assert.equal(timing.loops, 0, 'Bundled WebPs loop continuously');
    assert.throws(() => readWebPAnimationTiming(bytes.slice(0, bytes.byteLength - 1)), /Truncated/);
  }

  const original = await readFile('public/assets/lumi/states/lummi-animacao-transparente-1.webp');
  assert.equal(createHash('sha256').update(original).digest('hex'), '66cb7486d2c4ab90ef3452a2be7a424074fdc67023463014560b69ad5c3005c4', 'Optimization must retain the supplied source');
  const optimized = await readFile(`public${BUNDLED_LUMI_VIDEO_CLIPS.speaking!.url}`);
  assert.ok(optimized.byteLength < original.byteLength / 2, 'The speaking derivative must stay lighter than the Full HD source');
  // VP8X stores canvas dimensions minus one, and the alpha flag. ANMF timing is checked above.
  assert.equal(optimized.toString('ascii', 12, 16), 'VP8X');
  assert.equal(optimized.readUIntLE(24, 3) + 1, 600);
  assert.equal(optimized.readUIntLE(27, 3) + 1, 650);
  assert.ok(optimized[20] & 0x10, 'The optimized speaking animation must retain transparency');
  const frameDurations = (file: Buffer) => {
    const delays: number[] = [];
    for (let offset = 12; offset + 8 <= file.length;) {
      const size = file.readUInt32LE(offset + 4);
      if (file.toString('ascii', offset, offset + 4) === 'ANMF') delays.push(file.readUIntLE(offset + 20, 3));
      offset += 8 + size + (size & 1);
    }
    return delays;
  };
  assert.equal(frameDurations(optimized).length, 143);
  assert.deepEqual(frameDurations(optimized), frameDurations(original), 'Keep every frame and delay, not just total duration');

  // A padded unknown chunk must not shift ANMF duration parsing.
  const animation = Buffer.alloc(60);
  animation.write('RIFF'); animation.writeUInt32LE(52, 4); animation.write('WEBP', 8);
  animation.write('META', 12); animation.writeUInt32LE(1, 16);
  animation.write('ANIM', 22); animation.writeUInt32LE(6, 26); animation.writeUInt16LE(1, 34);
  animation.write('ANMF', 36); animation.writeUInt32LE(16, 40);
  animation.writeUIntLE(4321, 56, 3);
  assert.deepEqual(readWebPAnimationTiming(new Uint8Array(animation).buffer), { durationMs: 4321, loops: 1 });
  const still = Buffer.from('524946460400000057454250', 'hex');
  assert.equal(readWebPAnimationTiming(new Uint8Array(still).buffer), null, 'A still image must never hold a transition');
  assert.throws(() => readWebPAnimationTiming(new ArrayBuffer(0)), /Invalid/);
  console.log('Lumi animation transition and WebP timing checks passed');
}

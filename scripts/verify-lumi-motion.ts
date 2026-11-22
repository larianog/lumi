import assert from 'node:assert/strict';
import { readLumiMotionPreference, writeLumiMotionPreference } from '../lib/lumi-motion-preference';

export function verifyLumiMotion() {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  try {
    Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: storage });
    values.set('lumi-avatar-motion', 'off');
    assert.equal(readLumiMotionPreference(), null, 'An old saved pause must return to the system preference once');
    assert.equal(values.has('lumi-avatar-motion'), false, 'Remove the stale choice shared by the old players');
    writeLumiMotionPreference('off');
    assert.equal(readLumiMotionPreference(), 'off', 'New deliberate pauses survive subsequent reads and avatar remounts');
    writeLumiMotionPreference('on');
    assert.equal(readLumiMotionPreference(), 'on', 'Manual resume survives avatar remounts');
    writeLumiMotionPreference(null);
    assert.equal(readLumiMotionPreference(), null, 'System preference changes clear the manual choice');

    values.clear(); values.set('lumi-avatar-motion', 'on');
    assert.equal(readLumiMotionPreference(), 'on', 'Preserve previous explicit motion opt-in');
    values.clear(); values.set('lumi-avatar-motion', 'invalid');
    assert.equal(readLumiMotionPreference(), null, 'Invalid storage must not permanently disable motion');
    Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, get: () => { throw new Error('Storage disabled'); } });
    writeLumiMotionPreference('off');
    assert.equal(readLumiMotionPreference(), 'off');
    writeLumiMotionPreference('on');
    assert.equal(readLumiMotionPreference(), 'on', 'Storage failures retain manual resume in memory');
  } finally {
    writeLumiMotionPreference(null);
    if (originalStorage) Object.defineProperty(globalThis, 'sessionStorage', originalStorage);
    else Reflect.deleteProperty(globalThis, 'sessionStorage');
  }
  console.log('Lumi motion recovery and preference checks passed');
}

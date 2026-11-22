export type LumiMotionPreference = 'on' | 'off' | null;

const preferenceKey = 'lumi-avatar-motion-v2';
const legacyKey = 'lumi-avatar-motion';
let memoryPreference: LumiMotionPreference = null;

export function readLumiMotionPreference(): LumiMotionPreference {
  try {
    const saved = sessionStorage.getItem(preferenceKey);
    if (saved === 'on' || saved === 'off' || saved === 'system') {
      memoryPreference = saved === 'system' ? null : saved;
    } else {
      // Recover the old tab-wide pause once. Preserve explicit motion opt-in,
      // and leave reduced motion in charge when there was no opt-in.
      memoryPreference = sessionStorage.getItem(legacyKey) === 'on' ? 'on' : null;
      writeLumiMotionPreference(memoryPreference);
    }
  } catch { /* Keep explicit choices in memory when storage is unavailable. */ }
  return memoryPreference;
}

export function writeLumiMotionPreference(value: LumiMotionPreference) {
  memoryPreference = value;
  try {
    sessionStorage.setItem(preferenceKey, value ?? 'system');
    sessionStorage.removeItem(legacyKey);
  } catch { /* In-memory state survives placeholder/live avatar remounts. */ }
}

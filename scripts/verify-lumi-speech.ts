import assert from 'node:assert/strict';
import { LumiSpeechDetector, type LumiSpeechSample } from '../lib/lumi-speech';

export function verifyLumiSpeech() {
  const detector = new LumiSpeechDetector();
  const silence: LumiSpeechSample = { connected: true, microphoneEnabled: true, agentAudible: true, microphoneLevel: 0, agentLevel: 0 };
  assert.equal(detector.sample(silence, 0), 'idle');
  assert.equal(detector.sample({ ...silence, microphoneLevel: 0.02 }, 80), 'idle', 'Low background noise stays idle');
  assert.equal(detector.sample({ ...silence, microphoneLevel: 0.7 }, 160), 'idle', 'An isolated click must not switch to listening');
  assert.equal(detector.sample(silence, 240), 'idle');
  assert.equal(detector.sample({ ...silence, microphoneLevel: 0.7 }, 320), 'idle');
  assert.equal(detector.sample({ ...silence, microphoneLevel: 0.7 }, 400), 'listening');
  assert.equal(detector.sample(silence, 560), 'listening', 'Hold the pose across short pauses');
  assert.equal(detector.sample(silence, 720), 'idle', 'Silence must release listening');
  assert.equal(detector.sample({ ...silence, agentLevel: 0.5 }, 800), 'speaking');
  assert.equal(detector.sample(silence, 880), 'speaking');
  assert.equal(detector.sample(silence, 1040), 'idle', 'Silence must release speaking even if the agent has not sent an idle event');
  const overlap = { ...silence, microphoneLevel: 0.7, agentLevel: 0.5 };
  detector.sample(overlap, 1120);
  assert.equal(detector.sample(overlap, 1200), 'speaking', 'Audible agent speech takes priority over simultaneous microphone activity');
  assert.equal(detector.sample({ ...overlap, microphoneEnabled: false }, 1280), 'speaking', 'Muting immediately clears the local speech hold');
  assert.equal(detector.sample({ ...overlap, microphoneEnabled: false, agentAudible: false }, 1360), 'idle', 'Blocked or stopped audio must not animate speaking');
  assert.equal(detector.sample({ ...overlap, connected: false }, 1440), 'idle');
  assert.equal(detector.sample(silence, 1520), 'idle', 'Reconnect must not restore stale speech');

  const priority = new LumiSpeechDetector();
  const userOnly = { ...silence, microphoneLevel: 0.7 };
  priority.sample(userOnly, 0);
  assert.equal(priority.sample(userOnly, 80), 'listening');
  assert.equal(priority.sample(overlap, 160), 'speaking', 'Agent speech immediately replaces listening');
  assert.equal(priority.sample(userOnly, 240), 'speaking', 'Short gaps between agent syllables retain speaking');
  assert.equal(priority.sample(userOnly, 400), 'listening', 'User speech resumes listening once agent audio ends');
  assert.equal(priority.sample(silence, 720), 'idle', 'Both silent returns to still');
  priority.sample(overlap, 800);
  assert.equal(priority.sample({ ...overlap, agentAudible: false }, 880), 'listening', 'Stopped or blocked agent playback cannot mask the user');
  console.log('Lumi speech state checks passed');
}

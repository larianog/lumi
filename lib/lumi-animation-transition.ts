import type { AgentState } from 'agora-agent-client-toolkit';
import type { LumiSpeechState } from './lumi-speech';

export type LumiAnimationState = LumiSpeechState | 'sleeping' | 'celebrating';

/** SDK silence is also rest; actual RTC speech still resets the inactivity timer. */
export function isLumiRestingAgentState(state: `${AgentState}` | null): boolean {
  return state === null || state === 'idle' || state === 'listening' || state === 'silent';
}

/** Keep only the latest requested state, never a backlog of obsolete speech. */
export function nextLumiAnimationState(
  current: LumiAnimationState,
  requested: LumiAnimationState,
  finishingCycle: boolean,
): LumiAnimationState {
  // Audible speech retains priority over listening, including microphone echo.
  // Wake immediately on interaction; sleeping must never delay listening.
  // Celebration completion is consumed by the avatar at its first cycle boundary.
  if (!finishingCycle || current === 'idle' || current === 'sleeping' || current === 'celebrating' || requested === 'speaking') return requested;
  return current;
}

'use client';

import { useEffect, useState } from 'react';
import type { LumiSpeechState } from '@/lib/lumi-speech';
import type { LumiAnimationState } from '@/lib/lumi-animation-transition';

export const LUMI_IDLE_SLEEP_MS = 30_000;

/** Presentation only: keep RTC/microphone alive so speech can wake Lumi. */
export function useLumiIdleSleep(state: LumiSpeechState, enabled: boolean): LumiAnimationState {
  const [sleeping, setSleeping] = useState(false);

  useEffect(() => {
    setSleeping(false);
    if (!enabled || state !== 'idle') return;
    let timer: number | undefined;
    const wake = () => {
      window.clearTimeout(timer);
      setSleeping(false);
      // Hidden time never counts toward inactivity on returning to the page.
      if (document.visibilityState !== 'visible') return;
      timer = window.setTimeout(() => setSleeping(true), LUMI_IDLE_SLEEP_MS);
    };
    const activityEvents = ['pointerdown', 'pointermove', 'keydown', 'input', 'scroll'] as const;
    const options = { passive: true, capture: true };
    activityEvents.forEach((event) => window.addEventListener(event, wake, options));
    window.addEventListener('focus', wake);
    document.addEventListener('visibilitychange', wake);
    wake();
    return () => {
      window.clearTimeout(timer);
      activityEvents.forEach((event) => window.removeEventListener(event, wake, options));
      window.removeEventListener('focus', wake);
      document.removeEventListener('visibilitychange', wake);
    };
  }, [enabled, state]);

  return enabled && state === 'idle' && sleeping ? 'sleeping' : state;
}

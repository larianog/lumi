'use client';

import Image from 'next/image';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BUNDLED_LUMI_VIDEO_CLIPS, isWebPClip, type LumiVideoState } from '@/lib/lumi-video-states';
import type { LumiSpeechState } from '@/lib/lumi-speech';
import { forgetLumiWebP } from '@/lib/lumi-webp';
import LumiWebPClip from './LumiWebPClip';
import styles from './lumi-conversation-avatar.module.css';

const labels = { idle: 'Lumi parada', listening: 'Lumi escutando você', speaking: 'Lumi falando' };
const animatedStates = [{ id: 'listening', label: 'Escutando' }, { id: 'speaking', label: 'Falando' }] as const;
const motionPreferenceKey = 'lumi-avatar-motion';

export default function LumiConversationAvatar({ state }: { state: LumiSpeechState }) {
  const videos = useRef<Partial<Record<LumiVideoState, HTMLVideoElement>>>({});
  const [statuses, setStatuses] = useState<Partial<Record<LumiVideoState, 'ready' | 'failed'>>>({});
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [playBlocked, setPlayBlocked] = useState(false);
  const [retry, setRetry] = useState(0);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const failed = animatedStates.some(({ id }) => statuses[id] === 'failed');
  const motionLabel = failed ? 'Recarregar animações' : motionEnabled && !playBlocked ? 'Pausar animação da Lumi' : 'Animar Lumi';
  const showClip = state !== 'idle' && statuses[state] === 'ready' && motionEnabled && !playBlocked && visible;
  const onReady = useCallback((id: LumiVideoState) => setStatuses((current) => ({ ...current, [id]: 'ready' })), []);
  const onError = useCallback((id: LumiVideoState) => setStatuses((current) => ({ ...current, [id]: 'failed' })), []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      try { sessionStorage.removeItem(motionPreferenceKey); } catch { /* Storage may be disabled. */ }
      setMotionEnabled(!preference.matches);
    };
    const syncVisibility = () => setVisible(document.visibilityState === 'visible');
    let savedMotion: string | null = null;
    try { savedMotion = sessionStorage.getItem(motionPreferenceKey); } catch { /* Use the system preference. */ }
    setMotionEnabled(savedMotion === null ? !preference.matches : savedMotion === 'on');
    syncVisibility();
    for (const { id } of animatedStates) {
      if (videos.current[id] && videos.current[id].readyState >= 2) onReady(id);
    }
    preference.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      preference.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, [onReady]);

  useEffect(() => {
    const elements = Object.entries(videos.current);
    let cancelled = false;
    setPlayBlocked(false);
    for (const [id, element] of elements) {
      element.pause();
      element.currentTime = 0;
      if (id === state && statuses[state] === 'ready' && motionEnabled && visible) {
        void element.play().catch((error: DOMException) => {
          if (!cancelled && error.name !== 'AbortError') setPlayBlocked(true);
        });
      }
    }
    return () => { cancelled = true; elements.forEach(([, element]) => element.pause()); };
  }, [state, statuses, motionEnabled, visible, retry]);

  return (
    <div className={styles.avatar} data-lumi-state={state} role="group" aria-label={labels[state]}>
      <Image className={styles.still} data-visible={!showClip} src="/assets/lumi-avatar.png" alt="" width={480} height={520} priority />
      {animatedStates.map(({ id, label }) => {
        const clip = BUNDLED_LUMI_VIDEO_CLIPS[id];
        if (!clip) return null;
        const active = showClip && state === id;
        return isWebPClip(clip)
          ? <LumiWebPClip key={`${clip.url}:${loadAttempt}`} id={id} label={label} url={clip.url}
            className={styles.video} visible={active} playing={active} replay={retry} onReady={onReady} onError={onError} />
          : <video key={`${clip.url}:${loadAttempt}`} ref={(element) => { if (element) videos.current[id] = element; else delete videos.current[id]; }}
            className={styles.video} data-state={id} data-visible={active} src={clip.url}
            muted playsInline loop preload="auto" aria-hidden="true"
            onLoadedData={() => onReady(id)} onError={() => onError(id)} />;
      })}
      {failed && <p className={styles.loadError} role="status">Não foi possível carregar a animação. Toque em recarregar.</p>}
      <button className={styles.motionToggle} type="button" aria-label={motionLabel} title={motionLabel}
        onClick={() => {
          const enabled = failed || !motionEnabled || playBlocked;
          try { sessionStorage.setItem(motionPreferenceKey, enabled ? 'on' : 'off'); } catch { /* Keep the choice in this mount. */ }
          if (failed) {
            for (const { id } of animatedStates) {
              const clip = BUNDLED_LUMI_VIDEO_CLIPS[id];
              if (clip) forgetLumiWebP(clip.url);
            }
            setStatuses({});
            setLoadAttempt((value) => value + 1);
          }
          setMotionEnabled(enabled); setPlayBlocked(false); setRetry((value) => value + 1);
        }}>
        {failed ? <RotateCcw size={15} /> : motionEnabled && !playBlocked ? <Pause size={15} /> : <Play size={15} />}
        {(failed || !motionEnabled || playBlocked) && <span>{failed ? 'Recarregar' : 'Animar Lumi'}</span>}
      </button>
    </div>
  );
}

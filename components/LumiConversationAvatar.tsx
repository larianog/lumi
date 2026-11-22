'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type AnimationEventHandler } from 'react';
import { BUNDLED_LUMI_VIDEO_CLIPS, isWebPClip, type LumiVideoState } from '@/lib/lumi-video-states';
import { nextLumiAnimationState, type LumiAnimationState } from '@/lib/lumi-animation-transition';
import LumiWebPClip from './LumiWebPClip';
import styles from './lumi-conversation-avatar.module.css';

const labels = { idle: 'Lumi em repouso', listening: 'Lumi escutando você', speaking: 'Lumi falando', sleeping: 'Lumi dormindo' };
const idleStates = [{ id: 'idle', label: 'Repouso' }] as const;
const conversationStates = [...idleStates, { id: 'listening', label: 'Escutando' }, { id: 'speaking', label: 'Falando' }, { id: 'sleeping', label: 'Dormindo' }] as const;

type Props = {
  state: LumiAnimationState;
  active?: boolean;
  listeningEnabled?: boolean;
  speakingEnabled?: boolean;
  /** Illustrations outside a call load only the idle clip, not every voice state. */
  idleOnly?: boolean;
  className?: string;
  entranceReady?: boolean;
  onVisualReady?: () => void;
  onAnimationEnd?: AnimationEventHandler<HTMLDivElement>;
};
type ClipStatus = { status: 'ready' | 'failed'; durationMs?: number };

export default function LumiConversationAvatar({ state, active = true, listeningEnabled = true, speakingEnabled = true, idleOnly = false, className = '', entranceReady, onVisualReady, onAnimationEnd }: Props) {
  const animatedStates = idleOnly ? idleStates : conversationStates;
  const root = useRef<HTMLDivElement>(null);
  const visualReady = useRef(onVisualReady);
  useEffect(() => { visualReady.current = onVisualReady; }, [onVisualReady]);
  const [inView, setInView] = useState(true);
  const videos = useRef<Partial<Record<LumiVideoState, HTMLVideoElement>>>({});
  const [statuses, setStatuses] = useState<Partial<Record<LumiVideoState, ClipStatus>>>({});
  const [animationState, setAnimationState] = useState<LumiAnimationState>(state);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [playBlocked, setPlayBlocked] = useState(false);
  const failed = animatedStates.some(({ id }) => statuses[id]?.status === 'failed');
  const requested = idleOnly || !active || (state === 'listening' && !listeningEnabled) || (state === 'speaking' && !speakingEnabled) ? 'idle' : state;
  // Disconnection cancels speech immediately; the waiting mascot can still idle.
  const playbackAllowed = (active || animationState === 'idle') && motionEnabled && !playBlocked && visible && inView;
  const stateEnabled = animationState === 'listening' ? listeningEnabled : animationState === 'speaking' ? speakingEnabled : true;
  const showClip = statuses[animationState]?.status === 'ready' && playbackAllowed && stateEnabled;
  const finishingCycle = showClip && (statuses[animationState]?.durationMs ?? 0) > 0;
  const playingState = showClip ? animationState : null;
  const onReady = useCallback((id: LumiVideoState, _url?: string, durationMs?: number) => {
    setStatuses((current) => ({ ...current, [id]: { status: 'ready', durationMs } }));
    visualReady.current?.();
  }, []);
  const onError = useCallback((id: LumiVideoState) => setStatuses((current) => ({ ...current, [id]: { status: 'failed' } })), []);

  useEffect(() => {
    if (!root.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setAnimationState((current) => nextLumiAnimationState(current, requested, finishingCycle));
  }, [requested, finishingCycle]);

  const onCycleEnd = useCallback((id: LumiVideoState, url: string) => {
    if (!playbackAllowed || BUNDLED_LUMI_VIDEO_CLIPS[id]?.url !== url) return;
    setAnimationState((current) => current === id ? requested : current);
  }, [requested, playbackAllowed]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setMotionEnabled(!preference.matches);
    const syncVisibility = () => setVisible(document.visibilityState === 'visible');
    syncMotion();
    syncVisibility();
    for (const { id } of animatedStates) {
      const video = videos.current[id];
      if (video && video.readyState >= 2) onReady(id, video.src, video.duration * 1000);
    }
    preference.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      preference.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, [onReady, animatedStates]);

  useEffect(() => {
    const elements = Object.entries(videos.current);
    let cancelled = false;
    for (const [id, element] of elements) {
      element.pause();
      element.currentTime = 0;
      if (id === playingState) {
        void element.play().catch((error: DOMException) => {
          if (!cancelled && error.name !== 'AbortError') setPlayBlocked(true);
        });
      }
    }
    return () => { cancelled = true; elements.forEach(([, element]) => element.pause()); };
  }, [playingState]);

  return (
    <div ref={root} className={`${styles.avatar} ${idleOnly ? 'lumi-idle-avatar' : ''} ${className}`} data-ready={entranceReady}
      onAnimationEnd={onAnimationEnd} data-lumi-state={animationState} data-lumi-requested-state={requested} role="group" aria-label={labels[requested]}>
      <Image className={styles.still} data-visible={!showClip} src="/assets/lumi-avatar.png" alt="" width={480} height={520} priority
        onLoad={() => visualReady.current?.()} onError={() => visualReady.current?.()} />
      {animatedStates.map(({ id, label }) => {
        const clip = BUNDLED_LUMI_VIDEO_CLIPS[id];
        if (!clip) return null;
        const active = showClip && animationState === id;
        return isWebPClip(clip)
          ? <LumiWebPClip key={clip.url} id={id} label={label} url={clip.url}
            fit={clip.fit}
            className={styles.video} visible={active} playing={active} replay={0} onReady={onReady} onError={onError} onCycleEnd={onCycleEnd} />
          : <video key={clip.url} ref={(element) => { if (element) videos.current[id] = element; else delete videos.current[id]; }}
            className={styles.video} data-state={id} data-visible={active} src={clip.url}
            style={{ objectFit: clip.fit ?? 'contain' }}
            muted playsInline loop={requested === id} preload="auto" aria-hidden="true"
            onLoadedData={(event) => onReady(id, clip.url, event.currentTarget.duration * 1000)} onError={() => onError(id)}
            onEnded={() => onCycleEnd(id, clip.url)} />;
      })}
      {failed && <p className={styles.loadError} role="status">Não foi possível carregar a animação.</p>}
    </div>
  );
}

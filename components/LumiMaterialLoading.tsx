'use client';

import Image from 'next/image';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import LumiWebPClip from './LumiWebPClip';
import LumiConversationAvatar from './LumiConversationAvatar';
import { BUNDLED_LUMI_VIDEO_CLIPS } from '@/lib/lumi-video-states';
import { forgetLumiWebP } from '@/lib/lumi-webp';
import styles from './lumi-conversation-avatar.module.css';
import { messages } from '@/packages/i18n';
import { readLumiMotionPreference, writeLumiMotionPreference } from '@/lib/lumi-motion-preference';

const clip = BUNDLED_LUMI_VIDEO_CLIPS.reading!;

type Props = {
  loading?: boolean;
  active?: boolean;
  onComplete?: () => void;
};

// Keep this mounted after the API succeeds until a loaded playback cycle ends.
export default function LumiMaterialLoading({ loading = true, active = true, onComplete }: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [durationMs, setDurationMs] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const failed = status === 'failed';
  const showClip = active && status === 'ready';
  const playing = showClip && motionEnabled === true && visible;
  const onReady = useCallback((_id: string, _url: string, duration = 0) => {
    setDurationMs(duration); setStatus('ready');
  }, []);
  const onError = useCallback(() => setStatus('failed'), []);
  const onCycleEnd = useCallback(() => {
    if (!loading && playing) onComplete?.();
  }, [loading, playing, onComplete]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      writeLumiMotionPreference(null);
      setMotionEnabled(!preference.matches);
    };
    const saved = readLumiMotionPreference();
    setMotionEnabled(saved === null ? !preference.matches : saved === 'on');
    const syncVisibility = () => setVisible(document.visibilityState === 'visible');
    syncVisibility();
    preference.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      preference.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (active) { setStatus('loading'); setDurationMs(0); }
  }, [active]);

  useEffect(() => {
    if (!active || status !== 'loading') return;
    // An unavailable/undecodable animation must never trap a ready activity.
    const timer = window.setTimeout(() => setStatus('failed'), 15_000);
    return () => window.clearTimeout(timer);
  }, [active, status, attempt]);

  useEffect(() => {
    if (loading || motionEnabled === null) return;
    if (!active || !motionEnabled || !visible || failed || (status === 'ready' && !durationMs)) onComplete?.();
  }, [loading, active, motionEnabled, visible, failed, status, durationMs, onComplete]);

  const motionLabel = failed ? 'Recarregar animações' : motionEnabled ? 'Pausar animação da Lumi' : 'Animar Lumi';
  if (!active) return <LumiConversationAvatar state="idle" />;
  return (
    <div className={`lumi-inline-host ${styles.host}`}>
      <div className="lumi-inline">
        <div className={styles.avatar} data-lumi-state={active ? 'reading' : 'idle'} role="group" aria-label={active ? 'Lumi lendo o material' : 'Lumi parada'}>
          <Image className={styles.still} data-visible={!showClip} src="/assets/lumi-avatar.png" alt="" width={480} height={520} priority />
          {active && <LumiWebPClip key={attempt} id="reading" label="Lendo o material" url={clip.url}
            className={styles.video} fit={clip.fit} visible={showClip} playing={playing} replay={attempt}
            onReady={onReady} onError={onError} onCycleEnd={onCycleEnd} />}
          {active && failed && <p className={styles.loadError} role="status">Não foi possível carregar a animação. Toque em recarregar.</p>}
          {active && <button className={styles.motionToggle} type="button" aria-label={motionLabel} title={motionLabel}
            onClick={() => {
              const enabled = failed || !motionEnabled;
              writeLumiMotionPreference(enabled ? 'on' : 'off');
              setMotionEnabled(enabled);
              if (failed) {
                forgetLumiWebP(clip.url); setStatus('loading'); setDurationMs(0); setAttempt((value) => value + 1);
              }
            }}>
            {failed ? <RotateCcw size={15} /> : motionEnabled ? <Pause size={15} /> : <Play size={15} />}
            {(failed || !motionEnabled) && <span>{failed ? 'Recarregar' : 'Animar Lumi'}</span>}
          </button>}
        </div>
        {active && (
          <div className="lumi-inline-controls lumi-upload-status" role="status" aria-live="polite">
            <span className="lumi-inline-status">{messages.materials.loading}</span>
          </div>
        )}
      </div>
    </div>
  );
}

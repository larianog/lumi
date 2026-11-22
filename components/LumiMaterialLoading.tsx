'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import LumiWebPClip from './LumiWebPClip';
import LumiConversationAvatar from './LumiConversationAvatar';
import { BUNDLED_LUMI_VIDEO_CLIPS } from '@/lib/lumi-video-states';
import styles from './lumi-conversation-avatar.module.css';
import { messages } from '@/packages/i18n';

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
  const [visible, setVisible] = useState(true);
  const failed = status === 'failed';
  const showClip = active && status === 'ready';
  const playing = showClip && visible;
  const onReady = useCallback((_id: string, _url: string, duration = 0) => {
    setDurationMs(duration); setStatus('ready');
  }, []);
  const onError = useCallback(() => setStatus('failed'), []);
  const onCycleEnd = useCallback(() => {
    if (!loading && playing) onComplete?.();
  }, [loading, playing, onComplete]);

  useEffect(() => {
    // Keep the reading state animated even when OS interface animations are off.
    const syncVisibility = () => setVisible(document.visibilityState === 'visible');
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
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
  }, [active, status]);

  useEffect(() => {
    if (loading) return;
    if (!active || !visible || failed || (status === 'ready' && !durationMs)) onComplete?.();
  }, [loading, active, visible, failed, status, durationMs, onComplete]);

  if (!active) return <LumiConversationAvatar state="idle" />;
  return (
    <div className={`lumi-inline-host ${styles.host}`}>
      <div className="lumi-inline">
        <div className={styles.avatar} data-lumi-state={active ? 'reading' : 'idle'} role="group" aria-label={active ? 'Lumi lendo o material' : 'Lumi parada'}>
          <Image className={styles.still} data-visible={!showClip} src="/assets/lumi-avatar.png" alt="" width={480} height={520} priority />
          {active && <LumiWebPClip id="reading" label="Lendo o material" url={clip.url}
            className={styles.video} fit={clip.fit} visible={showClip} playing={playing} replay={0}
            onReady={onReady} onError={onError} onCycleEnd={onCycleEnd} />}
          {failed && <p className={styles.loadError} role="status">Não foi possível carregar a animação.</p>}
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

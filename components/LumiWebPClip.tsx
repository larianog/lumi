'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { LumiVideoClip, LumiVideoState } from '@/lib/lumi-video-states';
import { forgetLumiWebP, loadLumiWebP } from '@/lib/lumi-webp';
import { readWebPAnimationTiming } from '@/lib/lumi-webp-timing';

type Props = {
  id: LumiVideoState;
  label: string;
  url: string;
  className: string;
  fit?: LumiVideoClip['fit'];
  visible: boolean;
  playing: boolean;
  replay: number;
  onReady: (id: LumiVideoState, url: string, durationMs?: number) => void;
  onError: (id: LumiVideoState, url: string) => void;
  onCycleEnd?: (id: LumiVideoState, url: string) => void;
};

export default function LumiWebPClip({ id, label, url, className, fit = 'contain', visible, playing, replay, onReady, onError, onCycleEnd }: Props) {
  const [media, setMedia] = useState<{ blob: Blob; poster: string; timing: ReturnType<typeof readWebPAnimationTiming> } | null>(null);
  const [animationUrl, setAnimationUrl] = useState<string | null>(null);
  const [loadedAnimation, setLoadedAnimation] = useState<{ url: string; startedAt: number } | null>(null);
  const cycleEnd = useRef(onCycleEnd);
  useEffect(() => { cycleEnd.current = onCycleEnd; }, [onCycleEnd]);

  useEffect(() => {
    let cancelled = false;
    let previewUrl: string | undefined;
    const controller = new AbortController();
    const preview = new window.Image();
    void (async () => {
      try {
        const blob = await loadLumiWebP(url, controller.signal);
        const timing = readWebPAnimationTiming(await blob.arrayBuffer());
        if (cancelled) return;
        previewUrl = URL.createObjectURL(blob);
        preview.src = previewUrl;
        await preview.decode();
        if (cancelled) return;
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1024 / Math.max(preview.naturalWidth, preview.naturalHeight));
        canvas.width = Math.max(1, Math.round(preview.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(preview.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) throw new Error('WebP preview unavailable');
        // Canvas draws an animated image's default/first frame, preserving alpha.
        context.drawImage(preview, 0, 0, canvas.width, canvas.height);
        setMedia({ blob, poster: canvas.toDataURL('image/png'), timing });
        onReady(id, url, timing?.durationMs);
      } catch {
        if (!cancelled) { forgetLumiWebP(url); onError(id, url); }
      } finally {
        preview.src = '';
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
      preview.src = '';
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [id, url, onReady, onError]);

  useEffect(() => {
    if (!playing || !media) { setAnimationUrl(null); return; }
    // A fresh URL gives each explicit replay its own animation timeline.
    const next = URL.createObjectURL(media.blob);
    setAnimationUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [playing, media, replay]);

  const reportCycles = Boolean(onCycleEnd);
  useEffect(() => {
    if (!reportCycles || !playing || !visible || !media?.timing || !animationUrl || loadedAnimation?.url !== animationUrl) return;
    const { durationMs, loops } = media.timing;
    let iteration = 1;
    let timer: number;
    let cancelled = false;
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        cycleEnd.current?.(id, url);
        iteration++;
        if (loops === 0 || iteration <= loops) schedule();
      }, Math.max(0, loadedAnimation.startedAt + iteration * durationMs - performance.now()));
    };
    schedule();
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [reportCycles, playing, visible, media, animationUrl, loadedAnimation, id, url]);

  if (!media) return null;
  return <Image
    src={playing && animationUrl ? animationUrl : media.poster}
    alt={`WebP da Lumi: ${label}`}
    width={600} height={650} unoptimized loading="eager"
    className={className}
    style={{ objectFit: fit }}
    data-state={id}
    data-visible={visible}
    data-playing={playing && Boolean(animationUrl)}
    aria-hidden={!visible}
    onLoad={(event) => {
      if (playing && animationUrl && event.currentTarget.src === animationUrl) {
        setLoadedAnimation((current) => current?.url === animationUrl ? current : { url: animationUrl, startedAt: performance.now() });
      }
    }}
    onError={() => { forgetLumiWebP(url); onError(id, url); }}
  />;
}

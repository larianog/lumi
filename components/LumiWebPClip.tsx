'use client';

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
  const [media, setMedia] = useState<{ blob: Blob; poster: string; width: number; height: number; timing: ReturnType<typeof readWebPAnimationTiming> } | null>(null);
  const [animationUrl, setAnimationUrl] = useState<string | null>(null);
  const [loadedAnimation, setLoadedAnimation] = useState<{ url: string; startedAt: number } | null>(null);
  const cycleEnd = useRef(onCycleEnd);
  useEffect(() => { cycleEnd.current = onCycleEnd; }, [onCycleEnd]);

  useEffect(() => {
    let cancelled = false;
    let previewUrl: string | undefined;
    let posterUrl: string | undefined;
    let bitmap: ImageBitmap | undefined;
    const controller = new AbortController();
    let preview: HTMLImageElement | undefined;
    void (async () => {
      try {
        const blob = await loadLumiWebP(url, controller.signal);
        const timing = readWebPAnimationTiming(await blob.arrayBuffer());
        if (cancelled) return;
        // Decode only the first frame for inactive clips, without starting a
        // second animated image or waiting for Image.decode() on every clip.
        if (typeof createImageBitmap === 'function') {
          try { bitmap = await createImageBitmap(blob); } catch { /* Try the native image decoder below. */ }
        }
        if (cancelled) return;
        if (!bitmap) {
          const image = new window.Image();
          preview = image;
          previewUrl = URL.createObjectURL(blob);
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error('WebP preview unavailable'));
            image.src = previewUrl!;
          });
        }
        if (cancelled) return;
        const width = bitmap?.width ?? preview!.naturalWidth;
        const height = bitmap?.height ?? preview!.naturalHeight;
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1024 / Math.max(width, height));
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const context = canvas.getContext('2d');
        if (!context) throw new Error('WebP preview unavailable');
        // Canvas draws an animated image's default/first frame, preserving alpha.
        context.drawImage(bitmap ?? preview!, 0, 0, canvas.width, canvas.height);
        const poster = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
          (value) => value ? resolve(value) : reject(new Error('WebP preview unavailable')), 'image/png',
        ));
        if (cancelled) return;
        posterUrl = URL.createObjectURL(poster);
        setMedia({ blob, poster: posterUrl, width, height, timing });
        onReady(id, url, timing?.durationMs);
      } catch {
        if (!cancelled) { forgetLumiWebP(url); onError(id, url); }
      } finally {
        bitmap?.close();
        if (preview) preview.src = '';
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
      if (preview) preview.src = '';
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (posterUrl) URL.revokeObjectURL(posterUrl);
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
  // Blob animations need the native load event; next/image waits for decode()
  // before forwarding it, which can strand cycle callbacks on large animations.
  // eslint-disable-next-line @next/next/no-img-element
  return <img
    src={playing && animationUrl ? animationUrl : media.poster}
    alt={`WebP da Lumi: ${label}`}
    width={media.width} height={media.height} decoding="async" loading="eager"
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

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { LumiVideoState } from '@/lib/lumi-video-states';
import { forgetLumiWebP, loadLumiWebP } from '@/lib/lumi-webp';

type Props = {
  id: LumiVideoState;
  label: string;
  url: string;
  className: string;
  visible: boolean;
  playing: boolean;
  replay: number;
  onReady: (id: LumiVideoState, url: string) => void;
  onError: (id: LumiVideoState, url: string) => void;
};

export default function LumiWebPClip({ id, label, url, className, visible, playing, replay, onReady, onError }: Props) {
  const [media, setMedia] = useState<{ blob: Blob; poster: string } | null>(null);
  const [animationUrl, setAnimationUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let previewUrl: string | undefined;
    const controller = new AbortController();
    const preview = new window.Image();
    void (async () => {
      try {
        const blob = await loadLumiWebP(url, controller.signal);
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
        setMedia({ blob, poster: canvas.toDataURL('image/png') });
        onReady(id, url);
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

  if (!media) return null;
  return <Image
    src={playing && animationUrl ? animationUrl : media.poster}
    alt={`WebP da Lumi: ${label}`}
    width={600} height={650} unoptimized loading="eager"
    className={className}
    data-state={id}
    data-visible={visible}
    data-playing={playing && Boolean(animationUrl)}
    aria-hidden={!visible}
    onError={() => { forgetLumiWebP(url); onError(id, url); }}
  />;
}

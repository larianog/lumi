import { BUNDLED_LUMI_VIDEO_CLIPS } from './lumi-video-states';

const bundledUrls = new Set(Object.values(BUNDLED_LUMI_VIDEO_CLIPS).map((clip) => clip.url));
const bundledLoads = new Map<string, Promise<Blob>>();

async function fetchWebP(url: string, signal?: AbortSignal): Promise<Blob> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`WebP load failed (${response.status})`);
  return response.blob();
}

export function loadLumiWebP(url: string, signal: AbortSignal): Promise<Blob> {
  if (!bundledUrls.has(url)) return fetchWebP(url, signal);

  // The placeholder and live conversation mount different avatars. Keep their
  // shared static download alive across that transition and StrictMode cleanup.
  let pending = bundledLoads.get(url);
  if (!pending) {
    pending = fetchWebP(url).catch((error: unknown) => {
      bundledLoads.delete(url);
      throw error;
    });
    bundledLoads.set(url, pending);
  }
  return pending;
}

export function forgetLumiWebP(url: string) {
  bundledLoads.delete(url);
}

/** RIFF/ANMF timing, in milliseconds; the original image bytes are never changed.
 * https://developers.google.com/speed/webp/docs/riff_container#animation
 */
export function readWebPAnimationTiming(buffer: ArrayBuffer): { durationMs: number; loops: number } | null {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const tag = (offset: number) => String.fromCharCode(...bytes.subarray(offset, offset + 4));
  if (bytes.length < 12 || tag(0) !== 'RIFF' || tag(8) !== 'WEBP') throw new Error('Invalid WebP header');
  const end = view.getUint32(4, true) + 8;
  if (end > bytes.length || end < 12) throw new Error('Truncated WebP');
  let durationMs = 0;
  let loops: number | null = null;
  for (let offset = 12; offset < end;) {
    if (offset + 8 > end) throw new Error('Truncated WebP chunk');
    const size = view.getUint32(offset + 4, true);
    const payload = offset + 8;
    const next = payload + size + (size % 2);
    if (next > end) throw new Error('Truncated WebP payload');
    if (tag(offset) === 'ANIM') {
      if (size < 6) throw new Error('Invalid WebP animation');
      loops = view.getUint16(payload + 4, true);
    }
    if (tag(offset) === 'ANMF') {
      if (size < 16) throw new Error('Invalid WebP frame');
      const delay = bytes[payload + 12] | (bytes[payload + 13] << 8) | (bytes[payload + 14] << 16);
      // Browsers use the GIF-compatible 100 ms fallback for very short delays.
      durationMs += delay <= 10 ? 100 : delay;
    }
    offset = next;
  }
  return loops !== null && durationMs > 0 ? { durationMs, loops } : null;
}

import assert from 'node:assert/strict';
import { BUNDLED_LUMI_VIDEO_CLIPS } from '../lib/lumi-video-states';
import { forgetLumiWebP, loadLumiWebP } from '../lib/lumi-webp';

export async function verifyLumiWebP() {
  const url = BUNDLED_LUMI_VIDEO_CLIPS.listening!.url;
  const originalFetch = globalThis.fetch;
  try {
    forgetLumiWebP(url);
    let finish!: (response: Response) => void;
    let calls = 0;
    globalThis.fetch = async (_input, init) => {
      calls++;
      assert.equal(init?.signal, undefined, 'A bundled load must survive a subscriber unmount');
      return new Promise<Response>((resolve) => { finish = resolve; });
    };
    const placeholder = new AbortController();
    const first = loadLumiWebP(url, placeholder.signal);
    placeholder.abort();
    const live = loadLumiWebP(url, new AbortController().signal);
    assert.equal(first, live, 'Placeholder and live avatar share the pending download');
    finish(new Response('webp bytes', { headers: { 'Content-Type': 'image/webp' } }));
    assert.equal(await (await live).text(), 'webp bytes');
    await loadLumiWebP(url, new AbortController().signal);
    assert.equal(calls, 1, 'Remount uses the downloaded file');

    forgetLumiWebP(url);
    globalThis.fetch = async () => new Response(null, { status: 503 });
    await assert.rejects(loadLumiWebP(url, new AbortController().signal), /503/);
    globalThis.fetch = async () => new Response('recovered');
    assert.equal(await (await loadLumiWebP(url, new AbortController().signal)).text(), 'recovered', 'A failed request can be retried');

    const local = new AbortController();
    globalThis.fetch = async (_input, init) => {
      assert.equal(init?.signal, local.signal, 'Local overrides retain abort/cleanup ownership');
      return new Response('local');
    };
    await loadLumiWebP('blob:local-test', local.signal);
  } finally {
    forgetLumiWebP(url);
    globalThis.fetch = originalFetch;
  }
  console.log('Lumi WebP lifecycle checks passed');
}

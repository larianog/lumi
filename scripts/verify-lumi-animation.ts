import assert from 'node:assert/strict';
import { Agent } from 'agora-agents';
import { NextRequest } from 'next/server';
import { GET, POST } from '../app/api/playground/lumi-animation/route';
import { MOTION_PRESETS } from '../lib/lumi-animation';

export async function verifyLumiAnimation() {
  const originalKey = process.env.NEXT_LEMONSLICE_API_KEY;
  const originalCreateSession = Agent.prototype.createSession;
  const animation = { ...MOTION_PRESETS[1], aspectRatio: '2x3' };
  const valid = { requester_id: '4321', channel_name: 'lumi-animation-contract', animation };
  const request = (body: unknown) => new NextRequest('http://localhost:3000/api/playground/lumi-animation', {
    method: 'POST', body: JSON.stringify(body),
  });
  let starts = 0;
  let captured: ReturnType<Agent['toProperties']> | undefined;
  Agent.prototype.createSession = function (this: Agent, options: Parameters<Agent['createSession']>[0]) {
    assert.equal(options.channel, valid.channel_name);
    assert.equal(options.agentUid, '123456');
    assert.deepEqual(options.remoteUids, ['4321']);
    captured = this.toProperties({ channel: options.channel, agentUid: '123456', remoteUids: ['4321'], token: 'mock-token' });
    return { start: async () => { starts++; return 'playground-agent'; } } as ReturnType<Agent['createSession']>;
  };

  try {
    for (const body of [null, [], {}, { ...valid, requester_id: '234567' }, { ...valid, requester_id: '0' },
      { ...valid, requester_id: '4294967296' }, { ...valid, channel_name: 'production-channel' },
      { ...valid, animation: { ...animation, aspectRatio: '16x9' } },
      { ...valid, animation: { ...animation, idlePrompt: ' ' } },
      { ...valid, animation: { ...animation, speakingPrompt: 'x'.repeat(1601) } }]) {
      assert.equal((await POST(request(body))).status, 400, 'Invalid playground requests must not start an agent');
    }
    assert.equal((await POST(new NextRequest('http://localhost/api/playground/lumi-animation', { method: 'POST', body: '{' }))).status, 400);
    assert.equal((await POST(request({ payload: 'x'.repeat(8001) }))).status, 413);
    assert.equal(starts, 0);

    delete process.env.NEXT_LEMONSLICE_API_KEY;
    assert.deepEqual(await (await GET()).json(), { configured: false });
    assert.equal((await POST(request(valid))).status, 503);
    assert.equal(starts, 0);

    process.env.NEXT_LEMONSLICE_API_KEY = 'mock-provider-key';
    const status = await GET();
    assert.equal(status.headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(await status.json(), { configured: true }, 'Status must not disclose credentials');
    const response = await POST(request(valid));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).agent_id, 'playground-agent');
    assert.equal(starts, 1);
    assert.equal(captured?.avatar?.params?.agent_prompt, animation.speakingPrompt);
    assert.equal(captured?.avatar?.params?.agent_idle_prompt, animation.idlePrompt);
    assert.equal(captured?.avatar?.params?.aspect_ratio, '2x3');
    assert.equal(captured?.avatar?.params?.agora_uid, '234567');
    assert.ok(captured?.avatar?.params?.agent_image_base64, 'Use the repository image as the avatar source');
    assert.equal(captured?.avatar?.params?.agent_image_url, undefined, 'Do not fetch caller-supplied images');

    Agent.prototype.createSession = (() => { throw new Error('sensitive provider detail'); }) as Agent['createSession'];
    const failure = await POST(request(valid));
    assert.equal(failure.status, 502);
    assert.ok(!(await failure.text()).includes('sensitive provider detail'), 'Provider errors must be sanitized');
  } finally {
    Agent.prototype.createSession = originalCreateSession;
    if (originalKey === undefined) delete process.env.NEXT_LEMONSLICE_API_KEY;
    else process.env.NEXT_LEMONSLICE_API_KEY = originalKey;
  }
  console.log('Lumi animation playground contract checks passed');
}

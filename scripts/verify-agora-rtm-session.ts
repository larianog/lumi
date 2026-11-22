import assert from 'node:assert/strict';
import type { RTMClient } from 'agora-rtm';
import { createRtmSessionManager, startManagedConversation } from '../lib/agora-rtm-session';
import type { AgentResponse } from '../types/conversation';
import { generateAgoraParticipantUid, isAgoraParticipantUid, MAX_AGORA_PARTICIPANT_UID } from '../lib/agora';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));

export async function verifyAgoraRtmSession() {
  for (const value of [2, 2147483647, 2147483648, 2796831013, 2746931989, 4294967295]) {
    const uid = generateAgoraParticipantUid(() => value);
    assert.ok(isAgoraParticipantUid(uid));
    assert.ok(Number(uid) <= MAX_AGORA_PARTICIPANT_UID, 'Browser IDs must fit the agent API, not just RTC');
  }
  const reserved = [0, 1, 123456 * 2, 234567 * 2, 8642];
  assert.equal(generateAgoraParticipantUid(() => reserved.shift()!), '4321', 'Skip zero and reserved agent identities');
  for (const uid of ['0', '123456', '234567', '2147483648', '2796831013', '4294967295', 'user-4321']) {
    assert.equal(isAgoraParticipantUid(uid), false);
  }
  const events: string[] = [];
  let instances = 0;
  let tokenCalls = 0;
  let logoutGate: Promise<void> | undefined;
  let loginGate: Promise<void> | undefined;
  let fail: 'login' | 'subscribe' | 'logout' | undefined;
  const client = {
    login: async () => { events.push('login'); await loginGate; if (fail === 'login') throw new Error('login failure'); },
    subscribe: async (channel: string) => { events.push(`subscribe:${channel}`); if (fail === 'subscribe') throw new Error('subscribe failure'); },
    logout: async () => { events.push('logout'); await logoutGate; if (fail === 'logout') throw new Error('logout failure'); },
  } as unknown as RTMClient;
  const manager = createRtmSessionManager({
    uid: '4321',
    createClient: async () => { instances++; return client; },
    getToken: async (uid, channel) => { tokenCalls++; return { uid, token: 'fake', channel: channel ?? `channel-${tokenCalls}` }; },
  });

  const first = manager.acquire();
  assert.equal((await first.ready).data.uid, '4321');
  const next = manager.acquire('study');
  const gate = deferred<void>(); logoutGate = gate.promise;
  const closing = first.release();
  await tick();
  assert.equal(tokenCalls, 1, 'Next session waits for prior logout');
  gate.resolve(); await closing; logoutGate = undefined;
  assert.equal((await next.ready).rtm, client);
  assert.equal(instances, 1, 'Navigation must reuse the same RTM instance');
  const beforeStaleRelease = events.length;
  await first.release();
  assert.equal(events.length, beforeStaleRelease, 'Late cleanup must not log out the next owner');

  const queued = manager.acquire();
  const queuedResult = assert.rejects(queued.ready, { name: 'AbortError' });
  const cancelQueued = queued.release();
  await next.release(); await cancelQueued; await queuedResult;
  assert.equal(tokenCalls, 2, 'Cancelled queued sessions must not request credentials');

  for (const failure of ['login', 'subscribe'] as const) {
    fail = failure;
    const broken = manager.acquire();
    await assert.rejects(broken.ready, new RegExp(failure)); await broken.release();
    assert.equal(events.at(-1), 'logout', 'Partial startup must log out');
    fail = undefined;
  }
  const slowLogin = deferred<void>(); loginGate = slowLogin.promise;
  const cancelled = manager.acquire();
  const cancelledResult = assert.rejects(cancelled.ready, { name: 'AbortError' });
  await tick();
  const subscriptions = events.filter((event) => event.startsWith('subscribe:')).length;
  const cancelLogin = cancelled.release(); slowLogin.resolve(); await cancelLogin; await cancelledResult; loginGate = undefined;
  assert.equal(events.filter((event) => event.startsWith('subscribe:')).length, subscriptions, 'Cancellation during login skips subscription');

  const live = manager.acquire(); await live.ready;
  fail = 'logout'; await assert.rejects(live.release(), /logout failure/);
  const loginCount = events.filter((event) => event === 'login').length;
  const unsafe = manager.acquire(); await assert.rejects(unsafe.ready, /logout failure/); await assert.rejects(unsafe.release(), /logout failure/);
  assert.equal(events.filter((event) => event === 'login').length, loginCount, 'Failed cleanup must block another login');
  fail = undefined;
  const recovered = manager.acquire(); await recovered.ready; await recovered.release();
  assert.equal(instances, 1, 'Retries keep the same immutable SDK identity');

  let abortedToken = false;
  const cancelledTokenManager = createRtmSessionManager({
    uid: '4321', createClient: async () => { throw new Error('Must not construct SDK after cancellation'); },
    getToken: async (_uid, _channel, signal) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => { abortedToken = true; reject(signal.reason); }, { once: true });
    }),
  });
  const tokenLease = cancelledTokenManager.acquire();
  const tokenResult = assert.rejects(tokenLease.ready, { name: 'AbortError' });
  await tick(); await tokenLease.release(); await tokenResult; assert.ok(abortedToken);

  const invite = deferred<AgentResponse>();
  const stopped: string[] = [];
  let invited = false;
  const conversation = startManagedConversation(manager.acquire(), () => { invited = true; return invite.promise; }, async (id) => { stopped.push(id); });
  const cancelledInvite = assert.rejects(conversation.ready, { name: 'AbortError' });
  await tick(); assert.ok(invited);
  const stopOne = conversation.stop(); const stopTwo = conversation.stop();
  invite.resolve({ agent_id: 'late-agent', state: 'RUNNING', create_ts: 1 });
  await Promise.all([stopOne, stopTwo, cancelledInvite]);
  assert.deepEqual(stopped, ['late-agent'], 'Late invite success must be stopped exactly once');

  const failedInvite = startManagedConversation(manager.acquire(), async () => { throw new Error('invite failure'); }, async () => {});
  await assert.rejects(failedInvite.ready, /invite failure/); await failedInvite.stop();
  assert.equal(events.at(-1), 'logout');
  console.log('Agora RTM singleton, ownership, cancellation and partial cleanup checks passed');
}

import type { RTMClient } from 'agora-rtm';
import type { AgentResponse, AgoraTokenData } from '@/types/conversation';
import { generateAgoraParticipantUid, isAgoraParticipantUid } from './agora';

type RtmConnection = { data: AgoraTokenData; rtm: RTMClient };
export type RtmLease = { ready: Promise<RtmConnection>; release: () => Promise<void> };
type Dependencies = {
  uid: string;
  createClient: () => Promise<RTMClient>;
  getToken: (uid: string, channel: string | undefined, signal: AbortSignal) => Promise<AgoraTokenData>;
};

/** One immutable SDK identity, with exclusive login/subscription ownership. */
export function createRtmSessionManager({ uid, createClient, getToken }: Dependencies) {
  if (!isAgoraParticipantUid(uid)) throw new Error('Invalid Agora participant UID');
  let client: Promise<RTMClient> | undefined;
  let dirty: RTMClient | undefined;
  let queue: Promise<void> = Promise.resolve();
  const logout = async () => {
    if (!dirty) return;
    await dirty.logout();
    dirty = undefined;
  };

  return {
    acquire(channel?: string): RtmLease {
      const controller = new AbortController();
      let resolveReady!: (value: RtmConnection) => void;
      let rejectReady!: (error: unknown) => void;
      const ready = new Promise<RtmConnection>((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
      let releaseHold!: () => void;
      const hold = new Promise<void>((resolve) => { releaseHold = resolve; });
      const done = queue.then(async () => {
        try {
          controller.signal.throwIfAborted();
          // A failed logout must be retried successfully before another login.
          await logout();
          controller.signal.throwIfAborted();
          const data = await getToken(uid, channel, controller.signal);
          controller.signal.throwIfAborted();
          if (data.uid !== uid) throw new Error('RTM token identity mismatch');
          client ??= createClient().catch((error: unknown) => { client = undefined; throw error; });
          const rtm = await client;
          controller.signal.throwIfAborted();
          dirty = rtm; // Also clean up a login or subscription that only partly succeeds.
          await rtm.login({ token: data.token });
          controller.signal.throwIfAborted();
          await rtm.subscribe(data.channel);
          controller.signal.throwIfAborted();
          resolveReady({ data, rtm });
          await hold;
        } catch (error) {
          rejectReady(error);
        } finally {
          await logout();
        }
      });
      queue = done.catch(() => {});
      return {
        ready,
        release: () => { controller.abort(); releaseHold(); return done; },
      };
    },
  };
}

type RtmManager = ReturnType<typeof createRtmSessionManager>;
type BrowserState = { appId: string; manager: RtmManager };
type RtmWindow = Window & { __lumiRtmSessionV1?: BrowserState };

export function getBrowserRtmManager(): RtmManager {
  if (typeof window === 'undefined') throw new Error('RTM requires a browser');
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  if (!appId) throw new Error('Missing Agora App ID');
  const browser = window as RtmWindow;
  if (browser.__lumiRtmSessionV1) {
    if (browser.__lumiRtmSessionV1.appId !== appId) throw new Error('Reload after changing Agora App ID');
    return browser.__lumiRtmSessionV1.manager;
  }
  // Per-document identity: no storage, so duplicated tabs cannot share the UID.
  const uid = generateAgoraParticipantUid();
  const manager = createRtmSessionManager({
    uid,
    createClient: async () => {
      const { default: AgoraRTM } = await import('agora-rtm');
      return new AgoraRTM.RTM(appId, uid);
    },
    getToken: async (identity, channel, signal) => {
      const query = new URLSearchParams({ uid: identity });
      if (channel) query.set('channel', channel);
      const response = await fetch(`/api/generate-agora-token?${query}`, { signal, cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to prepare Agora connection');
      return response.json() as Promise<AgoraTokenData>;
    },
  });
  // Survives client navigation and Fast Refresh without reconstructing the SDK.
  browser.__lumiRtmSessionV1 = { appId, manager };
  return manager;
}

export type ManagedConversation = {
  ready: Promise<RtmConnection & { agentJoinError: boolean }>;
  stop: () => Promise<void>;
};

/** Keep invites observable after cancellation so late agent IDs can be stopped. */
export function startManagedConversation(
  lease: RtmLease,
  invite: (data: AgoraTokenData) => Promise<AgentResponse | null>,
  stopAgent: (agentId: string) => Promise<void>,
): ManagedConversation {
  let cancelled = false;
  let agentId: string | undefined;
  let stopping: Promise<void> | undefined;
  const stopOwnedAgent = () => {
    if (!agentId) return Promise.resolve();
    const id = agentId;
    stopping ??= Promise.resolve().then(() => stopAgent(id)).then(() => { agentId = undefined; }).finally(() => { stopping = undefined; });
    return stopping;
  };
  const ready = (async () => {
    try {
      const connection = await lease.ready;
      if (cancelled) throw new DOMException('Conversation cancelled', 'AbortError');
      const agent = await invite(connection.data);
      agentId = agent?.agent_id;
      if (cancelled) throw new DOMException('Conversation cancelled', 'AbortError');
      return { ...connection, data: { ...connection.data, agentId }, agentJoinError: !agentId };
    } catch (error) {
      await Promise.allSettled([stopOwnedAgent(), lease.release()]);
      throw error;
    }
  })();
  return {
    ready,
    stop: async () => {
      cancelled = true;
      // Release RTM even if the invite is still pending. Its eventual ID is stopped below.
      const leaving = lease.release();
      const results = await Promise.allSettled([leaving, ready]);
      await stopOwnedAgent();
      if (results[0].status === 'rejected') throw results[0].reason;
    },
  };
}

export function stopBrowserAgent(agentId: string) {
  return fetch('/api/stop-conversation', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent_id: agentId }), keepalive: true,
  }).then((response) => {
    if (!response.ok) throw new Error('Unable to confirm agent shutdown');
  });
}

import type { RTMClient } from 'agora-rtm';

/**
 * Browser-only: one RTM client (and one user UID) per tab.
 *
 * The RTM SDK counts every `new RTM()` in the page and logs "Ins id is N,
 * please pay attention to avoid mutual kick issues" (as console.error) from the
 * second one on. Lumi sessions restart often (profile → study workspace →
 * back), so instead of creating a client per session we keep one and log it
 * in/out per session. Operations are queued so a new session never logs in
 * before the previous one has logged out.
 */

let tabUid: string | null = null;
let client: RTMClient | null = null;
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const next = queue.then(operation, operation);
  queue = next.catch(() => undefined);
  return next;
}

/** Stable numeric UID for this tab, reused for RTC and RTM across sessions. */
export function getTabUid() {
  tabUid ??= String(Math.floor(Math.random() * 9_999_000) + 1000);
  return tabUid;
}

/** Log the shared client in with a fresh token and subscribe to the session channel. */
export function acquireRtm(appId: string, uid: string, token: string, channel: string) {
  return enqueue(async () => {
    if (!client) {
      const { default: AgoraRTM } = await import('agora-rtm');
      client = new AgoraRTM.RTM(appId, uid);
    }
    await client.login({ token });
    await client.subscribe(channel);
    return client;
  });
}

/** Leave the session channel and log out; the client is kept for the next session. */
export function releaseRtm(channel: string | undefined) {
  return enqueue(async () => {
    if (!client) return;
    if (channel) await client.unsubscribe(channel).catch(() => {});
    await client.logout().catch(() => {});
  });
}

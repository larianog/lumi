import { ConvoAITokenBuilder, RtcRole, RtcTokenBuilder } from 'agora-token';

function credentials() {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.NEXT_AGORA_APP_CERTIFICATE;
  if (!appId || !appCertificate) {
    throw new Error('Missing Agora configuration. Set NEXT_PUBLIC_AGORA_APP_ID and NEXT_AGORA_APP_CERTIFICATE.');
  }
  return { appId, appCertificate };
}

/**
 * ConvoAI token (RTC + RTM + ConvoAI) for the agent publisher and REST auth.
 *
 * `agora-agents` 2.15.0 calls `ConvoAITokenBuilder.buildToken` with a role in
 * the `tokenExpire` slot, so its auto-generated tokens live for one second: the
 * agent joins, gets dropped, and no transcript/state ever arrives. Build the
 * token here and pass it to the session/client until that SDK call is fixed.
 * Lifetimes are relative seconds, not Unix timestamps.
 */
export function buildAgentToken(channelName: string, uid: string | number, lifetimeSeconds = 60 * 60) {
  const { appId, appCertificate } = credentials();
  return ConvoAITokenBuilder.buildToken(appId, appCertificate, channelName, String(uid), lifetimeSeconds, lifetimeSeconds);
}

/**
 * Plain RTC publisher token for the LemonSlice avatar UID. LemonSlice never
 * answers the session request (Agora reports "Read timed out") when given a
 * ConvoAI token, so the avatar must get a standard RTC token for its numeric UID.
 */
export function buildAvatarToken(channelName: string, uid: number, lifetimeSeconds = 60 * 60) {
  const { appId, appCertificate } = credentials();
  return RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, RtcRole.PUBLISHER, lifetimeSeconds, lifetimeSeconds);
}

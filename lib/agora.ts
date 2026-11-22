export const DEFAULT_AGENT_UID = 123456;
export const DEFAULT_AVATAR_UID = 234567;

// The Conversational AI join endpoint accepts signed 31-bit numeric participants,
// even though the RTC SDK alone accepts the wider unsigned 32-bit range.
export const MAX_AGORA_PARTICIPANT_UID = 2147483647;

export function isAgoraParticipantUid(value: unknown): value is string {
  return typeof value === 'string' && /^[1-9]\d{0,9}$/.test(value)
    && Number(value) <= MAX_AGORA_PARTICIPANT_UID
    && ![String(DEFAULT_AGENT_UID), String(DEFAULT_AVATAR_UID)].includes(value);
}

export function generateAgoraParticipantUid(randomUint32 = () => crypto.getRandomValues(new Uint32Array(1))[0]): string {
  let uid = '0';
  while (!isAgoraParticipantUid(uid)) uid = String(randomUint32() >>> 1);
  return uid;
}

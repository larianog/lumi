import type { RTMClient } from 'agora-rtm';

export interface AgoraTokenData {
  token: string;
  uid: string;
  channel: string;
  agentId?: string;
}

export interface ClientStartRequest {
  requester_id: string;
  channel_name: string;
  profile_name?: string;
  profile_id?: string;
  age?: number;
  activity_title?: string;
  avatar_mode?: 'provider' | 'local';
  material_id?: string;
}

export interface StopConversationRequest {
  agent_id: string;
}

export interface AgentResponse {
  agent_id: string;
  create_ts: number;
  state: string;
}

export interface AgoraRenewalTokens {
  rtcToken: string;
  rtmToken: string;
}

export interface ConversationComponentProps {
  agoraData: AgoraTokenData;
  rtmClient: RTMClient;
  onTokenWillExpire: (uid: string) => Promise<AgoraRenewalTokens>;
  onEndConversation: () => void;
  /** `full` = in-call layout with header and transcript; `inline` = avatar + mic only. */
  variant?: 'full' | 'inline';
  avatarMode?: 'provider' | 'local';
  /** Called from a user tap after microphone access was denied. */
  onRetryMicrophone?: () => void;
  /** End the failed session and start a fresh one without leaving the page. */
  onRetryConversation?: () => void;
}

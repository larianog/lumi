import type { SessionRecordingContext } from '@/lib/use-session-recorder';
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
  /** Called from a user tap after microphone access was denied. */
  onRetryMicrophone?: () => void;
  /** When set, the session audio is recorded and saved for the parent area. */
  recording?: SessionRecordingContext;
}

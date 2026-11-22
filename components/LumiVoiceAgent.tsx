'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Loader2, Mic, X } from 'lucide-react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { RTMClient } from 'agora-rtm';
import { acquireRtm, getTabUid, releaseRtm } from '@/lib/rtm-session';
import type { SessionRecordingContext } from '@/lib/use-session-recorder';
import { messages } from '@/packages/i18n';
import type {
  AgentResponse,
  AgoraRenewalTokens,
  AgoraTokenData,
  ClientStartRequest,
} from '@/types/conversation';
import { ErrorBoundary } from './ErrorBoundary';
import { getLumiAvatar } from '@/lib/lumi-avatars';
import { LoadingSkeleton } from './LoadingSkeleton';

const ConversationComponent = dynamic(() => import('./ConversationComponent'), {
  ssr: false,
});

const AgoraProvider = dynamic(
  async () => {
    const { AgoraRTCProvider, default: AgoraRTC } = await import('agora-rtc-react');
    return {
      default: function AgoraProviders({ children }: { children: React.ReactNode }) {
        const clientRef = useRef<ReturnType<typeof AgoraRTC.createClient> | null>(null);
        if (!clientRef.current) {
          clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        }
        return <AgoraRTCProvider client={clientRef.current}>{children}</AgoraRTCProvider>;
      },
    };
  },
  { ssr: false },
);

type LumiVoiceAgentProps = {
  profileName: string;
  age: number;
  activityTitle: string;
  /** Profile/material identifiers let the server ground Lumi without trusting browser-supplied text. */
  profileId?: string;
  materialId?: string;
  /** Record the session audio for the parent area. */
  recording?: SessionRecordingContext;
  /** Lumi avatar chosen on the child's profile (`LumiAvatarId`). */
  lumiAvatar?: string;
  /** Start the session on mount instead of waiting for the "start" button. */
  autoStart?: boolean;
  /** `modal` = full-screen dialog; `inline` = avatar embedded in the page. */
  variant?: 'modal' | 'inline';
  onClose?: () => void;
};

export default function LumiVoiceAgent({
  profileName,
  age,
  activityTitle,
  profileId,
  materialId,
  recording,
  lumiAvatar,
  autoStart = false,
  variant = 'modal',
  onClose = () => {},
}: LumiVoiceAgentProps) {
  const avatarImage = getLumiAvatar(lumiAvatar).image;
  const [showConversation, setShowConversation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agoraData, setAgoraData] = useState<AgoraTokenData | null>(null);
  const [rtmClient, setRtmClient] = useState<RTMClient | null>(null);
  const [agentJoinError, setAgentJoinError] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  useEffect(() => {
    import('agora-rtc-react').catch(() => {});
    import('agora-rtm').catch(() => {});
  }, []);

  // True once the component has really unmounted. Reset on (re)mount so the
  // StrictMode simulated unmount does not count.
  const unmountedRef = useRef(false);

  const handleStartConversation = async () => {
    // Microphone and WebRTC only work on HTTPS or localhost (e.g. a phone on
    // http://192.168.x.x fails with WEB_SECURITY_RESTRICT). Explain instead.
    if (!window.isSecureContext) {
      setError(messages.voice.insecureContext);
      return;
    }
    setIsLoading(true);
    setError(null);
    setAgentJoinError(false);
    try {
      // Same UID for every session in this tab, so the shared RTM client can be reused.
      const agoraResponse = await fetch(`/api/generate-agora-token?uid=${getTabUid()}`);
      const responseData = await agoraResponse.json();
      if (!agoraResponse.ok) throw new Error(responseData.error ?? 'Agora token error');

      const [agentData, rtm] = await Promise.all([
        fetch('/api/invite-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requester_id: responseData.uid,
            channel_name: responseData.channel,
            profile_name: profileName,
            profile_id: profileId,
            age,
            activity_title: activityTitle,
            material_id: materialId,
            avatar_id: lumiAvatar,
          } satisfies ClientStartRequest & {
            profile_name: string;
            age: number;
            activity_title: string;
            profile_id?: string;
            material_id?: string;
          }),
        })
          .then(async (response) => {
            if (!response.ok) {
              setAgentJoinError(true);
              return null;
            }
            return response.json() as Promise<AgentResponse>;
          })
          .catch(() => {
            setAgentJoinError(true);
            return null;
          }),
        acquireRtm(
          process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          responseData.uid,
          responseData.token,
          responseData.channel,
        ),
      ]);

      // The page was left while connecting: release what was just created
      // instead of leaving an orphan RTM client (and agent) logged in.
      if (unmountedRef.current) {
        stopSession(agentData?.agent_id, responseData.channel);
        return;
      }

      setRtmClient(rtm);
      setAgoraData({ ...responseData, agentId: agentData?.agent_id });
      setShowConversation(true);
    } catch (conversationError) {
      console.error('Failed to start Lumi conversation:', conversationError);
      setError(messages.voice.connectionError);
    } finally {
      setIsLoading(false);
    }
  };

  // The ref survives React StrictMode's simulated remount, so only one
  // agent session is started per mount.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (!autoStart || autoStartedRef.current) return;
    autoStartedRef.current = true;
    void handleStartConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [autoStart]);

  // Stop the agent and leave RTM when the page unmounts (e.g. the child opens
  // an activity), so no agent keeps running in an empty channel.
  const sessionRef = useRef<{ agentId?: string; channel?: string }>({});
  useEffect(() => {
    sessionRef.current = rtmClient ? { agentId: agoraData?.agentId, channel: agoraData?.channel } : {};
  }, [agoraData, rtmClient]);
  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      const { agentId, channel } = sessionRef.current;
      sessionRef.current = {};
      if (agentId || channel) stopSession(agentId, channel);
    };
  }, []);

  const handleTokenWillExpire = useCallback(
    async (uid: string): Promise<AgoraRenewalTokens> => {
      const channel = agoraData?.channel;
      if (!channel || !agoraData) throw new Error('Missing Agora channel');
      const [rtcResponse, rtmResponse] = await Promise.all([
        fetch(`/api/generate-agora-token?channel=${channel}&uid=${uid}`),
        fetch(`/api/generate-agora-token?channel=${channel}&uid=${agoraData.uid}`),
      ]);
      const [rtcData, rtmData] = await Promise.all([rtcResponse.json(), rtmResponse.json()]);
      if (!rtcResponse.ok || !rtmResponse.ok) throw new Error('Failed to renew Agora tokens');
      return { rtcToken: rtcData.token, rtmToken: rtmData.token };
    },
    [agoraData],
  );

  // Safari and embedded browsers deny microphone access requested without a
  // user gesture (we auto-start on page load). Asking again inside the tap
  // grants permission; remounting the conversation then recreates the track.
  const [microphoneAttempt, setMicrophoneAttempt] = useState(0);
  const handleRetryMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch (permissionError) {
      console.error('Microphone permission still denied:', permissionError);
    }
    setMicrophoneAttempt((attempt) => attempt + 1);
  }, []);

  const handleEndConversation = useCallback(async () => {
    sessionRef.current = {}; // stopped here, skip the unmount cleanup
    if (agoraData?.agentId) {
      try {
        await fetch('/api/stop-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent_id: agoraData.agentId }),
        });
      } catch (stopError) {
        console.error('Failed to stop Lumi agent:', stopError);
      }
    }
    await releaseRtm(agoraData?.channel);
    setRtmClient(null);
    setShowConversation(false);
    setSessionEnded(true);
    onClose();
  }, [agoraData, onClose]);

  if (variant === 'inline') {
    return (
      <div className="lumi-inline-host">
        {showConversation && agoraData && rtmClient ? (
          <Suspense fallback={<LumiInlinePlaceholder image={avatarImage} status={messages.voice.starting} />}>
            <ErrorBoundary>
              {agentJoinError && <div className="voice-warning">{messages.voice.connectionError}</div>}
              <AgoraProvider>
                <ConversationComponent
                  key={microphoneAttempt}
                  onRetryMicrophone={handleRetryMicrophone}
                  agoraData={agoraData}
                  rtmClient={rtmClient}
                  onTokenWillExpire={handleTokenWillExpire}
                  onEndConversation={handleEndConversation}
                  recording={recording}
                  lumiAvatar={lumiAvatar}
                  variant="inline"
                />
              </AgoraProvider>
            </ErrorBoundary>
          </Suspense>
        ) : sessionEnded ? (
          <LumiInlinePlaceholder image={avatarImage} status={messages.voice.sessionEnded}>
            <button
              className="lumi-inline-restart"
              type="button"
              disabled={isLoading}
              onClick={() => {
                setSessionEnded(false);
                void handleStartConversation();
              }}
            >
              <Mic size={16} />{messages.voice.talkAgain}
            </button>
          </LumiInlinePlaceholder>
        ) : (
          <LumiInlinePlaceholder image={avatarImage} status={error ?? messages.voice.starting} />
        )}
      </div>
    );
  }

  return (
    <div className="voice-modal" role="dialog" aria-modal="true" aria-label={messages.voice.title}>
      {!showConversation ? (
        <div className="voice-precall">
          <button className="voice-close" onClick={onClose} aria-label={messages.common.close}><X size={21} /></button>
          <div className="voice-precall-orbit"><Image src={avatarImage} alt={messages.accessibility.lumiMascot} width={160} height={165} /></div>
          <span className="eyebrow">{messages.voice.title}</span>
          <h2>{messages.voice.preCall}</h2>
          <p>{messages.voice.configurationHint}</p>
          <button className="button button-primary button-large" onClick={handleStartConversation} disabled={isLoading}>
            {isLoading ? <Loader2 size={20} className="spin" /> : <Mic size={20} />}
            {isLoading ? messages.voice.starting : messages.voice.start}
          </button>
          {error && <p className="form-error">{error}</p>}
        </div>
      ) : agoraData && rtmClient ? (
        <Suspense fallback={<LoadingSkeleton />}>
          <ErrorBoundary>
            {agentJoinError && <div className="voice-warning">{messages.voice.connectionError}</div>}
            <AgoraProvider>
              <ConversationComponent
                key={microphoneAttempt}
                onRetryMicrophone={handleRetryMicrophone}
                agoraData={agoraData}
                rtmClient={rtmClient}
                onTokenWillExpire={handleTokenWillExpire}
                onEndConversation={handleEndConversation}
                recording={recording}
                lumiAvatar={lumiAvatar}
              />
            </AgoraProvider>
          </ErrorBoundary>
        </Suspense>
      ) : (
        <p className="form-error">{messages.voice.connectionError}</p>
      )}
    </div>
  );
}

/** Stop the agent and log the RTM client out. Safe to call with partial data. */
/** Stop the agent and log the shared RTM client out of this session's channel. */
function stopSession(agentId: string | undefined, channel: string | undefined) {
  if (agentId) {
    void fetch('/api/stop-conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId }),
      keepalive: true,
    }).catch(() => {});
  }
  void releaseRtm(channel);
}

function LumiInlinePlaceholder({ status, image, children }: { status: string; image: string; children?: React.ReactNode }) {
  return (
    <div className="lumi-inline">
      <Image
        className="lumi-inline-fallback"
        src={image}
        alt={messages.accessibility.lumiMascot}
        width={480}
        height={520}
        priority
      />
      <div className="lumi-inline-controls">
        <span className="lumi-inline-status" aria-live="polite">{status}</span>
      </div>
      {children}
    </div>
  );
}

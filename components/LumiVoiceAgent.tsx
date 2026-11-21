'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Loader2, Mic, X } from 'lucide-react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { RTMClient } from 'agora-rtm';
import { messages } from '@/packages/i18n';
import type {
  AgentResponse,
  AgoraRenewalTokens,
  AgoraTokenData,
  ClientStartRequest,
} from '@/types/conversation';
import { ErrorBoundary } from './ErrorBoundary';
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
  onClose: () => void;
};

export default function LumiVoiceAgent({ profileName, age, activityTitle, onClose }: LumiVoiceAgentProps) {
  const [showConversation, setShowConversation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agoraData, setAgoraData] = useState<AgoraTokenData | null>(null);
  const [rtmClient, setRtmClient] = useState<RTMClient | null>(null);
  const [agentJoinError, setAgentJoinError] = useState(false);

  useEffect(() => {
    import('agora-rtc-react').catch(() => {});
    import('agora-rtm').catch(() => {});
  }, []);

  const handleStartConversation = async () => {
    setIsLoading(true);
    setError(null);
    setAgentJoinError(false);
    try {
      const agoraResponse = await fetch('/api/generate-agora-token');
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
            age,
            activity_title: activityTitle,
          } satisfies ClientStartRequest & {
            profile_name: string;
            age: number;
            activity_title: string;
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
        (async () => {
          const { default: AgoraRTM } = await import('agora-rtm');
          const rtm: RTMClient = new AgoraRTM.RTM(
            process.env.NEXT_PUBLIC_AGORA_APP_ID!,
            responseData.uid,
          );
          await rtm.login({ token: responseData.token });
          await rtm.subscribe(responseData.channel);
          return rtm;
        })(),
      ]);

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

  const handleEndConversation = useCallback(async () => {
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
    await rtmClient?.logout().catch(() => {});
    setRtmClient(null);
    setShowConversation(false);
    onClose();
  }, [agoraData, onClose, rtmClient]);

  return (
    <div className="voice-modal" role="dialog" aria-modal="true" aria-label={messages.voice.title}>
      {!showConversation ? (
        <div className="voice-precall">
          <button className="voice-close" onClick={onClose} aria-label={messages.common.close}><X size={21} /></button>
          <div className="voice-precall-orbit"><Image src="/assets/lumi-avatar.png" alt={messages.accessibility.lumiMascot} width={160} height={165} /></div>
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
                agoraData={agoraData}
                rtmClient={rtmClient}
                onTokenWillExpire={handleTokenWillExpire}
                onEndConversation={handleEndConversation}
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

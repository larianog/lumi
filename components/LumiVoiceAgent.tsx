'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Loader2, Mic, X } from 'lucide-react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { RTMClient } from 'agora-rtm';
import { messages } from '@/packages/i18n';
import { getLumiAvatar } from '@/lib/lumi-avatars';
import { getBrowserRtmManager, startManagedConversation, stopBrowserAgent, type ManagedConversation } from '@/lib/agora-rtm-session';
import type {
  AgentResponse,
  AgoraRenewalTokens,
  AgoraTokenData,
  ClientStartRequest,
} from '@/types/conversation';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSkeleton } from './LoadingSkeleton';
import LumiConversationAvatar from './LumiConversationAvatar';
import avatarStyles from './lumi-conversation-avatar.module.css';

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
  /** Start the session on mount instead of waiting for the "start" button. */
  autoStart?: boolean;
  /** `modal` = full-screen dialog; `inline` = avatar embedded in the page. */
  variant?: 'modal' | 'inline';
  avatarMode?: 'provider' | 'local';
  lumiAvatar?: string;
  onClose?: () => void;
};

export default function LumiVoiceAgent({
  profileName,
  age,
  activityTitle,
  profileId,
  materialId,
  autoStart = false,
  variant = 'modal',
  avatarMode = 'provider',
  lumiAvatar,
  onClose = () => {},
}: LumiVoiceAgentProps) {
  const selectedAvatarImage = avatarMode === 'provider' && lumiAvatar ? getLumiAvatar(lumiAvatar).image : undefined;
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

  const mounted = useRef(false);
  const session = useRef<ManagedConversation | null>(null);
  const restarting = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const current = session.current;
      session.current = null;
      void current?.stop().catch(() => {});
    };
  }, []);

  const handleStartConversation = async () => {
    if (session.current) return;
    setIsLoading(true); setError(null); setAgentJoinError(false);
    let current: ManagedConversation | undefined;
    try {
      current = startManagedConversation(getBrowserRtmManager().acquire(), async (data) => {
        try {
          const response = await fetch('/api/invite-agent', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requester_id: data.uid, channel_name: data.channel,
              profile_name: profileName, profile_id: profileId, age,
              activity_title: activityTitle, avatar_mode: avatarMode, avatar_id: lumiAvatar, material_id: materialId,
            } satisfies ClientStartRequest),
          });
          return response.ok ? await response.json() as AgentResponse : null;
        } catch { return null; }
      }, stopBrowserAgent);
      session.current = current;
      const live = await current.ready;
      if (!mounted.current || session.current !== current) { await current.stop(); return; }
      if (live.agentJoinError) {
        await current.stop();
        throw new Error('Lumi agent did not start');
      }
      setRtmClient(live.rtm); setAgoraData(live.data); setAgentJoinError(live.agentJoinError);
      setShowConversation(true);
    } catch (conversationError) {
      if (mounted.current && (!current || session.current === current)) {
        session.current = null;
        console.error('Failed to start Lumi conversation:', conversationError);
        setError(messages.voice.connectionError);
      }
    } finally {
      if (mounted.current && (!session.current || session.current === current)) setIsLoading(false);
    }
  };

  const handleRetryConversation = async () => {
    if (restarting.current) return;
    restarting.current = true;
    const current = session.current;
    setShowConversation(false); setAgoraData(null); setRtmClient(null);
    setIsLoading(true); setError(null);
    try {
      // Unmount RTC through its hooks, then release the RTM lease before retrying.
      await current?.stop();
      if (!mounted.current || session.current !== current) return;
      session.current = null;
      await handleStartConversation();
    } catch {
      if (mounted.current && session.current === current) {
        // Keep ownership if shutdown failed, so another tap can retry cleanup.
        setError(messages.voice.connectionError);
        setIsLoading(false);
      }
    } finally { restarting.current = false; }
  };

  useEffect(() => {
    if (!autoStart) return;
    // StrictMode cancels the first timer before token requests or SDK creation.
    const timer = window.setTimeout(() => { void handleStartConversation(); }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one automatic attempt per mount
  }, [autoStart]);

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
    const current = session.current;
    setShowConversation(false); setRtmClient(null); setIsLoading(true);
    try { await current?.stop(); }
    catch { if (mounted.current) setError(messages.voice.connectionError); }
    finally {
      if (session.current === current) session.current = null;
      if (mounted.current) { setIsLoading(false); onClose(); }
    }
  }, [onClose]);

  if (variant === 'inline') {
    return (
      <div className={`lumi-inline-host ${avatarMode === 'local' ? avatarStyles.host : ''}`}>
        {showConversation && agoraData && rtmClient ? (
          <Suspense fallback={<LumiInlinePlaceholder status={messages.voice.starting} image={selectedAvatarImage} />}>
            <ErrorBoundary>
              {agentJoinError && <div className="voice-warning">{messages.voice.connectionError}</div>}
              <AgoraProvider>
                <ConversationComponent
                  key={microphoneAttempt}
                  onRetryMicrophone={handleRetryMicrophone}
                  onRetryConversation={handleRetryConversation}
                  agoraData={agoraData}
                  rtmClient={rtmClient}
                  onTokenWillExpire={handleTokenWillExpire}
                  onEndConversation={handleEndConversation}
                  variant="inline"
                  avatarMode={avatarMode}
                  lumiAvatar={lumiAvatar}
                />
              </AgoraProvider>
            </ErrorBoundary>
          </Suspense>
        ) : (
          <LumiInlinePlaceholder status={error ?? messages.voice.starting} image={selectedAvatarImage}
            onRetry={error && !isLoading ? handleRetryConversation : undefined} />
        )}
      </div>
    );
  }

  return (
    <div className="voice-modal" role="dialog" aria-modal="true" aria-label={messages.voice.title}>
      {!showConversation ? (
        <div className="voice-precall">
          <button className="voice-close" onClick={onClose} aria-label={messages.common.close}><X size={21} /></button>
          <div className="voice-precall-orbit">{selectedAvatarImage
            ? <Image src={selectedAvatarImage} alt={messages.accessibility.lumiMascot} width={160} height={165} />
            : <LumiConversationAvatar state="idle" idleOnly />}</div>
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
                onRetryConversation={handleRetryConversation}
                agoraData={agoraData}
                rtmClient={rtmClient}
                onTokenWillExpire={handleTokenWillExpire}
                onEndConversation={handleEndConversation}
                avatarMode={avatarMode}
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

function LumiInlinePlaceholder({ status, image, onRetry }: { status: string; image?: string; onRetry?: () => void }) {
  return (
    <div className="lumi-inline">
      {image
        ? <Image className="lumi-inline-fallback" src={image} alt={messages.accessibility.lumiMascot} width={480} height={520} priority />
        : <LumiConversationAvatar state="idle" />}
      <div className="lumi-inline-controls">
        <span className="lumi-inline-status" aria-live="polite">{status}</span>
        {onRetry && <button className="button button-primary" onClick={onRetry}>{messages.voice.reconnect}</button>}
      </div>
    </div>
  );
}

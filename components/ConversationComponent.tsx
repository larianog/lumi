'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AgoraRTC, {
  useRTCClient,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  useClientEvent,
  useJoin,
  usePublish,
  useConnectionState,
  RemoteUser,
  UID,
} from 'agora-rtc-react';
import {
  AgoraVoiceAI,
  AgoraVoiceAIEvents,
  AgentState,
  ChatMessagePriority,
  ChatMessageType,
  MessageSalStatus,
  TranscriptHelperMode,
  type TranscriptHelperItem,
  type UserTranscription,
  type AgentTranscription,
} from 'agora-agent-client-toolkit';
import { AgentVisualizer } from 'agora-agent-uikit';
import { MicButtonWithVisualizer } from 'agora-agent-uikit/rtc';
import {
  childSaid,
  extractFillCommands,
  fillAnswer,
  LUMI_SEND_TEXT_EVENT,
  type LumiSendTextDetail,
} from '@/lib/lumi-events';
import { DEFAULT_AGENT_UID, DEFAULT_AVATAR_UID } from '@/lib/agora';
import { messages } from '@/packages/i18n';
import {
  getCurrentInProgressMessage,
  getMessageList,
  mapAgentVisualizerState,
  normalizeTimestampMs,
  normalizeTranscript,
} from '@/lib/conversation';
import {
  getConversationIssueSeverity,
  type ConnectionIssue,
} from './ConversationErrorCard';
import type { ConversationComponentProps } from '@/types/conversation';
import LumiConversationAvatar from './LumiConversationAvatar';
import ChromaKeyAvatar from './ChromaKeyAvatar';
import { getLumiAvatar } from '@/lib/lumi-avatars';
import { useSessionRecorder } from '@/lib/use-session-recorder';
import { PhoneOff } from 'lucide-react';
import { useLumiSpeechState } from './useLumiSpeechState';
import { useLumiIdleSleep } from './useLumiIdleSleep';
import { isLumiRestingAgentState } from '@/lib/lumi-animation-transition';
import { LumiAnswerCelebrationDetector, LumiMaterialCompletionDetector } from '@/lib/lumi-answer-celebration';

// Cap the displayed issues list to avoid overwhelming the UI during a cascade of errors.
const MAX_CONNECTION_ISSUES = 6;

// Payload shape for signaling-level errors forwarded by the agent over RTM.
// The `module` field identifies which backend subsystem (LLM / ASR / TTS) raised the error.
type RtmMessageErrorPayload = {
  object: 'message.error';
  module?: string;
  code?: number;
  message?: string;
  send_ts?: number;
};

// Payload shape for SAL (Session Abstraction Layer) registration status messages.
// VP_REGISTER_FAIL and VP_REGISTER_DUPLICATE indicate RTM channel subscription problems.
type RtmSalStatusPayload = {
  object: 'message.sal_status';
  status?: string;
  timestamp?: number;
};

// Type guard for RTM signaling-level error payloads (object: 'message.error').
function isRtmMessageErrorPayload(
  value: unknown,
): value is RtmMessageErrorPayload {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { object?: unknown }).object === 'message.error'
  );
}

// Type guard for RTM SAL status payloads (object: 'message.sal_status').
function isRtmSalStatusPayload(value: unknown): value is RtmSalStatusPayload {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { object?: unknown }).object === 'message.sal_status'
  );
}

export default function ConversationComponent({
  agoraData,
  rtmClient,
  onTokenWillExpire,
  onEndConversation,
  variant = 'full',
  avatarMode = 'provider',
  lumiAvatar,
  recording,
  celebrateAnswers = false,
  onMaterialCompleted,
  onRetryMicrophone,
  onRetryConversation,
}: ConversationComponentProps) {
  const client = useRTCClient();
  const remoteUsers = useRemoteUsers();
  const [isEnabled, setIsEnabled] = useState(true);
  const [isAgentConnected, setIsAgentConnected] = useState(false);

  // Browsers block audio playback until the user interacts with the page
  // (e.g. when the profile URL is opened directly). The SDK resumes playback
  // on the next user gesture, so we only need to ask for a tap.
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  useEffect(() => {
    AgoraRTC.onAutoplayFailed = () => setAutoplayBlocked(true);
    return () => {
      AgoraRTC.onAutoplayFailed = undefined;
    };
  }, []);

  // Tracks granular RTC connection state for the status dot.
  // Agora states: DISCONNECTED | CONNECTING | CONNECTED | DISCONNECTING | RECONNECTING
  const connectionState = useConnectionState(client);
  const [agentLeft, setAgentLeft] = useState(false);
  const [connectionTimedOut, setConnectionTimedOut] = useState(false);
  const agentUID = String(DEFAULT_AGENT_UID);
  const handledFillCommandsRef = useRef(new Set<string>());
  const childTurnsRef = useRef(new Map<string, { text: string; timer: ReturnType<typeof setTimeout> }>());
  useEffect(() => {
    const pending = childTurnsRef.current;
    return () => pending.forEach(({ timer }) => clearTimeout(timer));
  }, []);
  const avatarUID = String(DEFAULT_AVATAR_UID);
  const [joinedUID, setJoinedUID] = useState<UID>(0);

  // Transcript + agent state — managed with AgoraVoiceAI (see effect below).
  const [rawTranscript, setRawTranscript] = useState<
    TranscriptHelperItem<Partial<UserTranscription | AgentTranscription>>[]
  >([]);
  const [agentState, setAgentState] = useState<AgentState | null>(null);
  const [connectionIssues, setConnectionIssues] = useState<ConnectionIssue[]>(
    [],
  );
  const addConnectionIssue = useCallback((issue: ConnectionIssue) => {
    // Log diagnostics only: never transcripts, provider payloads or credentials.
    console.warn('[Lumi] Voice service issue', { source: issue.source, code: issue.code });
    setConnectionIssues((prev) => {
      const isDuplicate = prev.some(
        (x) =>
          x.agentUserId === issue.agentUserId &&
          x.code === issue.code &&
          x.message === issue.message &&
          Math.abs(x.timestamp - issue.timestamp) < 1500,
      );
      if (isDuplicate) return prev;
      return [issue, ...prev].slice(0, MAX_CONNECTION_ISSUES);
    });
  }, []);


  // StrictMode guard: delay `useJoin`'s ready flag until after the fake-unmount
  // cycle completes. React StrictMode fires cleanup synchronously before any
  // setTimeout callback, so the first (fake) mount's timeout is always cancelled.
  // Only the real second mount's timeout fires, meaning useJoin joins exactly once.
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      if (!cancelled) setIsReady(true);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
      setIsReady(false);
    };
  }, []);

  const { isConnected: joinSuccess, error: joinError } = useJoin(
    {
      appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
      channel: agoraData.channel,
      token: agoraData.token,
      uid: parseInt(agoraData.uid, 10),
    },
    isReady,
  );

  // Create mic track only after the StrictMode fake-unmount cycle completes (isReady).
  // Passing `true` here creates two tracks in StrictMode — the first publishes, then
  // StrictMode cleanup closes it and the second takes over, causing a ~3s audio gap.
  // isReady uses the same setTimeout(fn,0) pattern as useJoin: StrictMode cleanup fires
  // synchronously before the timeout, so only the real second mount's timer fires.
  // Do NOT pass `isEnabled` — that ties track lifetime to mute state and breaks the Web Audio
  // graph inside MicButtonWithVisualizer. Mute uses track.setEnabled() only.
  const { localMicrophoneTrack, error: microphoneError } = useLocalMicrophoneTrack(isReady);
  const lumiConnected = isReady && joinSuccess && isAgentConnected && connectionState === 'CONNECTED';
  useEffect(() => {
    if (!isReady || lumiConnected) { setConnectionTimedOut(false); return; }
    const timer = window.setTimeout(() => setConnectionTimedOut(true), 20_000);
    return () => window.clearTimeout(timer);
  }, [isReady, lumiConnected]);
  useEffect(() => {
    if (isAgentConnected) setAgentLeft(false);
  }, [isAgentConnected]);
  const lumiSpeechState = useLumiSpeechState({
    enabled: avatarMode === 'local',
    connected: lumiConnected,
    microphoneEnabled: isEnabled && !microphoneError,
    agentAudioEnabled: !autoplayBlocked,
    microphone: localMicrophoneTrack,
    agent: remoteUsers.find((user) => String(user.uid) === agentUID),
  });

  // Track the auto-assigned RTC UID for token renewal and agent invite.
  useEffect(() => {
    if (joinSuccess && client) {
      const uid = client.uid;
      if (uid !== null && uid !== undefined) {
        setJoinedUID(uid);
      }
    }
  }, [joinSuccess, client]);

  // Initialize AgoraVoiceAI once the channel is joined.
  //
  // Gating on `isReady && joinSuccess` is critical for StrictMode safety:
  //   - `isReady` ensures we are past the initial fake-unmount cycle, so this
  //     effect only runs on the real mount (not the discarded fake one).
  //   - Once `isReady` is true, React does NOT double-invoke this effect for
  //     subsequent state changes (`joinSuccess` becoming true). That means
  //     AgoraVoiceAI.init() is called exactly once.
  useEffect(() => {
    if (!isReady || !joinSuccess) return;

    let cancelled = false;

    (async () => {
      try {
        const ai = await AgoraVoiceAI.init({
          rtcEngine: client,
          rtmEngine: rtmClient,
          // TEXT uses RTM transcripts and needs no audio PTS. Enabling PTS here
          // changes encodedInsertableStreams on an existing peer connection,
          // causing InvalidModificationError on its next configuration update.
          renderMode: TranscriptHelperMode.TEXT,
          enableLog: true,
        });

        if (cancelled) {
          try {
            if (AgoraVoiceAI.getInstance() === ai) {
              // Tear down only the instance created by this effect run.
              ai.unsubscribe();
              ai.destroy();
            }
          } catch {}
          return;
        }

        ai.on(AgoraVoiceAIEvents.TRANSCRIPT_UPDATED, (t) => {
          setRawTranscript([...t]);
          for (const item of t) {
            if (typeof item.text !== 'string') continue;
            if (item.uid === '0') {
              const key = `child:${item.turn_id}`;
              if (handledFillCommandsRef.current.has(key)) continue;
              const text = item.text;
              const pending = childTurnsRef.current;
              const emit = () => {
                if (handledFillCommandsRef.current.has(key)) return;
                handledFillCommandsRef.current.add(key);
                clearTimeout(pending.get(key)?.timer);
                pending.delete(key);
                if (text.trim()) childSaid(text);
              };
              if ((item.metadata as { final?: boolean } | null)?.final === true) {
                emit();
              } else if (pending.get(key)?.text !== text) {
                clearTimeout(pending.get(key)?.timer);
                pending.set(key, { text, timer: setTimeout(emit, 1500) });
              }
              continue;
            }
            extractFillCommands(item.text).forEach((command, position) => {
              const key = `${item.turn_id}:${position}`;
              if (handledFillCommandsRef.current.has(key)) return;
              handledFillCommandsRef.current.add(key);
              fillAnswer(command);
            });
          }
        });
        // Agent state drives the visualizer, independent of RTC audio presence.
        ai.on(AgoraVoiceAIEvents.AGENT_STATE_CHANGED, (_, event) =>
          setAgentState(event.state),
        );
        ai.on(AgoraVoiceAIEvents.MESSAGE_ERROR, (agentUserId, error) => {
          addConnectionIssue({
            id: `${Date.now()}-${agentUserId}-message-error-${error.code}`,
            source: 'rtm',
            agentUserId,
            code: error.code,
            message: error.message,
            timestamp: normalizeTimestampMs(error.timestamp),
          });
        });
        // SAL status: capture raw RTM messages so message.sal_status surfaces even if higher-level events don't.
        ai.on(
          AgoraVoiceAIEvents.MESSAGE_SAL_STATUS,
          (agentUserId, salStatus) => {
            if (
              salStatus.status === MessageSalStatus.VP_REGISTER_FAIL ||
              salStatus.status === MessageSalStatus.VP_REGISTER_DUPLICATE
            ) {
              addConnectionIssue({
                id: `${Date.now()}-${agentUserId}-sal-${salStatus.status}`,
                source: 'rtm',
                agentUserId,
                code: salStatus.status,
                message: `SAL status: ${salStatus.status}`,
                timestamp: normalizeTimestampMs(salStatus.timestamp),
              });
            }
          },
        );
        // Agent error: capture raw RTM messages so message.error surfaces even if higher-level events don't.
        ai.on(AgoraVoiceAIEvents.AGENT_ERROR, (agentUserId, error) => {
          addConnectionIssue({
            id: `${Date.now()}-${agentUserId}-agent-error-${error.code}`,
            source: 'agent',
            agentUserId,
            code: error.code,
            message: `${error.type}: ${error.message}`,
            timestamp: normalizeTimestampMs(error.timestamp),
          });
        });
        // subscribeMessage binds the toolkit to both RTC stream messages and RTM payloads.
        ai.subscribeMessage(agoraData.channel);
      } catch (error) {
        if (!cancelled) {
          console.error('[AgoraVoiceAI] init failed:', error);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        const ai = AgoraVoiceAI.getInstance();
        if (ai) {
          ai.unsubscribe();
          ai.destroy();
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, joinSuccess]);

  // Worksheet answer cards can ask the live tutor to check a typed answer.
  useEffect(() => {
    if (!isReady || !joinSuccess) return;
    const forwardText = (event: Event) => {
      const detail = (event as CustomEvent<LumiSendTextDetail>).detail;
      let ai: ReturnType<typeof AgoraVoiceAI.getInstance> | undefined;
      try { ai = AgoraVoiceAI.getInstance(); } catch { return; }
      if (!ai || !detail?.text) return;
      detail.handled = true;
      void ai.chat(agentUID, {
        messageType: ChatMessageType.TEXT,
        priority: ChatMessagePriority.INTERRUPTED,
        responseInterruptable: true,
        text: detail.text,
      }).catch((error: unknown) => console.error('Failed to send text to Lumi:', error));
    };
    window.addEventListener(LUMI_SEND_TEXT_EVENT, forwardText);
    return () => window.removeEventListener(LUMI_SEND_TEXT_EVENT, forwardText);
  }, [isReady, joinSuccess, agentUID]);

  // Raw RTM parsing is kept as a fallback for signaling-level errors and SAL status.
  useEffect(() => {
    const handleRtmMessage = (event: {
      message: string | Uint8Array;
      publisher: string;
    }) => {
      const payloadText =
        typeof event.message === 'string'
          ? event.message
          : new TextDecoder().decode(event.message);

      let parsed: unknown;
      try {
        parsed = JSON.parse(payloadText);
      } catch {
        return;
      }

      if (isRtmMessageErrorPayload(parsed)) {
        const p = parsed;
        addConnectionIssue({
          id: `${Date.now()}-${event.publisher}-rtm-msg-error-${p.code ?? 'unknown'}`,
          source: 'rtm-signaling',
          agentUserId: event.publisher,
          code: p.code ?? 'unknown',
          message: `${p.module ?? 'unknown'}: ${p.message ?? 'Unknown signaling error'}`,
          timestamp: normalizeTimestampMs(p.send_ts ?? Date.now()),
        });
        return;
      }

      if (isRtmSalStatusPayload(parsed)) {
        const p = parsed;
        if (
          p.status === 'VP_REGISTER_FAIL' ||
          p.status === 'VP_REGISTER_DUPLICATE'
        ) {
          addConnectionIssue({
            id: `${Date.now()}-${event.publisher}-rtm-sal-${p.status}`,
            source: 'rtm-signaling',
            agentUserId: event.publisher,
            code: p.status,
            message: `SAL status: ${p.status}`,
            timestamp: normalizeTimestampMs(p.timestamp ?? Date.now()),
          });
        }
      }
    };

    rtmClient.addEventListener('message', handleRtmMessage);
    return () => {
      rtmClient.removeEventListener('message', handleRtmMessage);
    };
  }, [rtmClient, addConnectionIssue]);

  // The toolkit uses uid="0" for local user speech — remap to actual RTC UID
  // so the transcript panel renders user messages on the correct side.
  // Also normalize punctuation spacing for display when upstream text arrives compacted.
  const transcript = useMemo(() => {
    return normalizeTranscript(rawTranscript, String(client.uid));
  }, [rawTranscript, client.uid]);

  // Completed (END + INTERRUPTED) messages shown as history.
  // INTERRUPTED must be included — if the agent's first turn is cut off,
  // messageList stays empty and the first interrupted turn is never shown.
  const messageList = useMemo(() => getMessageList(transcript), [transcript]);

  const currentInProgressMessage = useMemo(() => {
    // The live partial turn renders separately from the completed history list.
    return getCurrentInProgressMessage(transcript);
  }, [transcript]);

  const remoteAudioTracks = useMemo(
    () => remoteUsers.flatMap((user) => (user.audioTrack ? [user.audioTrack] : [])),
    [remoteUsers],
  );
  const getRecordingTranscript = useCallback(
    () => [...messageList, ...(currentInProgressMessage ? [currentInProgressMessage] : [])]
      .filter((message) => message.text.trim())
      .map((message) => ({
        speaker: String(message.uid) === agentUID ? 'lumi' as const : 'child' as const,
        text: message.text,
      })),
    [messageList, currentInProgressMessage, agentUID],
  );
  useSessionRecorder({ context: recording, micTrack: localMicrophoneTrack, remoteAudioTracks, getTranscript: getRecordingTranscript });

  // Publish local mic once the track exists; usePublish waits for RTC connection.
  usePublish([localMicrophoneTrack]);

  useClientEvent(client, 'user-joined', (user) => {
    if (user.uid.toString() === agentUID) setIsAgentConnected(true);
  });

  useClientEvent(client, 'user-left', (user, reason) => {
    if (user.uid.toString() === agentUID) {
      setIsAgentConnected(false);
      setAgentLeft(true);
      console.warn('[Lumi] Agent left the voice channel', { reason });
    }
  });

  // Sync isAgentConnected with remoteUsers (covers cases where user-joined/left are missed)
  useEffect(() => {
    const isAgentInRemoteUsers = remoteUsers.some(
      (user) => user.uid.toString() === agentUID,
    );
    setIsAgentConnected(isAgentInRemoteUsers);
  }, [remoteUsers, agentUID]);

  const connectionSeverity = useMemo<'normal' | 'warning' | 'error'>(() => {
    // RTC transport problems take precedence; otherwise derive severity from captured issues.
    if (
      connectionState === 'DISCONNECTED' ||
      connectionState === 'DISCONNECTING'
    ) {
      return 'error';
    }
    if (
      connectionState === 'CONNECTING' ||
      connectionState === 'RECONNECTING'
    ) {
      return 'warning';
    }
    if (connectionIssues.length === 0) {
      return 'normal';
    }
    return connectionIssues.some(
      (issue) => getConversationIssueSeverity(issue) === 'error',
    )
      ? 'error'
      : 'warning';
  }, [connectionState, connectionIssues]);

  const visualizerState = useMemo(
    () =>
      mapAgentVisualizerState(agentState, isAgentConnected, connectionState),
    [agentState, isAgentConnected, connectionState],
  );

  /**
   * Mute/unmute via track.setEnabled() only — usePublish owns publish state.
   * If we also unpublish in the toggle, usePublish and the button fight each other
   * and break the MicButtonWithVisualizer Web Audio graph.
   */
  const handleMicToggle = useCallback(async () => {
    const next = !isEnabled;
    const track = localMicrophoneTrack;
    if (!track) {
      setIsEnabled(next);
      return;
    }
    try {
      await track.setEnabled(next);
      setIsEnabled(next);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  }, [isEnabled, localMicrophoneTrack]);

  const handleTokenWillExpire = useCallback(async () => {
    if (!onTokenWillExpire || !joinedUID) return;
    try {
      // RTC and RTM renew independently, but the quickstart fetches both in one request.
      const { rtcToken, rtmToken } = await onTokenWillExpire(
        joinedUID.toString(),
      );
      await client?.renewToken(rtcToken);
      await rtmClient.renewToken(rtmToken);
    } catch (error) {
      console.error('Failed to renew Agora token:', error);
    }
  }, [client, onTokenWillExpire, joinedUID, rtmClient]);

  useClientEvent(client, 'token-privilege-will-expire', handleTokenWillExpire);

  const handleEndConversation = useCallback(async () => {
    onEndConversation();
  }, [onEndConversation]);

  const avatarUser = remoteUsers.find((user) => user.uid.toString() === avatarUID);
  const selectedProviderAvatar = avatarMode === 'provider' && Boolean(lumiAvatar);
  const avatar = getLumiAvatar(lumiAvatar);
  const displayMessages = currentInProgressMessage
    ? [...messageList, currentInProgressMessage]
    : messageList;
  const serviceFailed = connectionIssues.some((issue) => getConversationIssueSeverity(issue) === 'error');
  const voiceUnavailable = Boolean(joinError || agentLeft || connectionTimedOut || serviceFailed);
  const celebrationDetector = useRef(new LumiAnswerCelebrationDetector());
  const materialCompletionDetector = useRef(new LumiMaterialCompletionDetector());
  const deliveredCompletion = useRef<string | null>(null);
  const [materialCompletionId, setMaterialCompletionId] = useState<string | null>(null);
  const [celebrationId, setCelebrationId] = useState<string | null>(null);
  useEffect(() => {
    const enabled = celebrateAnswers && lumiConnected && !voiceUnavailable && !autoplayBlocked;
    const event = celebrationDetector.current.observe(transcript, agentUID, String(client.uid), enabled);
    const completion = materialCompletionDetector.current.observe(transcript, agentUID, String(client.uid), enabled && Boolean(onMaterialCompleted));
    if (!enabled) setCelebrationId(null);
    else if (event && avatarMode === 'local') setCelebrationId(event);
    if (!enabled || !onMaterialCompleted) setMaterialCompletionId(null);
    else if (completion) setMaterialCompletionId(completion);
  }, [transcript, agentUID, client.uid, celebrateAnswers, avatarMode, lumiConnected, voiceUnavailable, autoplayBlocked, onMaterialCompleted]);
  const celebrationReady = isLumiRestingAgentState(agentState) && lumiSpeechState !== 'speaking';
  useEffect(() => {
    if (!materialCompletionId || deliveredCompletion.current === materialCompletionId || !onMaterialCompleted
      || !celebrationReady || !lumiConnected || voiceUnavailable || autoplayBlocked) return;
    // The final transcript can precede the last audio samples. Let the closing
    // sentence finish before the study workspace unmounts this voice session.
    const timer = window.setTimeout(() => {
      deliveredCompletion.current = materialCompletionId;
      onMaterialCompleted();
    }, 600);
    return () => window.clearTimeout(timer);
  }, [materialCompletionId, onMaterialCompleted, celebrationReady, lumiConnected, voiceUnavailable, autoplayBlocked]);
  const lumiAnimationState = useLumiIdleSleep(lumiSpeechState,
    avatarMode === 'local' && lumiConnected && !voiceUnavailable && !microphoneError && !autoplayBlocked
    && isLumiRestingAgentState(agentState));
  const failureLabel = serviceFailed ? messages.voice.responseError : messages.voice.connectionLost;
  const statusLabel = voiceUnavailable
    ? failureLabel
    : lumiAnimationState === 'sleeping'
      ? messages.voice.sleeping
      : visualizerState === 'listening'
      ? messages.voice.listening
      : visualizerState === 'analyzing'
        ? messages.voice.thinking
        : visualizerState === 'talking'
          ? messages.voice.speaking
          : visualizerState === 'ambient'
            ? messages.voice.connected
            : messages.voice.connecting;

  const voiceWarnings = (
    <>
      {voiceUnavailable && (
        <div className="voice-warning" role="alert">
          <p>{failureLabel}</p>
          {onRetryConversation && <button className="button button-primary" onClick={onRetryConversation}>
            {messages.voice.reconnect}
          </button>}
        </div>
      )}
      {microphoneError && (
        <div className="voice-warning" role="alert">
          <p>{messages.voice.microphoneBlocked}</p>
          <button className="button button-primary" onClick={() => (onRetryMicrophone ? onRetryMicrophone() : window.location.reload())}>
            {messages.voice.retry}
          </button>
        </div>
      )}
      {!microphoneError && autoplayBlocked && (
        <button className="voice-warning" onClick={() => setAutoplayBlocked(false)}>
          {messages.voice.tapToHear}
        </button>
      )}
    </>
  );

  // Hidden players keep the agent's audio flowing while only the avatar is shown.
  const hiddenRemoteAudio = remoteUsers
    .filter((user) => user.uid.toString() !== avatarUID)
    .map((user) => (
      <div key={user.uid} className="hidden"><RemoteUser user={user} /></div>
    ));

  if (variant === 'inline') {
    return (
      <div className="lumi-inline" role="region" aria-label={messages.voice.title}>
        {voiceWarnings}
        {avatarMode === 'local' ? <LumiConversationAvatar state={lumiAnimationState} active={lumiConnected && !voiceUnavailable} listeningEnabled={isEnabled && !microphoneError} speakingEnabled={!autoplayBlocked} celebrationId={celebrateAnswers ? celebrationId : undefined} celebrationReady={celebrationReady} /> : avatarUser ? (
          <div className={`lumi-inline-avatar${selectedProviderAvatar ? ' is-keyed' : ''}`}>
            {selectedProviderAvatar ? <ChromaKeyAvatar user={avatarUser} keying={avatar.keying} /> : <RemoteUser user={avatarUser} />}
          </div>
        ) : selectedProviderAvatar ? (
          <Image className="lumi-inline-fallback" src={avatar.image} alt={messages.accessibility.lumiMascot} width={480} height={520} priority />
        ) : (
          <LumiConversationAvatar state="idle" />
        )}
        {hiddenRemoteAudio}
        <div className="lumi-inline-controls">
          <MicButtonWithVisualizer
            isEnabled={isEnabled}
            setIsEnabled={setIsEnabled}
            track={localMicrophoneTrack}
            onToggle={handleMicToggle}
            aria-label={isEnabled ? messages.voice.mute : messages.voice.unmute}
            enabledColor="hsl(var(--primary))"
            disabledColor="hsl(var(--destructive))"
          />
          <span className="lumi-inline-status" aria-live="polite">{!voiceUnavailable && avatarMode === 'local' && isAgentConnected && connectionState === 'CONNECTED'
            ? lumiAnimationState === 'sleeping' ? messages.voice.sleeping : lumiSpeechState === 'speaking' ? messages.voice.speaking : lumiSpeechState === 'listening' ? messages.voice.listening : messages.voice.connected
            : statusLabel}</span>
        </div>
        <button className="lumi-inline-end" type="button" onClick={() => void handleEndConversation()}>
          <PhoneOff size={16} />{messages.voice.endSession}
        </button>
      </div>
    );
  }

  return (
    <div className="lumi-conversation">
      {voiceWarnings}
      <header className="conversation-header">
        <div className="conversation-title">
          <span className="conversation-title-icon">✦</span>
          <div><strong>{messages.voice.title}</strong><small>{statusLabel}</small></div>
        </div>
        <button className="conversation-end" onClick={handleEndConversation}>{messages.voice.end}</button>
      </header>
      <div className="conversation-stage">
        <div
          className="avatar-stage"
          role="region"
          aria-label={messages.accessibility.lumiMascot}
        >
          {avatarMode === 'local' ? <LumiConversationAvatar state={lumiAnimationState} active={lumiConnected && !voiceUnavailable} listeningEnabled={isEnabled && !microphoneError} speakingEnabled={!autoplayBlocked} celebrationId={celebrateAnswers ? celebrationId : undefined} celebrationReady={celebrationReady} /> : avatarUser ? (
            <div className={`lumi-live-avatar${selectedProviderAvatar ? ' is-keyed' : ''}`}>
              {selectedProviderAvatar ? <ChromaKeyAvatar user={avatarUser} keying={avatar.keying} fit="contain" /> : <RemoteUser user={avatarUser} />}
            </div>
          ) : selectedProviderAvatar ? (
            <Image className="lumi-avatar-fallback" src={avatar.image} alt={messages.accessibility.lumiMascot} width={480} height={520} priority />
          ) : (
            <LumiConversationAvatar state="idle" idleOnly className="lumi-avatar-fallback" />
          )}
          {hiddenRemoteAudio}
          <div className="agent-visualizer-shell"><AgentVisualizer state={visualizerState} size="lg" /></div>
          <div className="conversation-controls" role="group" aria-label={messages.voice.title}>
            <div className="conversation-mic-host">
            <MicButtonWithVisualizer
              isEnabled={isEnabled}
              setIsEnabled={setIsEnabled}
              track={localMicrophoneTrack}
              onToggle={handleMicToggle}
              aria-label={isEnabled ? messages.voice.mute : messages.voice.unmute}
              enabledColor="hsl(var(--primary))"
              disabledColor="hsl(var(--destructive))"
            />
            </div>
          </div>
        </div>
        <aside className="conversation-transcript">
          <h2>{messages.voice.transcript}</h2>
          <small>{statusLabel}</small>
          <div className="transcript-list">
            {displayMessages.length === 0 ? (
              <p className="transcript-empty">{messages.voice.waitingTranscript}</p>
            ) : (
              displayMessages.slice(-6).map((message, index) => (
                <div
                  className={`transcript-bubble ${String(message.uid) === agentUID ? 'agent' : 'user'}`}
                  key={`${message.turn_id}-${index}`}
                >
                  {message.text}
                </div>
              ))
            )}
          </div>
          {connectionSeverity !== 'normal' && connectionIssues[0] && (
            <p className="connection-details">{connectionIssues[0].message}</p>
          )}
        </aside>
      </div>
    </div>
  );
}

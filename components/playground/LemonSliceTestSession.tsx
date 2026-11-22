'use client';

import dynamic from 'next/dynamic';
import LumiConversationAvatar from '@/components/LumiConversationAvatar';
import { Mic, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RTMClient } from 'agora-rtm';
import type { AnimationSettings } from '@/lib/lumi-animation';
import type { AgoraRenewalTokens, AgoraTokenData } from '@/types/conversation';
import { getBrowserRtmManager, type RtmLease } from '@/lib/agora-rtm-session';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import styles from './lumi-animation.module.css';

const Conversation = dynamic(() => import('@/components/ConversationComponent'), { ssr: false });
const Provider = dynamic(async () => {
  const { AgoraRTCProvider, default: AgoraRTC } = await import('agora-rtc-react');
  return {
    default: function PlaygroundRtcProvider({ children }: { children: React.ReactNode }) {
      const client = useRef<ReturnType<typeof AgoraRTC.createClient> | null>(null);
      if (!client.current) client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      return <AgoraRTCProvider client={client.current}>{children}</AgoraRTCProvider>;
    },
  };
}, { ssr: false });

type Resources = { cancelled: boolean; agentId?: string; lease?: RtmLease };
type LiveSession = { data: AgoraTokenData; rtm: RTMClient };

async function release(resources: Resources) {
  const results = await Promise.allSettled([
    resources.lease?.release(),
    (async () => {
      if (!resources.agentId) return;
      const response = await fetch('/api/stop-conversation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: resources.agentId }), keepalive: true,
      });
      if (!response.ok) throw new Error('Não foi possível confirmar o encerramento. Clique em fechar para tentar novamente.');
      resources.agentId = undefined;
    })(),
  ]);
  for (const result of results) if (result.status === 'rejected') throw result.reason;
}

export default function LemonSliceTestSession({ settings, onClose }: {
  settings: AnimationSettings;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const mounted = useRef(false);
  const resources = useRef<Resources | null>(null);
  const pending = useRef<Promise<void> | null>(null);
  const closing = useRef(false);
  const [live, setLive] = useState<LiveSession | null>(null);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [needsStop, setNeedsStop] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    mounted.current = true;
    const element = dialog.current;
    element?.showModal();
    return () => {
      mounted.current = false;
      element?.close();
      const current = resources.current;
      if (current) {
        current.cancelled = true;
        void current.lease?.release().catch(() => {});
        // Do not abort an invite: collect its returned agent ID, then stop that session.
        void (pending.current ?? Promise.resolve()).then(() => release(current)).catch(() => {});
      }
    };
  }, []);

  const start = () => {
    if (pending.current || closing.current || resources.current?.agentId) return;
    const current: Resources = { cancelled: false };
    resources.current = current;
    setStarting(true); setError('');
    const task = async () => {
      try {
        const channel = `lumi-animation-${crypto.randomUUID()}`;
        current.lease = getBrowserRtmManager().acquire(channel);
        const { data, rtm } = await current.lease.ready;
        if (current.cancelled) return;
        const response = await fetch('/api/playground/lumi-animation', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requester_id: data.uid, channel_name: data.channel, animation: settings }),
        });
        const result = await response.json();
        if (!response.ok || !result.agent_id) throw new Error(result.error || 'Não foi possível iniciar o avatar.');
        current.agentId = result.agent_id;
        if (!current.cancelled && mounted.current) setLive({ data: { ...data, agentId: result.agent_id }, rtm });
      } catch (failure) {
        current.cancelled = true;
        if (mounted.current) setError(failure instanceof Error ? failure.message : 'Não foi possível conectar. Tente novamente.');
      } finally {
        if (current.cancelled) {
          try { await release(current); } catch (failure) {
            if (mounted.current) setError(failure instanceof Error ? failure.message : 'Falha ao encerrar a sessão.');
          }
        }
        if (mounted.current) {
          setStarting(false);
          setNeedsStop(Boolean(current.agentId));
        }
      }
    };
    pending.current = task().finally(() => { pending.current = null; });
  };

  const end = async () => {
    if (closing.current) return;
    closing.current = true;
    setEnding(true); setLive(null); setError('');
    const current = resources.current;
    if (current) { current.cancelled = true; void current.lease?.release().catch(() => {}); }
    try {
      await pending.current;
      if (current) await release(current);
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Falha ao encerrar a sessão. Tente novamente.');
    } finally {
      closing.current = false;
      if (mounted.current) setEnding(false);
    }
  };

  const renew = useCallback(async (uid: string): Promise<AgoraRenewalTokens> => {
    if (!live) throw new Error('Missing playground session');
    const responses = await Promise.all([uid, live.data.uid].map((identity) =>
      fetch(`/api/generate-agora-token?${new URLSearchParams({ uid: identity, channel: live.data.channel })}`),
    ));
    if (responses.some((response) => !response.ok)) throw new Error('Token renewal failed');
    const [rtc, rtm] = await Promise.all(responses.map((response) => response.json()));
    return { rtcToken: rtc.token, rtmToken: rtm.token };
  }, [live]);

  return (
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="lemon-test-title" onCancel={(event) => { event.preventDefault(); void end(); }}>
      <header className={styles.dialogHeader}><h2 id="lemon-test-title">Lumi · teste ao vivo</h2><button onClick={() => void end()} disabled={ending} aria-label="Encerrar teste e fechar"><X size={19} /></button></header>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {live ? <>
        <p className={styles.liveHint}>Observe a fala e os intervalos de silêncio. A imagem de espera é substituída quando o vídeo do avatar chega.</p>
        <div className={styles.liveHost}><ErrorBoundary><Provider><Conversation agoraData={live.data} rtmClient={live.rtm} onTokenWillExpire={renew} onEndConversation={() => void end()} /></Provider></ErrorBoundary></div>
      </> : <div className={styles.sessionStart}>
        <LumiConversationAvatar state="idle" idleOnly />
        <p>Converse com a Lumi e observe como ela se movimenta com os prompts escolhidos.</p>
        <p className={styles.footnote}>O teste usa seu microfone e inicia uma sessão real da Agora e do Lemon Slice. Fechar esta janela encerra a sessão.</p>
        <button className={styles.primaryButton} onClick={start} disabled={starting || ending || needsStop}><Mic size={18} />{ending ? 'Encerrando teste…' : starting ? 'Preparando a Lumi…' : 'Iniciar conversa de teste'}</button>
      </div>}
    </dialog>
  );
}

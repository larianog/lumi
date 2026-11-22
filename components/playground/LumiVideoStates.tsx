'use client';

import Image from 'next/image';
import { Download, Film, Pause, Play, RotateCcw, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BUNDLED_LUMI_VIDEO_CLIPS, LUMI_VIDEO_STATES, VIDEO_CONVERSATION_DEMO, isWebPClip, videoFileError, videoProductionManifest, type LumiVideoClip, type LumiVideoState } from '@/lib/lumi-video-states';
import LumiWebPClip from '@/components/LumiWebPClip';
import styles from './lumi-animation.module.css';

type ClipStatus = { ready?: boolean; error?: string; duration?: number };
type VideoSimulation = { steps: typeof VIDEO_CONVERSATION_DEMO; index: number; returnState: LumiVideoState };

export default function LumiVideoStates({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const [state, setState] = useState<LumiVideoState>('speaking');
  const [clips, setClips] = useState<Partial<Record<LumiVideoState, LumiVideoClip>>>({ ...BUNDLED_LUMI_VIDEO_CLIPS });
  const [statuses, setStatuses] = useState<Partial<Record<LumiVideoState, ClipStatus>>>({});
  const [uploadError, setUploadError] = useState('');
  const [paused, setPaused] = useState(false);
  const [motionRequested, setMotionRequested] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [replay, setReplay] = useState(0);
  const [simulation, setSimulation] = useState<VideoSimulation | null>(null);
  const [background, setBackground] = useState<'checker' | 'studio' | 'forest'>('checker');
  const videos = useRef<Partial<Record<LumiVideoState, HTMLVideoElement>>>({});
  const urls = useRef<Partial<Record<LumiVideoState, string>>>(
    Object.fromEntries(Object.entries(BUNDLED_LUMI_VIDEO_CLIPS).map(([id, clip]) => [id, clip.url])),
  );
  const definition = LUMI_VIDEO_STATES.find((item) => item.id === state)!;
  const clip = clips[state];
  const isWebP = isWebPClip(clip);
  const status = statuses[state];
  const playable = Boolean(clip && status?.ready && !status.error);
  const motionBlocked = reducedMotion && !motionRequested;
  const playbackPaused = paused || motionBlocked;
  const stopped = playbackPaused || !active;
  const step = simulation?.index ?? null;
  const onWebPReady = useCallback((id: LumiVideoState, url: string) => {
    if (urls.current[id] === url) setStatuses((current) => ({ ...current, [id]: { ready: true } }));
  }, []);
  const onWebPError = useCallback((id: LumiVideoState, url: string) => {
    if (urls.current[id] === url) setStatuses((current) => ({ ...current, [id]: { error: 'Não foi possível abrir este WebP. Teste outra exportação do arquivo.' } }));
  }, []);

  useEffect(() => {
    setMotionRequested(false);
  }, [reducedMotion]);

  useEffect(() => () => {
    Object.values(urls.current).forEach((url) => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
  }, []);

  useEffect(() => {
    // Bundled media may load before hydration attaches the loadeddata handler.
    const loaded = Object.entries(videos.current).filter(([, video]) => video.readyState >= 2);
    if (loaded.length) setStatuses((current) => ({
      ...current,
      ...Object.fromEntries(loaded.map(([id, video]) => [id, { ready: true, duration: video.duration }])),
    }));
  }, [clips]);

  useEffect(() => {
    if (!simulation || stopped) return;
    const timer = window.setTimeout(() => {
      const next = simulation.steps[simulation.index + 1];
      setSimulation(next ? { ...simulation, index: simulation.index + 1 } : null);
      setState(next?.state ?? simulation.returnState);
      if (!next) setPaused(true);
    }, simulation.steps[simulation.index].seconds * 1000 / speed);
    return () => window.clearTimeout(timer);
  }, [simulation, stopped, speed]);

  useEffect(() => {
    const video = videos.current[state];
    if (video) video.currentTime = 0;
  }, [state, replay, clip?.url]);

  useEffect(() => {
    let cancelled = false;
    for (const [id, video] of Object.entries(videos.current)) {
      video.playbackRate = speed;
      if (id === state && playable && !stopped) {
        void video.play().catch((failure: DOMException) => {
          if (cancelled || failure.name === 'AbortError') return;
          setPaused(true);
          setUploadError('O navegador não iniciou o vídeo. Toque em retomar; se persistir, teste outra exportação.');
        });
      } else video.pause();
    }
    return () => { cancelled = true; };
  }, [state, playable, stopped, speed, replay, clips]);

  const chooseState = (next: LumiVideoState) => {
    setUploadError(''); setSimulation(null); setState(next); setReplay((value) => value + 1);
  };

  const addClip = (id: LumiVideoState, file?: File) => {
    if (!file) return;
    const error = videoFileError(file);
    if (error) { setUploadError(error); return; }
    const previous = urls.current[id];
    videos.current[id]?.pause();
    const url = URL.createObjectURL(file);
    urls.current[id] = url;
    setClips((current) => ({ ...current, [id]: { file, url, source: 'local' } }));
    setStatuses((current) => ({ ...current, [id]: {} }));
    setUploadError('');
    chooseState(id);
    if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
  };

  const removeClip = (id: LumiVideoState) => {
    if (simulation) { setSimulation(null); setPaused(true); }
    const previous = urls.current[id];
    videos.current[id]?.pause();
    const bundled = BUNDLED_LUMI_VIDEO_CLIPS[id];
    if (bundled) urls.current[id] = bundled.url;
    else delete urls.current[id];
    setClips((current) => {
      const next = { ...current };
      if (bundled) next[id] = bundled;
      else delete next[id];
      return next;
    });
    setStatuses((current) => { const next = { ...current }; delete next[id]; return next; });
    setUploadError('');
    if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
  };

  const exportGuide = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(videoProductionManifest(clips), null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'lumi-video-states.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div hidden={!active}>
      <div className={styles.workspace}>
        <section className={styles.preview} aria-label="Vídeos por estado da Lumi">
          <div className={styles.previewToolbar}>
            <span><Film size={15} /> {step === null ? 'Teste manual' : 'Conversa simulada'}</span>
            <div className={styles.backgroundSwitch} role="group" aria-label="Fundo dos vídeos">
              <button aria-pressed={background === 'checker'} onClick={() => setBackground('checker')}>Transparência</button>
              <button aria-pressed={background === 'studio'} onClick={() => setBackground('studio')}>Estúdio</button>
              <button aria-pressed={background === 'forest'} onClick={() => setBackground('forest')}>Floresta</button>
            </div>
          </div>
          <div className={`${styles.stage} ${styles.videoStage} ${background === 'checker' ? styles.checker : background === 'forest' ? styles.forest : ''}`}>
            <span className={styles.videoStateBadge}>{definition.label} · {isWebP ? 'WebP' : definition.loop ? 'loop' : 'uma vez'}</span>
            <div className={styles.videoCanvas}>
              {!playable && <Image src="/assets/lumi-avatar.png" alt="Imagem de referência da Lumi; vídeo ainda indisponível" width={600} height={650} sizes="(max-width: 650px) 65vw, 380px" />}
              {LUMI_VIDEO_STATES.map((item) => {
                const source = clips[item.id];
                if (source && isWebPClip(source)) return <LumiWebPClip
                  key={source.url} id={item.id} label={item.label} url={source.url}
                  fit={source.fit}
                  className={styles.stateVideo}
                  visible={state === item.id && playable} playing={state === item.id && playable && !stopped}
                  replay={replay} onReady={onWebPReady} onError={onWebPError}
                />;
                return source && <video
                  key={source.url}
                  ref={(element) => { if (element) videos.current[item.id] = element; else delete videos.current[item.id]; }}
                  className={styles.stateVideo}
                  data-visible={state === item.id && playable}
                  style={{ objectFit: source.fit ?? 'contain' }}
                  data-state={item.id}
                  aria-label={`Vídeo da Lumi: ${item.label}`}
                  aria-hidden={state !== item.id || !playable}
                  src={source.url}
                  muted playsInline preload="auto" loop={item.loop}
                  onLoadedData={(event) => {
                    if (urls.current[item.id] !== source.url) return;
                    const duration = event.currentTarget.duration;
                    setStatuses((current) => ({ ...current, [item.id]: { ready: true, duration } }));
                  }}
                  onError={() => {
                    if (urls.current[item.id] !== source.url) return;
                    setStatuses((current) => ({ ...current, [item.id]: { error: 'O navegador não conseguiu abrir este vídeo. Teste WebM ou outra exportação compatível.' } }));
                  }}
                  onEnded={() => {
                    if (urls.current[item.id] !== source.url) return;
                    if (state === item.id && !item.loop && step === null) setState('idle');
                  }}
                />;
              })}
            </div>
            <div className={styles.videoCaption} aria-live="polite">
              <strong>{!clip ? 'Adicione um vídeo ou WebP deste estado' : status?.error ? 'Formato não reproduzido' : !status?.ready ? 'Carregando arquivo…' : definition.trigger}</strong>
              {!clip && <span>A imagem é uma referência enquanto você prepara os clipes.</span>}
            </div>
          </div>
          <div className={styles.transport}>
            <button className={styles.playButton} onClick={() => {
              if (playbackPaused) { setMotionRequested(true); setPaused(false); }
              else setPaused(true);
            }} aria-label={playbackPaused ? 'Retomar vídeos' : 'Pausar vídeos'}>{playbackPaused ? <Play size={17} /> : <Pause size={17} />}</button>
            <div><strong>{motionBlocked ? 'Movimento reduzido' : paused ? 'Reprodução pausada' : definition.label}</strong><span>{isWebP ? 'Imagem WebP' : 'Vídeos sem áudio'} · {simulation ? `etapa ${simulation.index + 1} de ${simulation.steps.length}` : 'troca manual de estados'}</span></div>
            <button className={styles.textButton} aria-label="Reiniciar vídeo" onClick={() => setReplay((value) => value + 1)} disabled={!playable}><RotateCcw size={16} /><span>Reiniciar</span></button>
          </div>
        </section>

        <aside className={styles.controls}>
          <div className={styles.controlTitle}><Film size={19} /><h2>Estados da Lumi</h2><span className={styles.clipCount}>{Object.keys(clips).length}/{LUMI_VIDEO_STATES.length}</span></div>
          <p className={styles.helper}>Um clipe para cada momento. Adicione vídeos MP4, WebM, MOV ou imagens WebP, inclusive animadas e com transparência.</p>
          <div className={styles.videoStateGrid} role="group" aria-label="Estado da Lumi">
            {LUMI_VIDEO_STATES.map((item) => <button key={item.id} aria-pressed={state === item.id} onClick={() => chooseState(item.id)}><span aria-hidden="true">{item.icon}</span><strong>{item.label}</strong><small>{clips[item.id] ? statuses[item.id]?.error ? 'Revisar arquivo' : isWebPClip(clips[item.id]) ? clips[item.id]?.source === 'bundled' ? 'WebP padrão' : 'WebP adicionado' : clips[item.id]?.source === 'bundled' ? 'Vídeo padrão' : 'Vídeo adicionado' : 'Sem arquivo'}</small></button>)}
          </div>
          <div className={styles.clipUpload}>
            <label className={styles.outlineButton}><Upload size={16} />{clip ? 'Trocar arquivo' : `Adicionar: ${definition.label}`}<input type="file" accept=".webp,.webm,.mp4,.mov,image/webp,video/webm,video/mp4,video/quicktime" aria-label={`Adicionar vídeo: ${definition.label}`} onChange={(event) => { addClip(state, event.target.files?.[0]); event.target.value = ''; }} /></label>
            {clip && <div className={styles.clipFile}><span title={clip.file.name}>{clip.file.name}<small>{(clip.file.size / 1024 / 1024).toFixed(1)} MB{status?.duration && Number.isFinite(status.duration) ? ` · ${status.duration.toFixed(1)} s` : ''}{clip.source === 'bundled' ? ' · incluído no projeto' : ''}</small></span>{clip.source === 'local' && <button aria-label={BUNDLED_LUMI_VIDEO_CLIPS[state] ? `Restaurar vídeo padrão: ${definition.label}` : `Remover vídeo: ${definition.label}`} onClick={() => removeClip(state)}>{BUNDLED_LUMI_VIDEO_CLIPS[state] ? <RotateCcw size={16} /> : <X size={16} />}</button>}</div>}
            <p className={styles.footnote}>{clip?.source === 'bundled' ? 'Este arquivo já está salvo no projeto. Você pode experimentar outro arquivo sem substituir o padrão.' : 'Arquivos locais, até 40 MB. Substituições duram até recarregar; nenhum arquivo é enviado.'}</p>
            {isWebP && <p className={styles.footnote}>WebP usa a velocidade e a repetição do arquivo. Pausar mostra o primeiro quadro; retomar ou reiniciar começa do início. A troca de estado é manual ou pela simulação.</p>}
          </div>
          {(uploadError || status?.error) && <p role="alert" className={styles.error}>{uploadError || status?.error}</p>}
          <label className={styles.rangeLabel}><span>Velocidade <output>{isWebP ? 'Definida no WebP' : `${speed.toFixed(2).replace(/0$/, '')}×`}</output></span><input aria-label="Velocidade dos vídeos" type="range" min="0.5" max="1.5" step="0.05" value={speed} disabled={isWebP} onChange={(event) => setSpeed(Number(event.target.value))} /></label>
          <button className={styles.primaryButton} onClick={() => {
            if (simulation) { setSimulation(null); setPaused(true); return; }
            const isAvailable = (id: LumiVideoState) => Boolean(clips[id] && statuses[id]?.ready && !statuses[id]?.error);
            const steps = VIDEO_CONVERSATION_DEMO.filter((item) => isAvailable(item.state));
            if (!steps.length && isAvailable('idle')) steps.push({ state: 'idle', seconds: 4 });
            if (!steps.length) { setUploadError('Aguarde o carregamento de um arquivo ou adicione um clipe válido para simular.'); return; }
            setUploadError('');
            setSimulation({ steps, index: 0, returnState: isAvailable('idle') ? 'idle' : steps[steps.length - 1].state });
            setMotionRequested(true); setPaused(false); setState(steps[0].state); setReplay((value) => value + 1);
          }}>{step !== null ? <Pause size={17} /> : <Play size={17} />}{step !== null ? 'Parar simulação' : 'Simular conversa'}</button>
          {motionBlocked && <p className={styles.footnote}>Movimento reduzido está ativo. Os vídeos começam pausados; clique em retomar ou simular para reproduzir nesta página.</p>}
          <p className={styles.footnote}>A simulação usa apenas os estados com vídeo ou WebP pronto. Ao terminar, pausa em Repouso, se disponível, ou no último estado exibido.</p>
          <p className={styles.footnote}>Simulação local, sem microfone ou sessão paga. Os estados ainda não recebem eventos da conversa real.</p>
          <details className={styles.promptDetails}>
            <summary>Guia para produzir este clipe</summary>
            <p className={styles.helper}><strong>{definition.label} · {definition.duration}</strong><br />{definition.direction}</p>
            <p className={styles.helper}>Mantenha câmera, luz, escala e posição dos pés iguais em todos os clipes. Exporte sem áudio. {definition.loop ? 'Feche o loop sem saltos.' : isWebP ? 'Exporte o WebP com uma única repetição.' : 'Ao terminar, a prévia retorna ao repouso.'}</p>
            <p className={styles.helper}>O fundo precisa estar transparente no arquivo. Para testar, alterne entre o quadriculado e a floresta. MP4 comum não remove o fundo automaticamente.</p>
            <button className={styles.outlineButton} onClick={exportGuide}><Download size={16} /> Baixar roteiro dos {LUMI_VIDEO_STATES.length} estados</button>
          </details>
        </aside>
      </div>
      <section className={styles.notes} aria-label="Produção dos vídeos da Lumi">
        <article><span className={styles.noteIcon}><Film size={20} /></span><div><h3>Comece com os quatro loops</h3><p>Repouso, escuta, pensamento e fala cobrem a conversa. Saudação e comemoração são ações curtas. Produza os clipes com o mesmo enquadramento para manter a continuidade.</p></div></article>
        <article><span className={styles.noteIcon}><Play size={20} /></span><div><h3>Transparência e voz separadas</h3><p>Use <a href="https://developer.chrome.com/blog/alpha-transparency-in-chrome-video/" target="_blank" rel="noreferrer">WebM com alfa</a> e prepare <a href="https://developer.apple.com/videos/play/wwdc2019/506/" target="_blank" rel="noreferrer">HEVC com alfa</a> para Safari. O loop de fala representa a ação; não sincroniza cada palavra. A voz poderá continuar vindo da Agora.</p></div></article>
      </section>
    </div>
  );
}

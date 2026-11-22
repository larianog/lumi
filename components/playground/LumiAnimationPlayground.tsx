'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Activity, Download, FlaskConical, Leaf, Pause, Play, RotateCcw, SlidersHorizontal, Sparkles, Video } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { ASPECT_RATIOS, MOTION_PRESETS, lemonSliceParameters, readAnimationSettings, type AnimationSettings } from '@/lib/lumi-animation';
import LemonSliceTestSession from './LemonSliceTestSession';
import LumiVideoStates from './LumiVideoStates';
import styles from './lumi-animation.module.css';

const poses = [
  { id: 'idle', label: 'Respirar', line: 'Pronta para uma nova descoberta.', icon: '✦' },
  { id: 'listening', label: 'Escutar', line: 'Estou aqui. Pode me contar!', icon: '◌' },
  { id: 'thinking', label: 'Pensar', line: 'Hmm… tive uma ideia!', icon: '✧' },
  { id: 'speaking', label: 'Falar', line: 'Vamos descobrir isso juntos?', icon: '♫' },
  { id: 'celebrating', label: 'Celebrar', line: 'Você conseguiu! Que descoberta!', icon: '★' },
] as const;
type Pose = (typeof poses)[number]['id'];

export default function LumiAnimationPlayground() {
  const [mode, setMode] = useState<'videos' | 'local' | 'lemon'>('videos');
  const [pose, setPose] = useState<Pose>('idle');
  const [intensity, setIntensity] = useState(65);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [sequence, setSequence] = useState(false);
  const [compare, setCompare] = useState(false);
  const [background, setBackground] = useState<'studio' | 'forest'>('studio');
  const [preset, setPreset] = useState<string>('present');
  const [settings, setSettings] = useState<AnimationSettings>({ ...MOTION_PRESETS[1], aspectRatio: '2x3' });
  const [liveSettings, setLiveSettings] = useState<AnimationSettings | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [configurationError, setConfigurationError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const currentPose = poses.find((item) => item.id === pose)!;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (mode !== 'lemon') return;
    const controller = new AbortController();
    setConfigurationError(false);
    fetch('/api/playground/lumi-animation', { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Configuration unavailable');
        const data = await response.json();
        setConfigured(data.configured === true);
      })
      .catch(() => { if (!controller.signal.aborted) setConfigurationError(true); });
    return () => controller.abort();
  }, [mode]);

  useEffect(() => {
    if (!sequence || paused || reducedMotion || mode !== 'local') return;
    const timer = window.setInterval(() => {
      setPose((value) => poses[(poses.findIndex((item) => item.id === value) + 1) % poses.length].id);
    }, 3200 / speed);
    return () => window.clearInterval(timer);
  }, [sequence, paused, speed, mode, reducedMotion]);

  const changeMode = (value: 'videos' | 'local' | 'lemon') => {
    setMode(value);
    setSequence(false);
  };

  const reset = () => {
    setIntensity(65); setSpeed(1); setPose('idle'); setPaused(false); setSequence(false);
    setCompare(false); setBackground('studio');
  };

  const exportSettings = () => {
    const file = new Blob([JSON.stringify({
      version: 1,
      image: '/assets/lumi-avatar.png',
      local: { pose, intensity, speed },
      lemonSlice: lemonSliceParameters(settings),
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url; link.download = 'lumi-animation.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const motionStyle = {
    '--lift': `${intensity * 0.23}px`,
    '--tilt': `${intensity * 0.055}deg`,
    '--squash': 1 - intensity * 0.00035,
    '--stretch': 1 + intensity * 0.00035,
    '--duration': `${(pose === 'celebrating' ? 1.05 : pose === 'speaking' ? 1.6 : 3.8) / speed}s`,
  } as CSSProperties;

  const mascot = (animated: boolean) => (
    <div className={styles.mascotFrame}>
      <div className={styles.halo} aria-hidden="true" />
      <div className={styles.ground} aria-hidden="true" />
      <div className={`${styles.mascot} ${animated ? styles.moving : ''}`} data-pose={pose} data-paused={paused || reducedMotion} style={motionStyle}>
        <Image src="/assets/lumi-avatar.png" alt="Lumi, mascote de pelúcia verde e lilás com antenas luminosas" width={600} height={650} priority sizes="(max-width: 650px) 65vw, 360px" />
      </div>
      {animated && pose === 'celebrating' && <span className={styles.celebration} aria-hidden="true">✦ <span>✧</span> ✦</span>}
    </div>
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Voltar ao app Lumi"><span><Sparkles size={21} /></span> lumi<span className={styles.brandDivider} /> <small>playground</small></Link>
        <span className={styles.labBadge}><FlaskConical size={15} /> Laboratório de movimento</span>
        <Link href="/" className={styles.backLink}>Voltar ao app</Link>
      </header>

      <div className={styles.content}>
        <section className={styles.intro}>
          <div><span className={styles.eyebrow}>UM POUCO MAIS DE PERSONALIDADE</span><h1>Uma Lumi com mais vida<span>.</span></h1><p>Experimente ritmos, gestos e presença. Encontre o movimento que combina com ela.</p></div>
          {mode !== 'videos' && <button className={styles.outlineButton} onClick={exportSettings} disabled={!readAnimationSettings(settings)}><Download size={17} /> Exportar ajustes</button>}
        </section>

        <div className={`${styles.tabs} ${styles.modeTabs}`} role="group" aria-label="Modo de teste">
          <button aria-pressed={mode === 'videos'} onClick={() => changeMode('videos')}><Video size={16} /> Vídeos por estado</button>
          <button aria-pressed={mode === 'local'} onClick={() => changeMode('local')}><Activity size={16} /> Local 2D</button>
          <button aria-pressed={mode === 'lemon'} onClick={() => changeMode('lemon')}><Video size={16} /> Lemon Slice</button>
        </div>
        <LumiVideoStates active={mode === 'videos'} reducedMotion={reducedMotion} />

        {mode !== 'videos' && <div className={styles.workspace}>
          <section className={styles.preview} aria-label="Prévia da Lumi">
            <div className={styles.previewToolbar}>
              <span><span className={styles.statusDot} /> {mode === 'local' ? 'Prévia local' : 'Imagem de referência'}</span>
              <div className={styles.backgroundSwitch} role="group" aria-label="Fundo da prévia">
                <button aria-pressed={background === 'studio'} onClick={() => setBackground('studio')}>Estúdio</button>
                <button aria-pressed={background === 'forest'} onClick={() => setBackground('forest')}><Leaf size={13} /> Floresta</button>
              </div>
            </div>
            <div className={`${styles.stage} ${background === 'forest' ? styles.forest : ''}`} data-compare={compare && mode === 'local'}>
              {compare && mode === 'local' && <div className={styles.stageColumn}><span className={styles.stageLabel}>Imagem original</span>{mascot(false)}</div>}
              <div className={styles.stageColumn}>
                <span className={styles.stageLabel}>{mode === 'lemon' ? 'Lemon Slice · imagem de entrada' : compare ? 'Com movimento local' : 'Lumi · estudo de movimento'}</span>
                {mascot(mode === 'local')}
              </div>
              <div className={styles.stageCaption} aria-live="polite">
                <span>{mode === 'local' ? currentPose.icon : '✦'}</span>
                <p>{mode === 'local' ? currentPose.line : 'Os gestos do Lemon Slice aparecem no teste ao vivo.'}</p>
              </div>
            </div>
            <div className={styles.transport}>
              {mode === 'local' ? <>
                <button className={styles.playButton} onClick={() => setPaused(!paused)} disabled={reducedMotion} aria-label={paused ? 'Retomar movimento' : 'Pausar movimento'}>{paused ? <Play size={17} /> : <Pause size={17} />}</button>
                <div><strong>{reducedMotion ? 'Movimento reduzido' : paused ? 'Animação pausada' : sequence ? 'Sequência automática' : currentPose.label}</strong><span>{sequence ? 'Cada estado dura alguns segundos' : 'Movimento do corpo · sem áudio'}</span></div>
                <button className={styles.textButton} onClick={reset} aria-label="Restaurar prévia"><RotateCcw size={16} /><span>Restaurar</span></button>
              </> : <><Video size={21} /><div><strong>Pronta para experimentar</strong><span>A mesma imagem em todos os presets</span></div></>}
            </div>
          </section>

          <aside className={styles.controls}>
            <div className={styles.controlTitle}><SlidersHorizontal size={19} /><h2>Direção de movimento</h2></div>

            {mode === 'local' ? <>
              <p className={styles.helper}>Explore movimentos previsíveis usando a arte original da Lumi.</p>
              <fieldset className={styles.fieldset}><legend>O que a Lumi está fazendo?</legend><div className={styles.poseGrid}>
                {poses.map((item) => <button key={item.id} aria-pressed={pose === item.id} onClick={() => { setPose(item.id); setSequence(false); }}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
              </div></fieldset>
              <label className={styles.rangeLabel}><span>Intensidade <output>{intensity}%</output></span><input type="range" min="0" max="100" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} /><small>Discreta <span>Cheia de energia</span></small></label>
              <label className={styles.rangeLabel}><span>Velocidade <output>{speed.toFixed(2).replace(/0$/, '')}×</output></span><input type="range" min="0.5" max="1.75" step="0.05" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /><small>Tranquila <span>Animada</span></small></label>
              <label className={styles.checkLabel}><input type="checkbox" checked={compare} onChange={(event) => setCompare(event.target.checked)} /> Comparar com a imagem parada</label>
              <button className={styles.primaryButton} disabled={reducedMotion} onClick={() => { setSequence(!sequence); setPaused(false); }}>{sequence ? <Pause size={17} /> : <Play size={17} />}{sequence ? 'Parar sequência' : 'Reproduzir sequência'}</button>
              <p className={styles.footnote}>{reducedMotion ? 'A preferência de movimento reduzido do seu dispositivo está ativa.' : 'Esta prévia anima o corpo. Não simula o vídeo do Lemon Slice nem a sincronização da boca.'}</p>
            </> : <>
              <p className={styles.helper}>Compare a configuração atual com sugestões de gestos mais perceptíveis.</p>
              <fieldset className={styles.fieldset}><legend>Presença da Lumi</legend><div className={styles.presets}>
                {MOTION_PRESETS.map((item) => <button key={item.id} aria-pressed={preset === item.id} onClick={() => { setPreset(item.id); setSettings({ speakingPrompt: item.speakingPrompt, idlePrompt: item.idlePrompt, aspectRatio: settings.aspectRatio }); }}><strong>{item.name}{item.id === 'present' && <span>Comece aqui</span>}</strong><small>{item.description}</small></button>)}
              </div></fieldset>
              <label className={styles.selectLabel}>Formato do vídeo<select value={settings.aspectRatio} onChange={(event) => setSettings({ ...settings, aspectRatio: event.target.value as AnimationSettings['aspectRatio'] })}>{ASPECT_RATIOS.map((ratio) => <option key={ratio} value={ratio}>{ratio.replace('x', ':')}{ratio === '2x3' ? ' · original' : ''}</option>)}</select></label>
              <details className={styles.promptDetails}><summary>Editar prompts de movimento</summary>
                <label htmlFor="lumi-speaking-prompt">Enquanto fala</label><textarea id="lumi-speaking-prompt" maxLength={1600} rows={5} value={settings.speakingPrompt} onChange={(event) => { setPreset('custom'); setSettings({ ...settings, speakingPrompt: event.target.value }); }} />
                <label htmlFor="lumi-idle-prompt">Enquanto espera</label><textarea id="lumi-idle-prompt" maxLength={1600} rows={5} value={settings.idlePrompt} onChange={(event) => { setPreset('custom'); setSettings({ ...settings, idlePrompt: event.target.value }); }} />
              </details>
              <button className={styles.primaryButton} disabled={configured !== true || !readAnimationSettings(settings)} onClick={() => setLiveSettings({ ...settings })}><Video size={18} /> Testar ao vivo</button>
              <p className={styles.footnote}>{configurationError ? 'Não foi possível verificar a configuração. Recarregue a página para tentar novamente.' : configured === null ? 'Verificando disponibilidade…' : configured ? 'Usa microfone e uma sessão real da Agora + Lemon Slice, com consumo da sua conta.' : 'Para testar ao vivo, configure Agora e NEXT_LEMONSLICE_API_KEY no servidor. A prévia local já funciona.'}</p>
            </>}
          </aside>
        </div>}

        {mode !== 'videos' && <section className={styles.notes} aria-label="Como avaliar o movimento">
          <article><span className={styles.noteIcon}><Sparkles size={20} /></span><div><h3>Mais presença, com a mesma Lumi</h3><p>Comece com “Mais presente”. Observe a fala e depois fique alguns segundos em silêncio para avaliar os movimentos de espera.</p></div></article>
          <article><span className={styles.noteIcon}><FlaskConical size={20} /></span><div><h3>Um ajuste de cada vez</h3><p>Repita a mesma frase nos testes. Os prompts sugerem comportamento; o resultado precisa ser observado ao vivo. <a href="https://docs.agora.io/en/ai/platform/models/avatar/lemonslice" target="_blank" rel="noreferrer">Guia do Lemon Slice</a></p></div></article>
        </section>}
        <footer className={styles.footer}>Lumi Motion Lab <span>Experimentos independentes da experiência principal</span></footer>
      </div>
      {liveSettings && <LemonSliceTestSession settings={liveSettings} onClose={() => setLiveSettings(null)} />}
    </main>
  );
}

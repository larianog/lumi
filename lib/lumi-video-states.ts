export const LUMI_VIDEO_STATES = [
  { id: 'idle', label: 'Repouso', icon: '✦', loop: true, duration: '4–6 s', direction: 'Respiração visível e um piscar ocasional. Postura neutra; primeiro e último quadros combinam.', trigger: 'Enquanto aguarda uma interação.' },
  { id: 'sleeping', label: 'Dormindo', icon: '☾', loop: true, duration: '4 s', direction: 'Olhos fechados e respiração tranquila. Acorda assim que a pessoa interage ou a Lumi fala.', trigger: 'Após 30 segundos sem fala ou interação na página.' },
  { id: 'listening', label: 'Escutando', icon: '◌', loop: true, duration: '4–6 s', direction: 'Olhar atento e pequenas inclinações de cabeça. Boca fechada e gestos tranquilos.', trigger: 'Enquanto a pessoa está falando.' },
  { id: 'thinking', label: 'Pensando', icon: '✧', loop: true, duration: '3–4 s', direction: 'Inclinação curiosa de cabeça e um movimento discreto das antenas. Sem falar.', trigger: 'Enquanto a resposta é preparada.' },
  { id: 'reading', label: 'Lendo', icon: '▤', loop: true, duration: '4 s', direction: 'Lumi lê um livro enquanto analisa a atividade. Completa o ciclo antes de mostrar o resultado.', trigger: 'Enquanto a atividade está sendo analisada.' },
  { id: 'speaking', label: 'Falando', icon: '♫', loop: true, duration: '4–6 s', direction: 'Gestos leves e variados de corpo e braços. Movimento de boca genérico, sem formar uma frase específica.', trigger: 'Durante a reprodução da voz da Lumi.' },
  { id: 'greeting', label: 'Saudação', icon: '☀', loop: false, duration: '2–3 s', direction: 'Começa neutra, faz um aceno acolhedor e volta à mesma postura neutra.', trigger: 'Uma vez, ao começar uma interação.' },
  { id: 'celebrating', label: 'Comemorando', icon: '★', loop: false, duration: '2–3 s', direction: 'Começa neutra, dá um pequeno salto alegre e volta à postura inicial, com os pés no mesmo lugar.', trigger: 'Uma vez, após uma conquista na atividade.' },
] as const;

export type LumiVideoState = (typeof LUMI_VIDEO_STATES)[number]['id'];
export type LumiVideoClip = {
  file: Pick<File, 'name' | 'size'>;
  url: string;
  source: 'bundled' | 'local';
  fit?: 'contain' | 'cover';
};

export const BUNDLED_LUMI_VIDEO_CLIPS: Partial<Record<LumiVideoState, LumiVideoClip>> = {
  idle: {
    file: { name: 'lummi-idle-transparente.webp', size: 4146608 },
    url: '/assets/lumi/states/lummi-idle-transparente.webp',
    source: 'bundled',
  },
  sleeping: {
    file: { name: 'lummi-dormindo-transparente.webp', size: 4057788 },
    url: '/assets/lumi/states/lummi-dormindo-transparente.webp',
    source: 'bundled',
  },
  reading: {
    file: { name: 'lummi-lendo-transparente.webp', size: 5118000 },
    url: '/assets/lumi/states/lummi-lendo-transparente.webp',
    source: 'bundled',
  },
  listening: {
    file: { name: 'lummi-transparente-02.webp', size: 7209810 },
    url: '/assets/lumi/states/lummi-transparente-02.webp',
    source: 'bundled',
  },
  speaking: {
    file: { name: 'lummi-falando-otimizada.webp', size: 3949272 },
    url: '/assets/lumi/states/lummi-falando-otimizada.webp',
    source: 'bundled',
    // Pre-sized to the portrait viewport; retains the original cover framing.
    fit: 'cover',
  },
};

export const VIDEO_CONVERSATION_DEMO: { state: LumiVideoState; seconds: number }[] = [
  { state: 'greeting', seconds: 3 },
  { state: 'listening', seconds: 5 },
  { state: 'thinking', seconds: 3 },
  { state: 'speaking', seconds: 6 },
  { state: 'listening', seconds: 4 },
  { state: 'celebrating', seconds: 3 },
];

export function videoFileError(file: Pick<File, 'name' | 'size'>): string | null {
  if (!/\.(webm|mp4|mov|webp)$/i.test(file.name)) return 'Escolha um arquivo WebP, WebM, MP4 ou MOV.';
  if (file.size === 0) return 'Este arquivo está vazio. Escolha outro arquivo.';
  if (file.size > 40 * 1024 * 1024) return 'Use um clipe de até 40 MB para esta prévia.';
  return null;
}

export function isWebPClip(clip: LumiVideoClip | undefined): boolean {
  return Boolean(clip && /\.webp$/i.test(clip.file.name));
}

export function videoProductionManifest(clips: Partial<Record<LumiVideoState, LumiVideoClip>>) {
  return {
    version: 1,
    kind: 'lumi-video-states',
    audio: 'separate',
    note: 'Production guide only. Video bytes and temporary local URLs are not included.',
    states: Object.fromEntries(LUMI_VIDEO_STATES.map((state) => [state.id, {
      label: state.label,
      fileName: clips[state.id]?.file.name ?? null,
      bundledSource: clips[state.id]?.source === 'bundled' ? clips[state.id]?.url : null,
      fit: clips[state.id]?.fit ?? 'contain',
      suggestedWebm: `/assets/lumi/states/${state.id}.webm`,
      suggestedHevc: `/assets/lumi/states/${state.id}.mov`,
      suggestedWebp: `/assets/lumi/states/${state.id}.webp`,
      loop: state.loop,
      onEnded: state.loop ? null : 'idle',
      durationGuide: state.duration,
      direction: state.direction,
    }])),
  };
}

export const MOTION_PRESETS = [
  {
    id: 'original',
    name: 'Atual',
    description: 'O ponto de partida usado no app.',
    speakingPrompt: 'Mascote de pelúcia gentil, expressivo e curioso.',
    idlePrompt: 'Respira suavemente, pisca e faz pequenos acenos amigáveis.',
  },
  {
    id: 'present',
    name: 'Mais presente',
    description: 'Curiosa, atenta e com gestos mais perceptíveis.',
    speakingPrompt: 'A lively, curious plush mascot having a friendly conversation. Expressive head tilts, visible gentle body sways and occasional small arm gestures accompany speech. Warm and engaged energy. Keep the original plush character, face, antennae and proportions recognizable. Fixed camera.',
    idlePrompt: 'An attentive, curious plush mascot listening with interest. Gentle visible breathing, occasional head tilts, small body sways and a friendly little nod. Relaxed but engaged, with pauses between movements. Keep the original character and a fixed camera.',
  },
  {
    id: 'expressive',
    name: 'Expressiva',
    description: 'Mais energia para contar histórias e comemorar.',
    speakingPrompt: 'An enthusiastic, playful plush mascot telling a delightful story. Lively body language with friendly arm gestures, expressive head tilts and cheerful little bounces while talking. Keep the original plush character, facial features, antennae and body proportions recognizable. Fixed camera.',
    idlePrompt: 'A cheerful, playful plush mascot eagerly waiting for a reply. Curious head tilts, gentle swaying, occasional little nods and a brief friendly wave. Natural pauses between gestures. Preserve the original plush design. Fixed camera.',
  },
] as const;

export const ASPECT_RATIOS = ['2x3', '9x16', '1x1'] as const;
export type AnimationSettings = {
  speakingPrompt: string;
  idlePrompt: string;
  aspectRatio: (typeof ASPECT_RATIOS)[number];
};

export function readAnimationSettings(value: unknown): AnimationSettings | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const validPrompt = (prompt: unknown): prompt is string =>
    typeof prompt === 'string' && prompt.trim().length > 0 && prompt.length <= 1600;
  if (!validPrompt(input.speakingPrompt) || !validPrompt(input.idlePrompt)) return null;
  if (!ASPECT_RATIOS.includes(input.aspectRatio as AnimationSettings['aspectRatio'])) return null;
  return {
    speakingPrompt: input.speakingPrompt.trim(),
    idlePrompt: input.idlePrompt.trim(),
    aspectRatio: input.aspectRatio as AnimationSettings['aspectRatio'],
  };
}

export function lemonSliceParameters(settings: AnimationSettings) {
  return {
    aspect_ratio: settings.aspectRatio,
    agent_prompt: settings.speakingPrompt,
    agent_idle_prompt: settings.idlePrompt,
  };
}

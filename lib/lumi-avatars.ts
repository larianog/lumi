/**
 * Lumi avatars a child can pick on /profile/[id]/avatars. Safe for the browser:
 * the LemonSlice source (agent ID or reference image) is resolved on the server
 * in lib/lumi-avatar-source.ts.
 *
 * `keying` tunes components/ChromaKeyAvatar.tsx for the avatar's video background
 * (CbCr distance). Measure it on real frames before adding an avatar: background
 * pixels must stay below `similarity` and the character above
 * `similarity + smoothness`, or the cut-out gets green specks or holes.
 */
export type LumiAvatarId = 'alien' | 'princess' | 'hero' | 'cowboy' | 'plush';

export type LumiAvatar = {
  id: LumiAvatarId;
  name: string;
  description: string;
  /** Transparent still image, shown in the picker and while the video loads. */
  image: string;
  keying: { similarity: number; smoothness: number };
};

export const LUMI_AVATARS: readonly LumiAvatar[] = [
  {
    id: 'alien',
    name: 'Lumi Explorador',
    description: 'Um alienígena azul curioso, de olhos grandes e sorriso gentil.',
    image: '/assets/avatars/lumi-alien.png',
    // Mint background: max 0.013; light-blue body: 99% above 0.03.
    keying: { similarity: 0.014, smoothness: 0.012 },
  },
  {
    id: 'princess',
    name: 'Lumi Princesa',
    description: 'Uma princesa das estrelas, com coroa brilhante e vestido de galáxia.',
    image: '/assets/avatars/lumi-princess.png',
    // Mint background: max 0.010; the translucent veil keys out partially, by design.
    keying: { similarity: 0.014, smoothness: 0.012 },
  },
  {
    id: 'hero',
    name: 'Lumi Herói',
    description: 'Um super-herói corajoso, de capa e uniforme, pronto para qualquer desafio.',
    image: '/assets/avatars/lumi-hero.png',
    // Mint background: max 0.010; costume and body stay above 0.046.
    keying: { similarity: 0.014, smoothness: 0.012 },
  },
  {
    id: 'cowboy',
    name: 'Lumi Caubói',
    description: 'Um caubói aventureiro, de chapéu e botas, que adora explorar.',
    image: '/assets/avatars/lumi-cowboy.png',
    // Mint background: max 0.010; outfit and body stay above 0.05.
    keying: { similarity: 0.014, smoothness: 0.012 },
  },
  {
    id: 'plush',
    name: 'Lumi Pelúcia',
    description: 'O Lumi fofinho, com asinhas e antenas que brilham.',
    image: '/assets/avatars/lumi-plush.png',
    // Lime-green background: max 0.034; mint/lilac body: ~0.25 away.
    keying: { similarity: 0.06, smoothness: 0.05 },
  },
];

export const DEFAULT_LUMI_AVATAR: LumiAvatarId = 'plush';

export function isLumiAvatarId(value: unknown): value is LumiAvatarId {
  return typeof value === 'string' && LUMI_AVATARS.some((avatar) => avatar.id === value);
}

export function getLumiAvatar(id?: string | null): LumiAvatar {
  return LUMI_AVATARS.find((avatar) => avatar.id === id)
    ?? LUMI_AVATARS.find((avatar) => avatar.id === DEFAULT_LUMI_AVATAR)!;
}

export function getLumiAvatarMode(id?: string | null): 'local' | 'provider' {
  return getLumiAvatar(id).id === 'plush' ? 'local' : 'provider';
}

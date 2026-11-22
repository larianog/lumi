import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { LumiAvatarId } from '@/lib/lumi-avatars';

/** What `new LemonSlice(...)` needs to render one Lumi avatar (server-only). */
export type LemonSliceAvatarSource =
  | { agentId: string }
  | {
      agentImageBase64: string;
      aspectRatio: '2x3';
      additionalParams: { agent_prompt: string; agent_idle_prompt: string };
    };

const IMAGE_PROMPTS = {
  agent_prompt: 'Friendly plush mascot, warm smile, bright curious eyes. Nods gently while speaking, small happy bounces when praising, calm and patient.',
  agent_idle_prompt: 'Listens attentively, blinks softly, breathes calmly, small friendly nods, slight curious head tilt.',
};

/**
 * LemonSlice dashboard avatars, by catalog id. Their look and avatar/idle prompts
 * live in the dashboard. `alien` can be overridden with `NEXT_LEMONSLICE_AGENT_ID`.
 */
const DASHBOARD_AGENT_IDS: Partial<Record<LumiAvatarId, string>> = {
  alien: 'agent_65ce272168dc785d',
  princess: 'agent_b25ca593d9441a17',
  hero: 'agent_8dda03314aad465b',
  cowboy: 'agent_f9bad8af9467fa11',
};

/**
 * Dashboard avatars use their agent ID. `plush` is generated from a reference image
 * on a solid lime background, which the browser keys out; the image lives in
 * `assets/` (not `public/`) and is traced into the standalone build by next.config.mjs.
 */
export async function resolveLemonSliceSource(avatarId: LumiAvatarId): Promise<LemonSliceAvatarSource> {
  const agentId = avatarId === 'alien'
    ? process.env.NEXT_LEMONSLICE_AGENT_ID?.trim() || DASHBOARD_AGENT_IDS.alien
    : DASHBOARD_AGENT_IDS[avatarId];
  if (agentId) return { agentId };
  const image = await readFile(join(process.cwd(), 'assets/avatars/lumi-plush-reference.jpg'));
  return { agentImageBase64: image.toString('base64'), aspectRatio: '2x3', additionalParams: IMAGE_PROMPTS };
}

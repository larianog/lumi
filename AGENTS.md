# Agent Development Guide

This guide is for coding agents making changes in `agent-quickstart-nextjs`.

## How to Load

This repository uses progressive disclosure documentation. Docs live under `docs/ai/` in three levels.

1. Read [docs/ai/L0_repo_card.md](docs/ai/L0_repo_card.md) to identify the repo.
2. Load ALL 8 files in [docs/ai/L1/](docs/ai/L1/). They are small — load all upfront.
3. Follow L2 deep-dive links only when L1 isn't detailed enough. The index is at [docs/ai/L1/L2/_index.md](docs/ai/L1/L2/_index.md).

This repo declares `Recipe Role: base` in L0, so also read [docs/ai/RECIPE.md](docs/ai/RECIPE.md) when evaluating extension points, invariants, or stable contracts.

The sections below (Start Here, Patterns, Anti-Patterns, etc.) remain the canonical contributor handbook for hands-on work; the `docs/ai/` tree is the structured summary used by AI agents.

## Start Here

- Read [README.md](./README.md) for setup, commands, verification, and deployment.
- Use [docs/ai/RECIPE.md](docs/ai/RECIPE.md) for the base quickstart recipe contract.
- Use [docs/ai/L1/L2/from_scratch_bootstrap.md](docs/ai/L1/L2/from_scratch_bootstrap.md) for the baseline implementation map.
- Use [docs/ai/L1/L2/transcript_pipeline.md](docs/ai/L1/L2/transcript_pipeline.md) for transcript and RTM behavior.
- For layout and responsibilities inside `components/`, `app/api/`, and `lib/`, use [docs/ai/L1/03_code_map.md](docs/ai/L1/03_code_map.md) and [docs/ai/L1/02_architecture.md](docs/ai/L1/02_architecture.md).

## Current System Shape

- App shell: Next.js 16 App Router, React 19, and TypeScript
- Client RTC: `agora-rtc-react` hooks over `agora-rtc-sdk-ng`
- Messaging: `agora-rtm` for transcripts, agent state, metrics, and error events
- Toolkit core: `agora-agent-client-toolkit` for `AgoraVoiceAI`, transcript helpers, and turn status
- UI components: `agora-agent-uikit` for visualizer, transcript, and mic controls
- Server SDK: `agora-agents` for managed agent session startup
- API routes: token generation, agent invite, chat, and stop routes live in `app/api`
- Study materials: authenticated image upload, private temporary storage, OpenAI homework analysis, cached results, and child/parent history
- Default voice-agent config: Agora-managed STT, LLM, and TTS; OpenAI credentials are used only for material extraction

## Supported Modes

### Local Development

- Run from the repo root with `pnpm run dev`.
- Next.js serves the app and the route handlers at `http://localhost:3000`.
- For LAN previews bind to `0.0.0.0`, not `127.0.0.1`. Voice on a remote device needs a secure context; `pnpm run dev:lan` enables development HTTPS, with a certificate trusted by that device. LAN access does not publish the app on the internet.
- Local credentials are read from `.env.local`, usually written by `agora project env write .env.local`.
- Material extraction additionally requires server-only `OPENAI_API_KEY` values.

### Vercel Deployment

- Deploy the repository as a single Next.js app.
- Set `NEXT_PUBLIC_AGORA_APP_ID` and `NEXT_AGORA_APP_CERTIFICATE` in the deployment target.
- Set the OpenAI analysis variables when the material workflow is enabled.
- The bundled JSON database and local file cache are not durable on serverless Vercel; use persistent database/object-storage adapters for production material history.
- Keep `NEXT_AGORA_APP_CERTIFICATE` server-side only.
- `.github/workflows/deploy-vercel.yml` deploys production on pushes to `main` using GitHub repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
- Avoid duplicate production deployments if the Vercel Git integration is also enabled.

## Routing / Ownership

- UI and RTC/RTM client lifecycle live in `components`.
- Browser-facing API routes live in `app/api`.
- Shared constants and transcript normalization live in `lib`.
- Material persistence, extraction, retention, and storage adapters live in `lib`; uploaded files never live under `public/`.
- If a workflow, request contract, or ownership boundary changes, update `README.md`, `AGENTS.md`, and the relevant `docs/ai/` files in the same change.

## Key Files

- `app/playground/lumi-animation/page.tsx`: additive animation lab; leave the main route/navigation intact when experimenting.
- `components/playground/`: local motion preview, scoped CSS, and isolated Lemon Slice test-session bootstrap. The existing `ConversationComponent` retains RTC hook ownership.
- `app/api/playground/lumi-animation/route.ts`: optional live-test route with validated prompts, a fixed local image, and separate `lumi-animation-*` channels. Requires server-only `NEXT_LEMONSLICE_API_KEY` plus Agora credentials; it does not change the base environment contract.
- `lib/lumi-animation.ts`: experiment presets and validation. Changes here do not apply to the production invite route. `scripts/verify-lumi-animation.ts` runs through `verify:api`.
- `components/playground/LumiVideoStates.tsx` + `lib/lumi-video-states.ts`: default local video-state lab, eight-state production brief, and in-memory file selection. Only the active state plays; hidden tabs pause playback. No voice sessions or uploads occur in this mode. Follow `docs/lumi-video-states.md` for alpha formats and the future event integration boundary.
- `public/assets/lumi/states/lummi-falando-otimizada.webp` (speaking: 143 frames, 5957 ms, 600 × 650) and `lummi-transparente-02.webp` (listening: 192 frames, 7999 ms, 768 × 768): alpha animations registered in `BUNDLED_LUMI_VIDEO_CLIPS` and shared by profiles and the lab. Speaking is a 3,949,272-byte optimized derivative generated by `scripts/optimize-lumi-speaking.mjs`; preserve its 143 frames, delays, alpha and loop. Keep the Full HD source `lummi-animacao-transparente-1.webp` byte-for-byte and registry sizes accurate. Speaking uses `fit: 'cover'` to frame its centered character within portrait containers; other clips default to `contain`. The earlier speaking WebP and MP4 remain assets but are no longer selected. Temporary playground replacements do not change profile defaults. New replacements should use a new URL to avoid stale cached blobs.
- In video mode, reduced motion blocks autoplay only: keep manual play and **Simular conversa** enabled. A deliberate click enables motion for this page; reset that override on system preference changes or reload. Stopping the simulation pauses its video too.
- Video simulation snapshots only loaded, error-free clips when starting; skip missing states, including greeting. Finish paused on idle if available, otherwise on the last displayed state. Removing/replacing a clip cancels the sequence.
- The same file input accepts static/animated WebP. Shared `components/LumiWebPClip.tsx` renders it as an unoptimized image, accepts the caller's CSS class, shows a static first frame when paused/hidden/reduced-motion blocked, and allocates/revokes a new blob URL per replay. WebP speed/repeats come from the file; disable video speed for it. Manual WebP has no ended-to-idle event; timed simulation still switches states.
- `lib/lumi-webp.ts` shares bundled downloads across StrictMode and placeholder/live avatar remounts. Do not abort that shared download when one subscriber leaves. Local uploads still use abort cleanup; temporary decode/replay URLs are always revoked. Failed loads are evicted; the profile's **Recarregar** clears statuses and remounts players to refetch. Test this lifecycle through `verify:api`.

- `app/api/generate-agora-token/route.ts`: issues RTC + RTM tokens for the browser user.
- Participant IDs must fit the Conversational AI endpoint: `1..2147483647`, excluding reserved agent/avatar IDs. Use `generateAgoraParticipantUid` / `isAgoraParticipantUid` in `lib/agora.ts`; raw uint32 randomness can produce valid RTC IDs that the agent API rejects. Token requests above this maximum and invalid main/playground invite participants return `400`. Keep boundary tests, including high-bit random input and actual rejected IDs, in `verify:api`.
- `lib/agora-rtm-session.ts`: browser-owned RTM singleton shared by `LumiVoiceAgent`, `LandingPage` and `LemonSliceTestSession`. Keep its numeric UID stable within the document (no storage across tabs), request fresh combined tokens for each channel, and serialize login/subscription/logout through leases. Never reconstruct RTM on navigation or hide its duplicate-instance diagnostic. A stale lease must not log out a newer session; failed logout must succeed before another login. Invites start only after RTM readiness; do not abort an in-flight invite and lose the returned agent ID. Stop late successes and partial startup resources. `LumiVoiceAgent` defers automatic startup past the StrictMode cleanup and locks duplicate starts synchronously. Tests in `scripts/verify-agora-rtm-session.ts` run without live services through `verify:api`.
- `app/api/invite-agent/route.ts`: starts the managed agent session; edit here for system prompt, VAD, model, or voice changes.
- Profiles, material study and activity voice dialogs opt into `avatarMode="local"` for normal and demo accounts, forwarded as `avatar_mode: "local"` to the invite route. This mode must omit Lemon Slice even if its key exists; omitted/`provider` preserves other callers. `verify:api` checks both paths.
- `LumiConversationAvatar` + `useLumiSpeechState` + `lib/lumi-speech.ts`: idle/listening/speaking requests from existing RTC microphone/agent audio levels. Do not map the agent's generic `listening` state to user speech. Keep short attack/release windows and immediate agent-speech priority. `lib/lumi-animation-transition.ts` holds an ending action until the current animation cycle completes, then uses only the latest request; silence resumes the idle loop after that cycle. Never restart the timeline for short speech gaps. `lib/lumi-webp-timing.ts` reads ANMF durations without changing supplied bytes; `LumiWebPClip` reports cycles from image load, while videos use `ended`. Pause, hidden tabs, disconnect, muted listening, blocked speaking and failed playback cancel pending transitions immediately. This visual behavior does not change voice interruption. Preload conversation clips independently, animate only the displayed state, and retain the still fallback. `verify:api` includes timing and transition checks.
- Profile explicit play/pause is shared by avatars and material reading through `lib/lumi-motion-preference.ts`, stored as `lumi-avatar-motion-v2` in tab `sessionStorage` so entering the conversation does not reset it; system motion preference changes clear the choice. Storage failures fall back to in-memory state. Migrate the old key once: discard the old `off` value to restore system-controlled autoplay, preserve `on`, and keep new v2 choices persistent. Never override system reduced motion without explicit play. Keep an accessible, visible enable/reload action rather than silently remaining on the fallback image.
- `app/api/stop-conversation/route.ts`: stops the agent session.
- `app/api/chat/completions/route.ts`: optional OpenAI-compatible SSE proxy for a custom LLM (not wired by default).
- `app/api/materials/route.ts`: validates and hashes image uploads, reuses cached extraction, calls the OpenAI vision model, and lists material history.
- `app/api/materials/[id]/route.ts`: returns authorized material detail and records explicit completion.
- `app/profile/[id]/history/page.tsx`: child material history.
- `app/profile/[id]/materials/[materialId]/page.tsx`: study workspace with the uploaded image and inline local Lumi animations.
- The embedded material result shares the upload panel's translucent green surface and responsive styling in `app/lumi.css`; keep light text and legible loading/error/completion states. Scope these styles to `.home-material-layout` so standalone history/detail styling remains independent.
- Profile uploads stay on `/profile/[id]`: `MaterialStudyPageClient` has an embedded mode seeded from the upload response, retaining the profile header and URL. `LumiMaterialLoading` shows `lummi-lendo-transparente.webp` (118 frames, 3933 ms, 800 x 800, alpha; preserve exact bytes) plus **Carregando…** beneath the avatar while uploading/processing, respecting motion controls. Hold successful responses until the next loaded reading cycle ends, including a full first cycle for fast responses; loop while the API is pending. Start result/voice only after this gate. API errors cancel immediately; paused/reduced motion, hidden tabs and animation failures bypass the wait, with a 15-second asset timeout. Unmount the prior voice session during analysis and start a grounded local session only when ready. Lock duplicate upload/file changes, abort client requests on exit/profile change, and ignore late results. Processing polling is serial, abortable and bounded to two minutes with visible retry. **Enviar outra atividade** resets the inline flow; history/detail URLs still work through the same study component. Keep image/PDF preview and explicit completion available in both modes.
- `components/LandingPage.tsx`: session bootstrap, RTM setup, provider wiring, and conversation lifecycle.
- `components/ConversationComponent.tsx`: RTC join, mic publication, `AgoraVoiceAI` init, transcript state, and renewals.
- Idle is `lummi-idle-transparente.webp` (121 frames, 4033 ms, 800 × 800, alpha, 4,146,608 bytes), preserved exactly. `LumiConversationAvatar` plays idle between actions and immediately yields to listening/speaking/sleeping. Welcome, picker, activities, report and precall illustrations use `idleOnly` to load just this clip, with scoped responsive sizing and no extra CSS bob/tilt loop. Inline placeholders/provider fallbacks and inactive material views also use the shared idle. Disconnect cancels speech cycles but allows idle; pause, reduced motion, hidden tabs/offscreen visibility and failures retain static fallback. Keep the welcome intro completion callback/watchdog and accessible motion control. The lab includes idle; simulation ends paused on it when loaded. Keep the original PNG for error/loading fallback, provider input and the separate Local 2D comparison reference.
- `useLumiIdleSleep` overlays `sleeping` on idle local conversations after 30 seconds without speech or page interaction. It never changes RTC/mic lifecycle. User/agent speech and pointer/key/input/scroll activity wake immediately; leaving sleep preempts its cycle. Suspend during agent preparation, connection errors, blocked audio/mic and hidden tabs; resume with a fresh interval. `isLumiRestingAgentState` allows SDK `idle`, `listening`, `silent` and the initial null state; do not exclude `silent`, which otherwise prevents the timer from starting after a response. Changes between resting states must not restart the countdown. `lummi-dormindo-transparente.webp` is the supplied 121-frame, 4033 ms, 800 × 800 alpha loop (4,057,788 bytes), preserved byte-for-byte and available for manual playground preview. Loading materials continues to use reading.
- Voice recovery: read RTC state with `useConnectionState` so already-connected snapshots are not missed. Agent departure, join errors, fatal service events and a 20-second connection wait expose **Reconectar Lumi** in inline/full voice screens. `LumiVoiceAgent` stops the owned session before retrying, locks duplicate clicks and exposes failed invites for retry. Keep RTC cleanup in its hooks and reuse the RTM singleton. Log only departure reason or service source/code, never transcript/provider payloads.
- `components/QuickstartConversationLayout.tsx`: in-call header, transcript rail, and controls dock.
- `components/QuickstartPipelineMetrics.tsx`: per-stage latency chips from `AGENT_METRICS`.
- `components/QuickstartTranscriptPanel.tsx`: live transcript rail.
- `lib/chat-completions.ts`: server-side custom LLM SSE handler factory; the route only exports `POST`.
- `lib/agora.ts`: shared agent UID defaults.
- `lib/conversation.ts`: transcript normalization and visualizer state mapping.
- `lib/material-extraction.ts`: server-only multimodal extraction request and response validation.
- Homework tutoring: `analyzeMaterial` returns a child-safe `extractedText` and a server-only `analysis` (expected answers, steps, hints). Never add `analysis` to DTOs. `invite-agent` switches to `messages.voice.homeworkPrompt` when a material has an analysis. Uploads require a family session and owned child profile, without an additional adult-password step; family-wide history still requires recent adult access. The study workspace explicitly uses `avatarMode="local"` alongside `profileId` and `materialId`.
- `lib/material-storage.ts`: private temporary local file cache.
- `lib/study-materials.ts`: ownership, shared-demo isolation, DTO, and expiry helpers.
- `config/env/env.local.example`: local environment template.
- `deploy/docker/`: container build definition and Docker-specific ignore rules.
- `docs/assets/architecture/`: light and dark architecture diagrams used by the README.
- `scripts/verify-api-contracts.ts`: route contract verification.

## Patterns

### StrictMode Guard (`isReady`)

Both `useJoin` and `useLocalMicrophoneTrack` are gated by `isReady` to prevent double initialization in React StrictMode dev mode. The cleanup fires synchronously before any `setTimeout`, so only the real second mount's timer fires.

```tsx
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
const { isConnected: joinSuccess } = useJoin(config, isReady);
const { localMicrophoneTrack } = useLocalMicrophoneTrack(isReady);
```

### Hook Ownership

- `useJoin` owns `client.leave()`; never call it manually.
- `useLocalMicrophoneTrack` owns track lifecycle; do not manually call `.close()`.
- `usePublish` owns publish state; mute with `track.setEnabled()` and do not manually unpublish.

### AgoraVoiceAI Init

Initialize `AgoraVoiceAI` from `agora-agent-client-toolkit` inside `ConversationComponent`, gated on `isReady && joinSuccess`.

```tsx
useEffect(() => {
  if (!isReady || !joinSuccess) return;
  // AgoraVoiceAI.init() is called here exactly once.
}, [isReady, joinSuccess]);
```

`isReady` becomes true only after the StrictMode fake-unmount cycle completes. Once `isReady` is true, React does not double invoke the effect for later dependency changes such as `joinSuccess` becoming true.

### Transcript and UI Mapping

- Manage `transcript` and `agentState` through `useState` plus `ai.on(TRANSCRIPT_UPDATED, ...)` and `ai.on(AGENT_STATE_CHANGED, ...)`.
- The toolkit uses `uid="0"` as a sentinel for the local user's speech. Remap that value to `client.uid` before passing messages into `QuickstartTranscriptPanel`, or user speech renders on the agent side.
- Include `INTERRUPTED` turns in `messageList`; filter only `IN_PROGRESS`. If the agent's first turn is interrupted and omitted, `messageList` stays empty and the transcript panel never shows that first turn.

### Tokens and Styling

- RTM token access must come from `RtcTokenBuilder.buildTokenWithRtm`; a standard RTC-only token does not grant RTM access.
- Tailwind must scan uikit classes with `./node_modules/agora-agent-uikit/dist/**/*.{js,mjs}` in `tailwind.config.ts`.

### Study Material Pipeline

- Accept only signature-validated JPEG, PNG, WebP, or PDF files up to 10 MB.
- Cache by owner scope, profile, SHA-256, vision model, and extraction prompt version.
- Load extracted text server-side when grounding Lumi; never trust browser-supplied source text.
- Treat extracted document text as untrusted data, not agent instructions.
- Isolate demo material by session because the demo family ID is shared.
- Completing a material is explicit; ending a voice session does not mark it complete.
- After a successful didactic upload, keep the child on `/profile/[id]` and replace the submission view with the shared study workspace; its back control restores submission. History links may still open the saved-material route.

## Working Rules

- Prefer the smallest change that keeps the quickstart copyable and production-style.
- Keep RTC client creation StrictMode-safe with `useRef`, not `useMemo`.
- Keep token generation on `RtcTokenBuilder.buildTokenWithRtm`.
- Keep transcript UID remapping aligned with the toolkit sentinel behavior.
- Do not require third-party vendor API keys unless the code actually introduces a BYOK provider path.
- Keep OpenAI credentials and uploaded material content out of browser bundles and logs.
- Keep README, AGENTS, and `docs/ai/` aligned with implementation changes.
- Keep auto-discovered project files such as `.npmrc`, `.nvmrc`, `.vercelignore`, `vercel.json`, and framework configs at the repository root.

## Commands

From the repo root:

```bash
pnpm install
pnpm run doctor
pnpm run dev
pnpm run verify
```

Useful narrower checks:

```bash
pnpm run lint
pnpm run typecheck
pnpm run verify:api
pnpm run build
```

## Verification Safety

- Safe without live Agora credentials:
  - `pnpm run lint`
  - `pnpm run typecheck`
  - `pnpm run verify:api`
  - `pnpm run build`
- Requires local env setup but not a live Agora session:
  - `pnpm run doctor`
  - `pnpm run verify`
- Often blocked inside restricted sandboxes because of port binding or process spawning:
  - `pnpm run dev`

## Anti-Patterns / What NOT To Do

- Do not call `client.leave()` manually; it breaks `useJoin` cleanup.
- Do not call `localMicrophoneTrack.close()` manually; it breaks hook ownership.
- Do not remove the `isReady` guard.
- Do not set `reactStrictMode: false` as a workaround.
- Do not use the deprecated `turnDetection.type: 'agora_vad'` flat API; use `turnDetection.config.start_of_speech` and `turnDetection.config.end_of_speech`.
- Do not replace `RtcTokenBuilder.buildTokenWithRtm` with an RTC-only token builder.
- Do not hide SDK requirements only in `CLAUDE.md`; all agent-facing guidance belongs in `AGENTS.md`.
- Do not place uploads under `public/` or commit `data/lumi-db.json` / `data/material-cache/` runtime content.

## Done Criteria

Before finishing a change:

1. Run the narrowest relevant verification command.
2. For shipped app/runtime changes, ensure `pnpm run verify` passes.
3. If you changed files in `components/` or `app/api/`, verify that `README.md`, this file, and the relevant `docs/ai/` files still match the implementation.
4. Update root README and affected docs when workflow, request contracts, architecture, or environment guidance changes.
5. If the change touches workflows, interfaces, gotchas, or security details, update the matching file under [docs/ai/L1/](docs/ai/L1/) and bump `Last Reviewed` in [docs/ai/L0_repo_card.md](docs/ai/L0_repo_card.md).

## Git Conventions

### Commit messages — conventional commits

- **Format:** `type: description` or `type(scope): description`
- **Types:** `feat:` (new feature), `fix:` (bug fix), `chore:` (maintenance, version bumps), `test:` (test additions/changes), `docs:` (documentation)
- **Scoped variant:** `feat(scope):`, `fix(scope):` — e.g. `feat(api): add stop-conversation status flag`
- **Lowercase after prefix** — `feat: add feature`, not `feat: Add feature`
- **Present tense** — "add feature", not "added feature"
- **PR number appended** — `feat: add feature (#123)`

### Branch names

- **Format:** `type/short-description` — lowercase, hyphen-separated
- **Types match commit types:** `feat/`, `fix/`, `chore/`, `test/`, `docs/`
- **Examples:** `feat/agent-metrics`, `fix/transcript-uid`, `docs/progressive-disclosure`

### General rules

- **No AI tool names** — never mention claude, cursor, copilot, cody, aider, gemini, codex, chatgpt, or gpt-3/4 in commit messages or PR descriptions.
- **No Co-Authored-By trailers** — omit AI attribution lines.
- **No `--no-verify`** — let git hooks run normally.
- **No git config changes** — do not modify `user.name` or `user.email`.

## Doc Commands

| Command         | When to use                                                  |
| --------------- | ------------------------------------------------------------ |
| generate docs   | No `docs/ai/` directory exists yet                           |
| update docs     | Code changed since the `Last Reviewed` date in L0            |
| test docs       | Verify docs give agents the right context (writes `docs/ai/test-results.md`) |
| fix docs        | Close findings from a docs review or test run                |

The generator and tester live in the [AgoraIO-Community/ai-devkit](https://github.com/AgoraIO-Community/ai-devkit) skill set. See the [progressive disclosure standard](https://github.com/AgoraIO-Community/ai-devkit/blob/main/docs/progressive-disclosure-standard.md) for the full specification.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

Non-didactic material classification from main is retained in persistence and DTOs (`isDidactic`, with an analysis fallback for older records). Prompt version `material-tutor-v3` invalidates pre-classification cache entries. Upload success still finishes the reading cycle before showing the adult-profile warning or the embedded study result. Processing responses that later become non-didactic must not start a child tutoring session. The shared workspace retains keyboard/close-button image preview and the history route.

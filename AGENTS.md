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

- `components/LumiApp.tsx`: welcome headline and registration/sign-in actions. The old family-description paragraph is removed. Render the demo button, hint and associated error only when `process.env.NODE_ENV === 'development'`; this is a UI visibility rule, not a change to the login API contract.
- `lib/lumi-avatars.ts`, `components/LumiAvatarPickerClient.tsx`, and `/profile/[id]/avatars`: the child's catalog and existing save flow. Missing choices default to Plush; the shared demo family remains fixed while each demo session stores its own child avatar choices. `PATCH /api/profiles` validates the ID and saves it for an owned child or the current demo session. `public/assets/lumi-avatar.png` remains the Plush still used by the welcome/profile-selection animations; never replace the bundled Plush WebP clips with catalog PNGs.
- `app/playground/lumi-animation/page.tsx`: additive animation lab; leave the main route/navigation intact when experimenting.
- `components/playground/`: local motion preview, scoped CSS, and isolated Lemon Slice test-session bootstrap. The existing `ConversationComponent` retains RTC hook ownership.
- `app/api/playground/lumi-animation/route.ts`: optional live-test route with validated prompts, a fixed local image, and separate `lumi-animation-*` channels. Requires server-only `NEXT_LEMONSLICE_API_KEY` plus Agora credentials; it does not change the base environment contract.
- `lib/lumi-animation.ts`: experiment presets and validation. Changes here do not apply to the production invite route. `scripts/verify-lumi-animation.ts` runs through `verify:api`.
- `components/playground/LumiVideoStates.tsx` + `lib/lumi-video-states.ts`: default local video-state lab, eight-state production brief, and in-memory file selection. Only the active state plays; hidden tabs pause playback. No voice sessions or uploads occur in this mode. Follow `docs/lumi-video-states.md` for alpha formats and the future event integration boundary.
- `public/assets/lumi/states/lummi-falando-asas-web-v1.webp` (speaking: 181 frames, 6033 ms, 800 × 800) and `lummi-transparente-02.webp` (listening: 192 frames, 7999 ms, 768 × 768): alpha animations registered in `BUNDLED_LUMI_VIDEO_CLIPS` and shared by profiles and the lab. Speaking uses a 4,808,826-byte playback derivative from `scripts/optimize-lumi-speaking-wings.mjs`, keeping all 181 frames, delays, 800 × 800 dimensions and alpha. Preserve the 44,527,006-byte supplied master `lummi-falando-asas-preservadas.webp` byte-for-byte. Keep the Full HD source `lummi-animacao-transparente-1.webp` byte-for-byte and registry sizes accurate. Speaking uses `fit: 'contain'` to preserve the whole square frame and wings in portrait containers; other clips also default to `contain`. The earlier speaking WebP and MP4 remain assets but are no longer selected. Temporary playground replacements do not change profile defaults. New replacements should use a new URL to avoid stale cached blobs.
- In video mode, reduced motion blocks autoplay only: keep manual play and **Simular conversa** enabled. A deliberate click enables motion for this page; reset that override on system preference changes or reload. Stopping the simulation pauses its video too.
- Video simulation snapshots only loaded, error-free clips when starting; skip missing states, including greeting. Finish paused on idle if available, otherwise on the last displayed state. Removing/replacing a clip cancels the sequence.
- The same file input accepts static/animated WebP. Shared `components/LumiWebPClip.tsx` renders it as a native image, accepts the caller's CSS class, shows a static first frame when paused/hidden/reduced-motion blocked, and allocates/revokes a new blob URL per replay. WebP speed/repeats come from the file; disable video speed for it. Manual WebP has no ended-to-idle event; timed simulation still switches states.
- `lib/lumi-webp.ts` shares bundled downloads across StrictMode and placeholder/live avatar remounts. Do not abort that shared download when one subscriber leaves. Local uploads still use abort cleanup; temporary decode/replay URLs are always revoked. Failed loads are evicted; a page reload remounts players to refetch. Test this lifecycle through `verify:api`.

- `app/api/generate-agora-token/route.ts`: issues RTC + RTM tokens for the browser user.
- Participant IDs must fit the Conversational AI endpoint: `1..2147483647`, excluding reserved agent/avatar IDs. Use `generateAgoraParticipantUid` / `isAgoraParticipantUid` in `lib/agora.ts`; raw uint32 randomness can produce valid RTC IDs that the agent API rejects. Token requests above this maximum and invalid main/playground invite participants return `400`. Keep boundary tests, including high-bit random input and actual rejected IDs, in `verify:api`.
- `lib/agora-rtm-session.ts`: browser-owned RTM singleton shared by `LumiVoiceAgent`, `LandingPage` and `LemonSliceTestSession`. Keep its numeric UID stable within the document (no storage across tabs), request fresh combined tokens for each channel, and serialize login/subscription/logout through leases. Never reconstruct RTM on navigation or hide its duplicate-instance diagnostic. A stale lease must not log out a newer session; failed logout must succeed before another login. Invites start only after RTM readiness; do not abort an in-flight invite and lose the returned agent ID. Stop late successes and partial startup resources. `LumiVoiceAgent` defers automatic startup past the StrictMode cleanup and locks duplicate starts synchronously. Tests in `scripts/verify-agora-rtm-session.ts` run without live services through `verify:api`.
- `app/api/invite-agent/route.ts`: starts the managed agent session; edit here for system prompt, VAD, model, or voice changes.
- `lib/agora-agent-token.ts`: explicit one-hour ConvoAI token for the managed agent and RTC publisher token for Lemon Slice. The current `agora-agents` 2.15.0 auto-token path can issue a one-second agent token; keep these explicit tokens on the invite path.
- Profile, material-study, and activity voice dialogs use the selected avatar. Missing/Plush choices use `avatarMode="local"` and preserve all bundled Plush idle/listening/speaking/sleeping animations without Lemon Slice. Other choices use `avatarMode="provider"` plus `avatar_id`; `lib/lumi-avatar-source.ts` resolves the catalog dashboard agent, and `components/ChromaKeyAvatar.tsx` renders its keyed video. No provider key leaves the selected still visible. Omitted provider settings preserve other callers. `verify:api` checks default Plush and selected provider paths.
- `LumiConversationAvatar` + `useLumiSpeechState` + `lib/lumi-speech.ts`: idle/listening/speaking requests from existing RTC microphone/agent audio levels. Do not map the agent's generic `listening` state to user speech. Keep short attack/release windows and immediate agent-speech priority. `lib/lumi-animation-transition.ts` holds an ending action until the current animation cycle completes, then uses only the latest request; silence resumes the idle loop after that cycle. Never restart the timeline for short speech gaps. `lib/lumi-webp-timing.ts` reads ANMF durations without changing supplied bytes; `LumiWebPClip` reports cycles from image load, while videos use `ended`. Reduced motion, hidden tabs, disconnect, muted listening, blocked speaking and failed playback cancel pending transitions immediately. This visual behavior does not change voice interruption. Preload conversation clips independently, animate only the displayed state, and retain the still fallback. `verify:api` includes timing and transition checks.
- Plush and material-reading avatars animate automatically and show no motion toggle. Older manual choices in tab `sessionStorage` are ignored. A failed animation retains the still fallback and error status; reloading the page retries the asset. The playground keeps its independent motion controls.
- `app/api/stop-conversation/route.ts`: stops the agent session.
- `app/api/chat/completions/route.ts`: optional OpenAI-compatible SSE proxy for a custom LLM (not wired by default).
- `app/api/materials/route.ts`: validates and hashes image uploads, reuses cached extraction, calls the OpenAI vision model, and lists material history.
- `app/api/materials/[id]/route.ts`: returns authorized material detail and records explicit completion.
- `app/report/page.tsx` and `app/api/recordings/`: the parent report lists session audio, transcripts and linked lesson files. Recording upload/playback/delete use the family session; demo recordings are isolated by session.
- `components/NewProfileForm.tsx` and `POST /api/profiles`: two-step family sign-up creates the adult account first, then up to eight children in one request. `/profiles` resumes step two if the family has no child yet.
- `lib/use-session-recorder.ts` reads the child mic and remote audio tracks without stopping them; the parent report's audio and transcripts live in `data/recordings/` for `LUMI_RECORDING_RETENTION_HOURS` (default 168). Keep playback private and demo sessions isolated.
- `app/profile/[id]/history/page.tsx`: child material history.
- `app/profile/[id]/materials/[materialId]/page.tsx`: study workspace with question cards, answer blanks, the original-file viewer, and the selected Lumi avatar.
- The embedded material result shares the upload panel's translucent green surface and responsive styling in `app/lumi.css`; keep light text and legible loading/error/completion states. Scope these styles to `.home-material-layout` so standalone history/detail styling remains independent.
- Profile uploads stay on `/profile/[id]`: `MaterialStudyPageClient` has an embedded mode seeded from the upload response, retaining the profile header and URL. `LumiMaterialLoading` shows `lummi-lendo-transparente.webp` (118 frames, 3933 ms, 800 x 800, alpha; preserve exact bytes) plus **Carregando…** beneath the avatar while uploading/processing, including when the system prefers reduced motion. Hold successful responses until the next loaded reading cycle ends, including a full first cycle for fast responses; loop while the API is pending. Start result/voice only after this gate. API errors cancel immediately; hidden tabs and animation failures bypass the wait, with a 15-second asset timeout. Unmount the prior voice session during analysis and start a grounded session with the selected avatar only when ready. Lock duplicate upload/file changes, abort client requests on exit/profile change, and ignore late results. Processing polling is serial, abortable and bounded to two minutes with visible retry. **Enviar outra atividade** resets the inline flow; history/detail URLs still work through the same study component. Keep question cards, spoken answer filling, image/PDF preview and explicit completion available in both modes.
- `components/LandingPage.tsx`: session bootstrap, RTM setup, provider wiring, and conversation lifecycle.
- `components/ConversationComponent.tsx`: RTC join, mic publication, `AgoraVoiceAI` init, transcript state, and renewals.
- Idle is `lummi-idle-transparente.webp` (121 frames, 4033 ms, 800 × 800, alpha, 4,146,608 bytes), preserved exactly. `LumiConversationAvatar` plays idle between actions and immediately yields to listening/speaking/sleeping. Welcome, picker, activities, report and precall illustrations use `idleOnly` to load just this clip, with scoped responsive sizing and no extra CSS bob/tilt loop. Inline placeholders/provider fallbacks and inactive material views also use the shared idle. Disconnect cancels speech cycles but allows idle; hidden tabs/offscreen visibility and failures retain static fallback. Keep the welcome intro completion callback/watchdog. The lab includes idle; simulation ends paused on it when loaded. Keep the original PNG for error/loading fallback, provider input and the separate Local 2D comparison reference.
- `useLumiIdleSleep` overlays `sleeping` on idle local conversations after 30 seconds without speech or page interaction. It never changes RTC/mic lifecycle. User/agent speech and pointer/key/input/scroll activity wake immediately; leaving sleep preempts its cycle. Suspend during agent preparation, connection errors, blocked audio/mic and hidden tabs; resume with a fresh interval. `isLumiRestingAgentState` allows SDK `idle`, `listening`, `silent` and the initial null state; do not exclude `silent`, which otherwise prevents the timer from starting after a response. Changes between resting states must not restart the countdown. `lummi-dormindo-transparente.webp` is the supplied 121-frame, 4033 ms, 800 × 800 alpha loop (4,057,788 bytes), preserved byte-for-byte and available for manual playground preview. Loading materials continues to use reading.
- Voice recovery: read RTC state with `useConnectionState` so already-connected snapshots are not missed. Agent departure, join errors, fatal service events and a 20-second connection wait expose **Reconectar Lumi** in inline/full voice screens. `LumiVoiceAgent` stops the owned session before retrying, locks duplicate clicks and exposes failed invites for retry. Keep RTC cleanup in its hooks and reuse the RTM singleton. Log only departure reason or service source/code, never transcript/provider payloads.
- `components/QuickstartConversationLayout.tsx`: in-call header, transcript rail, and controls dock.
- `components/QuickstartPipelineMetrics.tsx`: per-stage latency chips from `AGENT_METRICS`.
- `components/QuickstartTranscriptPanel.tsx`: live transcript rail.
- `lib/chat-completions.ts`: server-side custom LLM SSE handler factory; the route only exports `POST`.
- `lib/agora.ts`: shared agent UID defaults.
- `lib/conversation.ts`: transcript normalization and visualizer state mapping.
- `lib/material-extraction.ts`: server-only multimodal extraction request and response validation.
- Homework tutoring: `analyzeMaterial` returns a child-safe `extractedText` and a server-only `analysis` (expected answers, steps, hints). Never add `analysis` to DTOs. `invite-agent` switches to `messages.voice.homeworkPrompt` when a material has an analysis. Uploads require a family session and owned child profile, without an additional adult-password step; family-wide history is available to the signed-in family session; the parent area has no separate password. The study workspace passes the child's selected avatar mode/ID alongside `profileId` and `materialId`.
- `lib/material-storage.ts`: private temporary local file cache.
- `lib/study-materials.ts`: ownership, shared-demo isolation, DTO, and expiry helpers.
- `config/env/env.local.example`: local environment template.
- `deploy/docker/`: container build definition and Docker-specific ignore rules.
- `docs/assets/architecture/`: light and dark architecture diagrams used by the README.
- `scripts/verify-api-contracts.ts`: route contract verification.

- Whole-material completion is distinct from per-question praise: `messages.voice.materialCompletionConfirmation` ("Atividade concluída com sucesso!") is reserved for all checked questions/steps. `LumiMaterialCompletionDetector` accepts only completed agent turns following a user answer, deduplicates and discards interrupted/disabled events. `ConversationComponent.onMaterialCompleted`, forwarded by `LumiVoiceAgent` only with a material ID, fires after the final audio/preparation ends plus a 600 ms quiet interval. `MaterialStudyPageClient` then unmounts voice through its normal cleanup, starts one success cycle and sends the owned material's existing PATCH. Restore profile upload only after persistence succeeds and `onCelebrationComplete` settles; standalone detail returns to the profile. Hidden/offscreen/failed animation or its 30-second watchdog bypasses only the visual wait. Save failures remain visible with retry, requests are synchronously locked, bounded to 15 seconds and aborted on exit; ignore late responses. Completed history entries do not auto-close. Never expose private answers or mark completion from generic praise/session end.

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

Keep `TranscriptHelperMode.TEXT` free of late `ENABLE_AUDIO_PTS` changes. In RTC SDK 4.24.10 that parameter changes `encodedInsertableStreams`; setting it after a peer connection exists makes later `setConfiguration` calls throw `InvalidModificationError`. TEXT transcripts do not require PTS. Any future WORD-mode setup must configure its required SDK flags before creating the RTC client. Reload existing browser tabs after removing a late global parameter change.

### Transcript and UI Mapping

- Manage `transcript` and `agentState` through `useState` plus `ai.on(TRANSCRIPT_UPDATED, ...)` and `ai.on(AGENT_STATE_CHANGED, ...)`.
- The toolkit uses `uid="0"` as a sentinel for the local user's speech. Remap that value to `client.uid` before passing messages into `QuickstartTranscriptPanel`, or user speech renders on the agent side.
- Include `INTERRUPTED` turns in `messageList`; filter only `IN_PROGRESS`. If the agent's first turn is interrupted and omitted, `messageList` stays empty and the transcript panel never shows that first turn.

### Tokens and Styling

- RTM token access must come from `RtcTokenBuilder.buildTokenWithRtm`; a standard RTC-only token does not grant RTM access.
- Tailwind must scan uikit classes with `./node_modules/agora-agent-uikit/dist/**/*.{js,mjs}` in `tailwind.config.ts`.

### Study Material Pipeline

- The profile's **Remover** action clears only the selected local attachment, file inputs and upload feedback, restoring focus to **Inserir arquivo**. Guard it during upload and the final reading cycle; never delete persisted materials through this control.
- Accept only signature-validated JPEG, PNG, WebP, or PDF files up to 10 MB.
- Cache by owner scope, profile, SHA-256, vision model, and extraction prompt version.
- Load extracted text server-side when grounding Lumi; never trust browser-supplied source text.
- Treat extracted document text as untrusted data, not agent instructions.
- Isolate demo material by session because the demo family ID is shared.
- Complete a material through the authorized `PATCH { completed: true }`, either manually or after the tutor's distinct whole-material confirmation. Ending a voice session or one correct question must never mark it complete.
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

Non-didactic material classification from main is retained in persistence and DTOs (`isDidactic`, with an analysis fallback for older records). Prompt version `material-tutor-v5` invalidates pre-classification cache entries. Upload success still finishes the reading cycle before showing the adult-profile warning or the embedded study result. Processing responses that later become non-didactic must not start a child tutoring session. The shared workspace retains the original-file viewer, answer blanks, and the history route.

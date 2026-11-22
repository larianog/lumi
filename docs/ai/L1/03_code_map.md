# 03 Code Map

> Directory-level ownership map and where to change behavior safely.

## Top-Level Layout

```text
app/                 Next.js routes + API handlers
components/          Client UI and RTC/RTM lifecycle
config/env/           Tracked local environment template
deploy/docker/        Container build definition and ignore rules
lib/                 Shared helpers and server-side chat completions handler
scripts/             Verification and doctor helpers
docs/                Human-oriented guides
docs/assets/         Documentation images and diagrams
docs/ai/             Progressive disclosure docs (this system)
public/              Static assets and branding
types/               Shared TypeScript route/component contracts
```

Auto-discovered project files remain at the repository root. This includes package-manager files (`package.json`, lockfile, `.npmrc`, `.nvmrc`), framework/build configs, `.vercelignore`, and `vercel.json`; moving them would change or disable tool behavior.

## API Route Ownership (`app/api`)

- `generate-agora-token/route.ts`: builds RTC+RTM token via `buildTokenWithRtm`.
- `invite-agent/route.ts`: validates input/env, configures and starts agent session.
- `stop-conversation/route.ts`: stops agent and handles idempotent already-stopping cases.
- `chat/completions/route.ts`: optional OpenAI-compatible SSE proxy for custom LLM path.
- `materials/route.ts`: upload validation, cache reservation, OpenAI analysis, and child/family lists.
- `materials/[id]/route.ts`: authorized detail and explicit completion.

## Client Ownership (`components`)

- `LumiApp.tsx`: welcome headline and sign-up/sign-in actions, without the former family-description paragraph. Demo entry, its hint and errors are rendered only in development (`NODE_ENV === 'development'`); the login API contract is unchanged.
- `LumiConversationAvatar.tsx` + `lumi-conversation-avatar.module.css`: shared conversation idle/listening/speaking playback for profiles, materials and activities; completes outgoing cycles with immediate speaking priority, independent readiness and system reduced-motion handling.
- `LumiAvatarPickerClient.tsx` + `/profile/[id]/avatars`: child avatar catalog and save action. `lib/lumi-avatars.ts` defaults missing choices to Plush and selects local/provider playback; `ChromaKeyAvatar.tsx` displays selected provider video. `lib/lumi-avatar-source.ts` maps catalog IDs to server-only Lemon Slice sources.
- `lib/lumi-animation-transition.ts` + `lib/lumi-webp-timing.ts`: latest-state transition policy and RIFF/ANMF timing; `scripts/verify-lumi-transitions.ts` checks both via `verify:api`.
- `useLumiSpeechState.ts` + `lib/lumi-speech.ts`: samples existing RTC tracks and smooths speech activity; `scripts/verify-lumi-speech.ts` exercises silence, noise, overlap, mute, blocked audio, and reconnect behavior through `verify:api`.
- `useLumiIdleSleep.ts`: 30-second silent/visible inactivity timer for local voice avatars, page-interaction wake listeners and immediate speech wake-up. Its `sleeping` state is visual only; RTC and microphone ownership remain in the conversation hooks. `lummi-dormindo-transparente.webp` is shared with the playground.

- `LandingPage.tsx`: pre-call shell, token/invite/RTM bootstrap, conversation mount/unmount.
- `LumiVoiceAgent.tsx`: profile/material/activity session owner; StrictMode-safe automatic startup and cancellation through managed conversation handles.
- `lib/agora-rtm-session.ts`: one browser RTM instance, stable document UID, serialized leases and late-invite cleanup. Also used by `LandingPage` and the live playground. `scripts/verify-agora-rtm-session.ts` verifies lifecycle races with fake transports.
- `lib/agora.ts`: shared agent/avatar IDs and participant generation/validation bounded to the Conversational AI maximum `2147483647`.
- `lib/agora-agent-token.ts`: explicit managed-agent and Lemon Slice publisher tokens used by the invite route while the SDK's agent auto-token expiry is broken.
- `ConversationComponent.tsx`: RTC join, mic publish, toolkit init, transcript/metrics/issues state.
- `QuickstartConversationLayout.tsx`: in-call framing and slots.
- `QuickstartTranscriptPanel.tsx`: live transcript panel.
- `QuickstartPipelineMetrics.tsx`: latency chips from metrics stream.
- `ConnectionStatusPanel.tsx` + `ConversationErrorCard.tsx`: issue rendering/severity.
- `MaterialStudyPageClient.tsx`: shared embedded profile result and standalone history detail, with image/PDF preview, bounded processing polling/retry, grounded voice and explicit completion.
- `LumiMaterialLoading.tsx`: reading avatar and **Carregando…** caption during upload/analysis, without opening a voice session. Reports completion after a full loaded cycle once the API responds; motion cancellation/failure bypasses the wait.
- `MaterialHistoryPageClient.tsx`: child material history/status list.

## Shared Logic (`lib`)

- `chat-completions.ts`: server-side custom LLM SSE handler factory, shared by the route and contract tests.
- `agora.ts`: default constants (`DEFAULT_AGENT_UID`).
- `conversation.ts`: transcript normalization, spacing cleanup, timestamp normalization, visualizer state mapping.
- `material-extraction.ts`: OpenAI request, extraction prompt, timeout, and response parsing.
- `material-storage.ts`: private temporary local file storage.
- `study-materials.ts`: ownership, DTO, demo isolation, and expiry cleanup.

## Validation and Tooling

- `app/playground/lumi-animation/page.tsx` + `components/playground/`: separate animation lab, CSS Module, local motion states, and live-test dialog.
- `lib/lumi-animation.ts`: bounded prompt validation and presets; no main-app defaults are imported from it.
- `components/playground/LumiVideoStates.tsx` + `lib/lumi-video-states.ts`: local clips, playback lifecycle, state sequence, and exported production manifest. `docs/lumi-video-states.md` documents the asset brief and future Agora event mapping.
- `public/assets/lumi/states/lummi-falando-otimizada.webp` (speaking) and `lummi-transparente-02.webp` (listening): optimized speaking and supplied listening animations selected by `BUNDLED_LUMI_VIDEO_CLIPS` in both profile and playground. Local overrides can restore these defaults without changing the assets. The earlier MP4 is retained but not selected.
- `public/assets/lumi/states/lummi-lendo-transparente.webp`: reading animation for material generation and manual playground preview (118 frames, 3933 ms, 800 x 800, alpha).
- `components/LumiWebPClip.tsx`: shared browser-local static/animated WebP playback, first-frame pause preview and replay URL lifecycle. Profile and playground supply visibility/playback state and scoped CSS.
- `lib/lumi-webp.ts` + `scripts/verify-lumi-webp.ts`: shared bundled Blob downloads survive subscriber unmounts, failed requests can retry, and local uploads retain abort ownership. Lifecycle checks run through `verify:api`.
- `app/api/playground/lumi-animation/route.ts`: configuration status and isolated live-test session creation.
- `scripts/verify-lumi-animation.ts`: live-test request validation, provider serialization, missing credentials, and sanitized failures, called by `verify:api` with mocked session startup.

- `scripts/verify-api-contracts.ts`: imports route handlers and validates contract behavior.
- `scripts/doctor.mjs`: local setup checks consumed by `pnpm run doctor`.
- `tailwind.config.ts`: includes `agora-agent-uikit` dist classes in content scan.

## Fast File Lookup

- Change agent prompt/model/VAD -> `app/api/invite-agent/route.ts`.
- Change token policy/channel naming -> `app/api/generate-agora-token/route.ts`.
- Change transcript mapping behavior -> `lib/conversation.ts` + `components/ConversationComponent.tsx`.
- Change session bootstrap UX -> `components/LandingPage.tsx`.
- Change material ingestion/cache -> `app/api/materials/route.ts` + `lib/db.ts`.
- Change material study/history UX -> `components/MaterialStudyPageClient.tsx` / `MaterialHistoryPageClient.tsx`.

## Additional Component Roles

- `QuickstartPreCallCard.tsx`: start CTA and pre-call messaging.
- `QuickstartConversationLayout.tsx`: shared in-call composition shell.
- `MicrophoneSelector.tsx`: input-device selection UI.
- `ConnectionStatusPanel.tsx`: summary + detailed connection issue panel.
- `ErrorBoundary.tsx`: runtime guardrail for conversation subtree.

## Type Contract Locations

- `types/conversation.ts`: request/response payloads and component prop types.
- `types/database.d.ts` and `types/materials.ts`: persisted material and browser-safe DTO contracts.
- `types/env.d.ts`: typed environment variable expectations.
- `types/jsx.d.ts` and `types/react-jsx.d.ts`: JSX typing support details.

## Static and Styling Assets

- `public/*`: icons, logos, and heading SVG assets used in pre-call/in-call experience.
- `docs/assets/architecture/*`: light and dark architecture diagrams embedded by the README.
- `app/globals.css` and `styles/globals.css`: baseline theme/layout styles.
- `tailwind.config.ts`: utility class scan and theme extension.

## Verification Path Mapping

- API contract behavior test: `scripts/verify-api-contracts.ts`.
- Environment and prerequisites check: `scripts/doctor.mjs`.
- Aggregate check chain: `pnpm run verify` script in `package.json`.

## Ownership Boundaries

- `components/` owns client runtime lifecycle and UI state.
- `app/api/` owns privileged operations needing app certificate.
- `lib/` owns reusable helpers; `chat-completions.ts` is server-side only.
- `docs/` owns human-facing implementation narrative and runbooks.

## Related Deep Dives

- [conversation_lifecycle.md](L2/conversation_lifecycle.md) — Cross-file call path during start/stop.
- [from_scratch_bootstrap.md](L2/from_scratch_bootstrap.md) — Official baseline map for recreating the quickstart recipe.
- [transcript_pipeline.md](L2/transcript_pipeline.md) — Mapping and rendering flow from toolkit events.

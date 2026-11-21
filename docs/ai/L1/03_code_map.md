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

- `LumiConversationAvatar.tsx` + `lumi-conversation-avatar.module.css`: profile stationary idle and bundled listening/speaking playback, independent clip readiness, visibility/reduced-motion handling.
- `useLumiSpeechState.ts` + `lib/lumi-speech.ts`: samples existing RTC tracks and smooths speech activity; `scripts/verify-lumi-speech.ts` exercises silence, noise, overlap, mute, blocked audio, and reconnect behavior through `verify:api`.

- `LandingPage.tsx`: pre-call shell, token/invite/RTM bootstrap, conversation mount/unmount.
- `ConversationComponent.tsx`: RTC join, mic publish, toolkit init, transcript/metrics/issues state.
- `QuickstartConversationLayout.tsx`: in-call framing and slots.
- `QuickstartTranscriptPanel.tsx`: live transcript panel.
- `QuickstartPipelineMetrics.tsx`: latency chips from metrics stream.
- `ConnectionStatusPanel.tsx` + `ConversationErrorCard.tsx`: issue rendering/severity.
- `MaterialStudyPageClient.tsx`: grounded Lumi with local speech-state animations and an uploaded-image study workspace.
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
- `public/assets/lumi/states/lummi-transparente.webp` (speaking) and `lummi-transparente-02.webp` (listening): supplied animations selected by `BUNDLED_LUMI_VIDEO_CLIPS` in both profile and playground. Local overrides can restore these defaults without changing the assets. The earlier MP4 is retained but not selected.
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

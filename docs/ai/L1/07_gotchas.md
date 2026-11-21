# 07 Gotchas

> High-impact pitfalls that regularly break session startup, transcript rendering, or lifecycle cleanup.

## Critical Runtime Pitfalls

- Profile avatar poses follow actual RTC audio levels, not the toolkit's generic ready-to-listen state. Silence/thinking must be stationary. Audible agent speech takes visual priority during overlap, including microphone pickup of the speaker; ongoing user speech selects listening after agent speech ends. Mute, lost connection, stopped/blocked playback clear speech activity. Level thresholds are heuristics and may respond to loud background noise. Never create another microphone track or take ownership of SDK cleanup for animation.
- Local profile mode must send `avatar_mode: "local"`; merely hiding a provider video would still create a paid avatar. Manual playground uploads do not propagate to profiles. Speaking uses `lummi-transparente.webp` and listening uses `lummi-transparente-02.webp`, preserved as supplied; never assume the earlier MP4 is still selected or render WebP with `<video>`. Keep ready/error status per clip and stop the previous animation when speech state changes.

- Playground Local 2D is a body-motion study, not Lemon Slice output or phoneme lip sync. Motion prompts influence generated video without guaranteeing gestures. Watch both speech and idle intervals in real sessions.
- Closing the playground during startup must collect a late invite's agent ID and stop it. Do not abort the invite response and lose that ID. RTM failure prevents inviting an agent; explicit stop failure keeps a retry available.
- All playground CSS stays in its CSS Module. No playground-specific rules belong in the global Lumi stylesheet.
- Video states are a local simulation, not real Agora state binding. MP4 container support does not imply alpha support; the player neither removes backgrounds nor converts codecs. Keep an image fallback for missing/unsupported clips, mute all videos, pause hidden elements, and revoke object URLs after use. Replacing/removing a clip must ignore late events from the old URL.
- Do not disable the video simulation/play buttons for `prefers-reduced-motion`. Suppress autoplay, explain the paused state, and let a user click enable playback for that page. Reset this override when the system preference changes or the page reloads; stopping simulation must pause playback as well.
- Do not start video simulation with a fixed greeting or finish on a missing idle clip. Build the sequence from loaded, error-free clips; with both defaults ready, simulate listening → speaking → listening and finish paused on listening.
- WebP is rendered as an image, not `<video>`. Native animated images have no video pause/rate/ended controls. Use the static first-frame preview while paused or hidden, restart with a fresh blob URL, and keep the speed control disabled. WebP repeat counts remain file-defined; manual playback does not automatically return to idle. Do not optimize away animation or leave an animated image visible under reduced motion without an explicit play request.
- A canceled WebP request during avatar replacement is different from a missing public file. Bundled loads are shared and survive subscriber cleanup; do not reintroduce per-avatar aborts for them. Preserve cleanup for local uploads and blob URLs. Failed profile loads need refetch/remount, not just a new replay counter. Explicit motion choices must survive the placeholder-to-live transition.

- Using RTC-only token generation breaks RTM login and transcript/state events.
- Removing `isReady` guard can trigger StrictMode double-initialization and duplicate/missing tracks.
- Manual `client.leave()` conflicts with `useJoin` cleanup contract.
- Manual `localMicrophoneTrack.close()` conflicts with hook-owned lifecycle.

## Transcript Pitfalls

- Not remapping toolkit `uid="0"` causes user turns to render as agent turns.
- Dropping `INTERRUPTED` from message history can keep transcript panel from auto-opening on first interrupted turn.
- Skipping punctuation/timestamp normalization creates inconsistent transcript readability and issue time ordering.

## Agent Startup Pitfalls

- Missing `NEXT_PUBLIC_AGORA_APP_ID`/`NEXT_AGORA_APP_CERTIFICATE` yields hard 500s on token/invite/stop routes.
- Changing the agent UID outside `lib/agora.ts` can desynchronize the browser and invite route.
- RTM subscription failures may only surface through SAL status or raw signaling fallback events.

## Frontend Lifecycle Pitfalls

- Initializing toolkit before `joinSuccess` often causes missing subscriptions.
- Tying mic track creation directly to mute state can break visualizer audio graph.
- Failing to teardown RTM client on session end leaks subscriptions and stale events.

## Material Pipeline Pitfalls

- Relying on filename extensions instead of MIME plus signature validation lets arbitrary bytes reach storage/provider boundaries.
- Hash-only caching can reuse the wrong output after model or prompt changes; both are part of the cache identity.
- Family-only ownership leaks uploads between users of the shared demo family; demo session ID is mandatory.
- Sending extracted text from the browser into `/api/invite-agent` makes the prompt tamperable; load it server-side by material ID.
- Treating voice-session end as completion produces false positives; completion is an explicit PATCH action.
- `data/` writes are not durable on serverless Vercel and cannot be the production material store.
- A crashed `processing` reservation must age out; only fresh processing entries are reusable.

## Docs/Process Pitfalls

- Changing `components/` or `app/api/` without syncing README/GUIDE/TEXT_STREAMING/AGENTS leads to stale operator guidance.
- Updating workflows/contracts without updating `docs/ai/L1` and L0 `Last Reviewed` breaks progressive disclosure trust.
- Base recipe contracts also require `docs/ai/RECIPE.md` updates when extension points, invariants, or stable APIs change.

## Fast Triage Checklist

1. Run `agora project doctor --deep`.
2. Verify token route still uses `buildTokenWithRtm`.
3. Check `uid="0"` remap path.
4. Check `isReady` guard and hook ownership constraints.
5. Inspect connection issues panel for RTM/SAL/agent error signals.

## Frequent Regression Patterns

- Refactoring token route and accidentally removing RTM capability.
- Simplifying transcript list logic and unintentionally dropping interrupted turns.
- Moving toolkit init into mount-only effect and reintroducing StrictMode double-init.
- Replacing `useRef` RTC client storage with recreated client object per render.

## Symptom-to-File Debug Guide

| Symptom | First Files to Inspect |
| --- | --- |
| RTM login fails | `app/api/generate-agora-token/route.ts`, `components/LandingPage.tsx` |
| Agent starts but no transcript | `components/ConversationComponent.tsx`, `lib/conversation.ts` |
| Conversation hangs on end | `components/LandingPage.tsx`, `app/api/stop-conversation/route.ts` |
| Metrics panel empty | `components/ConversationComponent.tsx`, `components/QuickstartPipelineMetrics.tsx` |
| Upload rejected | `app/api/materials/route.ts`, `lib/material-storage.ts` |
| Extraction fails or is empty | `lib/material-extraction.ts`, `OPENAI_API_KEY` |
| Lumi ignores the material | `components/LumiVoiceAgent.tsx`, `app/api/invite-agent/route.ts` |
| Parent cannot see history | `/api/materials?scope=family`, adult verification window |

## Sandbox and Local Dev Caveats

- `pnpm run dev` can fail in restricted environments due to port/process limits.
- Route contract checks are better suited for restricted CI/sandbox contexts.
- Some failures are environment-binding issues, not code regressions.

## Pre-merge Gotcha Checklist

- Confirm no manual `leave()` or `close()` lifecycle calls were introduced.
- Confirm transcript mapping still remaps sentinel local UID.
- Confirm token renewal still returns both RTC and RTM tokens.
- Confirm docs were updated when workflow/interface behavior changed.

## Incident Learning Notes

- Connection issue deduplication intentionally uses a small time window to avoid noisy cascades.
- Invite failures are intentionally non-fatal to allow UI fallback state visibility.
- Raw RTM fallback parsing exists because higher-level hooks may miss some signaling payloads in edge conditions.

## Toolkit 2.10.0 Migration

Pass `rtmEngine` directly to `AgoraVoiceAI.init`; the nested `rtmConfig` is no longer supported. UIKit 1.1.0 declares an optional Toolkit ^1.2.0 peer, while this workspace resolves Toolkit 2.10.0. Validate transcript, agent state, metrics, and teardown in a real call before shipping.

## Related Deep Dives

- [conversation_lifecycle.md](L2/conversation_lifecycle.md) — Start/stop race and lifecycle ownership details.
- [transcript_pipeline.md](L2/transcript_pipeline.md) — Transcript edge cases and failure surfaces.

# 07 Gotchas

> High-impact pitfalls that regularly break session startup, transcript rendering, or lifecycle cleanup.

## Critical Runtime Pitfalls

- Conversation avatar requests follow actual RTC audio levels, not the toolkit's generic ready-to-listen state. Silence/thinking becomes stationary after the outgoing cycle finishes. Audible agent speech enters immediately during overlap, including microphone pickup of the speaker; ongoing user speech requests listening after agent speech ends. Mute, lost connection, stopped/blocked playback clear speech activity. Level thresholds are heuristics and may respond to loud background noise. Never create another microphone track or take ownership of SDK cleanup for animation.
- Profiles, material study and activity dialogs must send `avatar_mode: "local"` for normal and demo accounts; merely hiding a provider video would still create a paid avatar. Playground uploads do not propagate to conversations. Speaking uses `lummi-falando-asas-web-v1.webp` and listening uses `lummi-transparente-02.webp`. Speaking uses a compressed 800 × 800 playback copy with every frame/delay and alpha retained; keep the supplied master byte-for-byte and use `contain` so the wings remain visible. Keep the older assets unchanged and never drop frames/delays to reduce size; never render WebP with `<video>`. Keep ready/error status per clip. Speaking preempts immediately; other changes wait for the current cycle, then use the latest request. Do not restart WebP URLs or cycle timers on every speech-state update. Hidden tabs, disconnect, muted listening, blocked speaking and load failures must cancel the wait, not leave a stale queued action.

- Playground Local 2D is a body-motion study, not Lemon Slice output or phoneme lip sync. Motion prompts influence generated video without guaranteeing gestures. Watch both speech and idle intervals in real sessions.
- Closing the playground during startup must collect a late invite's agent ID and stop it. Do not abort the invite response and lose that ID. RTM failure prevents inviting an agent; explicit stop failure keeps a retry available.
- All playground CSS stays in its CSS Module. No playground-specific rules belong in the global Lumi stylesheet.
- Video states are a local simulation, not real Agora state binding. MP4 container support does not imply alpha support; the player neither removes backgrounds nor converts codecs. Keep an image fallback for missing/unsupported clips, mute all videos, pause hidden elements, and revoke object URLs after use. Replacing/removing a clip must ignore late events from the old URL.
- Do not disable the video simulation/play buttons for `prefers-reduced-motion`. Suppress autoplay, explain the paused state, and let a user click enable playback for that page. Reset this override when the system preference changes or the page reloads; stopping simulation must pause playback as well.
- Do not start video simulation with a fixed greeting or finish on a missing idle clip. Build the sequence from loaded, error-free clips; with the bundled conversation clips ready, simulate listening → speaking → listening → celebrating and finish paused on the loaded idle clip (or the last displayed state if idle is unavailable).
- WebP is rendered as an image, not `<video>`. Native animated images have no video pause/rate/ended controls. Use the static first-frame preview while paused or hidden, restart with a fresh blob URL, and keep the speed control disabled. WebP repeat counts remain file-defined; manual playback does not automatically return to idle. Do not optimize away animation. The caller owns playback policy: product avatars autoplay under reduced motion by explicit product choice; the playground still requires a deliberate play request.
- A canceled WebP request during avatar replacement is different from a missing public file. Bundled loads are shared and survive subscriber cleanup; do not reintroduce per-avatar aborts for them. Preserve cleanup for local uploads and blob URLs. Failed profile loads need refetch/remount, not just a new replay counter. Product animations are automatic: do not restore old manual `off` values or reintroduce start/pause buttons. Product character motion is independent of the OS reduced-motion preference, including during error recovery; preserve hidden/offscreen pausing. The playground retains its independent controls.

- Using RTC-only token generation breaks RTM login and transcript/state events.
- A UID above `2147483647` can log into RTM but the Conversational AI join endpoint rejects `remote_rtc_uids[0]`, leaving Lumi silent. Generate bounded participant IDs with `lib/agora.ts`, and preserve the same valid UID across token, RTM, RTC and invite. After correcting an already-created browser identity, fully reload; Fast Refresh intentionally retains the existing manager. Boundary tests must enforce the provider's range, not merely mock every invite as successful.
- Removing `isReady` guard can trigger StrictMode double-initialization and duplicate/missing tracks.
- Manual `client.leave()` conflicts with `useJoin` cleanup contract.
- Manual `localMicrophoneTrack.close()` conflicts with hook-owned lifecycle.

## Transcript Pitfalls

- Not remapping toolkit `uid="0"` causes user turns to render as agent turns.
- Dropping `INTERRUPTED` from message history can keep transcript panel from auto-opening on first interrupted turn.
- Skipping punctuation/timestamp normalization creates inconsistent transcript readability and issue time ordering.

## Agent Startup Pitfalls

- Missing `NEXT_PUBLIC_AGORA_APP_ID`/`NEXT_AGORA_APP_CERTIFICATE` yields hard 500s on token/invite/stop routes.
- `agora-agents` 2.15.0 calls `ConvoAITokenBuilder.buildToken` with a role where the token lifetime belongs, producing a one-second token. Keep invite agent and Lemon Slice avatar tokens on `lib/agora-agent-token.ts` until that SDK call is fixed. `RtcTokenBuilder.buildTokenWithRtm` also expects relative lifetime seconds, not a Unix timestamp.
- Changing the agent UID outside `lib/agora.ts` can desynchronize the browser and invite route.
- RTM subscription failures may only surface through SAL status or raw signaling fallback events.

## Frontend Lifecycle Pitfalls

- Do not set `ENABLE_AUDIO_PTS` in a mounted conversation effect. RTC SDK 4.24.10 derives `encodedInsertableStreams` from this global flag; changing it after native peer creation makes subsequent `setConfiguration` fail with `InvalidModificationError`. Current TEXT rendering needs no PTS. Configure any future WORD-mode flags before RTC client creation, and fully reload tabs containing the old global state after this fix. Keep real SDK diagnostics visible.
- Initializing toolkit before `joinSuccess` often causes missing subscriptions.
- Tying mic track creation directly to mute state can break visualizer audio graph.
- Failing to teardown RTM client on session end leaks subscriptions and stale events.
- RTM 2.3 logs `Ins id is 2` when constructing a second SDK instance, even after logout. All app callers must reuse `lib/agora-rtm-session.ts`; do not suppress the diagnostic or reconstruct with the same UID. Fresh per-channel tokens must match its immutable UID. A full browser reload is needed to clear instances created before this fix. Never persist the UID in session/local storage or abort an invite whose agent ID is still needed for cleanup.

## Material Pipeline Pitfalls

- Upload success must render the study workspace inside the profile rather than push a new route. Cached `processing` responses also need the reading/loading view until ready and the displayed cycle finishes. Fast responses must wait for at least one full loaded reading cycle; do not measure this from upload start or restart on API completion. Animation failure, a 15-second asset timeout, an inactive loading view or hidden tabs must release ready content; API failures remain immediate. Do not leave the generic voice agent running behind that view or start a grounded session without ready content. Prevent duplicate uploads/file changes and ignore aborted responses. Keep polling serial with cleanup and visible retry instead of an endless silent spinner; history URLs continue to work independently.

- Relying on filename extensions instead of MIME plus signature validation lets arbitrary bytes reach storage/provider boundaries.
- Hash-only caching can reuse the wrong output after model or prompt changes; both are part of the cache identity.
- Family-only ownership leaks uploads between users of the shared demo family; demo session ID is mandatory.
- Sending extracted text from the browser into `/api/invite-agent` makes the prompt tamperable; load it server-side by material ID.
- Treating voice-session end, generic praise or a single correct answer as material completion produces false positives. Only manual completion or the reserved whole-material tutor confirmation can send the authenticated PATCH. Never reset the upload form before saving succeeds; preserve error retry and abort/late-response protection.
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
| Parent cannot see history | Family session cookie, `/api/materials?scope=family`, `/api/recordings` |

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

- Sleeping is visual inactivity, not a disconnected or muted voice session. Agora can report `silent` after a response; omitting this resting state disables sleep indefinitely. Include it via `isLumiRestingAgentState` and test that resting-state changes do not restart inactivity. Keep the microphone/RTC alive for speech wake-up, never sleep during agent preparation or material reading, and reset hidden-tab time. Waking must not wait for the sleeping loop to end. Keep the supplied sleeping WebP bytes and clear all inactivity listeners/timers on unmount or speech-state changes.

- A departed agent must not show an endless initial-connection status. Read RTC's current state with `useConnectionState`; later events alone can miss a connection. Inline voice screens expose failures and a retry after 20 seconds without a ready connection. `LumiVoiceAgent` must finish old-session cleanup before retrying and must not mount an empty call after a failed invite. Never log service payloads or conversation content when diagnosing these errors.

- [conversation_lifecycle.md](L2/conversation_lifecycle.md) — Start/stop race and lifecycle ownership details.
- [transcript_pipeline.md](L2/transcript_pipeline.md) — Transcript edge cases and failure surfaces.


WebP previews decode only the first frame with `createImageBitmap` (native image-load fallback), then encode a static PNG asynchronously. Poster/replay blob URLs are revoked and bitmap resources closed on cleanup. Playback uses native image load events, avoiding `next/image` decode waits that can delay cycle completion. Hidden tabs still pause playback. Product character animations autoplay regardless of OS reduced motion; only the playground keeps its reduced-motion autoplay gate.

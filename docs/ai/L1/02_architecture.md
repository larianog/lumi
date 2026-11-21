# 02 Architecture

> Runtime architecture for browser RTC/RTM, Next.js route handlers, and Agora managed agent session.

## High-Level Shape

- Next.js App Router frontend and API routes in one deployable app.
- Browser joins Agora RTC channel and uses RTM for transcript/state/metrics/errors.
- Server-side routes mint token and call Agora Agent Server SDK.
- Agent executes STT -> LLM -> TTS pipeline in Agora cloud.

## Component Graph

```text
Browser UI (LandingPage + ConversationComponent)
  -> GET /api/generate-agora-token
  -> POST /api/invite-agent
  -> RTC join/publish mic
  -> RTM subscribe + AgoraVoiceAI events
  -> POST /api/stop-conversation

Next.js API routes
  -> agora-token (RtcTokenBuilder.buildTokenWithRtm)
  -> agora-agents (start/stop managed agent)

Agora Cloud
  -> Agent session (Deepgram STT + OpenAI LLM + MiniMax TTS by default)
  -> RTM payloads (transcript, state, metrics, error)
```

## Start Sequence

1. UI fetches RTC+RTM token and channel.
2. UI invites agent and initializes RTM in parallel.
3. UI mounts conversation view.
4. `useJoin` connects RTC once `isReady` guard passes.
5. `AgoraVoiceAI.init()` subscribes transcript/state/metrics streams.

## End Sequence

1. UI calls `/api/stop-conversation` with `agent_id` if present.
2. UI logs out RTM client.
3. RTC hook ownership handles leave/unpublish cleanup.
4. Component state resets to pre-call shell.

## Core State Domains

Profile pages explicitly pass `avatarMode="local"` through `LumiVoiceAgent` to `ConversationComponent` and the invite API (`avatar_mode`). The API skips avatar generation in that mode; RTC/RTM voice providers stay the same. `useLumiSpeechState` samples the existing mic and agent audio tracks every 80 ms. `LumiSpeechDetector` uses an 80 ms user attack and short release windows to select idle/listening/speaking. Audible agent speech takes visual priority over microphone activity; once its 220 ms release window ends, ongoing user speech selects listening. This does not change RTC interruption behavior. Muted, disconnected, missing, or non-playing tracks do not sustain speech poses. Agent semantic state still drives the existing visualizer; it is not evidence of audible speech.

`LumiConversationAvatar` displays a stationary reference image for silence/thinking, `lummi-transparente-02.webp` during user speech, and `lummi-transparente.webp` during audible agent speech. Both clips preload with independent ready/error status; only the active state animates. It uses shared `components/LumiWebPClip.tsx` with its own scoped class, retaining a video renderer for video-format defaults. It overrides the profile's old image bobbing, stops/resets inactive clips, pauses hidden tabs, and offers a motion toggle with reduced-motion defaults. The reference image is the fallback when a clip cannot animate, tilted during listening. There is no phoneme lip sync. Playground uploads remain independent and memory-only.

- Session bootstrap: `LandingPage` (`agoraData`, `rtmClient`, loading/error flags).
- RTC transport and mic: `ConversationComponent` + `agora-rtc-react` hooks.
- Transcript + agent state: `AgoraVoiceAI` events mapped through `lib/conversation.ts`.
- Metrics and connection issues: `AGENT_METRICS`, `MESSAGE_ERROR`, `SAL_STATUS`, RTM fallback parsing.

## External Dependencies

The additive `/playground/lumi-animation` route owns a separate CSS Module and local motion state. Its live-test dialog creates RTM first, then calls `/api/playground/lumi-animation` and mounts the existing `ConversationComponent` with a separate RTC provider. It reuses token/stop endpoints. Pending invites are allowed to return their agent ID before cleanup stops the session, including cancellation during startup. Explicit stop failures remain visible for retry. Main app bootstrap and invite defaults are unchanged.

The lab defaults to browser-local video states. `LumiVideoStates` owns object URLs and persistent video elements, plays only the selected clip, pauses when hidden, and releases URLs on replacement/removal/unmount. Reduced motion pauses autoplay; manual play or simulation enables an in-memory override until reload or a system preference change. Stop simulation pauses its video too. Manual one-shot clips return to idle on completion. Conversation simulation snapshots a timed sequence of loaded, error-free clips, skipping missing states; completion pauses on available idle or the last displayed state. Removing/replacing a clip cancels the sequence. Real Agora events are not connected to these videos. The Lemon Slice configuration check only runs when its tab is selected.

Bundled clips come from `BUNDLED_LUMI_VIDEO_CLIPS` and static `public/assets/lumi/states/` assets. The supplied `lummi-transparente.webp` (speaking) is selected initially; `lummi-transparente-02.webp` (listening) is also available. Local uploads override defaults in memory, and reset/reload restores the bundled sources. Only blob URLs are revoked; static asset URLs persist. Video playback checks already-loaded media after hydration in addition to listening for `loadeddata`.

WebP selections use `LumiWebPClip`, an unoptimized image instead of a video element. It decodes a static first-frame preview via canvas (up to 1024 px), preserves alpha, and uses a fresh blob URL for each play/replay. Paused, hidden, and reduced-motion-blocked WebP uses the still preview; temporary URLs and local override loads are cleaned up. `lib/lumi-webp.ts` retains bundled Blob promises across avatar remounts, so placeholder cleanup does not abort a download needed by the live view. Failed loads leave the cache; profile reload clears cache/status and remounts players. Speed/repeat count are native file settings; video speed is disabled and manual WebP has no ended-to-idle transition. Ready/error callbacks guard against stale source URLs, and valid WebP participates in the existing timed simulation.

The profile motion toggle keeps explicit on/off choices in `sessionStorage` (`lumi-avatar-motion`), preserving them through the placeholder-to-conversation transition and reload. System preference changes clear the override. Failed storage access is tolerated; the current mount remains usable. This does not change the playground's independent motion override.

- `agora-rtc-react` / `agora-rtc-sdk-ng` for media transport.
- `agora-rtm` for data channel.
- `agora-agent-client-toolkit` and `agora-agent-uikit` for conversation logic/UI.
- `agora-agents` for managed agent lifecycle.

## Deployment Modes

- Local development via `pnpm run dev`.
- Vercel deployment as single Next.js app with server env vars.

## Data and Control Boundaries

- Browser never sees the app certificate; only receives signed short-lived tokens.
- Agent lifecycle control (`start`, `stop`) is server-routed.
- Transcript/state/metrics are data-plane RTM events from agent to browser.
- UI control-plane actions (start/end, renew) originate in `LandingPage`.

## Internal Interfaces Between Components

`LandingPage` -> `ConversationComponent` props:

- `agoraData` (`token`, `uid`, `channel`, optional `agentId`)
- `rtmClient` (already logged-in and subscribed)
- `onTokenWillExpire(uid)` callback for dual-token renewal
- `onEndConversation()` callback for teardown and route stop call

`ConversationComponent` -> child UI components:

- normalized transcript items and current in-progress turn
- agent visualizer state derived from transport + semantic state
- connection issue list and derived severity
- recent metric window for stage latency chips

## Why the App Router Structure Matters

- API handlers under `app/api` co-deploy with UI and share env management.
- Client components isolate browser-only SDK usage via dynamic import and `ssr: false`.
- This avoids SSR-side access to WebRTC-dependent modules.

## Change Impact Hints

- Changes to token or invite routes affect both startup and renewal paths.
- Changes to transcript mapping can break both transcript panel and visualizer semantics.
- Changes to RTM setup in `LandingPage` affect toolkit subscription readiness.

## Related Deep Dives

- [conversation_lifecycle.md](L2/conversation_lifecycle.md) — Detailed bootstrapping and teardown timeline.
- [transcript_pipeline.md](L2/transcript_pipeline.md) — Event mapping, UID remap, in-progress/completed segmentation.

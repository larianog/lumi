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

Profile material UI
  -> POST /api/materials (multipart image)
  -> GET/PATCH /api/materials/:id
  -> GET /api/materials?profileId=... or scope=family

Next.js API routes
  -> agora-token (RtcTokenBuilder.buildTokenWithRtm)
  -> agora-agents (start/stop managed agent)
  -> private material cache + JSON metadata
  -> OpenAI vision analysis (structured homework brief)

Agora Cloud
  -> Agent session (Deepgram STT + OpenAI LLM + MiniMax TTS by default)
  -> RTM payloads (transcript, state, metrics, error)
```

## Start Sequence

1. UI acquires a lease from `lib/agora-rtm-session.ts`, which waits for prior logout and fetches a fresh RTC+RTM token/channel using the document's stable UID.
2. The shared RTM instance logs in and subscribes before the UI invites the agent.
3. UI mounts conversation view.
4. `useJoin` connects RTC once `isReady` guard passes.
5. `AgoraVoiceAI.init()` subscribes transcript/state/metrics streams.

## End Sequence

1. UI cancels the session handle and unmounts the call view.
2. Its lease logs out RTM before another session can start; the agent is stopped through `/api/stop-conversation`, including IDs returned by pending invites after cancellation.
3. RTC hook ownership handles leave/unpublish cleanup.

The RTM manager is held on the browser window so client routing and Fast Refresh reuse one SDK instance. Each document generates its own numeric UID, avoiding duplicated-tab collisions from session storage. The UID is not a family/profile authorization identifier. Partial login/subscription failures clean up before retry; failed logout blocks new login until cleanup succeeds. Callers never directly log out a shared client. StrictMode auto-start is timer-gated, and per-component handles reject duplicate clicks.

Numeric participant IDs must fit `1..2147483647` for the Conversational AI join API. `lib/agora.ts` bounds browser randomness and validates invite IDs; the token route rejects larger numbers so token/RTM/RTC/invite identity remains consistent. Agent/avatar reserved IDs are excluded by the browser generator and invite validation.
4. Component state resets to pre-call shell.

## Core State Domains

Material tutoring also has a presentation-only success cue. Its prompt reserves **Você acertou!** for a complete checked answer; `LumiAnswerCelebrationDetector` consumes completed normalized agent turns after a user answer, once per turn. `LumiVoiceAgent` enables this only with a material ID. The avatar queues the supplied celebration until speech/preparation and the outgoing cycle end, consumes it after one loaded 3033 ms cycle and resumes the latest audio state. New speech preempts it; hidden/offscreen playback, disconnect, blocked audio, load failure and a 30-second timeout discard pending events. No extra model call or answer-key DTO is introduced, and this cue does not record completion or points.

`LumiConversationAvatar` also owns the idle loop. Its `idleOnly` illustration mode loads only `lummi-idle-transparente.webp` for welcome, profile picker, activities, parent report and precall panels; responsive frame sizing uses `--lumi-idle-width`. The welcome uses `onVisualReady`/`onAnimationEnd` for its bounded entrance. Provider waiting views and inactive material panels reuse the shared idle. An intersection observer pauses offscreen/CSS-hidden avatars; document visibility is also a playback gate. Disconnect immediately cancels action completion and resumes idle, while hidden/offscreen views keep the static fallback. Idle never delays a requested action.

`useLumiIdleSleep` overlays `sleeping` on an idle local conversation after 30 seconds without audio or pointer/key/input/scroll interaction. It owns only a presentation timer and activity listeners; RTC/RTM remain connected. Agent preparation, connection errors, microphone/audio blocking and hidden tabs suspend the countdown; visibility restoration starts a fresh interval. `isLumiRestingAgentState` includes SDK `silent` alongside `idle`, `listening` and null, so a silent agent can sleep after responding. Resting-state changes preserve the countdown; RTC speech still resets it. Sleeping wakes immediately on any interaction or speech, while normal listening/speaking completion rules remain intact. The sleeping WebP preloads independently alongside listening and speaking; only the displayed clip animates. Material loading uses its separate reading player.

Profile, material-study, and activity voice screens pass the child's selected `lumiAvatar` through `LumiVoiceAgent`. Missing choices resolve to Plush and set `avatarMode="local"`; the invite API skips Lemon Slice and `ConversationComponent` uses the bundled Plush WebP states. A saved non-Plush choice sets `avatarMode="provider"` and sends `avatar_id`; the invite route resolves its Lemon Slice dashboard agent, while `ChromaKeyAvatar` keys the video and the selected PNG is the fallback. The picker persists choices through authenticated `PATCH /api/profiles`; demo choices live on the current session and do not mutate the shared demo family. Welcome and profile selection always use animated Plush. RTC/RTM voice providers stay the same. In local mode, `useLumiSpeechState` samples the existing mic and agent audio tracks every 80 ms. `LumiSpeechDetector` uses an 80 ms user attack and short release windows to select idle/listening/speaking. Audible agent speech takes visual priority over microphone activity; once its 220 ms release window ends, ongoing user speech selects listening. This does not change RTC interruption behavior. Muted, disconnected, missing, or non-playing tracks do not sustain speech poses. Agent semantic state still drives the existing visualizer; it is not evidence of audible speech.

`LumiConversationAvatar` separates the requested speech state from the displayed animation. Speaking preempts listening immediately. Other changes finish the current cycle before applying the latest request, without queuing outdated states or restarting on short gaps; silence then resumes the idle loop. `lib/lumi-webp-timing.ts` reads ANMF frame durations, and `LumiWebPClip` reports cycle boundaries from image load without changing asset bytes. Video defaults use native `ended`. Conversation clips preload independently; only the displayed state animates. Hidden tabs, disconnect, muted listening, blocked speaking and failed playback cancel pending transitions. The shared implementation is used in profiles, material study and activity voice dialogs for normal and demo accounts. Reload recovery and the still fallback remain available. There is no phoneme lip sync. Playground uploads and its timed simulation remain independent and memory-only.

- Session bootstrap: `LandingPage` (`agoraData`, `rtmClient`, loading/error flags).
- RTC transport and mic: `ConversationComponent` + `agora-rtc-react` hooks.
- Transcript + agent state: `AgoraVoiceAI` events mapped through `lib/conversation.ts`.
- Metrics and connection issues: `AGENT_METRICS`, `MESSAGE_ERROR`, `SAL_STATUS`, RTM fallback parsing.
- Study material: `lib/db.ts` metadata/completion state, `lib/material-storage.ts` temporary bytes, and the child-safe transcript plus a server-only tutoring analysis.

## External Dependencies

The additive `/playground/lumi-animation` route owns a separate CSS Module and local motion state. Its live-test dialog creates RTM first, then calls `/api/playground/lumi-animation` and mounts the existing `ConversationComponent` with a separate RTC provider. It reuses token/stop endpoints. Pending invites are allowed to return their agent ID before cleanup stops the session, including cancellation during startup. Explicit stop failures remain visible for retry. Main app bootstrap and invite defaults are unchanged.

The lab defaults to browser-local video states. `LumiVideoStates` owns object URLs and persistent video elements, plays only the selected clip, pauses when hidden, and releases URLs on replacement/removal/unmount. Reduced motion pauses autoplay; manual play or simulation enables an in-memory override until reload or a system preference change. Stop simulation pauses its video too. Manual one-shot clips return to idle on completion. Conversation simulation snapshots a timed sequence of loaded, error-free clips, skipping missing states; completion pauses on available idle or the last displayed state. Removing/replacing a clip cancels the sequence. Real Agora events are not connected to these videos. The Lemon Slice configuration check only runs when its tab is selected.

Bundled clips come from `BUNDLED_LUMI_VIDEO_CLIPS` and static `public/assets/lumi/states/` assets. The supplied `lummi-falando-asas-web-v1.webp` (speaking, 800 × 800, 181 frames, 6033 ms, 4,808,826 bytes, `contain` framing to preserve the wings) is selected initially; `lummi-transparente-02.webp` (listening) is also available. Local uploads override defaults in memory, and reset/reload restores the bundled sources. Only blob URLs are revoked; static asset URLs persist. Video playback checks already-loaded media after hydration in addition to listening for `loadeddata`.

WebP selections use `LumiWebPClip`, a native image instead of a video element. Native load events start cycle timing without waiting for `next/image` to decode the animation. It decodes a static first-frame preview via canvas (up to 1024 px), preserves alpha, and uses a fresh blob URL for each play/replay. Paused, hidden, and reduced-motion-blocked WebP uses the still preview; temporary URLs and local override loads are cleaned up. `lib/lumi-webp.ts` retains bundled Blob promises across avatar remounts, so placeholder cleanup does not abort a download needed by the live view. Failed loads leave the cache; profile reload clears cache/status and remounts players. Speed/repeat count are native file settings; video speed is disabled and manual WebP has no ended-to-idle transition. Ready/error callbacks guard against stale source URLs, and valid WebP participates in the existing timed simulation.

Product avatars and material reading animate automatically, with no start/pause control or stored manual override. By explicit product choice, both animate regardless of system reduced motion; hidden/offscreen playback gates remain. OS settings are never changed. Previous `lumi-avatar-motion` and `lumi-avatar-motion-v2` values are ignored. Failed loading/playback exposes only **Recarregar**, which retries automatic playback. The playground keeps its independent manual controls and system reduced-motion gate.

- `agora-rtc-react` / `agora-rtc-sdk-ng` for media transport.
- `agora-rtm` for data channel.
- `agora-agent-client-toolkit` and `agora-agent-uikit` for conversation logic/UI.
- `agora-agents` for managed agent lifecycle.
- OpenAI vision model (AI SDK, Responses API) for structured homework analysis of images and PDFs.

## Deployment Modes

- Local development via `pnpm run dev`.
- Vercel deployment as single Next.js app with server env vars.

## Data and Control Boundaries

- Browser never sees the app certificate; only receives signed short-lived tokens.
- Browser never sees the OpenAI key or a private storage path.
- Agent lifecycle control (`start`, `stop`) is server-routed.
- Transcript/state/metrics are data-plane RTM events from agent to browser.
- UI control-plane actions (start/end, renew) originate in `LandingPage`.
- Material ownership is derived from the authenticated family session; shared demo uploads are additionally scoped to the session ID.

## Material Sequence

1. The profile page sends an authenticated multipart image upload.
2. The server validates the signature/size, hashes the bytes, and reserves a material record.
3. An unexpired match for owner/profile/hash/model/prompt is reused; otherwise the private file is stored and OpenAI extracts text.
4. The profile retains its URL/header and embeds `MaterialStudyPageClient` with the upload response. `LumiMaterialLoading` displays the bundled reading WebP plus a loading caption during upload/processing, while the previous voice component is unmounted. Once ready and the current reading cycle completes (at least one full cycle), the same panel displays the original image/PDF and starts Lumi with server-loaded material context. History detail routes reuse the study component independently.
5. Manual completion or a completed whole-material tutor confirmation triggers the existing authorized PATCH. Automatic completion waits for final speech, unmounts voice, plays one success cycle and returns to profile upload only after both saving and animation finish. Failed saving retains the material with retry; navigation cancels pending requests. Child history and adult report read the same record.
6. File and text content expire lazily while metadata and completion state remain.

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

Non-didactic material classification from main is retained in persistence and DTOs (`isDidactic`, with an analysis fallback for older records). Prompt version `material-tutor-v5` invalidates pre-classification cache entries. Upload success still finishes the reading cycle before showing the adult-profile warning or the embedded study result. Processing responses that later become non-didactic must not start a child tutoring session. The shared workspace retains keyboard/close-button image preview and the history route.

Whole-material completion has a separate reserved first sentence, **Atividade concluída com sucesso!**, emitted only after the tutor verifies all questions and steps. `LumiMaterialCompletionDetector` shares transcript normalization/deduplication rules but never treats the per-question cue as a final verdict. `ConversationComponent` delivers `onMaterialCompleted` after a completed final turn and 600 ms with no agent audio/preparation. `LumiVoiceAgent` forwards it only in material sessions. The study workspace owns the authenticated PATCH and success presentation; unmounting voice keeps RTC/RTM teardown with their existing owners. Persistence and a full celebration cycle form independent gates before restoring upload. Visibility/error/timeout can bypass only the visual gate, never failed saving. The tutor remains the judge; no new model call, answer-key DTO or public webhook is added.

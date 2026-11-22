# 06 Interfaces

> Contracts at repo boundaries: API routes, env vars, runtime events, and shared TypeScript payloads.

## HTTP Route Contracts

### `GET /api/generate-agora-token`

Query params:

- `uid` optional; missing/non-numeric/nonpositive resolves to a random RTM-safe UID. Numeric values above `2147483647` return `400` rather than silently changing the requested identity.
- `channel` optional; defaults to generated `ai-conversation-<ts>-<rand>`.

Success response:

```json
{ "token": "...", "uid": "1234", "channel": "ai-conversation-..." }
```

Failure response: `{ "error": string, "details"?: string }` with `400` for oversized UIDs or `500` for server failures.

### `POST /api/invite-agent`

Optional `avatar_mode` accepts only `"local"` or `"provider"`; optional `avatar_id` must be a catalog ID (`alien`, `princess`, `hero`, `cowboy`, or `plush`). Invalid values return `400`. `"local"` starts the usual voice agent without Lemon Slice. Profile, material-study, and activity pages send local mode for the default Plush and provider mode plus the saved ID for other choices. Omitted provider settings retain the existing generic avatar path. The response shape is unchanged. Client components pass this selection as `avatarMode` and `lumiAvatar`.

Body (`ClientStartRequest`):

```json
{ "requester_id": "1234", "channel_name": "ai-conversation-..." }
```

Success (`AgentResponse`):

```json
{ "agent_id": "...", "create_ts": 1710000000, "state": "RUNNING" }
```

Validation failures return `400`; server failures return `500`.

The main route uses `LumiTTS` from `lib/lumi-tts.ts` for both greeting and replies: managed MiniMax `speech_2_6_turbo`, voice `English_captivating_female1`, and explicit `params.language_boost: 'Portuguese'`. The adapter preserves SDK-managed model metadata while adding the documented MiniMax language option. No new environment variable or browser parameter is required. Contract tests inspect serialization without starting live sessions; pronunciation must be checked in a new conversation. The isolated playground provider experiment retains its own configuration.

`requester_id` must be a decimal string in `1..2147483647` distinct from the reserved agent/avatar IDs. This is the current Conversational AI numeric participant limit, narrower than RTC's uint32 range. Invalid IDs are rejected before an agent session is created.

### `PATCH /api/profiles`

An authenticated family session may save `{ "profileId": "...", "lumiAvatar": "plush" }` for one of its child profiles. The avatar ID must be in the catalog. Demo saves update only the current session overlay, leaving the shared demo family unchanged; an unknown or adult profile returns `404`. Existing profiles without `lumiAvatar` resolve to Plush. The picker at `/profile/[id]/avatars` uses this contract.

### `POST /api/profiles`

The two-step sign-up form first creates an adult profile with name, phone and password. Its second request sends `{ "children": [{ "firstName": "...", "lastName": "...", "birthDate": "YYYY-MM-DD" }] }` under that new session. An existing signed-in family uses the same child request; up to eight children are accepted atomically. Child dates must be past dates and under 18 years ago. The demo cannot add profiles.

### `/api/recordings`

The signed-in family session can list recordings (`GET`), upload a completed child voice session (`POST` multipart), play private audio with byte ranges (`GET /[id]/file`), and delete it (`DELETE /[id]`). Demo recordings are scoped to the current session. `LUMI_RECORDING_RETENTION_HOURS` defaults to 168.

### `POST /api/stop-conversation`

Body (`StopConversationRequest`): `{ "agent_id": "..." }`.

Responses:

- `{ "success": true }`
- `{ "success": true, "state": "already-stopping" }` for idempotent stop state
- `{ "error": string }` on failure

### `POST /api/chat/completions`

Optional SSE proxy path (not default runtime path). Requires `NEXT_LLM_API_KEY` and `NEXT_LLM_URL` when used.

### `/api/playground/lumi-animation`

- `GET`: uncached `{ configured: boolean }` for the three live-test credentials; never returns keys.
- `POST`: `{ requester_id, channel_name, animation: { speakingPrompt, idlePrompt, aspectRatio } }`. UID must be a decimal string in `1..2147483647` distinct from agent/avatar UIDs; channel must start with `lumi-animation-` and have 1–48 alphanumeric/hyphen suffix characters. Prompts must be nonblank and at most 1600 characters each; aspect ratio is `2x3`, `9x16`, or `1x1`. Only the repository Lumi image is used.
- Success: `{ agent_id, create_ts, state: 'RUNNING' }`. Invalid JSON/fields: `400`; body over 8000 characters: `413`; absent server credentials: `503`; provider failure: sanitized `502`.
- Reuses the existing token and stop contracts; all main-app contracts remain unchanged.

### `POST /api/materials`

Authenticated multipart body: `profileId` string plus `file` (`image/jpeg`, `image/png`, `image/webp`, or `application/pdf`, maximum 10 MB), with optional `literacyLevel`. Requires a family-owned child profile; there is no additional adult-password step for uploads. Family-wide history uses the signed-in family session.

- `201`: new extraction completed, `{ material, cached: false }`.
- `200`: unexpired ready/processing record reused, `{ material, cached: true }`.
- `400/401/404/413/415`: request, session, ownership, size, or media validation failure.
- `422/502/504`: unreadable image, provider failure, or timeout.

### `GET /api/materials`

- `?profileId=<id>` returns browser-safe history metadata for a family-owned child.
- `?scope=family` returns all current-session family material metadata to the signed-in family session.

List results exclude hashes, private storage keys, and extracted text.

### `GET/PATCH /api/materials/[id]`

`GET` returns authorized detail including extracted text while retained. `PATCH { "completed": true }` records idempotent completion, invoked by the manual action or a whole-material tutor confirmation. Expired content keeps metadata but omits text.

## Event/Data Interfaces

- RTM transcript/state/metrics/errors consumed through `AgoraVoiceAI` event emitter.
- Raw RTM `message` event parsed as fallback for `message.error` and `message.sal_status` payloads.
- `AGENT_METRICS` payloads displayed by `QuickstartPipelineMetrics`.

## Environment Contract

Required:

- `NEXT_PUBLIC_AGORA_APP_ID`
- `NEXT_AGORA_APP_CERTIFICATE`
- `OPENAI_API_KEY`

Optional material settings are `HOMEWORK_VISION_MODEL` (default `gpt-4.1-mini`) and `LUMI_MATERIAL_RETENTION_HOURS`. Optional voice BYOK snippets use additional variables only when explicitly enabled.

## Test Coverage for Interfaces

- `scripts/verify-api-contracts.ts` asserts token generation, input validation, env failures, and SSE framing cases.

## Shared Client-Side Interfaces

`ConversationComponent.celebrateAnswers` defaults to false and is enabled by `LumiVoiceAgent` only for material sessions, in inline and full layouts. It derives a `celebrationId` from `LumiAnswerCelebrationDetector` using completed normalized agent confirmations, deduplicated by turn ID. `LumiConversationAvatar` accepts `celebrationId?: string | null` (undefined skips the study clip preload) and `celebrationReady` (response preparation/audio finished). The avatar consumes one loaded celebration cycle; its cancellation gates consume the cue without replay. `LumiAnimationState` includes `celebrating`, while RTC speech detection remains idle/listening/speaking. Per-question cues do not persist completion. Whole-material completion uses the separate callback below; HTTP payloads and private analysis remain unchanged.

Product avatars and material reading have automatic playback, with no start/pause button. They autoplay regardless of `prefers-reduced-motion` by explicit product choice and do not read or write manual playback choices in `sessionStorage`; old saved pauses cannot disable new mounts. Failed loading/playback shows a still image and status; reloading the page retries the asset. Hidden/offscreen gates remain. Playground controls and its reduced-motion autoplay gate remain independent.

`LumiConversationAvatar` optionally accepts `idleOnly`, `className`, `entranceReady`, `onVisualReady` and `onAnimationEnd` for standalone illustrations. `idleOnly` loads only idle and uses a responsive frame; callers may size it through `--lumi-idle-width`. A disconnected call still renders idle, but never keeps its previous listening/speaking loop. Intersection and document visibility pause animation without changing voice lifecycle.

`useLumiIdleSleep(state, enabled)` returns `LumiAnimationState` (`LumiSpeechState | 'sleeping'`). `LumiSpeechDetector` remains audio-only. `LumiConversationAvatar` accepts this presentation state, and `nextLumiAnimationState` immediately exits sleep on interaction; other ending actions retain their current-cycle behavior. `LUMI_IDLE_SLEEP_MS` is 30,000 ms, measured only while enabled, silent and visible. `isLumiRestingAgentState` accepts SDK `idle`, `listening`, `silent` and null; it rejects `thinking`/`speaking`. Passing its boolean result keeps the timer stable across resting-state events.

`getBrowserRtmManager().acquire(channel?)` returns `{ ready, release }`. `ready` supplies combined token data and the shared RTM client; `release` is idempotent for that lease and never releases a newer owner. `startManagedConversation` wraps a lease with an invite callback and agent-stop callback, exposing `{ ready, stop }`. Ready includes `agentJoinError` for the base/Lumi nonfatal invite path. Tokens use a stable per-document numeric UID and a fresh channel unless an isolated playground channel is supplied; endpoint contracts remain unchanged. SDK import/construction stays browser-only.

`MaterialStudyPageClient` accepts optional `embedded`, `initialProfile`, `initialMaterial` and `onClose` props. The profile seeds it with the authorized upload response, so upload success renders in place instead of routing away. History/detail routes omit these props. Processing is polled serially every 1.8 seconds, aborted on cleanup and bounded to two minutes before offering retry. No API request or DTO contract changes are required.

`LumiMaterialLoading` receives `loading` (API pending), `active` (reading presentation enabled) and `onComplete`. Keep it mounted after success with `loading=false` until `onComplete` fires at the next loaded WebP cycle boundary, guaranteeing a full first cycle even for fast responses. Errors cancel the presentation immediately. Hidden tabs and animation failures bypass the wait; a 15-second asset watchdog prevents stalls. Profile uploads hold a pending response until completion; material polling holds the ready presentation and voice startup until completion, without delaying requests. Retry starts a fresh reading animation.

`LumiConversationAvatar` receives the requested `state` plus `active`, `listeningEnabled` and `speakingEnabled` cancellation flags from the existing RTC lifecycle. Its `data-lumi-state` is the displayed cycle; `data-lumi-requested-state` tracks current speech. `LumiWebPClip.onReady` optionally reports cycle duration in milliseconds and `onCycleEnd` reports loaded playback boundaries. Conversation callers finish cycles except for incoming speech priority or explicit cancellation. Playground callers retain their independent timed simulation.

`LumiVideoClip.fit` optionally selects `contain` (default) or centered `cover` for both players and the exported production manifest. The bundled square speaking WebP uses `contain` to show the whole image and wings in portrait containers without modifying its bytes. Local replacements default to `contain`.

The playground file selector accepts WebP/WebM/MP4/MOV up to 40 MB. `LumiVideoClip` represents both images and videos; file extension selects the renderer, and the browser validates decoding. `videoProductionManifest` exports `suggestedWebp` alongside existing video paths; it contains no local file bytes or blob URLs.

From `types/conversation.ts` (high-use):

- `AgoraTokenData`: token bootstrap payload consumed by `LandingPage`.
- `AgoraRenewalTokens`: renewal callback result (`rtcToken`, `rtmToken`).
- `ConversationComponentProps`: runtime dependencies for in-call component.
- `StudyMaterialDto`: browser-safe material state; detail responses may populate `extractedText`.

## Interface Invariants

- Token payload must always include `token`, `uid`, `channel`.
- Invite route requires both `requester_id` and `channel_name`.
- Stop route requires `agent_id`; missing should never be tolerated silently.
- Token route should always return UID as string for downstream compatibility.
- Material list routes must never return `storageKey`, `sha256`, `familyId`, or extracted text.
- `profile_id` and `material_id` must be supplied together when grounding `/api/invite-agent`.

## Event Interface Notes

- Metrics stream entries are append-only in component state, capped to recent window.
- Connection issue records carry `source`, `agentUserId`, code/message, timestamp.
- SAL and signaling fallback payloads are parsed defensively because message schema can vary.

## Backward Compatibility Guidance

- If route response shape changes, update both client consumers and contract tests in same change.
- If adding fields, keep existing fields stable to avoid quickstart consumer breakage.
- Reflect interface changes in README and L1 docs to keep sample copyable.

## Related Deep Dives

- [conversation_lifecycle.md](L2/conversation_lifecycle.md) — How route contracts are used in sequence.
- [transcript_pipeline.md](L2/transcript_pipeline.md) — Event-level contract mapping.

Non-didactic material classification from main is retained in persistence and DTOs (`isDidactic`, with an analysis fallback for older records). Prompt version `material-tutor-v5` invalidates pre-classification cache entries. Upload success still finishes the reading cycle before showing the adult-profile warning or the embedded study result. Processing responses that later become non-didactic must not start a child tutoring session. The shared workspace retains keyboard/close-button image preview and the history route.

`ConversationComponent.onMaterialCompleted?: () => void` reports the distinct final tutor verdict only after speech/preparation ends; `LumiVoiceAgent` forwards it only with `materialId`. The study workspace disables this callback for already-completed materials. Its automatic mode owns a locked, abortable 15-second `PATCH { completed: true }` and waits for the successful response plus success animation before invoking `onClose`, or returning standalone detail to `/profile/:id`. `LumiConversationAvatar.onCelebrationComplete?(id, outcome)` reports exactly once per cue with `played` after a full cycle or `skipped` on visibility/error/30-second timeout; it does not itself persist anything. Retry never creates a second completion timestamp.

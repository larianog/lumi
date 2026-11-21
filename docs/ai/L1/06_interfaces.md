# 06 Interfaces

> Contracts at repo boundaries: API routes, env vars, runtime events, and shared TypeScript payloads.

## HTTP Route Contracts

### `GET /api/generate-agora-token`

Query params:

- `uid` optional; invalid/zero resolves to random RTM-safe UID.
- `channel` optional; defaults to generated `ai-conversation-<ts>-<rand>`.

Success response:

```json
{ "token": "...", "uid": "1234", "channel": "ai-conversation-..." }
```

Failure response: `{ "error": string, "details"?: string }` with `500`.

### `POST /api/invite-agent`

Body (`ClientStartRequest`):

```json
{ "requester_id": "1234", "channel_name": "ai-conversation-..." }
```

Success (`AgentResponse`):

```json
{ "agent_id": "...", "create_ts": 1710000000, "state": "RUNNING" }
```

Validation failures return `400`; server failures return `500`.

### `POST /api/stop-conversation`

Body (`StopConversationRequest`): `{ "agent_id": "..." }`.

Responses:

- `{ "success": true }`
- `{ "success": true, "state": "already-stopping" }` for idempotent stop state
- `{ "error": string }` on failure

### `POST /api/chat/completions`

Optional SSE proxy path (not default runtime path). Requires `NEXT_LLM_API_KEY` and `NEXT_LLM_URL` when used.

### `POST /api/materials`

Authenticated multipart body: `profileId` string plus `file` (`image/jpeg`, `image/png`, or `image/webp`, maximum 8 MB).

- `201`: new extraction completed, `{ material, cached: false }`.
- `200`: unexpired ready/processing record reused, `{ material, cached: true }`.
- `400/401/404/413/415`: request, session, ownership, size, or media validation failure.
- `422/502/504`: unreadable image, provider failure, or timeout.

### `GET /api/materials`

- `?profileId=<id>` returns browser-safe history metadata for a family-owned child.
- `?scope=family` requires recent adult verification and returns all current-session family material metadata.

List results exclude hashes, private storage keys, and extracted text.

### `GET/PATCH /api/materials/[id]`

`GET` returns authorized detail including extracted text while retained. `PATCH { "completed": true }` records idempotent explicit completion. Expired content keeps metadata but omits text.

## Event/Data Interfaces

- RTM transcript/state/metrics/errors consumed through `AgoraVoiceAI` event emitter.
- Raw RTM `message` event parsed as fallback for `message.error` and `message.sal_status` payloads.
- `AGENT_METRICS` payloads displayed by `QuickstartPipelineMetrics`.

## Environment Contract

Required:

- `NEXT_PUBLIC_AGORA_APP_ID`
- `NEXT_AGORA_APP_CERTIFICATE`
- `FEITA_AI_API_KEY`
- `FEITA_AI_MODEL`

Optional material settings are `FEITA_AI_URL` and `LUMI_MATERIAL_RETENTION_HOURS`. Optional voice BYOK snippets use additional variables only when explicitly enabled.

## Test Coverage for Interfaces

- `scripts/verify-api-contracts.ts` asserts token generation, input validation, env failures, and SSE framing cases.

## Shared Client-Side Interfaces

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

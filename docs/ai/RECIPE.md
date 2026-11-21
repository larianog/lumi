---
recipe_version: 0.1.0
recipe_status: stable
extension_points:
  - api.routes
  - api.material-extraction
  - persistence.material-storage
  - prompts.system
  - pipeline.providers
  - ui.conversation
invariants:
  - baseline.official-sample
  - tokens.rtc-rtm
  - lifecycle.strict-mode
  - transcript.uid-remap
  - materials.private-authenticated
  - materials.cache-versioned
stable_contracts:
  - env.required
  - api.token
  - api.invite-agent
  - api.stop-conversation
  - api.materials
---

# Quickstart Recipe Profile

This repo is a reusable quickstart sample for building browser voice-agent experiences with Agora Conversational AI Engine.

## Recipe Role

- Role: `base` quickstart recipe.
- Target audience: developers bootstrapping a production-style Next.js voice agent app.
- Reuse model: clone, bind project, run, then customize prompt/pipeline/UI.

## Recipe Scope

This base recipe provides a copyable browser voice-agent starter with:

- browser RTC audio and RTM event transport
- server-side token, invite, stop, and optional custom LLM routes
- managed default STT, LLM, and TTS provider configuration
- pre-call, in-call, transcript, metrics, and connection-status UI
- authenticated study-material upload, cached OpenAI analysis, child history, and adult-visible completion

## Baseline Implementation Guidance

This repository is the official Agora Next.js quickstart baseline for this recipe. Agents should use this repo's source and progressive disclosure docs as the starting point, then customize.

Do not recreate Agora ConvoAI integration from memory. Provider schemas, SDK builder fields, token behavior, and RTM event details can drift. For a new baseline implementation, follow [L1/L2/from_scratch_bootstrap.md](L1/L2/from_scratch_bootstrap.md) while copying verified patterns from this repo.

## Extension Points

- `api.routes`: add browser-facing routes under `app/api`, with shared request/response types in `types/conversation.ts` when the client consumes them.
- `api.material-extraction`: change OpenAI request/prompt behavior in `lib/material-extraction.ts`; bump the prompt version when semantics change.
- `persistence.material-storage`: replace `lib/material-storage.ts` and JSON material persistence with durable private adapters for production deployment.
- `prompts.system`: edit `ADA_PROMPT` and `GREETING` in `app/api/invite-agent/route.ts`.
- `pipeline.providers`: adjust the `DeepgramSTT`, `OpenAI`, and `MiniMaxTTS` builder chain, or enable the commented BYOK blocks.
- `ui.conversation`: customize `QuickstartPreCallCard`, `QuickstartConversationLayout`, `QuickstartTranscriptPanel`, and `QuickstartPipelineMetrics`.

## Invariants

- Keep `RtcTokenBuilder.buildTokenWithRtm` for RTM-capable tokens.
- Treat this repo as the official baseline; customize after preserving a working token, invite, RTC, RTM, and transcript flow.
- Preserve StrictMode `isReady` guard for join/mic initialization.
- Preserve UID remap (`uid="0"`) and `INTERRUPTED` message-list inclusion.
- Keep documentation synchronized when workflows/contracts change.
- Keep material uploads private/authenticated, demo-session isolated, and cached by hash + model + prompt version.

## Stable Contracts

- `GET /api/generate-agora-token` returns `{ token, uid, channel }`.
- `POST /api/invite-agent` accepts `{ requester_id, channel_name }` and returns the agent id/state payload.
- `POST /api/stop-conversation` accepts `{ agent_id }` and treats already-stopping sessions as success.
- Required env vars are `NEXT_PUBLIC_AGORA_APP_ID` and `NEXT_AGORA_APP_CERTIFICATE`.
- Material extraction additionally requires server-only `OPENAI_API_KEY`.
- `POST/GET /api/materials` and `GET/PATCH /api/materials/[id]` own material ingestion, history, detail, and completion contracts.
- `components/LandingPage.tsx` owns pre-call bootstrap and RTM client lifecycle.
- `components/ConversationComponent.tsx` owns joined-session RTC/toolkit lifecycle.
- `lib/conversation.ts` owns transcript normalization helpers.

## Internal / Subject to Change

- Visual styling and copy in the quickstart UI.
- The exact reseller defaults for STT, LLM, and TTS models.
- Connection issue display heuristics and metric chip presentation.

## Consumer Onboarding Recipe

1. Clone or scaffold from template.
2. Bind Agora project and write `.env.local`.
3. Run `pnpm run doctor` and `pnpm run dev`.
4. Validate with `pnpm run verify` before sharing modifications.
5. Customize agent behavior and UI using the supported surfaces above.

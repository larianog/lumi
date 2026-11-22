> **When to Read This:** Load this when modifying transcript rendering, event handling, UID mapping, metrics/error panels, or RTM fallback parsing.

# Transcript Pipeline

## Overview

Transcript and call diagnostics are delivered through AgoraVoiceAI events over RTM, then normalized for UI kit components.

`lib/agora-rtm-session.ts` supplies a shared browser RTM instance through exclusive leases. Login and channel subscription complete before agent invite and `ConversationComponent` mount. On cleanup, component/toolkit listeners are removed and the lease logs out before another channel starts. Reuse the instance/UID but fetch new channel tokens; stale cleanup must not affect a later lease. The per-document UID is independent of profile/family identity and is not persisted across tabs.

Primary pipeline:

1. RTM/RTC data arrives.
2. `AgoraVoiceAI` emits transcript/state/metrics/error events.
3. `ConversationComponent` stores raw transcript and issue streams.
4. `lib/conversation.ts` normalizes UID/text/timestamps.
5. UI panels render message history + in-progress turn separately.

## Transcript Normalization Stages

- UID remap: toolkit `uid="0"` -> actual local RTC UID string.
- Text cleanup: punctuation spacing normalization.
- Timestamp normalization: seconds vs milliseconds unified.
- Status segmentation:
- `IN_PROGRESS` displayed as live bubble.
- `END` + `INTERRUPTED` included in scrollable history.

## Why `INTERRUPTED` Must Stay in History

If the first agent turn is interrupted and omitted, `messageList` can remain empty and transcript auto-open logic may never engage. Keeping interrupted turns preserves user-visible causality.

## Agent Visualizer Mapping

Uploaded-material sessions opt into `celebrateAnswers`. After normalization, `LumiAnswerCelebrationDetector` recognizes the tutor's reserved first sentence **Você acertou!** only in `END` agent turns following a completed user answer. It deduplicates agent turn IDs and consumes interrupted/disabled-context turns without celebrating. The prompt uses this sentence only after checking a complete answer; generic encouragement and partial steps do not qualify. This is a visual cue from the existing tutor, not an independent answer validator or persistence event. The avatar waits for speech/preparation to finish, completes one celebration cycle and resumes the latest normal state; cancellation drops stale cues. No transcript content or answer analysis is logged or added to browser DTOs.

Profile local avatars use a separate RTC audio activity path (`useLumiSpeechState` / `LumiSpeechDetector`). A session's generic `listening` event is not proof the user is speaking. Existing mic/remote agent levels drive idle/listening/speaking with short attack/release windows; audible agent speech wins visual overlap, and continuing user speech resumes listening once agent audio ends. Disabled mic, lost connection, or inaudible remote playback clears the corresponding activity. Transcript rendering, voice interruption behavior, and the visualizer mapping below are unchanged.

`mapAgentVisualizerState` prioritizes RTC transport state before agent semantic state:

- `DISCONNECTED`/`DISCONNECTING` -> `disconnected`
- `CONNECTING`/`RECONNECTING` -> `joining`
- no agent presence -> `not-joined`
- otherwise map agent states (`listening`, `thinking`, `speaking`, idle-like)

This avoids showing optimistic speech/listen states while transport is degraded.

## Metrics and Error Streams

Handled signals:

- `AGENT_METRICS` for per-stage latency chips.
- `MESSAGE_ERROR` and `AGENT_ERROR` for surfaced issues.
- `MESSAGE_SAL_STATUS` for registration failures (`VP_REGISTER_FAIL`, `VP_REGISTER_DUPLICATE`).

Fallback parser:

- Raw RTM `message` listener parses JSON payloads for `message.error` and `message.sal_status` to catch issues not raised via higher-level events.

## Coupled Files

- `components/ConversationComponent.tsx`: event subscriptions and issue collection.
- `lib/conversation.ts`: transcript + visualizer mapping transforms.
- `components/QuickstartTranscriptPanel.tsx`: transcript render sink.
- `components/QuickstartPipelineMetrics.tsx`: metrics render sink.
- `components/ConnectionStatusPanel.tsx`: surfaced connection diagnostics.

The separate **Atividade concluída com sucesso!** first sentence is reserved for the entire checked worksheet. `LumiMaterialCompletionDetector` accepts only completed agent turns after a user answer, with the same interrupted/disabled/duplicate protection. `ConversationComponent` waits for agent rest and no audible speech for 600 ms before calling the material-specific callback. The study workspace then owns persistence, voice unmount, one success animation and return to upload. Per-question confirmation, ending a call and text spoken by the user never substitute for the final tutor verdict. This is the existing tutor's judgment, not an independent server grader.

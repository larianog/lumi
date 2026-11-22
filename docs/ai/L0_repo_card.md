# Agora Conversational AI Next.js Quickstart — Repo Card

> Official Next.js quickstart for building browser-based voice AI agents with Agora Conversational AI Engine.

## Identity

| Field | Value |
| --- | --- |
| Repo | `AgoraIO-Conversational-AI/agent-quickstart-nextjs` |
| Type | `frontend-app` |
| Language | TypeScript, Next.js 16 App Router, React 19 |
| Deploy Target | Local Node.js dev server, Vercel |
| Owner | Agora Conversational AI / DevEx |
| Recipe Role | base |
| Recipe Version | 0.1.0 |
| Recipe Status | stable |
| Last Reviewed | 2026-11-22 |

## L1 — Summaries

Motion control removal on 2026-11-22 removes the main-app avatar and reading play/pause/reload buttons. Playback now follows the system reduced-motion preference directly; failed assets retain the still fallback and error status, and a page reload retries them. The animation playground keeps its separate controls.

Welcome review on 2026-11-22 removes the family-description paragraph and limits the demo button/hint/error to development builds. Production retains registration and sign-in; the login API contract is unchanged.

Merge review on 2026-11-22 combines main's didactic classification, product README/demo image, feedback specifications and CI/Docker updates with local animations, reading-cycle gating, voice recovery and sleep. Cached/async non-didactic results do not start tutoring; runtime database contents are preserved locally.

Sleep regression review on 2026-11-22 includes the SDK `silent` state in the inactivity gate. Previously a silent agent could stay awake indefinitely after replying. The countdown remains stable across resting-state events, with browser coverage of sleep and speech wake-up.

Idle review on 2026-11-22 configures the supplied 121-frame, 4033 ms alpha WebP across all app mascot illustrations and voice waiting states. Shared `idleOnly` rendering avoids downloading other clips on non-voice screens; intersection/visibility handling pauses hidden illustrations. Idle immediately yields to conversation actions or sleep, and material analysis keeps reading. The welcome entrance remains accessible.

Inactivity review on 2026-11-22 adds sleeping after 30 seconds without speech or page interaction in local conversations. The supplied sleeping loop retains its original bytes (121 frames, 4033 ms, alpha). Interaction or speech wakes immediately; pending responses, failed connections and hidden tabs suspend the countdown. Voice stays connected and material loading keeps reading.

Voice recovery review on 2026-11-22 uses the current RTC snapshot and exposes retry after agent departure, failed join/invite, fatal service errors or a 20-second connection wait. Cleanup precedes a fresh session without navigating away or recreating RTM. Speaking now uses a 600 × 650 derivative retaining all frames, timing and alpha, with the original preserved.

RTM lifecycle review on 2026-11-21 reuses one SDK instance and numeric UID per browser document across Lumi, the base screen and live playground. Lease ownership serializes login/subscription/logout; fresh channel tokens match the same UID. StrictMode auto-start, partial failure and late invite cleanup are covered without live services. Existing browser instances require one full reload after this change.

Participant UID regression review on 2026-11-21 constrains generated identities to `1..2147483647`. The agent join endpoint rejects larger uint32 IDs even when RTM login succeeds. Token/invite guards and tests cover the observed rejected values and maximum random input.

Upload flow review on 2026-11-21 keeps analysis and results inside the profile URL. A reading avatar (`lummi-lendo-transparente.webp`, 118 frames, 3933 ms, alpha) and loading caption replace voice during processing; successful responses wait for a full reading cycle before the embedded study workspace starts a grounded session. Motion cancellation and asset failures bypass this presentation wait. Shared history/detail rendering, PDF preview, explicit completion, bounded polling and retry remain available.

Animation transition review on 2026-11-21 covers normal/demo profiles, material study and activity voice dialogs. Audible speech enters immediately; ending actions complete their current cycle before applying only the latest requested state. WebP ANMF timing and native video completion drive transitions; explicit playback cancellation clears pending work. Source assets and voice lifecycle are unchanged.

Integration review on 2026-11-21 combines the material upload/history/tutoring flow from main with local profile and material-study animations. Invites preserve both material grounding identifiers and `avatar_mode`; upload password removal does not remove the adult check on family-wide history. Local database sessions are preserved separately from the merge commit.

Review scope on 2026-11-21 includes the animation playground, local video/WebP workflow, and profile avatars driven by RTC speech activity. Profiles explicitly request local avatars without Lemon Slice; omitted invite avatar mode preserves provider defaults.

The bundled assets are `lummi-falando-otimizada.webp` for speaking (143 frames, approximately 6 seconds, 600 × 650) and `lummi-transparente-02.webp` for listening (192 frames, approximately 8 seconds, 768 × 768), both with alpha, rendered by a shared WebP component in profiles and the playground. Speaking uses a 3.95 MB portrait derivative with 81% fewer pixels per frame and the same centered cover framing; the original Full HD `lummi-animacao-transparente-1.webp` is retained unchanged. Profiles preload conversation clips and animate only the displayed state; silence plays the idle loop until the inactivity timer requests sleep. The earlier speaking WebP and MP4 are not the defaults.

The reviewed avatar loading flow shares bundled downloads across placeholder/live remounts and retains a still fallback on failure. LAN previews require a network binding; microphone use on another device requires HTTPS.

Conversation animations give incoming audible agent speech immediate priority over microphone activity. After speech ends, the displayed cycle finishes before resuming listening if the user is still talking, or returning to still. RTC voice interruption behavior is unchanged.

The Audience column helps agents prioritise: **Use** = consuming the repo behavior, **Maintain** = changing internals.

| File | Purpose | Audience |
| --- | --- | --- |
| [01_setup](L1/01_setup.md) | Environment setup, quick commands, env vars, verification safety | Use & Maintain |
| [02_architecture](L1/02_architecture.md) | End-to-end runtime architecture and data flow | Maintain |
| [03_code_map](L1/03_code_map.md) | Directory/module map and ownership boundaries | Maintain |
| [04_conventions](L1/04_conventions.md) | Coding conventions, lifecycle patterns, and doc sync rules | Maintain |
| [05_workflows](L1/05_workflows.md) | Common task recipes (run, modify, validate, ship) | Use & Maintain |
| [06_interfaces](L1/06_interfaces.md) | API contracts, event payloads, env contracts | Use & Maintain |
| [07_gotchas](L1/07_gotchas.md) | High-impact pitfalls and known failure modes | Maintain |
| [08_security](L1/08_security.md) | Secret handling, trust boundaries, auth/token model | Maintain |

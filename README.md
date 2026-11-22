# Lumi — AI study companion for children

[![CI](https://github.com/larianog/unmute-by-agora/actions/workflows/ci.yml/badge.svg)](https://github.com/larianog/unmute-by-agora/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)

Lumi is a voice-first study companion that helps children work through school activities with guidance instead of simply giving them the answers. A child can upload a worksheet or photograph a page, choose their current reading level, and talk to Lumi about the activity in Brazilian Portuguese.

The experience is designed for families. Adults create the family account and child profiles, children study through their own profile, and responsible adults can review materials and completed activities in a protected progress area.

This repository is built from Agora's Conversational AI Next.js quickstart and extends it into a complete study-material workflow with multimodal analysis, family profiles, history, completion tracking, and a material-aware voice tutor.

![Lumi Desktop and Mobile](docs/assets/lumi-desktop-mobile.png)

## What Lumi does

A typical study session follows this path:

1. An adult completes the two-step sign-up form: create the family account, then add one or more child profiles; development builds also offer the built-in demo.
2. The child selects their profile and adds a school activity as a photo, image, or PDF.
3. The child selects how independently they currently read: not yet reading, reading with help, or reading independently.
4. The server validates the file and uses an OpenAI vision model to understand the worksheet.
5. Lumi identifies the subject, instructions, questions, expected answers, solution steps, and progressive hints.
6. The profile page opens the worksheet question cards and original-file viewer in place. Children can type answers or fill blanks by speaking, and a private, material-aware voice agent guides them through the activity. **Enviar outra atividade** returns to submission.
7. The child explicitly completes the activity. Its status then appears in the child's history and the adult progress report.

Lumi's tutoring prompt is adapted to the child's name, age, reading level, and uploaded activity. Expected answers remain server-side and are used only to check the child's reasoning; the child-facing extracted text does not expose the answer key.

## Run locally

### Prerequisites

- [Node.js 22 or newer](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation)
- [Agora CLI](https://github.com/AgoraIO-Community/cli)
- An Agora project with Conversational AI enabled
- An OpenAI API key for worksheet analysis

### 1. Clone and install

```bash
git clone https://github.com/larianog/unmute-by-agora.git
cd unmute-by-agora
pnpm install
```

### 2. Install and authenticate the Agora CLI

macOS and Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/AgoraIO/cli/main/install.sh | sh -s -- --add-to-path
```

Windows PowerShell:

```powershell
irm https://dl.agora.io/cli/install.ps1 | iex
```

Then authenticate and bind the repository to an Agora project:

```bash
agora login
agora project use <your-project>
agora project env write .env.local
```

### 3. Configure material analysis

After the Agora CLI writes `.env.local`, add the OpenAI key and optional material settings:

```dotenv
OPENAI_API_KEY=your_openai_api_key
# HOMEWORK_VISION_MODEL=gpt-4.1-mini
# LUMI_MATERIAL_RETENTION_HOURS=168
```

The complete tracked template is [`config/env/env.local.example`](config/env/env.local.example).

| Variable | Required | Purpose |
| --- | :---: | --- |
| `NEXT_PUBLIC_AGORA_APP_ID` | Yes | Public Agora project identifier used by the browser and server |
| `NEXT_AGORA_APP_CERTIFICATE` | Yes | Server-only Agora signing credential |
| `OPENAI_API_KEY` | Yes | Server-only credential for image/PDF material analysis |
| `HOMEWORK_VISION_MODEL` | No | Overrides the material model; defaults to `gpt-4.1-mini` |
| `LUMI_MATERIAL_RETENTION_HOURS` | No | File/text retention from 1 to 720 hours; defaults to 168 |

Never expose the Agora certificate or OpenAI key through `NEXT_PUBLIC_*` variables.

### 4. Verify and start

For another device on the same LAN, use `pnpm run dev --hostname 0.0.0.0 --port 3000`. Microphone access on that device requires HTTPS via `pnpm run dev:lan` and a trusted development certificate. LAN access does not publish the app on the internet.

```bash
pnpm run doctor
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000). You can create a family account or choose **Entrar na Demo** to explore the built-in demo profiles. The welcome demo button and its hint appear only with `NODE_ENV=development` (`pnpm run dev`); production builds omit them.

If the voice agent does not join or transcripts do not appear, run:

```bash
agora project doctor --deep
```

## Features

### Child study experience

- Dedicated profiles for each child in a family.
- Camera capture and file upload from the study screen.
- Support for JPEG, PNG, WebP, and PDF files up to 10 MB.
- Reading-level selection that changes how Lumi reads and explains the activity.
- Structured worksheet understanding, including instructions, questions, visual elements, skills, steps, and hints.
- A live voice tutor grounded in the selected material.
- Progressive help that encourages the child to reason before receiving more guidance.
- Material history with processing, pending, failed, and completed states.
- Explicit activity completion instead of treating the end of a voice call as completion.

### Family and adult experience

- Family accounts with password-protected sessions.
- Multiple child profiles under one family.
- A protected adult area for reviewing progress and submitted materials.
- Per-child activity history and a family report with session audio, transcripts and linked lesson files.
- A two-step sign-up form for an adult account followed by one or more child profiles.
- A ready-to-use demo family for exploring the product without registration through the development-only welcome button.

### Safety and reliability

- File type and binary-signature validation before analysis.
- A didactic-content check that keeps unrelated documents out of the child's study flow.
- Server-side material ownership checks before a voice agent can use extracted content.
- Cache reuse based on owner, profile, file hash, model, and prompt version.
- Private temporary file storage; uploads are never placed under `public/`.
- Child-safe material DTOs that do not expose private storage paths, hashes, or the server-only answer brief.
- Demo uploads and avatar choices isolated by browser session even though the demo family is shared.
- Demo recordings isolated by browser session; session audio defaults to seven-day retention in private storage.
- Automatic expiry of uploaded bytes and extracted text, with a seven-day default retention period.

Run `pnpm run verify` before shipping changes — it covers local prerequisites, lint, type safety, the core API route contracts, and the production build.
GitHub CI installs the pnpm version declared in `package.json`.

| Type | Accepted MIME type | Validation |
| --- | --- | --- |
| JPEG | `image/jpeg` | JPEG signature |
| PNG | `image/png` | PNG signature |
| WebP | `image/webp` | RIFF/WebP signature |
| PDF | `application/pdf` | `%PDF-` signature |

The Docker build definition and its context-specific ignore file live together under `deploy/docker/`:
The Dockerfile pins the same pnpm version as `package.json`.

- A child-safe transcription containing the activity title, instructions, and questions.
- A private tutoring brief containing expected answers, reasoning steps, hints, and pedagogical notes.

The private brief is loaded on the server when the voice session starts. Text supplied by the browser is never trusted as the grounding source.

## Architecture

Lumi is a single Next.js application containing the browser UI, server route handlers, voice-session orchestration, and local development persistence.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/architecture/system-architecture-dark.svg">
  <img src="./docs/assets/architecture/system-architecture.svg" alt="Lumi system architecture">
</picture>

### Technology stack

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Web application | Next.js 16 App Router, React 19, TypeScript | Pages, client state, API routes, and server rendering |
| Real-time audio | `agora-rtc-react`, `agora-rtc-sdk-ng` | Browser channel join, microphone track, and audio publication |
| Real-time events | `agora-rtm` | Transcript, agent state, metrics, and error events |
| Voice-agent client | `agora-agent-client-toolkit`, `agora-agent-uikit` | `AgoraVoiceAI`, turn state, transcript helpers, and voice UI |
| Voice-agent server | `agora-agents` | Managed agent creation, provider configuration, and session lifecycle |
| Material analysis | Vercel AI SDK and OpenAI | Structured multimodal analysis of images and PDFs |
| Local persistence | JSON metadata database and private filesystem cache | Families, profiles, sessions, completions, and temporary material content |

### Material-analysis pipeline

```text
Child profile
  -> POST /api/materials (authenticated multipart upload)
  -> ownership, size, MIME, and file-signature validation
  -> SHA-256 cache lookup
  -> OpenAI vision analysis with a strict structured schema
  -> child-safe extracted text + private tutoring brief
  -> private temporary storage + material metadata
  -> study workspace embedded on the profile page
```

The default material model is `gpt-4.1-mini`. The extraction result includes a didactic-content flag, title, subject, estimated grade, general instructions, up to 15 questions, expected answers, solution steps, and hints. Non-didactic files are associated with the adult profile rather than entering the child's tutoring flow.

### Voice-agent pipeline

The browser and the managed voice agent join the same Agora channel:

```text
Child microphone
  -> Agora RTC
  -> speech-to-text
  -> material-aware language model
  -> text-to-speech
  -> Agora RTC audio back to the child

Agent transcript, state, metrics, and errors
  -> Agora RTM
  -> browser UI
```

For uploaded study material, the browser sends multipart form data to `/api/materials` and opens the study workspace directly on the profile page, with a visible **Enviar outra atividade** control. The saved `/profile/:profileId/materials/:materialId` route remains available from history. Lumi starts an inline session grounded with server-loaded extracted text. The child explicitly completes the activity; ending the voice session alone does not mark it complete.
The default managed agent uses:

| Stage | Provider/model |
| --- | --- |
| Speech-to-text | Deepgram `nova-3`, Portuguese |
| Language model | OpenAI `gpt-4o-mini` |
| Text-to-speech | MiniMax `speech_2_6_turbo` |
| Optional visual avatar | LemonSlice, when configured |

Voice-session startup works as follows:

1. The browser requests a combined RTC + RTM token from `GET /api/generate-agora-token`.
2. After acquiring an RTM lease and completing login/subscription, the browser sends its channel, user ID, profile, and optional material IDs to `POST /api/invite-agent`.
3. The server verifies the family session and material ownership, then builds age-, literacy-, and worksheet-aware instructions.
4. The Agora managed agent joins the RTC channel and begins listening after voice activity is detected.
5. The browser publishes microphone audio and receives agent audio over RTC.
6. `AgoraVoiceAI` receives transcript, state, latency metrics, and errors over RTM.
7. `POST /api/stop-conversation` stops the managed session; React hooks own RTC and microphone cleanup.

The voice configuration uses server-side voice activity detection, bounded conversation history, interruption support, and a material-specific greeting. Agora-managed STT, LLM, and TTS do not require separate provider credentials in the default configuration. The `OPENAI_API_KEY` described below is used for material analysis.

### Data and security boundaries

- `NEXT_AGORA_APP_CERTIFICATE` and `OPENAI_API_KEY` are server-only secrets.
- The browser receives short-lived signed channel tokens, never the Agora certificate.
- Session tokens are stored in HTTP-only, same-site cookies.
- Uploaded files live in a private cache outside `public/`.
- Material access is scoped to the authenticated family and profile.
- Expected answers and tutoring notes never appear in list or child-facing material responses.
- Expired file/text content is purged lazily while completion metadata can remain available for history.

## Lumi animation and session behavior

The default resting mascot uses the supplied `lummi-idle-transparente.webp` (121 frames, 4033 ms, alpha) across welcome, profile selection, activities, parent report, voice placeholders/conversations and inactive material views. Standalone illustrations load only idle; voice views share the registered clips. System reduced-motion preferences and offscreen/hidden-tab pausing apply throughout the main app. Idle yields immediately to speech or sleep; reading keeps priority during material analysis. The playground includes the same idle and returns to it paused after simulation when loaded.

Local Lumi conversations sleep after 30 seconds without speech or page interaction, using the supplied `lummi-dormindo-transparente.webp` (121 frames, 4033 ms, 800 × 800, alpha). Speaking, pointer/key/input/scroll activity wakes the avatar immediately while RTC and the microphone remain connected. Hidden tabs reset the countdown; agent preparation, connection errors and blocked audio/microphone suspend sleep. The SDK resting states `idle`, `listening` and `silent` all allow the countdown; switching between them does not restart it. Actual RTC speech still wakes Lumi. Material analysis keeps its reading animation. The playground also offers manual **Dormindo** preview.

[`lib/agora-rtm-session.ts`](lib/agora-rtm-session.ts) owns one RTM instance and numeric UID per browser document, shared by Lumi, the base call screen and the live playground. It survives client navigation/Fast Refresh, serializes login/subscription/logout, and fetches fresh combined tokens for each channel using that UID. Identities are not stored across tabs. Agent invitation starts after RTM is ready; cancellation cleans up partial connections and stops late invite results. RTC hook ownership remains unchanged.

Participant UIDs use `1..2147483647`, excluding the agent/avatar IDs, as required by the Conversational AI join endpoint. The browser generator in `lib/agora.ts` constrains cryptographic random values to that range. Token requests above the limit and invalid invite participants return `400` before contacting Agora. Do not use the wider RTC-only uint32 range for this combined voice flow.

Lumi voice screens read the RTC connection snapshot as well as later events. Agent departure, RTC join failure, a 20-second connection wait, or a fatal voice-service event displays a recovery message and **Reconectar Lumi**, including inline profiles/materials. Retrying stays on the page, unmounts the old call through RTC hooks, stops its agent and releases its RTM lease before starting again. Duplicate retry clicks are locked; failed invites remain retryable instead of opening an empty call. SDK transport recovery clears the timeout. Diagnostic logs include only event source/code or departure reason, never conversation content.

### Lumi animation playground

Open [http://localhost:3000/playground/lumi-animation](http://localhost:3000/playground/lumi-animation) after `pnpm run dev`.
This standalone lab adds no navigation or styling changes to the main Lumi experience.

- **Vídeos por estado (default):** opens on **Falando** with `public/assets/lumi/states/lummi-falando-otimizada.webp` (143 frames, about 6 seconds, 600 × 650); **Escutando** uses `lummi-transparente-02.webp` (192 frames, about 8 seconds, 768 × 768) in the same directory. Both animated WebPs have alpha. Speaking uses an optimized portrait derivative (3,949,272 bytes, down from 9,202,324), retaining all 143 frames, delays and the previous centered cover framing. The Full HD source `lummi-animacao-transparente-1.webp` remains unchanged. Regenerate offline with `node scripts/optimize-lumi-speaking.mjs` (Sharp supplied by Next). Load local WebP/WebM/MP4/MOV overrides for any state, preview animations, pause/replay, inspect backgrounds, and simulate a conversation without API calls. Local overrides stay in page memory across playground tabs; reload or **Restaurar vídeo padrão** restores bundled defaults. Reading also has a bundled `lummi-lendo-transparente.webp` available for manual preview. Idle and sleeping also have bundled loops; the remaining three states await clips. See the [Lumi video production guide](docs/lumi-video-states.md) for the eight-state brief and alpha formats.
- **Local 2D:** preview breathing, listening, thinking, speaking and celebration body motions; adjust intensity/speed, pause, play a sequence and compare with the original image. This is a silent motion study, not lip sync or a prediction of Lemon Slice output. Device reduced-motion preferences are respected.
- **Lemon Slice:** compare the current prompt with `Mais presente` and `Expressiva`, edit speaking/idle prompts, choose an aspect ratio, then explicitly start a real test conversation. Each test uses its own `lumi-animation-*` channel and ends when its dialog closes. Tests consume Agora/Lemon Slice account usage.
- **Exportar ajustes:** download the local motion values and Lemon Slice parameters as JSON. Exporting does not apply anything to the main app.

Local preview needs no credentials. Live tests require the existing Agora variables plus the optional server-only `NEXT_LEMONSLICE_API_KEY` in `.env.local`; restart the server after changing it. No key is entered in the browser. The separate `/api/playground/lumi-animation` route uses the existing Lumi image and a fixed test greeting for comparisons. It leaves `/api/invite-agent` unchanged.

Video states are currently simulated, not wired to real Agora state events. Ordinary MP4 does not automatically provide a transparent background; deliver WebM with alpha and an HEVC-alpha variant for compatible Safari devices. The player does not remove backgrounds or convert formats. Clips are muted; the speaking loop is not phoneme lip sync. The video workflow avoids avatar-provider generation, while any future voice session still has its own costs.

In video mode, reduced-motion preferences pause automatic playback but keep **Simular conversa** and manual playback available. Clicking either explicitly enables playback for the current page; reload or a change in the system preference resets that choice. **Parar simulação** stops both the sequence and the current video.

The simulation includes only states with loaded, playable clips. With both bundled assets ready, it runs **Escutando → Falando → Escutando**, skipping **Saudação** and the other missing states. On completion it pauses on **Repouso** if available, otherwise on the last displayed state.

The same tab also accepts static or animated **WebP**, including alpha transparency, up to 40 MB. WebP participates in the state simulation. Pausing or hiding it displays a still first-frame preview; resuming/restarting plays from the beginning. WebP speed and repeat count come from the file, so the video speed control is disabled for it. Manual WebP playback does not automatically return to idle on completion; use state selection or the timed simulation. These files stay browser-local too. See [Google's WebP documentation](https://developers.google.com/speed/webp/faq).

Start with `Mais presente`, repeat the same spoken phrase, then wait silently to observe idle behavior. Motion prompts are suggestions, so evaluate the actual video; they do not guarantee individual gestures. See the [Agora Lemon Slice guide](https://docs.agora.io/en/ai/platform/models/avatar/lemonslice) and [Lemon Slice plugin parameter guidance](https://docs.livekit.io/agents/models/avatar/plugins/lemonslice/). `pnpm run verify:api` includes the playground route contracts without creating real sessions.

### Main conversation

Profiles (`/profile/[id]`), material study and activity voice dialogs use the bundled local Lumi animations for both normal accounts and demo sessions. Microphone speech requests `lummi-transparente-02.webp` (listening); audible agent speech requests `lummi-falando-otimizada.webp` (speaking). Speaking starts immediately, even during a listening cycle. When an action ends, its current animation cycle finishes before switching to the latest requested state; silence then resumes the idle loop. Short gaps or resumed speech do not restart the cycle, and obsolete states are not queued. WebP cycle duration is read from its frame metadata and timed from image load; videos use their native end event. Conversation clips preload independently and only the displayed state animates. Reduced motion, hidden tabs, disconnected sessions, microphone mute during listening, blocked audio during speaking, and load failures cancel the wait. The still image is the fallback for missing, failed, or reduced-motion clips. Speech detection uses audio-level thresholds on existing RTC tracks, so background noise may affect it.

The welcome demo and profile selection show the animated Plush Lumi, which is also the default when a child starts a lesson without a saved avatar choice. The avatar picker at `/profile/:profileId/avatars` keeps the other catalog choices; a saved choice is used for later profile, material-study, and activity conversations. The shared demo family's avatar cannot be changed. Plush sends `avatar_mode: "local"` to `/api/invite-agent`, keeping the bundled idle/listening/speaking/sleeping animations and omitting Lemon Slice even when its key is configured. A selected non-Plush avatar sends `avatar_mode: "provider"` and `avatar_id`; Lemon Slice uses that avatar's dashboard agent when the optional server-only `NEXT_LEMONSLICE_API_KEY` is set, and otherwise the selected still image remains visible. Agora voice/STT/LLM/TTS remain active in either mode. Omitted provider settings retain the prior generic behavior. Animation pauses when the page is hidden; the system reduced-motion preference keeps local Plush motion still. The main app has no avatar motion button. Temporary playground uploads do not replace bundled conversation assets. `NEXT_LEMONSLICE_AGENT_ID` optionally overrides the Explorer avatar's dashboard agent; the Plush reference image is traced into standalone builds for explicit provider use.

Bundled WebP downloads are shared across the placeholder and live avatar, so starting a conversation does not cancel/restart them. A failed animation shows its still fallback and an error message; reloading the page retries the asset. Avatar and material-reading playback follows the system reduced-motion preference, regardless of older saved manual choices. The playground's own motion controls remain independent.

1. The browser requests an RTC + RTM token from `/api/generate-agora-token`.
2. The backend invites an Agora cloud agent with `/api/invite-agent`.
3. The browser joins the channel and publishes mic audio.
4. The client receives transcript, agent state, and `AGENT_METRICS` (per-stage latency) events over RTM.
5. On end, the client calls `/api/stop-conversation`, logs out RTM, and unmounts the call view so Agora React hooks clean up RTC publish/join and the local microphone track.

For uploaded study material, the browser sends multipart form data to `/api/materials` and keeps the result inside `/profile/:profileId`, preserving the header, forest layout and URL. During upload/analysis, Plush Lumi plays `lummi-lendo-transparente.webp` (118 frames, 3933 ms, 800 x 800, alpha) with **Carregando…** below it; the previous voice component unmounts and releases its session. After the response and the end of the current reading cycle (at least one full cycle for fast responses), the embedded study workspace starts a new grounded voice session with `profile_id`, `material_id`, and the child's selected avatar mode and ID. Processing cache hits are polled serially, with cancellation on exit, a two-minute timeout, and visible retry on failure. Reading loops during longer analysis; errors display immediately. Reduced motion, hidden tabs or animation failures bypass the animation wait; a 15-second asset timeout prevents stalls. File replacement and duplicate sends stay disabled through the final reading cycle. The child can complete the activity or choose **Enviar outra atividade** on the same page. Images and PDFs render in the study panel; history links still use `/profile/:profileId/materials/:materialId` and share that component. Uploads accept JPEG/PNG/WebP/PDF up to 10 MB and require a family session with an owned child profile, without an additional adult-password step. Family-wide history is available to the signed-in family session. Ending the voice session alone does not mark an activity complete.

The upload and embedded result panels share the same translucent green background and responsive styling, with light text for contrast.

Before sending a selected file or captured photo, **Remover** clears the attachment and any upload error, then focuses **Inserir arquivo** so another material can be chosen. Removal stays disabled during upload and the final reading cycle; it does not delete saved material history.


## Development commands

```bash
pnpm run dev          # start the local Next.js server
pnpm run lint         # run ESLint
pnpm run typecheck    # run TypeScript without emitting files
pnpm run verify:api   # verify API contracts
pnpm run build        # create a production build
pnpm run verify       # doctor + lint + typecheck + API checks + build
```

Run `pnpm run verify` before shipping changes. The `doctor` step requires a configured `.env.local`; lint, typecheck, API verification, and build can be run independently when live Agora credentials are unavailable.

## Main application routes

| Route | Purpose |
| --- | --- |
| `/` | Welcome, registration, sign-in, and development-only demo entry |
| `/profiles` | Family profile selection and adult-area entry |
| `/profile/[id]` | Child study-material upload and embedded study workspace |
| `/profile/[id]/history` | Material history for one child |
| `/profile/[id]/materials/[materialId]` | Saved-material study workspace opened from history |
| `/report` | Adult family progress report |

## Main API routes

| Endpoint | Purpose |
| --- | --- |
| `POST /api/login` | Family or demo authentication |
| `GET/POST /api/profiles` | Profile lookup and family/child creation |
| `/api/recordings` | Save, list, play and delete session recordings for the signed-in family |
| `GET/POST /api/materials` | Material history and authenticated upload/analysis |
| `GET/PATCH /api/materials/[id]` | Authorized material detail and explicit completion |
| `GET /api/materials/[id]/file` | Authorized private material bytes |
| `GET /api/generate-agora-token` | Combined RTC + RTM browser token |
| `POST /api/invite-agent` | Material-aware managed voice-agent startup |
| `POST /api/stop-conversation` | Idempotent managed agent shutdown |

## Repository map

- `app/` — Next.js pages, layouts, global styles, and API routes.
- `components/` — product UI, upload flows, study pages, RTC/RTM lifecycle, and voice controls.
- `lib/db.ts` — local family, session, completion, and material metadata persistence.
- `lib/material-extraction.ts` — multimodal schema, prompt, sanitization, and child-safe transcript generation.
- `lib/material-storage.ts` — private temporary file storage.
- `lib/study-materials.ts` — ownership, demo isolation, browser-safe DTOs, and retention cleanup.
- `lib/conversation.ts` — transcript normalization and agent visual-state mapping.
- `app/api/invite-agent/route.ts` — tutor instructions, VAD, managed provider pipeline, and agent startup.
- `components/ConversationComponent.tsx` — RTC join, microphone publication, transcript/state events, metrics, and renewals.
- `config/env/env.local.example` — local environment template.
- `data/lumi-db.json` — local runtime database; its generated contents should not be committed.
- `deploy/docker/` — standalone container build.
- `docs/ai/` — progressive-disclosure architecture and maintenance documentation.

## Production and deployment

The repository can be deployed as a single Next.js application. A production deployment must configure the three required environment variables and keep both secrets server-side.

The included GitHub workflows provide:

- CI verification through [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
- Production Vercel deployment through [`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml).
- Container verification through [`.github/workflows/docker.yml`](.github/workflows/docker.yml).

To build the standalone container locally:

```bash
docker build -f deploy/docker/Dockerfile -t lumi-by-agora .
```

The bundled JSON database and private filesystem cache are intended for local development or a persistent single-container deployment. They are not durable on serverless Vercel instances. Before a production launch, replace them with a persistent database and private object storage while preserving the ownership and retention boundaries in `lib/study-materials.ts`.

## Troubleshooting

- **Agent does not join:** verify the Agora environment with `pnpm run doctor` and inspect `/api/invite-agent`.
- **No transcript or agent state:** confirm the token route still uses `RtcTokenBuilder.buildTokenWithRtm`; an RTC-only token cannot authenticate RTM.
- **Material upload is rejected:** use a JPEG, PNG, WebP, or PDF whose contents match its declared type and is no larger than 10 MB.
- **Material analysis is unavailable:** confirm `OPENAI_API_KEY` is present in `.env.local` and restart the dev server.
- **The worksheet is unreadable:** upload a sharper photo taken from above with good lighting, or a shorter PDF containing only the activity pages.
- **Local data appears stale:** remember that file/text content expires according to `LUMI_MATERIAL_RETENTION_HOURS`, while metadata can remain for history.

## Further documentation

- [`AGENTS.md`](AGENTS.md) — contributor and coding-agent rules.
- [`docs/ai/L0_repo_card.md`](docs/ai/L0_repo_card.md) — repository identity and documentation index.
- [`docs/ai/RECIPE.md`](docs/ai/RECIPE.md) — quickstart extension points and invariants.
- [`docs/ai/L1/02_architecture.md`](docs/ai/L1/02_architecture.md) — runtime architecture.
- [`docs/ai/L1/L2/material_pipeline.md`](docs/ai/L1/L2/material_pipeline.md) — material ingestion and retention details.
- [`docs/ai/L1/L2/transcript_pipeline.md`](docs/ai/L1/L2/transcript_pipeline.md) — Agora transcript and RTM behavior.

## License

Released under the [MIT License](LICENSE).

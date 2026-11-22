# Agora Conversational AI Next.js Quickstart

[![Build](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-nextjs/actions/workflows/build-check.yml/badge.svg)](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-nextjs/actions/workflows/build-check.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)

Build a production-style voice agent in minutes with Next.js and the Agora Conversational AI Engine, including voice agent visualizer ([Agent UIKit](https://agoraio-conversational-ai.github.io/agent-uikit/)), live transcript, and real-time pipeline latency via `AGENT_METRICS` ([Agent Toolkit](https://github.com/AgoraIO-Conversational-AI/agent-client-toolkit-ts)).

## Prerequisites

- [Node.js 22+](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation)
- [Agora CLI](https://github.com/AgoraIO-Community/cli)

## Run It

Getting started is quick and easy: install the CLI _(skip if you already have it)_ , scaffold the Next.js quickstart using the Agora CLI, install dependencies, and run.

1. **Install the Agora CLI and sign in**
   _(skip if `agora` is already on your PATH)_:

   macOS and Linux:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/AgoraIO/cli/main/install.sh | sh -s -- --add-to-path
   ```

   Windows PowerShell:

   ```powershell
   irm https://dl.agora.io/cli/install.ps1 | iex
   ```

   If the Windows install command fails in PowerShell, try running the macOS/Linux command from [Git Bash](https://git-scm.com/downloads/win), then open a new terminal and run `agora --help` to confirm the CLI is on your PATH.

   Then verify and sign in:

   ```bash
   agora --help
   agora login
   ```

   If `agora --help` is not found after install, close and reopen your terminal, then try again. If it still fails, check that the installer-added Agora CLI location is on your shell `PATH`.

2. **Scaffold and run**
   `agora init` clones the starter, binds an Agora project, and writes `.env.local`. (replace `my-nextjs-demo` with your own project name):

   ```bash
   agora init my-nextjs-demo --template nextjs
   cd my-nextjs-demo
   pnpm install
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) and click **Start conversation**.

If the agent does not join or transcripts do not appear, run **`agora project doctor --deep`** to check credentials, feature enablement, network reachability, and local env binding.

### Working from a clone of this repository

Use this path if you already cloned **this** repo (for example to contribute or fork):

```bash
git clone https://github.com/AgoraIO-Conversational-AI/agent-quickstart-nextjs.git
cd agent-quickstart-nextjs
agora login
agora project use <your-project>
pnpm install
agora project env write .env.local
agora project doctor --deep
pnpm dev
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAgoraIO-Conversational-AI%2Fagent-quickstart-nextjs&project-name=agent-quickstart-nextjs&repository-name=agent-quickstart-nextjs&env=NEXT_PUBLIC_AGORA_APP_ID,NEXT_AGORA_APP_CERTIFICATE&envDescription=Agora%20credentials%20needed%20to%20run%20the%20app&envLink=https%3A%2F%2Fgithub.com%2FAgoraIO-Conversational-AI%2Fagent-quickstart-nextjs%23run-it&demo-title=Agora%20Conversational%20AI%20Next.js%20Quickstart&demo-description=Official%20Next.js%20quickstart%20for%20building%20browser-based%20voice%20AI%20with%20Agora&demo-image=https%3A%2F%2Fraw.githubusercontent.com%2FAgoraIO-Conversational-AI%2Fagent-quickstart-nextjs%2Fmain%2F.github%2Fassets%2FConversation-Ai-Client.gif)

To populate Vercel env vars from your bound Agora project:

```bash
agora project use <your-project>
agora project env write .env.local
rg "^(NEXT_PUBLIC_AGORA_APP_ID|NEXT_AGORA_APP_CERTIFICATE)=" .env.local
```

Copy those two values into Vercel Project Settings -> Environment Variables.

To deploy production on every push to `main` through GitHub Actions, configure these repository secrets:

| Secret | Value |
| --- | --- |
| `VERCEL_TOKEN` | A Vercel access token with access to the project. |
| `VERCEL_ORG_ID` | The `orgId` from `.vercel/project.json` after running `vercel link` locally. |
| `VERCEL_PROJECT_ID` | The `projectId` from the same file. |

The [deployment workflow](.github/workflows/deploy-vercel.yml) runs `vercel deploy --prod` on each push to `main`. Keep the Agora variables in Vercel Project Settings so they are available to the production build and server routes. If the Vercel Git integration is also deploying this project on pushes, disable its automatic deployments to avoid a second production deployment.

### Environment variables

Defined in [`config/env/env.local.example`](config/env/env.local.example).

| Variable                     | Required | Notes                                                            |
| ---------------------------- | :------: | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_AGORA_APP_ID`   |    ✅    | Agora Console → Project → App ID.                                |
| `NEXT_AGORA_APP_CERTIFICATE` |    ✅    | Agora Console → Project → App Certificate. **Server-side only.** |
| `OPENAI_API_KEY`             |    ✅    | OpenAI key used only by the material (homework) analysis route.  |
| `HOMEWORK_VISION_MODEL`      |    ➖    | Vision model for analysis and cache keys. Default `gpt-4.1-mini`. |
| `LUMI_MATERIAL_RETENTION_HOURS` | ➖ | Temporary file/text retention; defaults to 168 hours.             |

The default voice-agent configuration in [`app/api/invite-agent/route.ts`](app/api/invite-agent/route.ts) uses Agora-managed STT, LLM, and TTS. The separate study-material extraction workflow requires the OpenAI variable above.

## Commands

```bash
# Dev
pnpm dev                # start the Next.js dev server

# Quality
pnpm run lint           # eslint
pnpm run typecheck      # tsc --noEmit
pnpm run doctor         # local prereqs + env binding

# CI / pre-ship
pnpm run verify:api     # API contract checks
pnpm run build          # production build
pnpm run verify         # doctor + lint + typecheck + verify:api + build
```

Run `pnpm run verify` before shipping changes — it covers local prerequisites, lint, type safety, the core API route contracts, and the production build.

For another device on the same LAN, run `pnpm run dev --hostname 0.0.0.0 --port 3000` and open `http://<computer-ip>:3000`. Binding to `127.0.0.1` only permits this computer. HTTP over a LAN IP supports visual previews but not browser microphone access; use the existing `pnpm run dev:lan` HTTPS mode with a certificate trusted by the testing device for voice. A LAN address is not an internet deployment.

### Container build

The Docker build definition and its context-specific ignore file live together under `deploy/docker/`:

```bash
docker build -f deploy/docker/Dockerfile -t lumi-by-agora .
```

## Architecture

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/architecture/system-architecture-dark.svg">
  <img src="./docs/assets/architecture/system-architecture.svg" alt="System architecture">
</picture>

The browser fetches a combined RTC + RTM token (`buildTokenWithRtm`) from this app, joins the channel using a single RTC client, and uses RTM as the data channel for transcript, agent state, metrics, and error events. The Conversational AI Engine joins the same channel as the shared agent UID in [`lib/agora.ts`](lib/agora.ts) and runs the STT → LLM → TTS pipeline in Agora Cloud.

[`lib/agora-rtm-session.ts`](lib/agora-rtm-session.ts) owns one RTM instance and numeric UID per browser document, shared by Lumi, the base call screen and the live playground. It survives client navigation/Fast Refresh, serializes login/subscription/logout, and fetches fresh combined tokens for each channel using that UID. Identities are not stored across tabs. Agent invitation starts after RTM is ready; cancellation cleans up partial connections and stops late invite results. RTC hook ownership remains unchanged.

Participant UIDs use `1..2147483647`, excluding the agent/avatar IDs, as required by the Conversational AI join endpoint. The browser generator in `lib/agora.ts` constrains cryptographic random values to that range. Token requests above the limit and invalid invite participants return `400` before contacting Agora. Do not use the wider RTC-only uint32 range for this combined voice flow.

Lumi voice screens read the RTC connection snapshot as well as later events. Agent departure, RTC join failure, a 20-second connection wait, or a fatal voice-service event displays a recovery message and **Reconectar Lumi**, including inline profiles/materials. Retrying stays on the page, unmounts the old call through RTC hooks, stops its agent and releases its RTM lease before starting again. Duplicate retry clicks are locked; failed invites remain retryable instead of opening an empty call. SDK transport recovery clears the timeout. Diagnostic logs include only event source/code or departure reason, never conversation content.

Study-material images are uploaded to the authenticated `/api/materials` route. The server validates and hashes each image, reuses an unexpired extraction with the same profile, model, and prompt version, or sends the image to OpenAI for text extraction. The private file and extracted text expire automatically; metadata and completion state remain available to the child history and adult report.

## What You Get

The default resting mascot uses the supplied `lummi-idle-transparente.webp` (121 frames, 4033 ms, alpha) across welcome, profile selection, activities, parent report, voice placeholders/conversations and inactive material views. Standalone illustrations load only idle; voice views share the registered clips. Pause/reduced-motion controls and offscreen/hidden-tab pausing apply everywhere. Idle yields immediately to speech or sleep; reading keeps priority during material analysis. The playground includes the same idle and returns to it paused after simulation when loaded.

Local Lumi conversations sleep after 30 seconds without speech or page interaction, using the supplied `lummi-dormindo-transparente.webp` (121 frames, 4033 ms, 800 × 800, alpha). Speaking, pointer/key/input/scroll activity wakes the avatar immediately while RTC and the microphone remain connected. Hidden tabs reset the countdown; agent preparation, connection errors and blocked audio/microphone suspend sleep. The SDK resting states `idle`, `listening` and `silent` all allow the countdown; switching between them does not restart it. Actual RTC speech still wakes Lumi. Material analysis keeps its reading animation. The playground also offers manual **Dormindo** preview.

- browser voice client built with Next.js App Router
- RTC audio plus RTM transcript and state events
- server routes for token generation, invite, and stop
- [`AgentVisualizer`](https://agoraio-conversational-ai.github.io/agent-uikit/) for agent state and a built-in transcript panel for live turns
- per-stage latency header driven by `AGENT_METRICS`
- Agora-managed default STT, LLM, and TTS configuration
- private image upload, cached OpenAI homework analysis, study history, and parent-visible completion state

## How It Works

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

Profiles (`/profile/[id]`), material study and activity voice dialogs use the bundled local Lumi animations for both normal accounts and demo sessions. Microphone speech requests `lummi-transparente-02.webp` (listening); audible agent speech requests `lummi-falando-otimizada.webp` (speaking). Speaking starts immediately, even during a listening cycle. When an action ends, its current animation cycle finishes before switching to the latest requested state; silence then resumes the idle loop. Short gaps or resumed speech do not restart the cycle, and obsolete states are not queued. WebP cycle duration is read from its frame metadata and timed from image load; videos use their native end event. Conversation clips preload independently and only the displayed state animates. Explicit pause, hidden tabs, disconnected sessions, microphone mute during listening, blocked audio during speaking, and load failures cancel the wait. The still image is the fallback for missing, failed, paused, or reduced-motion clips. Speech detection uses audio-level thresholds on existing RTC tracks, so background noise may affect it.

Profiles, material study and activity voice dialogs send `avatar_mode: "local"` to `/api/invite-agent`, which omits Lemon Slice even when its key is configured. Agora voice/STT/LLM/TTS remain active. Omitted or `"provider"` mode preserves the previous provider behavior for other callers and provider experiments. Animation pauses when the page is hidden; reduced-motion preferences start it still, and the animation button can enable/pause movement without muting voice. Temporary playground uploads do not replace bundled conversation assets.

Bundled WebP downloads are shared across the placeholder and live avatar, so starting a conversation does not cancel/restart them. A failed animation shows **Recarregar**, which downloads the files again. **Animar Lumi** is visible when movement is disabled; an explicit play/pause choice is kept in this tab's `sessionStorage` across remounts and reloads, and cleared when the system motion preference changes. Avatar and reading players share the preference helper. This update clears the old saved pause once (`lumi-avatar-motion` → `lumi-avatar-motion-v2`), while preserving explicit motion opt-in and reduced-motion preferences. New pauses remain persistent. **Animar Lumi** means motion is disabled; it resumes playback directly. The playground's own motion controls remain independent.

1. The browser requests an RTC + RTM token from `/api/generate-agora-token`.
2. The backend invites an Agora cloud agent with `/api/invite-agent`.
3. The browser joins the channel and publishes mic audio.
4. The client receives transcript, agent state, and `AGENT_METRICS` (per-stage latency) events over RTM.
5. On end, the client calls `/api/stop-conversation`, logs out RTM, and unmounts the call view so Agora React hooks clean up RTC publish/join and the local microphone track.

For uploaded study material, the browser sends multipart form data to `/api/materials` and keeps the result inside `/profile/:profileId`, preserving the header, forest layout and URL. During upload/analysis, Lumi plays `lummi-lendo-transparente.webp` (118 frames, 3933 ms, 800 x 800, alpha) with **Carregando…** below it; the previous voice component unmounts and releases its session. After the response and the end of the current reading cycle (at least one full cycle for fast responses), the embedded study workspace starts a new grounded voice session with `profile_id`, `material_id` and `avatar_mode: "local"`. Processing cache hits are polled serially, with cancellation on exit, a two-minute timeout, and visible retry on failure. Reading loops during longer analysis; errors display immediately. Paused/reduced motion, hidden tabs or animation failures bypass the animation wait; a 15-second asset timeout prevents stalls. File replacement and duplicate sends stay disabled through the final reading cycle. The child can complete the activity or choose **Enviar outra atividade** on the same page. Images and PDFs render in the study panel; history links still use `/profile/:profileId/materials/:materialId` and share that component. Uploads accept JPEG/PNG/WebP/PDF up to 10 MB and require a family session with an owned child profile, without an additional adult-password step. Family-wide history remains protected by adult verification. Ending the voice session alone does not mark an activity complete.

The upload and embedded result panels share the same translucent green background and responsive styling, with light text for contrast.

## Optional BYOK

The base `.env.local` contract contains only Agora credentials. If you are migrating from a supported provider, uncomment the matching snippet in [`app/api/invite-agent/route.ts`](app/api/invite-agent/route.ts) and add its variables to your local environment.

```bash
# Deepgram STT
NEXT_DEEPGRAM_API_KEY=...

# OpenAI-compatible LLM
NEXT_LLM_URL=https://api.openai.com/v1/chat/completions
NEXT_LLM_API_KEY=...

# ElevenLabs TTS
NEXT_ELEVENLABS_API_KEY=...
NEXT_ELEVENLABS_VOICE_ID=...
```

## Repo Map

- `app/api/generate-agora-token/route.ts` — issues RTC + RTM tokens
- `app/api/invite-agent/route.ts` — starts the agent session and configures the pipeline
- `app/api/stop-conversation/route.ts` — stops the agent session
- `app/api/materials/route.ts` — uploads, validates, deduplicates, extracts, and lists study material
- `app/api/materials/[id]/route.ts` — returns material detail and records completion
- `app/profile/[id]/history/page.tsx` — child material history
- `app/profile/[id]/materials/[materialId]/page.tsx` — study workspace with the uploaded image and local Lumi animations
- `config/env/env.local.example` — tracked local environment template
- `deploy/docker/` — container build definition and Docker-specific ignore rules
- `docs/assets/architecture/` — light and dark architecture diagrams
- `docs/CONTRIBUTING.md` — contributor setup and conventions
- `components/LandingPage.tsx` — entry point: token fetch, RTM login, conversation lifecycle
- `components/ConversationComponent.tsx` — RTC client, transcript state, `AGENT_METRICS`, mic release
- `components/QuickstartConversationLayout.tsx` — in-call header, transcript rail, controls dock
- `components/QuickstartPipelineMetrics.tsx` — per-stage latency chips in the header
- `components/QuickstartTranscriptPanel.tsx` — live transcript rail
- `components/QuickstartPreCallCard.tsx` — pre-call hero card
- `lib/chat-completions.ts` — server-side custom LLM SSE handler used by the chat completions route
- `lib/conversation.ts` — transcript normalization and visualizer state mapping
- `lib/material-extraction.ts` — server-only OpenAI multimodal extraction client
- `lib/material-storage.ts` — private temporary file-cache adapter
- `AGENTS.md` — primary agent-facing guide

Files such as `.npmrc`, `.nvmrc`, `.vercelignore`, `vercel.json`, `next.config.mjs`, and `package.json` intentionally remain at the project root because their tools discover them there.

## Troubleshooting

- **Agent does not join or transcripts are missing:** run `agora project doctor --deep`.
- **`pnpm run doctor` fails:** run `agora project env write .env.local`, then retry.
- **Manual clone / env values:** `agora project use <your-project>` then `agora project env write .env.local`.
- **RTM login fails:** keep [`app/api/generate-agora-token/route.ts`](app/api/generate-agora-token/route.ts) on `RtcTokenBuilder.buildTokenWithRtm` — RTC-only tokens will not satisfy `rtm.login`.
- **RTM `Ins id is 2` / mutual-kick warning:** the installed SDK reports repeated construction even after logout. Use the shared session manager rather than constructing RTM in components; see [Agora's RTM lifecycle reference](https://docs.agora.io/en/api-reference/api-ref/signaling/web). After installing this lifecycle fix in a running dev browser, fully reload once to discard instances created by the old code. `verify:api` covers reuse, cancellation, partial failures, stale cleanup and serialized logout; these checks do not open paid sessions.
- **Transcript speakers inverted:** check the `uid === "0"` remap in [`components/ConversationComponent.tsx`](components/ConversationComponent.tsx).
- **Agent never appears in channel:** ensure the shared agent UID in [`lib/agora.ts`](lib/agora.ts) is used by both the client and invite route.

## More Docs

- [docs/ai/L0_repo_card.md](./docs/ai/L0_repo_card.md)
- [docs/ai/RECIPE.md](./docs/ai/RECIPE.md)
- [AGENTS.md](./AGENTS.md)

## Contributing

Pull requests welcome — see [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development setup and conventions.

## Security

Uploaded school material can contain personal information. Files are stored outside `public/`, OpenAI credentials remain server-only, demo uploads are isolated by session, and expired content is purged lazily. The bundled JSON database and filesystem cache are for local/container development; use durable private object storage and a persistent database before deploying this workflow to serverless Vercel production.

Please do **not** open public issues for security reports. Email security@agora.io with details and reproduction steps.

## License

Released under the [MIT License](./LICENSE).

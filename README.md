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

Defined in [`env.local.example`](env.local.example).

| Variable                     | Required | Notes                                                            |
| ---------------------------- | :------: | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_AGORA_APP_ID`   |    ✅    | Agora Console → Project → App ID.                                |
| `NEXT_AGORA_APP_CERTIFICATE` |    ✅    | Agora Console → Project → App Certificate. **Server-side only.** |

The default agent configuration in [`app/api/invite-agent/route.ts`](app/api/invite-agent/route.ts) uses Agora-managed STT, LLM, and TTS, so no extra vendor API keys are required for the base quickstart.

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

## Architecture

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./system-architecture-dark.svg">
  <img src="./system-architecture.svg" alt="System architecture">
</picture>

The browser fetches a combined RTC + RTM token (`buildTokenWithRtm`) from this app, joins the channel using a single RTC client, and uses RTM as the data channel for transcript, agent state, metrics, and error events. The Conversational AI Engine joins the same channel as the shared agent UID in [`lib/agora.ts`](lib/agora.ts) and runs the STT → LLM → TTS pipeline in Agora Cloud.

## What You Get

- browser voice client built with Next.js App Router
- RTC audio plus RTM transcript and state events
- server routes for token generation, invite, and stop
- [`AgentVisualizer`](https://agoraio-conversational-ai.github.io/agent-uikit/) for agent state and a built-in transcript panel for live turns
- per-stage latency header driven by `AGENT_METRICS`
- Agora-managed default STT, LLM, and TTS configuration

## How It Works

### Lumi animation playground

Open [http://localhost:3000/playground/lumi-animation](http://localhost:3000/playground/lumi-animation) after `pnpm run dev`.
This standalone lab adds no navigation or styling changes to the main Lumi experience.

- **Vídeos por estado (default):** opens on **Falando** with the supplied 8-second clip at `public/assets/lumi/states/speaking.mp4`, looping and muted. This original clip has a pink background. Load local WebM/MP4/MOV overrides for any state, preview loops and one-shot actions, pause/replay, inspect backgrounds, and simulate a conversation without API calls. Local overrides stay in page memory across playground tabs; reload restores bundled defaults. A speaking override can also be reset with **Restaurar vídeo padrão**. The remaining states await videos. See the [Lumi video production guide](docs/lumi-video-states.md) for the six-state brief and alpha formats.
- **Local 2D:** preview breathing, listening, thinking, speaking and celebration body motions; adjust intensity/speed, pause, play a sequence and compare with the original image. This is a silent motion study, not lip sync or a prediction of Lemon Slice output. Device reduced-motion preferences are respected.
- **Lemon Slice:** compare the current prompt with `Mais presente` and `Expressiva`, edit speaking/idle prompts, choose an aspect ratio, then explicitly start a real test conversation. Each test uses its own `lumi-animation-*` channel and ends when its dialog closes. Tests consume Agora/Lemon Slice account usage.
- **Exportar ajustes:** download the local motion values and Lemon Slice parameters as JSON. Exporting does not apply anything to the main app.

Local preview needs no credentials. Live tests require the existing Agora variables plus the optional server-only `NEXT_LEMONSLICE_API_KEY` in `.env.local`; restart the server after changing it. No key is entered in the browser. The separate `/api/playground/lumi-animation` route uses the existing Lumi image and a fixed test greeting for comparisons. It leaves `/api/invite-agent` unchanged.

Video states are currently simulated, not wired to real Agora state events. Ordinary MP4 does not automatically provide a transparent background; deliver WebM with alpha and an HEVC-alpha variant for compatible Safari devices. The player does not remove backgrounds or convert formats. Clips are muted; the speaking loop is not phoneme lip sync. The video workflow avoids avatar-provider generation, while any future voice session still has its own costs.

In video mode, reduced-motion preferences pause automatic playback but keep **Simular conversa** and manual playback available. Clicking either explicitly enables playback for the current page; reload or a change in the system preference resets that choice. **Parar simulação** stops both the sequence and the current video.

The simulation includes only states with loaded, playable clips. With the bundled asset alone, it starts directly on **Falando** and skips **Saudação** and the other missing states. On completion it pauses on **Repouso** if available, otherwise on the last displayed state.

The same tab also accepts static or animated **WebP**, including alpha transparency, up to 40 MB. WebP participates in the state simulation. Pausing or hiding it displays a still first-frame preview; resuming/restarting plays from the beginning. WebP speed and repeat count come from the file, so the video speed control is disabled for it. Manual WebP playback does not automatically return to idle on completion; use state selection or the timed simulation. These files stay browser-local too. See [Google's WebP documentation](https://developers.google.com/speed/webp/faq).

Start with `Mais presente`, repeat the same spoken phrase, then wait silently to observe idle behavior. Motion prompts are suggestions, so evaluate the actual video; they do not guarantee individual gestures. See the [Agora Lemon Slice guide](https://docs.agora.io/en/ai/platform/models/avatar/lemonslice) and [Lemon Slice plugin parameter guidance](https://docs.livekit.io/agents/models/avatar/plugins/lemonslice/). `pnpm run verify:api` includes the playground route contracts without creating real sessions.

### Main conversation

1. The browser requests an RTC + RTM token from `/api/generate-agora-token`.
2. The backend invites an Agora cloud agent with `/api/invite-agent`.
3. The browser joins the channel and publishes mic audio.
4. The client receives transcript, agent state, and `AGENT_METRICS` (per-stage latency) events over RTM.
5. On end, the client calls `/api/stop-conversation`, logs out RTM, and unmounts the call view so Agora React hooks clean up RTC publish/join and the local microphone track.

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
- `components/LandingPage.tsx` — entry point: token fetch, RTM login, conversation lifecycle
- `components/ConversationComponent.tsx` — RTC client, transcript state, `AGENT_METRICS`, mic release
- `components/QuickstartConversationLayout.tsx` — in-call header, transcript rail, controls dock
- `components/QuickstartPipelineMetrics.tsx` — per-stage latency chips in the header
- `components/QuickstartTranscriptPanel.tsx` — live transcript rail
- `components/QuickstartPreCallCard.tsx` — pre-call hero card
- `lib/chat-completions.ts` — server-side custom LLM SSE handler used by the chat completions route
- `lib/conversation.ts` — transcript normalization and visualizer state mapping
- `AGENTS.md` — primary agent-facing guide

## Troubleshooting

- **Agent does not join or transcripts are missing:** run `agora project doctor --deep`.
- **`pnpm run doctor` fails:** run `agora project env write .env.local`, then retry.
- **Manual clone / env values:** `agora project use <your-project>` then `agora project env write .env.local`.
- **RTM login fails:** keep [`app/api/generate-agora-token/route.ts`](app/api/generate-agora-token/route.ts) on `RtcTokenBuilder.buildTokenWithRtm` — RTC-only tokens will not satisfy `rtm.login`.
- **Transcript speakers inverted:** check the `uid === "0"` remap in [`components/ConversationComponent.tsx`](components/ConversationComponent.tsx).
- **Agent never appears in channel:** ensure the shared agent UID in [`lib/agora.ts`](lib/agora.ts) is used by both the client and invite route.

## More Docs

- [docs/ai/L0_repo_card.md](./docs/ai/L0_repo_card.md)
- [docs/ai/RECIPE.md](./docs/ai/RECIPE.md)
- [AGENTS.md](./AGENTS.md)

## Contributing

Pull requests welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and conventions.

## Security

Please do **not** open public issues for security reports. Email security@agora.io with details and reproduction steps.

## License

Released under the [MIT License](./LICENSE).

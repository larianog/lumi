# 01 Setup

> Environment setup, commands, and safe verification flow for this quickstart.

## Runtime Requirements

- Node.js `>=22` (`package.json` engines field).
- `pnpm` package manager.
- Agora CLI (`agora`) for project binding and environment bootstrap.
- Agora project with Conversational AI enabled.

Install the Agora CLI from the root `README.md` instructions. On Windows, use the PowerShell installer first; if it fails, run the shell installer from Git Bash and then verify with `agora --help`.

## Install and Bootstrap

1. Install dependencies.
2. Bind an Agora project.
3. Write `.env.local`.
4. Verify setup before running.

```bash
pnpm install
agora login
agora project use <your-project>
agora project env write .env.local
agora project doctor --deep
```

## Required Environment Variables

- `NEXT_PUBLIC_AGORA_APP_ID`: Agora project App ID.
- `NEXT_AGORA_APP_CERTIFICATE`: Agora App Certificate (server only).
- `OPENAI_API_KEY`: OpenAI key for homework (material) analysis (server only).
- `HOMEWORK_VISION_MODEL`: optional vision model (default `gpt-4.1-mini`); also participates in the extraction cache key.

Optional material setting: `LUMI_MATERIAL_RETENTION_HOURS` (168-hour default). The tracked template is `config/env/env.local.example`; agent behavior defaults live in code, and optional voice BYOK examples are documented later in the root README.

## Primary Commands

```bash
pnpm run dev
pnpm run lint
pnpm run typecheck
pnpm run verify:api
pnpm run build
pnpm run verify
```

## Verification Safety

Safe without live session:

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run verify:api`
- `pnpm run build`

Requires env/project binding:

- `pnpm run doctor`
- `pnpm run verify`

## Local Run Notes

- App + API routes run at `http://localhost:3000`.
- Session starts from `QuickstartPreCallCard` (`Try it now`) and bootstraps token + RTM + invite flow.
- If transcript or agent join fails, first run `agora project doctor --deep`.

## CI Expectations

- `pnpm/action-setup` reads the pnpm version from `package.json`; do not also set its `version` input.
- CI runs lint, typecheck, API contracts, and build without `doctor` or application credentials. Run `doctor` locally with a configured `.env.local`.
- Both Dockerfile install stages pin the same pnpm version as `package.json`.
- Build workflow badge exists in root `README.md`.
- Pre-ship expectation: `pnpm run verify` passes.
- Route contract tests are executed by `scripts/verify-api-contracts.ts`.

## Troubleshooting Matrix

| Symptom | Probable Cause | First Check | Fix Path |
| --- | --- | --- | --- |
| Agent never joins | Invite route or env mismatch | `pnpm run doctor` and invite route logs | Verify the shared agent UID and invite payload |
| Transcript missing | RTM token capability missing | Token route implementation | Ensure `buildTokenWithRtm` remains unchanged |
| `verify` fails at doctor | Project not bound | `agora project use` output | Re-bind project and rewrite `.env.local` |
| Mic publishes but no agent response | Agent start failed | UI warning (`agentJoinError`) | Inspect `/api/invite-agent` response |
| Material extraction fails | `OPENAI_API_KEY`/model or unsupported image | `/api/materials` response | Check OpenAI variable and use JPEG/PNG/WebP or PDF up to 10 MB |

## Local-Only vs Deploy-Specific

Local:

- Uses `.env.local` created by `agora project env write`.
- Add the OpenAI variable after the Agora CLI writes the file; the CLI does not manage them.
- Uses the default Next.js Turbopack development server via `next dev`.
- Best for flow debugging and transcript behavior checks.

Vercel:

- Requires environment vars configured per environment scope.
- Requires durable database and private object storage adapters for production material history; the bundled JSON/filesystem adapters are local/container oriented.
- Keep `NEXT_AGORA_APP_CERTIFICATE` private server variable.
- Use `pnpm run build` locally before pushing deployment changes.
- `.github/workflows/deploy-vercel.yml` deploys to production on pushes to `main` using `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` GitHub repository secrets.
- Avoid a second deployment from the Vercel Git integration when using the Actions workflow.

## Setup Change Checklist

When setup docs/config change:

1. Update `README.md` environment/commands sections.
2. Update `config/env/env.local.example` if variable set changes.
3. Update `docs/ai/L1/01_setup.md` and `L0_repo_card.md` `Last Reviewed`.
4. Run at least `pnpm run typecheck` and `pnpm run verify:api`.

## Related Deep Dives

- [conversation_lifecycle.md](L2/conversation_lifecycle.md) — Full start/join/teardown sequence.
- [transcript_pipeline.md](L2/transcript_pipeline.md) — RTM transcript/event pipeline internals.

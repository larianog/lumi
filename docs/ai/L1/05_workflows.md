# 05 Workflows

> Repeatable task recipes for common quickstart changes and validation loops.

## Run Locally

1. `pnpm install`
2. `agora login`
3. `agora project use <your-project>`
4. `agora project env write .env.local`
5. `pnpm run doctor`
6. `pnpm run dev`

If start fails, run `agora project doctor --deep`.

## Change Agent Behavior

To use local animations during an actual voice session, open a child profile such as `/profile/demo-lia` after signing into the demo. Profile pages request `avatarMode="local"`: no speech is stationary, user speech plays `lummi-transparente-02.webp`, and audible agent speech plays `lummi-transparente.webp`. Enable the mic and allow browser audio as needed. Both clips are bundled; a temporary playground upload is not deployed to profiles. Other callers keep provider avatars by default. Validate with `pnpm run verify:api` and `pnpm run verify`; do not start paid sessions during automated checks.

If the profile remains on its still fallback, use **Animar Lumi** when motion is paused, or **Recarregar** when file loading failed. The latter refetches files instead of only replaying an unavailable clip. Explicit motion choices persist in this tab across placeholder/live remounts and reload, until the system motion preference changes. Test remounts while downloads are pending, failed-load recovery, and actual frame changes with the real Next Image component; avoid replacing the image renderer with a stub for lifecycle regression checks.

For motion experiments only, visit `/playground/lumi-animation`. Compare `Atual`, `Mais presente`, and `Expressiva` using the same phrase and a silent interval. Live tests require optional server-only Lemon Slice credentials and consume provider usage. Close each test before changing prompts. Export downloads a JSON recipe; it does not update the main agent. Local controls simulate body motion only, without audio or lip sync. Run `pnpm run verify:api` for the added endpoint and `pnpm run verify` before shipping.

For prerecorded animations, use the default **Vídeos por estado** tab, which opens on the supplied speaking WebP; listening also has a bundled WebP (each 192 frames, about 8 seconds, alpha), looping as encoded. Import local overrides, inspect backgrounds, and simulate a conversation without paid sessions. Simulation skips states without loaded, playable clips: with both defaults ready it runs listening → speaking → listening. Completion pauses on available idle or the last displayed state. Local overrides are memory-only; reset/reload restores bundled defaults. To ship another default, add its asset under `public/assets/lumi/states/` and register its metadata in `BUNDLED_LUMI_VIDEO_CLIPS`. Produce remaining assets using [the video brief](../../lumi-video-states.md); the exported manifest is a production guide rather than a video archive.

The same upload control also accepts WebP (static/animated, with optional alpha), up to 40 MB. WebP joins the timed state simulation; pause displays its first frame and resume/replay restarts it. Speed and repeats come from the file, with no automatic manual ended-to-idle transition. See the video brief for these format-specific controls.

Target file: `app/api/invite-agent/route.ts`.

Typical edits:

- System prompt (`ADA_PROMPT`).
- Greeting default (`GREETING`).
- Shared agent UID (`DEFAULT_AGENT_UID` in `lib/agora.ts`).
- VAD (`turnDetection.config.*`).
- STT/LLM/TTS model/provider blocks.

Validation path:

1. `pnpm run lint`
2. `pnpm run typecheck`
3. `pnpm run verify:api`
4. `pnpm run build`

## Change Token or Session Bootstrap

Token behavior:

- Edit `app/api/generate-agora-token/route.ts`.
- Preserve RTM-capable token generation.

Bootstrap behavior:

- Edit `components/LandingPage.tsx`.
- Keep invite + RTM setup parallelized before conversation mount.

## Change Transcript Rendering

1. Update transforms in `lib/conversation.ts`.
2. Update wiring in `components/ConversationComponent.tsx`.
3. Ensure `IN_PROGRESS` is separated from history, `INTERRUPTED` retained in history.
4. Re-check [transcript_pipeline.md](L2/transcript_pipeline.md) for consistency.

## Change Study Material Extraction

1. Update provider request/prompt handling in `lib/material-extraction.ts`.
2. Increment `MATERIAL_EXTRACTION_PROMPT_VERSION` when extraction semantics change so stale text is not reused.
3. Keep upload validation and authenticated ownership in `app/api/materials/route.ts`.
4. Keep Lumi grounding server-side through optional `profile_id` + `material_id` fields on `/api/invite-agent`.
5. Test first upload, cache hit, failure, expiry, demo isolation, completion, child history, and adult report.
6. Run lint, typecheck, API contracts, and build.

The bundled JSON database and `data/material-cache/` adapter are suitable for local or persistent-container development. Select durable database/private object storage adapters before serverless production deployment.

After a didactic upload, the profile page embeds `MaterialStudyPageClient` in place of the submission controls. The profile header's **Voltar** action restores the submission view. Saved materials from history still use `/profile/[id]/materials/[materialId]`.

## Ship-Readiness Workflow

1. Run `pnpm run verify`.
2. Confirm docs alignment (`README`, guides, `AGENTS`, `docs/ai`).
3. Use conventional commit and branch naming.

## Deploy to Vercel from GitHub Actions

1. Link the Vercel project locally with `vercel link` to obtain `orgId` and `projectId` from `.vercel/project.json`.
2. Set GitHub repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
3. Set `NEXT_PUBLIC_AGORA_APP_ID` and `NEXT_AGORA_APP_CERTIFICATE` in the Vercel project's Production environment.
4. Push to `main`; `.github/workflows/deploy-vercel.yml` runs `vercel deploy --prod`.

## Build the Container Image

The Dockerfile and its Dockerfile-specific ignore rules are colocated under `deploy/docker/`. Keep the repository root as the build context:

```bash
docker build -f deploy/docker/Dockerfile -t lumi-by-agora .
```

## Progressive Disclosure Doc Workflow

- `generate docs`: create `docs/ai/` tree when absent.
- `update docs`: refresh after workflow/interface/security changes.
- `test docs`: execute question-based validation and write `docs/ai/test-results.md`.
- `fix docs`: close findings from `docs/ai/test-results.md` or a docs review.

## Workflow: Implement a Baseline Recipe Repo

1. Treat this repo as the official Agora Next.js quickstart baseline.
2. Do not recreate Agora ConvoAI integration from memory.
3. Follow [from_scratch_bootstrap.md](L2/from_scratch_bootstrap.md) for the implementation map and checklist.
4. Preserve the recipe invariants in `docs/ai/RECIPE.md`.
5. Run the verification commands before publishing a derivative.

## Workflow: Add a New API Route

1. Add route under `app/api/<route-name>/route.ts`.
2. Define payload types in `types/conversation.ts` if shared with client.
3. Add/update contract verification in `scripts/verify-api-contracts.ts`.
4. Run `pnpm run verify:api` and `pnpm run typecheck`.
5. Update `README.md` and `docs/ai/L1/06_interfaces.md`.

Material routes also require session ownership tests and must never expose storage keys or extracted content in list responses.

## Workflow: Modify Transcript UX

1. Update transforms in `lib/conversation.ts`.
2. Update render usage in transcript/layout components.
3. Validate edge states (`IN_PROGRESS`, `INTERRUPTED`, empty history).
4. Reconcile guidance in [transcript_pipeline.md](L2/transcript_pipeline.md).
5. Run `pnpm run lint` and `pnpm run build`.

## Workflow: Enable BYOK Provider Path

1. Uncomment relevant provider block in invite route.
2. Add the provider variables shown in the lower README BYOK section to your local environment.
3. Keep default no-key path intact for baseline quickstart behavior.
4. Keep provider variables out of `config/env/env.local.example`; they are not part of the base contract.
5. Re-run `pnpm run verify` before shipping.

## Workflow: Docs Refresh After Runtime Changes

1. Update L1 files matching changed subsystem.
2. Update or add L2 deep dives if L1 explanation exceeds concise bounds.
3. Bump `Last Reviewed` in `L0_repo_card.md`.
4. Re-run docs test and append retest notes for any fixes.

## Related Deep Dives

- [conversation_lifecycle.md](L2/conversation_lifecycle.md) — Full runtime sequence for bootstrap and teardown tasks.
- [from_scratch_bootstrap.md](L2/from_scratch_bootstrap.md) — Baseline implementation checklist for recipe consumers.
- [transcript_pipeline.md](L2/transcript_pipeline.md) — Required checks when editing transcript flow.

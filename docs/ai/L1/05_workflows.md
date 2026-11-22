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

To use local Plush animations during an actual voice session, open a child profile such as `/profile/demo-lia` after signing into the demo. Missing avatar choices request `avatarMode="local"`: no speech plays the idle loop, user speech plays `lummi-transparente-02.webp`, and audible agent speech plays `lummi-falando-otimizada.webp`. Enable the mic and allow browser audio as needed. Any child, including one in the demo, can choose another avatar at `/profile/[id]/avatars`; later profile, material, and activity calls request that catalog provider avatar. Demo choices are isolated to that browser session. Both Plush clips are bundled; a temporary playground upload is not deployed to profiles. Other callers keep provider avatars by default. Validate with `pnpm run verify:api` and `pnpm run verify`; do not start paid sessions during automated checks.

If the profile remains on its still fallback, check the system reduced-motion preference. A failed file load shows an error status; reload the page to retry the asset. Test remounts while downloads are pending, failure fallback, and actual frame changes with the real Next Image component; avoid replacing the image renderer with a stub for lifecycle regression checks.

For motion experiments only, visit `/playground/lumi-animation`. Compare `Atual`, `Mais presente`, and `Expressiva` using the same phrase and a silent interval. Live tests require optional server-only Lemon Slice credentials and consume provider usage. Close each test before changing prompts. Export downloads a JSON recipe; it does not update the main agent. Local controls simulate body motion only, without audio or lip sync. Run `pnpm run verify:api` for the added endpoint and `pnpm run verify` before shipping.

For prerecorded animations, use the default **Vídeos por estado** tab, which opens on the supplied speaking WebP (143 frames, about 6 seconds); listening also has a bundled WebP (192 frames, about 8 seconds). Both have alpha and loop as encoded. Reading is also available for manual preview (118 frames, 3933 ms), used during material analysis. Import local overrides, inspect backgrounds, and simulate a conversation without paid sessions. Simulation skips states without loaded, playable clips: with both defaults ready it runs listening → speaking → listening. Completion pauses on available idle or the last displayed state. Local overrides are memory-only; reset/reload restores bundled defaults. To ship another default, add its unchanged asset under `public/assets/lumi/states/` using a new URL to bypass cached blobs and register its metadata in `BUNDLED_LUMI_VIDEO_CLIPS`; update bundled timing expectations. The optional `fit` field controls framing and defaults to `contain`. Produce remaining assets using [the video brief](../../lumi-video-states.md); the exported manifest is a production guide rather than a video archive.

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
- Acquire a shared RTM lease and await login/subscription before inviting the agent. Mount the conversation only after bootstrap. Release through the handle on stop/unmount; never log out a shared client directly. Verify sequential sessions, StrictMode auto-start, cancellation during token/login/invite, and late cleanup without live credentials.

## Change Transcript Rendering

1. Update transforms in `lib/conversation.ts`.
2. Update wiring in `components/ConversationComponent.tsx`.
3. Ensure `IN_PROGRESS` is separated from history, `INTERRUPTED` retained in history.
4. Re-check [transcript_pipeline.md](L2/transcript_pipeline.md) for consistency.

## Change Study Material Extraction

Before upload, **Remover** clears a selected file or camera photo and its error/warning, with keyboard focus returning to **Inserir arquivo**. Verify removal, selecting the same file again, and removal after a failed upload. Removal is locked during the request and the final reading cycle; existing history is unaffected.

1. Update provider request/prompt handling in `lib/material-extraction.ts`.
2. Increment `MATERIAL_EXTRACTION_PROMPT_VERSION` when extraction semantics change so stale text is not reused.
3. Keep upload validation and authenticated ownership in `app/api/materials/route.ts`.
4. Keep Lumi grounding server-side through optional `profile_id` + `material_id` fields on `/api/invite-agent`.
5. Test first upload, processing/ready cache hits, upload/poll failures and retry, expiry, demo isolation, completion, child history, and adult report. Assert that upload/result/completion/new-activity stay on the profile URL; the caption sits below the reading avatar, duplicate uploads are blocked, and navigation cancels pending work. Include image/PDF and mobile previews. Verify fast API success waits for one loaded reading cycle, slow success finishes the current cycle, and grounded voice starts only afterwards. Check processing/retry, API and animation failures, stalled asset loading, pause/reduced motion, hidden tabs and navigation cleanup.
6. Run lint, typecheck, API contracts, and build.

The two-step sign-up form posts an adult account first, then up to eight child profiles in one request. The lesson page displays child-safe question cards, answer blanks and a private original-file viewer; spoken or typed answers can be checked with Lumi.

The bundled JSON database and `data/material-cache/` adapter are suitable for local or persistent-container development. Select durable database/private object storage adapters before serverless production deployment.

After a didactic upload, the profile page embeds `MaterialStudyPageClient` in place of the submission controls. Its **Voltar ao perfil** action restores the submission view. Saved materials from history still use `/profile/[id]/materials/[materialId]`.

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
When changing the `packageManager` version, update both Dockerfile install stages to match.

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

- For a profile stuck at **Lumi está chegando**, inspect RTC join/service events and use **Reconectar Lumi**. Agent departures, failed joins/invites and connection waits over 20 seconds expose recovery on the same page. Verify cleanup, duplicate-click locking and reuse of the document's RTM instance with mocked services; live voice still needs microphone/audio permissions and an available provider.

- [conversation_lifecycle.md](L2/conversation_lifecycle.md) — Full runtime sequence for bootstrap and teardown tasks.
- [from_scratch_bootstrap.md](L2/from_scratch_bootstrap.md) — Baseline implementation checklist for recipe consumers.
- [transcript_pipeline.md](L2/transcript_pipeline.md) — Required checks when editing transcript flow.

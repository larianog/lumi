# Study Material Pipeline

> End-to-end contract for private material upload, text extraction, grounded voice study, and completion history.

## Sequence

1. `app/profile/[id]/page.tsx` sends `profileId` and an image/PDF as multipart form data to `POST /api/materials`. Before sending, **Remover** clears the local file/photo selection and upload feedback, returning focus to the file picker button. It is disabled during upload and the final reading cycle and does not delete server records.
2. The route authenticates the family session, confirms an owned child profile, caps the file at 10 MB, and validates JPEG/PNG/WebP/PDF signatures. Uploads do not require a separate adult-password step.
3. The server computes SHA-256 and atomically reserves a material keyed by owner scope, profile, hash, `HOMEWORK_VISION_MODEL`, and `MATERIAL_EXTRACTION_PROMPT_VERSION`.
4. A fresh processing or ready record is reused. Otherwise `lib/material-storage.ts` stores private bytes and `lib/material-extraction.ts` sends a base64 image plus extraction-only prompt to OpenAI.
5. The record becomes `ready` with extracted text or `failed` with a bounded error code.
6. Upload success embeds `MaterialStudyPageClient` inside `/profile/[id]`, retaining the profile header/layout and URL. Upload/analysis replaces the previous voice component with `LumiMaterialLoading` (reading plus **Carregando…** below the avatar). Reading plays at least one full cycle even for fast success, looping for longer requests and finishing at the next boundary. Errors, motion cancellation, hidden tabs and animation failures bypass the wait; a 15-second asset timeout prevents stalls. Processing cache hits poll serially every 1.8 seconds, with abort cleanup and a two-minute timeout/retry. Once ready and the reading cycle finishes, the panel previews the retained image/PDF and starts grounded local Lumi. **Enviar outra atividade** returns to upload without navigation. `/profile/[id]/materials/[materialId]` remains available from history and reuses the same study component.
7. `LumiVoiceAgent` sends `profile_id`, `material_id`, and `avatar_mode: "local"`; `/api/invite-agent` reloads authorized text and delimits it as untrusted reference material. Uploaded text is not trusted from browser invite payloads.
8. Manual completion or the tutor's distinct **Atividade concluída com sucesso!** confirmation sends the existing authenticated `PATCH { completed: true }`. The final verdict requires all questions/steps to be checked, a completed agent turn after a user answer, and final speech/preparation to finish. The study workspace unmounts voice, plays one success cycle and restores upload only after both saving and animation settle. Hidden/offscreen/failed playback or its 30-second watchdog bypasses the visual gate; failed saving retains the activity with retry. Requests are locked, bounded to 15 seconds and aborted on exit. The embedded profile keeps its URL and clears the attachment; standalone detail returns to the profile. Child history and adult report read the same completion record. One correct question or simply ending voice must never complete a material.

## Retention and Cache

- `LUMI_MATERIAL_RETENTION_HOURS` defaults to 168 and is clamped to 1–720 hours.
- Expiry clears `storageKey` and `extractedText`, deletes the private file lazily, and keeps metadata/completion.
- Failed records are never cache hits. Processing reservations are reusable for two minutes so crashed requests eventually permit retry.
- Changing provider model or extraction behavior creates a new cache identity; bump the prompt version for the latter.

## Authorization

- Every material route requires the HttpOnly family session.
- Child/detail access verifies family ownership. Family lists require recent adult verification.
- Because demo sessions share `demo-family`, material records also store and filter `demoSessionId`.
- Browser DTOs omit family ID, hash, storage key, and list-response extracted text.

## Deployment Boundary

The JSON database and `data/material-cache/` adapter support local or persistent-container development. Serverless production requires durable database and private object-storage adapters with the same ownership, cache, retention, and DTO contracts.

## Verification

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run verify:api`
- `pnpm run build`
- Manual: first upload, cache hit, provider failure, completion, child history, adult report, demo isolation, mobile layout, and grounded voice response.

## Homework tutoring mode

- Uploads require a family session and owned child profile, without an extra adult-password step, and accept JPEG/PNG/WebP or PDF up to 10 MB, plus an optional `literacyLevel` (`pre_reader` | `emergent` | `fluent`, defaulted from age). The literacy level is part of the cache key. Family-wide history still requires recent adult access (`POST /api/adult-access`; `GET` reports `{ verified }`).
- `lib/material-extraction.ts` calls the OpenAI vision model with a strict JSON Schema and stores two things: `extractedText` (child-safe transcript: title, instructions, questions) and `analysis` (server-only: visual elements, skill, expected answer, steps, graded hints). `readable=false` fails the material with code `UNREADABLE` and returns `422`.
- DTOs expose only `title`, `subject`, and `questionCount` from the analysis; `analysis` and expected answers never reach the browser.
- `invite-agent` uses `messages.voice.homeworkPrompt` (step-by-step tutoring that never gives the final answer, adapted to literacy level) and `homeworkGreeting` when the material has an `analysis`; older text-only materials keep `agentPrompt`.
- The browser downsizes photos to 1600 px JPEG on a white background before upload (`lib/prepare-upload.ts`); transparent PNGs otherwise become unreadable black images.

Non-didactic material classification from main is retained in persistence and DTOs (`isDidactic`, with an analysis fallback for older records). Prompt version `material-tutor-v3` invalidates pre-classification cache entries. Upload success still finishes the reading cycle before showing the adult-profile warning or the embedded study result. Processing responses that later become non-didactic must not start a child tutoring session. The shared workspace retains keyboard/close-button image preview and the history route.

# Study Material Pipeline

> End-to-end contract for private material upload, text extraction, grounded voice study, and completion history.

## Sequence

1. `app/profile/[id]/page.tsx` sends `profileId` and an image as multipart form data to `POST /api/materials`.
2. The route authenticates the family session, confirms a child profile, caps the image at 8 MB, and validates JPEG/PNG/WebP signatures.
3. The server computes SHA-256 and atomically reserves a material keyed by owner scope, profile, hash, `FEITA_AI_MODEL`, and `MATERIAL_EXTRACTION_PROMPT_VERSION`.
4. A fresh processing or ready record is reused. Otherwise `lib/material-storage.ts` stores private bytes and `lib/feita-extraction.ts` sends a base64 image plus extraction-only prompt to Feita.
5. The record becomes `ready` with extracted text or `failed` with a bounded error code.
6. `/profile/[id]/materials/[materialId]` polls processing state, displays retained text, and starts inline Lumi.
7. `LumiVoiceAgent` sends only `profile_id` and `material_id`; `/api/invite-agent` reloads authorized text and delimits it as untrusted reference material.
8. The child explicitly PATCHes `{ completed: true }`. Child history and adult report read the same record.

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

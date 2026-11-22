# 08 Security

> Security model, trust boundaries, secret handling, and safety controls for this quickstart.

## Trust Boundaries

- Browser is untrusted and never receives `NEXT_AGORA_APP_CERTIFICATE`.
- Next.js server routes hold credentials and mint scoped, expiring tokens.
- Agora cloud executes managed agent pipeline using server-issued credentials.
- OpenAI receives validated material images and PDFs through a server-only credential.
- Uploaded bytes stay in private storage; the browser receives only authorized DTOs and retained extracted text.

## Secret Handling Rules

- Keep `NEXT_AGORA_APP_CERTIFICATE` server-side only.
- Do not expose BYOK provider API keys to client bundles.
- Store secrets in `.env.local` for dev and deployment secret store in Vercel.
- `config/env/env.local.example` documents expected keys without real values.
- Keep `OPENAI_API_KEY` server-side and rotate any key pasted into chat, logs, issues, or commits.
- Keep `NEXT_LEMONSLICE_API_KEY` server-side. The browser sends only a catalog avatar ID; the invite route resolves its provider source and reads the Plush reference image on the server.

## Token Security Model

- Tokens expire (default 1 hour).
- Token endpoint allows caller-provided UID/channel but still uses server secret signing.
- Renewal flow requests new RTC/RTM tokens near expiry.
- RTM capability is required and intentionally embedded by `buildTokenWithRtm`.

## Input Validation and Failure Handling

- Route handlers validate required fields and env availability.
- Errors return structured JSON with bounded detail.
- Material routes authenticate the family session, verify profile/material ownership, validate size/MIME/signature, and scope family-wide lists to the signed-in family session.
- `PATCH /api/profiles` authenticates the family session, validates the catalog ID, limits writes to that family's child profiles, and stores demo choices only on the current session, never the shared demo family.
- Stop route treats already-stopping/not-found agent as idempotent success.

## Agent Behavior Safety

- Prompt includes explicit honesty and non-hallucination policy for product claims.
- Agent failure message is constrained (`Please wait a moment.`) for degraded-path behavior.

## Operational Security Practices

- Run `pnpm run verify` before release changes.
- Avoid logging secrets; current logs are operational and should remain non-secret.
- Use least-privilege project bindings when managing Agora environments.

## Known Limits

- The optional playground live-test endpoint has the same sample-app authentication limits as the existing invite endpoint and consumes provider usage. Apply the same deployment access controls to it. It bounds prompts, accepts only experiment channel names and the fixed local image, returns sanitized provider errors, and exposes only a credential-availability boolean. `NEXT_LEMONSLICE_API_KEY` stays server-only; exported recipes contain no credentials.
- Video-state file selections remain browser-local object URLs and are never uploaded or persisted. Accepted local formats are WebP/WebM/MP4/MOV, bounded to 40 MB per clip; actual decoding compatibility is checked by the browser. WebP preview/replay blob URLs are also released after use. Exported manifests contain filenames and production hints, not file bytes or reusable object URLs.
- Bundled defaults such as `public/assets/lumi/states/lummi-falando-asas-web-v1.webp` are public static project assets. They are distinct from browser-local overrides; exported manifests may include their public asset paths.
- The bundled WebP cache retains only registered public asset Blobs in page memory; it does not retain local uploads or credentials. Product animation no longer reads or writes manual motion preferences in `sessionStorage`.

- This quickstart is a sample app; it does not implement user auth/tenant isolation.
- If productionizing, add authenticated route access and per-user authorization checks.

## Security Review Checklist

1. Confirm `NEXT_AGORA_APP_CERTIFICATE` is never referenced in client files.
2. Confirm token minting still uses server route only.
3. Confirm route error payloads do not leak secrets.
4. Confirm BYOK keys are optional and remain server-side.
5. Confirm docs do not instruct users to expose secrets in public config.

## Threat Notes for This Sample

- Token misuse risk is bounded by token expiry but still requires secure key custody.
- Public start/stop endpoints are unauthenticated in sample form; production needs auth.
- RTM message payloads are parsed defensively but should be treated as untrusted input.
- School material may contain child personal data; file/text retention defaults to seven days and metadata persists only for history/completion.
- Shared demo uploads require session isolation to avoid cross-visitor disclosure.
- Extracted text is untrusted prompt data and is explicitly delimited from agent instructions.
- Vercel stores metadata in PostgreSQL and files in a private Blob store; file routes check the family and demo session before reading bytes. Local JSON/files remain for local or persistent-container use.

## Hardening Steps for Productionization

- Add authenticated identity and authorization to all mutation routes.
- Scope agent start permissions per user/session ownership.
- Add rate limiting for token and invite endpoints.
- Add request tracing IDs for security incident investigation.
- Add environment-specific secret rotation policy and monitoring.
- Keep the private hosted database and Blob store connected; add deletion/export controls and rate limiting.

## Deployment Secret Checklist (Vercel)

- `NEXT_PUBLIC_AGORA_APP_ID` set for all required environments.
- `NEXT_AGORA_APP_CERTIFICATE` set as server-side secret only.
- Optional BYOK keys set only when related provider block is enabled.
- `OPENAI_API_KEY` set for deployments using material extraction.
- Pooled `DATABASE_URL` set server-side for hosted persistence; connect only a private Blob store (`BLOB_STORE_ID`, automatic short-lived OIDC) and set `LUMI_STORAGE_BACKEND=hosted`.
- Preview environments use non-production credentials.

## Security-Relevant Files

- `app/api/generate-agora-token/route.ts`
- `app/api/invite-agent/route.ts`
- `app/api/stop-conversation/route.ts`
- `config/env/env.local.example`
- `app/api/materials/route.ts`
- `app/api/materials/[id]/route.ts`
- `lib/material-extraction.ts`
- `lib/material-storage.ts`
- `lib/hosted-db.ts`
- `lib/private-file-storage.ts`
- `README.md` environment section

## Audit Trigger Events

Re-audit security docs when any of these change:

- token issuance logic
- agent start/stop route authorization assumptions
- environment variable set or naming
- provider integration path (default vs BYOK)

## Related Deep Dives

- [conversation_lifecycle.md](L2/conversation_lifecycle.md) — Token issuance and renewal sequence details.
- [transcript_pipeline.md](L2/transcript_pipeline.md) — RTM event surfaces and error propagation boundaries.

# Study Material Pipeline

> End-to-end contract for private material upload, text extraction, grounded voice study, and completion history.

## Sequence

1. `app/profile/[id]/page.tsx` sends `profileId` and an image as multipart form data to `POST /api/materials`.
2. The route authenticates the family session, confirms a child profile, caps the image at 8 MB, and validates JPEG/PNG/WebP signatures.
3. The server computes SHA-256 and atomically reserves a material keyed by owner scope, profile, hash, `HOMEWORK_VISION_MODEL`, and `MATERIAL_EXTRACTION_PROMPT_VERSION`.
4. A fresh processing or ready record is reused. Otherwise `lib/material-storage.ts` stores private bytes and `lib/material-extraction.ts` sends a base64 image plus extraction-only prompt to OpenAI.
5. The record becomes `ready` with extracted text or `failed` with a bounded error code.
6. The profile page embeds `MaterialStudyPageClient` after upload to poll processing state, display the material, and start inline Lumi. The same component serves `/profile/[id]/materials/[materialId]` for saved history links. The embedded workspace has a visible return action that restores submission controls.
7. `LumiVoiceAgent` sends only `profile_id` and `material_id`; `/api/invite-agent` reloads authorized text and delimits it as untrusted reference material.
8. The child explicitly PATCHes `{ completed: true }`. Child history and adult report read the same record.

## Retention and Cache

- `LUMI_MATERIAL_RETENTION_HOURS` defaults to 168 and is clamped to 1–720 hours.
- Expiry clears `storageKey` and `extractedText`, deletes the private file lazily, and keeps metadata/completion.
- Failed records are never cache hits. Processing reservations are reusable for two minutes so crashed requests eventually permit retry.
- Changing provider model or extraction behavior creates a new cache identity; bump the prompt version for the latter.

## Authorization

- Every material route requires the HttpOnly family session.
- Child/detail access verifies family ownership. Family lists need only the family session.
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

- Uploads accept JPEG/PNG/WebP or PDF up to 10 MB, plus an optional `literacyLevel` (`pre_reader` | `emergent` | `fluent`, defaulted from age). The literacy level is part of the cache key.
- `lib/material-extraction.ts` calls the OpenAI vision model with a strict JSON Schema and stores two things: `extractedText` (child-safe transcript: title, instructions, questions) and `analysis` (server-only: visual elements, skill, expected answer, steps, graded hints). `readable=false` fails the material with code `UNREADABLE` and returns `422`.
- DTOs expose only `title`, `subject`, and `questionCount` from the analysis; `analysis` and expected answers never reach the browser.
- `invite-agent` uses `messages.voice.homeworkPrompt` (step-by-step tutoring that never gives the final answer, adapted to literacy level) and `homeworkGreeting` when the material has an `analysis`; older text-only materials keep `agentPrompt`.
- The browser downsizes photos to 1600 px JPEG on a white background before upload (`lib/prepare-upload.ts`); transparent PNGs otherwise become unreadable black images.
- Each question also carries child-safe `supportContent` (word box, list or text printed on the sheet) and `answerSlots` (labels of the answer blanks, e.g. `1`..`27`). `withoutAnswers` drops support content that repeats multi-word answer items, in case the model filled a table in. The DTO exposes `instructions` and `questions[{ number, statement, supportContent, answerSlots }]` only with the detail view.
- `components/MaterialQuestion.tsx` renders the word bank as chips (used words are struck through), the numbered answer grid (saved in `localStorage` per material/question) and "Pedir para o Lumi conferir", which calls `sendTextToLumi` (`lib/lumi-events.ts`); `ConversationComponent` forwards it to the agent with `AgoraVoiceAI.chat`. Nothing is graded on screen.
- Voice filling (TEXT render mode marks every user update, partials included, as `END`; wait for `metadata.final`, or 1.5 s without changes): when the child says word-bank items out loud, `ConversationComponent` emits her final STT turns (`childSaid`, toolkit uid `"0"`, status `END`) and the active question (last one touched, badge "Respondendo agora") writes matched words into the next empty blanks in spoken order (`lib/answer-matching.ts`: accent-insensitive, whole words, longest first, skips words already used). This path is deterministic.
- As a best-effort extra, the tutor prompt asks Lumi to append `[preencher QUESTÃO|ESPAÇO|RESPOSTA]` with what the child said; MiniMax `skipPatterns: [4]` keeps it out of the voice, `stripFillCommands` keeps it out of transcripts, and `extractFillCommands` turns it into a fill event. Measured with the managed `gpt-4o-mini`, Lumi emits correct commands in under half of the turns, so never rely on it alone.
- `moveInlineListToSupport` moves a word list the model left inside the statement ("…: pepino - mel - …") into `supportContent`.
- Routing (`MaterialStudyPageClient`): a finished utterance goes to the question the child named ("questão dois"), else the active question if its bank matches, else the question whose bank matches best; that question becomes active. Fill-in-the-letter banks ("_iboia", "pa é") match spoken words that contain the printed letters in order plus 1–2 more, and the child's word is written as said.


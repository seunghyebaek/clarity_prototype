# Clarity API contract (proposed — no server exists yet)

Types live in `src/types/api.ts`; the HTTP client is `src/api/http.ts`.
All requests go to `VITE_API_BASE_URL` with `credentials: "include"` plus headers from `src/api/auth.ts`.
The backend derives user identity, groups and roles from the verified session. The frontend never sends `user_id`, roles or groups as authorization input.

| Method | Path | Query | Body | Response |
|---|---|---|---|---|
| GET | `/me` | — | — | `{user_id, display_name, country, groups, capabilities}` |
| POST | `/chat` | — | `{conversation_id: string\|null, message, response_language: "auto"\|"en"\|"ko"}` | `ChatResponse` |
| GET | `/conversations` | `cursor?` | — | `{items:[{id,title,updated_at}], next_cursor}` |
| GET | `/conversations/{id}` | — | — | `{id, messages:[{id,role,content,run_id,citations}]}` |
| GET | `/documents` | `q?`, `department?`, `language?` (`en`/`ko`), `status?`, `cursor?` | — | `{items: DocumentSummary[], next_cursor}` |
| GET | `/documents/{id}` | — | — | `{document, sections:[{id,title,text}]}` |
| POST | `/feedback` | — | `{run_id, rating:"up"\|"down", category\|null, comment\|null}` | `{id, saved}` |
| POST | `/admin/documents` | — | multipart: `file` (.md/.txt) + `metadata` (JSON string) | `{document_id, job_id, status:"pending"}` |
| GET | `/admin/jobs/{id}` | — | — | `{id, status, error}` |
| GET | `/eval/runs` | `cursor?` | — | `{items: EvalRunSummary[], next_cursor}` |
| GET | `/eval/runs/{id}` | — | — | `{summary, cases}` |

`DocumentSummary = {id,title,department,country,language,version,effective_date,status}` with
`status ∈ pending | processing | ready | failed | inactive`.

Capability used by the UI: `documents:upload` shows the upload panel. Backend authorization is still mandatory.

## Errors

Body: `{error:{code,message,request_id}}`. Codes the UI distinguishes:
`network_error` (fetch failed), `rate_limited` (429), `session_expired` (401), `forbidden` (403); anything else shows a generic error.
The UI never falls back to fabricated answers on error.

## Mock fixtures (mock mode only, fictional Northstar Labs corpus)

- `src/fixtures/documents.ts` — 8 documents covering every status, EN and KO.
- `src/fixtures/chat.ts` — deterministic scenarios:
  1. "remote" + "canada" → `answered`, 4 citations (Remote Work Policy — Canada v3.1).
  2. contains "출장비" → `needs_clarification` (asks country and expense type).
  3. "pet insurance" / "반려동물" → `insufficient_evidence`.
  4. contains "육아휴직" → Korean answer from the English Parental Leave Policy.
  Anything else → `insufficient_evidence` with "prototype only supports sample scenarios".
  All metrics are `null` (shown as "Not measured").
- `src/fixtures/evaluations.ts` — two ILLUSTRATIVE runs (baseline/candidate) and failure cases; some metrics are `null` to show "Not evaluated yet".
- Simulation panel (mock only): persona (employee/admin → `/me` capabilities) and a one-shot forced error for the next chat request.

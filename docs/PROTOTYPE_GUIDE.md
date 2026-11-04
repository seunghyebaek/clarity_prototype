# Clarity — Company Knowledge Workspace: prototype guide

This Lovable project is a **UI prototype and design reference** built on TanStack Start (React + Vite).
It is **not** a Next.js app. Production will be a separate Next.js App Router + TypeScript + Tailwind frontend with a FastAPI / MongoDB / LangGraph backend.
All data is deterministic, fictional (Northstar Labs) mock data.

## Pages
| Route (prototype) | Suggested Next.js route | Page component | Notes |
|---|---|---|---|
| `/` | `app/(workspace)/page.tsx` | `home/HomePage` | composer, task chips, featured update, onboarding progress, pinned docs, recently updated |
| `/ask?q&context&from&send` | `app/(workspace)/ask/page.tsx` | `ask/AskPage` | prefill from links; only Home composer auto-sends (`send=1`) |
| `/documents?doc` | `app/(workspace)/documents/page.tsx` (+ `[id]` intercepting route for drawer) | `documents/DocumentsPage` | |
| `/updates` | `app/(workspace)/updates/page.tsx` | `updates/UpdatesPage` | |
| `/updates/$id` | `app/(workspace)/updates/[id]/page.tsx` | `updates/UpdateDetailPage` | |
| `/onboarding` | `app/(workspace)/onboarding/page.tsx` | `onboarding/OnboardingPage` | |
| `/knowledge-health?tab&gap&q` | `app/(admin)/knowledge-health/page.tsx` | `admin/KnowledgeHealthPage` | admin layout must check auth server-side |
| `/evaluations` | `app/(admin)/evaluations/page.tsx` | `evaluations/EvaluationsPage` | |

## Component inventory (`src/components`)
- shell: `WorkspaceShell`, `SimulationPanel` (Demo role preview, reset demo data, reference date), `BrandMark`
- ask: `QuestionComposer`, `AskPage`, `AssistantMessage`, `AnswerMarkdown` (per-block report action), `Feedback` (thumbs)
- evidence: `EvidenceDrawer`, `HighlightedText`
- feedback: `AnswerFeedbackDialog`
- updates: `PolicyUpdateCard`, `PolicyDiffView`, `VersionTimeline`, `EffectiveBadge`
- onboarding: `OnboardingChecklist`, `ProgressBar`
- admin: `KnowledgeGapTable`, `FeedbackQueue`, `DocumentationRequestDialog`
- documents: `DocumentsPage`, `StatusBadge`, `UploadPanel`

Presentational: `QuestionComposer`, `PolicyDiffView`, `VersionTimeline`, `OnboardingChecklist`, `ProgressBar`, `FeedbackQueue`, `KnowledgeGapTable`, `StatusBadge`, `EffectiveBadge`, `HighlightedText` (props in, callbacks out).
Data access lives only in `src/api` (adapter interface → mock or HTTP). Routing lives in `src/routes`. Auth placeholder: `src/api/auth.ts`.

### Client Components in Next.js
Need `"use client"`: shell (drawers, language toggle), `QuestionComposer` (IME handling), `AskPage`, `AnswerMarkdown` (selection), `EvidenceDrawer` (scroll/clipboard), all dialogs, `PolicyDiffView` (mode toggle), `OnboardingChecklist` (toggles/localStorage), `KnowledgeGapTable`, `FeedbackQueue`.
Can be Server Components: page shells fetching lists, `PolicyUpdateCard`, `VersionTimeline`, `StatusBadge`, document tables (with a client filter island).

## Design tokens (`src/styles.css`)
background #F7F8FA, foreground (navy) #172B4D, primary (teal) #087F8C, `learn`/`learn-soft` lavender (onboarding), `warning`/`warning-soft` amber (policy change, review), `success` green (completed, added), `destructive`/`danger-soft` red (errors, removed), `highlight` (evidence marks), `surface-sunken`. Radius 0.75rem base; cards use `rounded-2xl`.
Fonts: Bricolage Grotesque (display), IBM Plex Sans + IBM Plex Sans KR (body). Utilities: `font-display`, `diff-added`, `diff-removed`, `evidence-mark`, `animate-rise`, `animate-flash`; motion disabled under `prefers-reduced-motion`.

## Mock scenarios (`src/fixtures`)
- chat.ts: Canada remote work, Canada meal allowance (v5.0 vs future v5.1), expense reimbursement, accounts, IT equipment (KO answer from EN source), security orientation (EN answer from KO source), 출장비 clarification, pet insurance (insufficient), 육아휴직, 휴가. Others → "prototype only supports sample scenarios". Evidence = only `[n]` markers with exact excerpts (validated at load).
- workspace.ts: updates (CA meal CAD 60 → 75, effective **2026-12-01**; CA remote v2.0 → v3.1), onboarding tasks (filtered by country/department/role), knowledge gaps (pet insurance, international remote work, home office equipment, VPN = retrieval issue), demo owners, seeded feedback report.

## Data relationships
Citation.document_id → Document; chunk_id = `docId#sectionId` → section highlighted in EvidenceDrawer.
PolicyUpdate.source_links/document_id → Documents; suggested_question → Ask prefill; Ask `context` → update chip.
OnboardingTask.documents → Documents; ask_question → Ask (`from=onboarding`).
FeedbackReport.run_id → chat run; `candidate_eval` surfaces in Evaluations.
KnowledgeGap.keywords match an insufficient-evidence question (admin link) ; linked_document_id → Document; DocumentationRequest.gap_id → gap.

## Proposed API additions (beyond docs/API_CONTRACT.md)
`GET /updates`, `GET /updates/{id}`, `GET /onboarding/tasks` (server filters by verified profile in prod), `POST /feedback/passages`, `GET /admin/feedback`, `PATCH /admin/feedback/{id}` `{status?, candidate_eval?}`, `GET /admin/knowledge-gaps`, `PATCH /admin/knowledge-gaps/{id}` `{owner?, status?, linked_document_id?}`, `POST|GET /admin/documentation-requests`. `/me.capabilities` adds `admin:view`.
All `/admin/*` must be authorized server-side; gap examples from restricted documents must never reach employee views.

## Local state
Only non-sensitive demo onboarding progress (`clarity.demo.onboarding.v1`) and UI language are stored in localStorage. Never used for authorization. Reports, gaps and requests live in memory and reset on refresh.

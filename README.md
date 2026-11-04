# Clarity — Company Knowledge Workspace (UI prototype)

"Your company's knowledge, connected to your work." Employee-facing EN/KR workspace: answers with evidence, documents, policy updates, onboarding, feedback and knowledge health.

This is a TanStack Start (React) prototype and design reference — not a Next.js app. See `docs/PROTOTYPE_GUIDE.md` for page/component inventory, tokens, scenarios, data relationships, proposed APIs and the Next.js route mapping.

## Run

```bash
bun install
bun run dev      # http://localhost:8080
bun run build
```

## Configuration

Copy `.env.example` to `.env`:

- `VITE_API_MODE=mock` (default) — in-memory deterministic fixtures, "Demo data" badge, simulation panel. Resets on refresh.
- `VITE_API_MODE=api` — calls `VITE_API_BASE_URL` (default `http://localhost:8000`). Errors are shown; no fallback to mock data.

Only public values belong here. Never put model keys, DB credentials or shared secrets in frontend code.

## Structure

- `src/types/api.ts` — contract types
- `src/api/` — `adapter.ts` (interface), `mock.ts`, `http.ts`, `auth.ts` (placeholder), `index.ts` (mode selection)
- `src/fixtures/` — fictional Northstar Labs data
- `src/i18n/` — `en.ts`, `ko.ts`
- `src/components/` — shell, source drawer, ask / documents / evaluations
- `src/routes/` — `/` Home, `/ask`, `/documents`, `/updates`, `/updates/$id`, `/onboarding`, `/knowledge-health`, `/evaluations`
- `docs/API_CONTRACT.md` — endpoints, query params, errors, fixtures

## Auth placeholder

`src/api/auth.ts` returns no headers and does nothing on session expiry. Plug the company SSO session in there later. There is no fake production login; the mock persona switch is a labeled simulation and admin visibility in API mode comes only from `/me` capabilities.

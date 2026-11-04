<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Components call `api` from `src/api` only, never `fetch` directly — keeps mock/HTTP swappable.
- No Lovable Cloud/LLM/backend here; the backend is an external FastAPI service per docs/API_CONTRACT.md.
- Never derive admin rights from client state; UI gating uses `/me` capabilities only.
- All UI strings go through `src/i18n` dictionaries (EN + KO).
- Pages live in `src/components/<area>/*Page.tsx`; route files only parse search/params and pass props — keeps routing separate for the later Next.js port.
- Guided demo flows are data in `src/fixtures/scenarios.ts`; add steps there, not in components.

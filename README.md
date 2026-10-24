# Relaunch

Decide what happens to your unfinished projects: continue, restart, pivot, repurpose or archive.
React 19 + TypeScript + Vite + Tailwind v4 + Motion + GSAP. Local-first (IndexedDB), no backend, no account.

    npm install
    npm run dev       # app + landing at http://localhost:5173
    npm test          # score, recommendation, ops, query, backup, IndexedDB tests
    npm run build

## Layout
- `src/landing/` – the scroll-video landing page (from the `relaunch/` upload), fed by real project data.
- `src/domain/` – pure logic: `analysis.ts` (Relaunch Score + path recommendation, documented at the top), `ops.ts`, `query.ts`, `timeline.ts`, `backup.ts`.
- `src/storage/db.ts` – versioned IndexedDB. `src/store/` – React state, persists before updating the view.
- `src/pages/`, `src/components/` – the app (hash routes: `#/app`, `#/projects`, `#/projects/new`, `#/projects/:id`, `#/projects/:id/decision`, `#/paths`, `#/timeline`, `#/archive`, `#/data`).

Roadmap items (cloud sync, GitHub/Notion import, team boards) are listed on the Your data page as not yet available.

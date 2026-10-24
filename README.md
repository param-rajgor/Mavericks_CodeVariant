# Relaunch

A pixel-art **project graveyard**. Keep your unfinished ideas, see why each one stalled, and decide whether to
continue, restart, pivot, repurpose or archive it. Local-first: everything is stored in your browser (IndexedDB),
with no account and no server.

React 19 · TypeScript · Vite · Tailwind v4 · Motion

```
npm install
npm run dev        # http://localhost:5173
npm test           # score, recommendation, operations, query, backup and storage tests
npm run build
```

## Project structure

```
relaunch/
├─ docs/                      Design spec and the reference screenshots (source of truth for the look)
├─ index.html                 Fonts (Pixelify Sans, VT323, Nunito) and the page shell
└─ src/
   ├─ main.tsx, App.tsx       Entry point and routes
   ├─ styles/theme.css        The whole design system: colours, fonts, pixel primitives, ambient motion
   │
   ├─ frontend/               Everything you see
   │  ├─ landing/             Landing page: hero, live stats bar, landing → graveyard transition
   │  ├─ graveyard/           Graveyard dashboard: gravestones, "Project Found" panel, detail modal, control bar
   │  │  └─ gravestone/       The stone itself (shape, vines, status pill, tooltip, icons)
   │  ├─ workspace/           The other pages
   │  │  ├─ pages/            Project Journal, Insights, Decision Shrine, Archive, Progress, Settings
   │  │  └─ components/       New-project wizard, edit / archive / restore / delete dialogs, empty states
   │  ├─ scene/               The pixel-art world (canvas layers, ambient fireflies, stars, petals)
   │  ├─ shell/               Page frame for the workspace pages, and the shared "plant a project" / "details" dialogs
   │  ├─ navigation/          Top navigation bar
   │  ├─ ui/                  Shared pieces: pixel button, sprites, dialog, toasts, form fields
   │  └─ routing/             Tiny hash router (works on any static host)
   │
   └─ backend/                Everything that thinks and remembers (runs in the browser)
      ├─ domain/              Pure logic: Relaunch Score and path recommendation (analysis.ts), operations,
      │                       queries, timeline, backup, sample data, dashboard numbers (insights.ts)
      ├─ storage/             Versioned IndexedDB
      ├─ store/               React state; saves first, then updates the view
      └─ tests/               Unit tests for the above
```

The `@` import alias points at `src`, for example `import { analyzeProject } from "@/backend/domain/analysis"`.

## Pages

| Route | Page |
|---|---|
| `#/` | Landing page |
| `#/graveyard` | Graveyard dashboard: filter, search, sort, click a stone for its panel |
| `#/journal` | Project Journal: every idea as a card, your journey, suggested next steps |
| `#/insights` | Patterns across your ideas |
| `#/decision` | Decision Shrine: score breakdown and the five paths |
| `#/archive` | Archived ideas: restore or delete |
| `#/progress` | Your five-step journey |
| `#/settings` | Backup, restore, sample data, delete all |

## Data

Twelve sample projects ship with the app (`src/backend/domain/seed.ts`) and are labelled as samples. Both the
landing page and the graveyard read the same saved projects through one adapter, `frontend/graveyard/stone.ts`,
so a name or status can never differ between pages. The Relaunch Score is a transparent weighted formula, not a
prediction; the formula is documented at the top of `backend/domain/analysis.ts`.

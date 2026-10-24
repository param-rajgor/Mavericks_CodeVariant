# Relaunch: project instructions

Relaunch is a pixel-art "project graveyard" site (React, TypeScript, Vite, Tailwind v4, Motion). It is local-first:
projects live in the browser's IndexedDB, there is no server.

## Read before building UI
- `docs/design-spec.md`: behaviour, content, colours, fonts and motion.
- `docs/reference/landing.png`, `docs/reference/dashboard.png` and `docs/reference/states/`: the target look.

## Layout (see README.md for the full tree)
- `src/frontend/`: all UI (landing, graveyard, workspace pages, scene, navigation, shared ui).
- `src/backend/`: domain logic, IndexedDB storage and the React store. No UI in here.
- `src/styles/theme.css`: the only place for colours, fonts and pixel primitives. Use the exact hex values from the spec.

## Rules
- Use `@/` imports (alias for `src`).
- Names, statuses and details come from the stored projects, through `frontend/graveyard/stone.ts`. Never hardcode a project's name twice.
- Pixel art stays crisp (`image-rendering: pixelated`). Hard-edged shadows and notched corners only: no glassmorphism, no soft drop shadows on UI.
- Animate with Motion (`layoutId` for the shared stone transition). Respect `prefers-reduced-motion`.
- Status labels are exactly `Stalled`, `In Progress`, `To Revisit`, `Archived`.

## How to work
- For anything bigger than a small fix, show a short plan first.
- Run `npm run build` and `npm test` and check the browser console before saying a step is done.
- Don't commit unless asked.

# Relaunch: project instructions

This repo is the frontend for **Relaunch**, a pixel-art "project graveyard" website built for the Code Variant Build 01 hackathon.

## Read these before building any UI
- `docs/canvas-protocol-plan.md`: the CURRENT task (drag-and-drop hackathon rule), with an approved plan and a progress log. Continue from the first unchecked phase. This file wins when it conflicts with the other docs.
- `docs/design-spec.md`: the full design spec, covering behaviour, content, colours and motion. Its "Latest decisions" section at the top overrides the older parts.
- `docs/reference/landing.png` and `docs/reference/dashboard.png`: the target look. These are look only: never crop them for assets.
- `docs/reference/states/`: frames showing the hover, tooltip, filter, search, transition and panel states.

## Rules
- Build on the existing layout and stack. Don't restructure folders, change routing conventions or swap frameworks without asking me first.
- React app. Use Framer Motion for animation (including `layoutId` for shared stone transitions) and @dnd-kit/core for drag-and-drop.
- All project data lives in the existing `ProjectsContext` (persisted to IndexedDB). Never create a second store and never hardcode project names.
- Put colours and fonts in one place, as CSS variables or a theme file. Use the exact hex values from the spec.
- Only two fonts: Jersey 15 (`--font-display`) and Chakra Petch 500/600 (`--font-body`). Don't reintroduce Pixelify, VT323, Nunito or DotGothic16.
- Pixel art must stay crisp: use `image-rendering: pixelated` and never blur-scale it.
- Hard-edged shadows and notched pixel corners only. No glassmorphism and no soft drop shadows on UI.
- Respect `prefers-reduced-motion`.
- Popups, tooltips, panels and the drag overlay render via a portal, above the stones, using the z-index scale in canvas-protocol-plan.md.
- No standard buttons for primary actions: they must be drag-and-drop (hackathon rule).
- There is no backend: everything is hardcoded demo data.

## How to work with me
- For anything bigger than a small fix, show me a short plan first and wait for my OK.
- Work in small steps. After each step, tell me what changed and how to see it in the browser.
- Run the dev server and check that there are no console or build errors before saying a step is done.
- After each phase in canvas-protocol-plan.md: tick off the Progress log, then commit and push. Several teammates take turns, so the repo must always show where work stopped.

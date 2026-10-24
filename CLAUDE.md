# Relaunch: project instructions

This repo is the frontend for **Relaunch**, a pixel-art "project graveyard" website built for the Code Variant Build 01 hackathon.

## Read these before building any UI
- `docs/design-spec.md`: the full design spec, covering behaviour, content, colours, fonts and motion.
- `docs/reference/landing.png` and `docs/reference/dashboard.png`: the target look. These images are the source of truth for layout.

## Rules
- Build on the existing layout and stack. Don't restructure folders, change routing conventions or swap frameworks without asking me first.
- If the project uses React, use Framer Motion for animation, including `layoutId` for the shared stone transitions.
- Keep all demo data in one file (`src/data/projects`) and import it on both pages. Never hardcode names twice.
- Put colours and fonts in one place, as CSS variables or a theme file. Use the exact hex values from the spec.
- Load the fonts from Google Fonts: Pixelify Sans, VT323 and Nunito.
- Pixel art must stay crisp: use `image-rendering: pixelated` and never blur-scale it.
- Hard-edged shadows and notched pixel corners only. No glassmorphism and no soft drop shadows on UI.
- Respect `prefers-reduced-motion`.
- There is no backend: everything is hardcoded demo data.

## How to work with me
- For anything bigger than a small fix, show me a short plan first and wait for my OK.
- Work in small steps. After each step, tell me what changed and how to see it in the browser.
- Run the dev server and check that there are no console or build errors before saying a step is done.
- Don't commit unless I ask.

`docs/reference/states/`: frames showing hover, tooltip, filter, search, transition and panel states. Use these for interaction details.
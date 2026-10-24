# Relaunch — Pixel-Art Project Graveyard

React 19 + Vite + Tailwind v4 + Motion + GSAP ScrollTrigger + Lucide.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # typecheck + production build
```

## The video
- `src/config.ts` → `VIDEO_URL` / `POSTER_URL` are the single source of truth.
- `public/videos/relaunch-graveyard.mp4` is your upload re-encoded with a keyframe on every frame (no audio) so scroll-scrubbing is smooth. Your untouched original is in `source-video/original-upload.mp4`.
- `public/videos/poster.jpg` is the first frame, extracted from the video.
- Desktop: playback is scrubbed by scroll (0 at top → 1 when the footer is ~20% from the viewport top).
- Mobile / coarse pointer: plain muted loop. Reduced motion or load failure: poster frame.
- The video has baked-in nav, hero text and stats (with AI typos). Feathered "mist" panels in `ScrollVideoBackground.tsx` hide them so the real HTML replaces them.

## Demo data
Projects and stats are illustrative samples (`src/data/demoProjects.ts`). Everything lives in React state — nothing is persisted or sent anywhere.
External links (Contact / GitHub / Docs) are placeholders: set URLs in `src/config.ts`.

## Dev dependencies beyond your list
`typescript`, `@types/react`, `@types/react-dom` — needed for TypeScript; no runtime additions.

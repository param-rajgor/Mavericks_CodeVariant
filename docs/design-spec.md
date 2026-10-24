# Relaunch: Frontend Design Spec

Relaunch is a playful "project graveyard". People keep their unfinished side projects here, see why each one stalled, and decide whether to continue, restart, pivot, repurpose or archive it.

The whole site is a cozy, explorable, retro pixel-art world. Every project is a small gravestone in a magical twilight graveyard. The gravestones are interactive objects that react to the cursor like objects in a cozy indie game.

**Source of truth for layout:** `docs/reference/landing.png` and `docs/reference/dashboard.png`. Match their composition, proportions and placement as closely as possible. This document covers behaviour, content, colours and motion. If the two disagree on layout, follow the images.

**Mood:** whimsical, warm, nostalgic, polished, smooth. It should feel like a premium creative website crossed with a 16-bit indie game.

**It must NOT look like:** a horror game, a real cemetery, a childish cartoon, a generic SaaS dashboard, or a normal website with pixel icons pasted on.


## ⚠️ Latest decisions: these OVERRIDE anything older in this file
These were made during the build, after the mockups were drawn:
- **Fonts:** only two fonts are used.
  - **Jersey 15** is the display font: headings, wordmark, nav, tabs, buttons, stone names, pills, chips, tags, numbers, labels.
  - **Chakra Petch** (500/600) is the body font: descriptions, tooltips, panel text, card explanations, search, any sentence longer than about 5 words.
  - Pixelify Sans, VT323, Nunito and DotGothic16 are **removed**. Use the CSS variables `--font-display` and `--font-body`.
- **Logo:** a bold 16×16 pixel rocket shown at 48px, tilted 45°. White body, dark outline, lavender window, purple fins, orange flame. It sits next to RELAUNCH in Jersey 15 at about 44px with a 3px dark shadow, and is the same on both pages.
- **Landing nav:** links are white, with a dark pixel text-shadow and a subtle dark backing band so they stay readable over the clouds.
- **Readability:** all important text has a hard 2–3px dark pixel shadow or sits on a solid panel. Body text is at least 18px and at least #DED5F4 on dark backgrounds.
- **Dashboard bottom bar:** one thin row of about 72px.
  - The **Sort By control is removed**.
  - Order from left to right: filter chips, divider, search (grows to fill), and the plant control on the far right.
- **Project Found panel:**
  - It closes on a click outside, on Esc, or when the same stone is clicked again.
  - Clicking another stone switches the panel to that project.
  - Popups, tooltips and panels always render above the stones (portal + z-index scale in `docs/canvas-protocol-plan.md`).
- **Signposts:** a reusable `<Signpost>` component. Text always fits its board, wraps only on word boundaries, and every sign in a group uses the same font size.
- **Canvas Protocol (hackathon rule):** primary actions are drag-and-drop only. See `docs/canvas-protocol-plan.md`. That file wins wherever it differs from this spec. For example, "+ PLANT A PROJECT" and "INSPECT THIS IDEA" are no longer buttons.
- The project data now lives in `ProjectsContext` (persisted to IndexedDB), not `src/data/projects`.

---

## 1. Pages

There are two pages that feel like one continuous world:

1. **Landing page** at `/`
2. **Graveyard dashboard** at `/graveyard`

All data is hardcoded demo data. There is no backend.

---

## 2. Landing page (see `landing.png`)

The page is one full-viewport scene: the UI sits on top and an illustrated pixel-art landscape fills the rest.

### Background scene (back to front)
- Twilight sky: deep indigo at the top fading to purple, then lavender and dusty pink near the horizon. Use stepped bands rather than a smooth gradient.
- Tiny square stars. A few of them twinkle at different times.
- A large pixel-art setting sun just right of centre, half hidden behind the mountains. It has horizontal stripe gaps across its lower half and a soft peach glow around it.
- Pixel clouds in lavender and pink, lit from below by the sun, drifting slowly.
- Layered pixel mountains in violet and purple. The far layers are lighter and the near layers darker.
- A rolling grass meadow.
- A large blossom tree on the right: a brown trunk and branches with a lavender and pink canopy.
- Two glowing lanterns hanging from a branch.
- A wooden signpost with a small white rocket on it, standing by the tree.
- A sleeping calico cat (white and orange) curled on a rock at the bottom left, with floating "z Z z".
- Dark green foreground leaves framing the bottom-left and bottom-right corners.
- Small white and pink flowers and grass tufts around the stones.
- Golden fireflies drifting slowly.

### Navigation bar (top)
- **Left:** a pixel rocket icon (white body, lavender nose, orange flame, tilted 45°) and the wordmark **RELAUNCH** in a chunky pixel font.
- **Centre:** "How it Works" and "Explore" in a pixel font, with small gold sparkles between them.
- **Right:** a **Log in** button (dark fill, lavender pixel border) and a **Get Started** button (lavender fill, dark text).

### Hero (left side)
- Headline on two lines: **YOUR IDEAS / AREN'T DEAD.**
  - Chunky bold pixel font in white, with a thick dark outline and a hard drop shadow.
  - **DEAD.** is lavender-purple: lighter on the top half, deeper on the bottom half.
  - Small gold "burst" lines sit to the top-right of the headline.
- Subtitle in a monospace pixel font on two lines: "They're just waiting for their / next chapter."
- Primary button: **ENTER THE GRAVEYARD →**
  - Gold fill (#FFC94D) with a dark pixel border and a hard orange-brown shadow underneath.
  - Clicking it goes to `/graveyard`.

### Gravestones (centre-bottom, in a row)
Show 4 stones, left to right:

| Project | Icon | Status |
|---|---|---|
| SocialPulse | `</>` | Stalled |
| CampusKart | cube | In Progress |
| ML Classifier | bar chart | To Revisit |
| Portfolio v1 | laptop | Archived |

- Each stone is a rounded-top lavender pixel stone. It has a dark outline, a lighter left edge and a darker right edge.
- Each stone shows an engraved icon, the project name in a bold rounded sans font, and a status pill.
- SocialPulse has green vines climbing over its left side and top. It glows gold at rest to show it is the featured project.
- Green leaves and flowers grow around the stone bases.

### Stats bar (bottom centre)
A dark indigo panel with a thick lavender pixel border, split into three sections by thin dividers:

- 📁 **12 PROJECTS RESTING** (purple folder icon)
- 🌱 **3 READY TO REVIVE** (green sprout icon)
- 💡 **1 NEW IDEA** (gold bulb icon)

Use pixel-art icons, not emoji. Text is in the pixel font.

### Landing interactions
**Hovering a gravestone:**
- The stone lifts 6–8px.
- A gold outline and soft glow appear, with a few gold sparkle particles.
- The grass at its base brightens slightly.
- A cream speech-bubble tooltip appears above it, as in `landing.png`. It shows the name in bold, a one-line description, and a `>` chevron.
- The tooltip fades and rises in over about 200ms.

**Clicking a gravestone:** goes to `/graveyard` with that project selected.

**Buttons:**
- Hover lifts the button 2–3px.
- Click presses it down 2–3px into its shadow.
- When hovering the primary button, a tiny gold sparkle appears at one corner.

---

## 3. Graveyard dashboard (see `dashboard.png`)

### Top navigation bar
- Dark indigo bar with a lavender bottom border.
- Rocket and **RELAUNCH** at the left, then a thin vertical divider.
- Four tabs, each with a small pixel icon: **Graveyard** (active), **Project Journal**, **Decision Shrine**, **Archive**.
  - The active tab has a lavender-purple fill and a light pixel border.
  - Hovering an inactive tab brightens it and lifts its icon 1–2px.
- At the far right, after a divider: a pill reading 🌱 **12 ideas resting**.

### Heading (centre)
- **YOUR PROJECT / GRAVEYARD** in the same chunky outlined pixel headline style.
- Small gold dash accents sit on both sides of "GRAVEYARD".
- Below it, a pill-shaped banner with a lavender pixel border and diamond end-caps reads: "Every little idea gets a place to rest — and a chance to rise again."

### Scene
- The same world as the landing page, so the same palette, sun and mountains.
- The blossom tree is now on the **left**, with three hanging lanterns.
- A small dark castle silhouette with lit gold windows stands on a hill to the right of the sun.
- A laptop showing `</>` and a stack of books sit at the bottom left.
- The sleeping cat is in the bottom centre-right, with rocks and pink flowers at the bottom right.

### Gravestones: 6 in one row
Left to right:

| Project | Icon | Status |
|---|---|---|
| SocialPulse | `</>` | Stalled |
| CampusKart | cube or cart | In Progress |
| ML Classifier | bar chart | To Revisit |
| Portfolio v1 | laptop | Archived |
| Cozy Habit App | sprout | Stalled |
| Game Jam 2025 | gamepad | Stalled |

- Long names wrap onto two lines, as in the mockup.
- Vary the stones slightly (vines, curve of the top, width) but keep one consistent style.
- All six stones must look like one family.

### Project Found panel (top right)
This panel appears when a stone is clicked. It is a game-inventory style window: dark indigo, a double lavender pixel border, and small gold sparkles.

- Header: ✦ **PROJECT FOUND!** ✦
- An icon tile (light lavender square with the project icon), then the **name** in pixel font, then the one-line description.
- **Progress**: a segmented pixel bar in mint (#9CE6BD) with the percentage on the right in pixel font. It animates filling from 0.
- 📅 **Last visited:** "2 months ago"
- 🏷 Tech stack chips, for example React · TypeScript · Supabase
- Button: **INSPECT THIS IDEA ↗** in gold. Clicking it opens a detail drawer or modal that also shows **Why it stalled** and **What can be reused**.

**Transition:** the panel expands out of the clicked stone (a shared-element style animation, 350–450ms). Its contents then fade in one after another.

### Selection and tooltip
- Hovering a stone works the same as on the landing page.
- The dashboard tooltip is dark indigo with a light border, as in `dashboard.png`. It shows "SocialPulse —", the description, and a small gold **> OPEN PROJECT** button.
- The selected stone keeps its gold outline after it is clicked.

### Bottom control bar (fixed)
A full-width dark indigo bar with a lavender top border. From left to right:

- **Filter chips:** ALL (12) · STALLED (4) · ACTIVE (2) · ARCHIVED (2)
  - The active chip has a lavender-purple fill.
  - Clicking a chip presses it down 3px and changes its fill.
- A divider.
- A **search input** with a pixel magnifier icon and the placeholder "Search your projects...".
- **SORT BY:** followed by a dropdown showing "LAST VISITED ▾".
- A divider.
- A **+ PLANT A PROJECT** button with a lavender fill, pixel font, and a small sprout on its corner.

### Filter and search behaviour
- Filtering fades and slightly sinks the stones that don't match. They don't jump: the row layout stays stable.
- Animate the stones with a small stagger (about 50ms each).
- Search matches project names live as the user types, case-insensitive.
- Matching stones stay visible and the rest fade out gently.
- Clearing the search brings every stone back.

---

## 4. Demo data

Put this in one data file, e.g. `src/data/projects.(ts|js)`, and use the same data on both pages.

| id | name | status | icon | description | progress | lastVisited | stack | whyStalled | reusable |
|---|---|---|---|---|---|---|---|---|---|
| socialpulse | SocialPulse | Stalled | code | Social media analytics platform | 62 | 2 months ago | React, TypeScript, Supabase | Time constraints and pending feature integrations. | Analytics modules, database schema, and UI components. |
| campuskart | CampusKart | In Progress | box | Campus marketplace for students | 45 | 1 week ago | Next.js, Tailwind, Firebase | — | Listing cards and auth flow. |
| mlclassifier | ML Classifier | To Revisit | chart | Image classifier experiment | 70 | 3 months ago | Python, PyTorch, FastAPI | Accuracy plateaued; needed more data. | Training pipeline and data loaders. |
| portfolio | Portfolio v1 | Archived | laptop | First personal portfolio site | 100 | 1 year ago | HTML, CSS, JavaScript | Replaced by a newer version. | Section layouts and animations. |
| cozyhabit | Cozy Habit App | Stalled | sprout | Gentle daily habit tracker | 30 | 5 months ago | React Native, Expo | Scope grew too fast. | Streak logic and illustrations. |
| gamejam | Game Jam 2025 | Stalled | pad | 48-hour jam platformer | 55 | 8 months ago | Godot, GDScript | Jam ended before polish. | Character controller and tileset. |

Status labels are always exactly: `Stalled`, `In Progress`, `To Revisit`, `Archived`.

---

## 5. Landing → Dashboard transition

Clicking **ENTER THE GRAVEYARD** should feel like walking deeper into the same world, not loading a new site. Total length is about 600–850ms.

- The landing hero UI fades out and slides slightly left.
- The scene zooms in a little, and the foreground grass slides down out of view.
- A sweep of golden pixel blocks crosses the screen left to right, revealing the dashboard behind it.
- The 4 landing stones glide to their positions in the dashboard row (shared-element, e.g. Framer Motion `layoutId`). The 2 extra stones pop in afterwards.
- Use no loading screen, no spinner and no terminal effects.

---

## 6. Colour palette

**Backgrounds and sky**

| Use | Hex |
|---|---|
| Deep night indigo | `#24234F` |
| Panel indigo | `#2A2563` |
| Deep panel | `#1E1C48` |
| Dark purple | `#34316C` |
| Mid purple | `#57449A` |
| Twilight violet | `#8170C8` |
| Horizon pink | `#EFA8B6` |
| Peach glow | `#F6B9AB` |

**Stones**

| Use | Hex |
|---|---|
| Stone | `#C3B5E6` |
| Light edge | `#E2D8F7` |
| Shade | `#9C8CCB` |
| Deep shade | `#7A6AAE` |
| Outline | `#3A2F6E` |
| Engraving | `#4A3E80` |

**Accents**

| Use | Hex |
|---|---|
| Lavender | `#B995FF` |
| Bright lavender | `#D8B7FF` |
| Button purple | `#8A63E8` |
| Gold | `#FFD166` |
| Button gold | `#FFC94D` |
| Lantern gold | `#FFBE55` |
| Soft pink | `#EDB0D5` |
| Mint | `#9CE6BD` |

**Text**

| Use | Hex |
|---|---|
| Primary | `#F8F3FF` |
| Secondary | `#DED5F4` |
| Dark text on light surfaces | `#2E2560` |

**Status pills (fill / border / text)**

| Status | Fill | Border | Text |
|---|---|---|---|
| Stalled | `#F7B39C` | `#D9806A` | `#6E2A22` |
| In Progress | `#A9E8BF` | `#5FB37E` | `#1F5534` |
| To Revisit | `#FFD36E` | `#D9A23A` | `#5A3B0C` |
| Archived | `#ECE4FB` | `#A796D8` | `#4B3F7A` |

**Grass**

| Use | Hex |
|---|---|
| Highlight | `#B4D27A` |
| Light | `#93C062` |
| Mid | `#76A84F` |
| Dark | `#5E9143` |
| Deep | `#4C7A3A` |

Rules:
- Purple is the core identity.
- Gold is the interaction highlight: hovered and selected things glow gold.
- Do not use neon green, saturated red or electric blue.

---

## 7. Typography
See "Latest decisions" at the top of this file:
- **Jersey 15** for display text, set large because it is narrow. Headline ~110px, dashboard headline ~90px, card and panel titles 44–52px, stone names 30px, buttons and nav 26–30px, pills and chips 22–24px. Use letter-spacing 1–2px on uppercase text.
- **Chakra Petch** 500/600 for body text: 18–20px, line-height 1.45.

Text must stay sharp and must not flicker or glitch.

## 8. Pixel-art rules

- All art uses crisp pixels. Set `image-rendering: pixelated` on sprites and canvases, and never apply blurred scaling.
- Keep one consistent pixel size across the whole scene. Don't mix huge blocky pixels with tiny ones.
- Use stepped outlines, limited colour ramps, light top-left edges and darker bottom-right edges.
- Buttons, panels and pills use "notched" corners (stepped, with 1 pixel cut off each corner) and hard-edged shadows. No blur shadows.
- Glow stays close to its source: lanterns, the sun, fireflies and selected stones. No big hazy bloom.
- Scenery can be built as SVG/CSS pixel shapes, a canvas, or PNG sprite layers in `public/assets/`. Choose whichever fits the existing codebase, and keep each scene layer separate so it can parallax.

---

## 9. Motion

| Interaction | Duration |
|---|---|
| Hover feedback | 120–180ms |
| Button press | 80–120ms |
| Tooltip | 180–250ms |
| Stone lift | 180–250ms |
| Page transition | 600–850ms, ease-out |

Ambient motion is slow, subtle and staggered so nothing moves at the same time:
- Fireflies drift.
- Lanterns pulse between two warm brightness levels.
- Clouds drift.
- Stars twinkle at different times.
- Petals occasionally fall from the tree.
- The cat breathes and its "z"s float up.
- Grass sways a few pixels.

Respect `prefers-reduced-motion`: turn off ambient motion and the big transitions. Everything must still work.

---

## 10. Avoid

- Horror imagery: skeletons, ghosts, blood, scary stones.
- Bootstrap-looking cards and glassmorphism.
- Excessive gradients or neon colours.
- Constant bouncing, spinning or glitch effects.
- Unreadable text, misspelled project names, or project names that differ between pages.
- Inconsistent status colours.
- Loading screens, a plain white background, or vector art pretending to be pixel art.

---

## 11. Done when

- [ ] Both pages match the reference images closely at 1920×1080 and look good at 1440×900.
- [ ] The hover, tooltip, click, filter, search and panel interactions all work with the demo data.
- [ ] The landing-to-dashboard transition shows the shared stones moving into place.
- [ ] Project data, names and status colours are identical on both pages.
- [ ] Reduced-motion mode works, and there are no console errors.

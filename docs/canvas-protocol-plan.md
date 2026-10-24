# Canvas Protocol: implementation plan and handoff log

> **Whoever's Claude is working on this:** read `CLAUDE.md`, `docs/design-spec.md` and this file first.
>
> The audit and plan below are already approved, so don't redo them. Continue from the first unchecked phase in the **Progress log** at the bottom.
>
> After you finish each phase:
> 1. Tick it off in the Progress log, and add notes on anything changed or left over.
> 2. Commit with a message like `Canvas Protocol: phase N`, then push.
>
> This lets another person continue if you run out of usage.

## The rule (hackathon surprise challenge)
- Standard buttons for **primary actions** (submit, save, create, delete, choosing a decision, etc.) are **not allowed**.
- Users must perform every primary action by **dragging a data card and dropping it onto an Action Zone**.
- The app must keep its purpose: deciding what happens to unfinished projects.
- It must be intuitive and clean, match our pixel style exactly (Jersey 15 + Chakra Petch, palette, notched corners, hard shadows), and **not lag**.

## Answers to the open questions (FINAL, don't ask again)
1. **Commits:** the earlier uncommitted work has been committed separately already. Each phase gets its own commit.
2. **LOOK CLOSER:** clicking a stone still opens the Project Found panel (that's viewing, not an action). The LOOK CLOSER zone opens the **full detail view** and replaces the "INSPECT THIS IDEA ↗" button.
3. **Reason cards:**
   - Dashboard: a small "Why it stalled?" rack of 4 mini signposts at the left of the scene, draggable onto any stone or the open panel.
   - Decision Shrine: the same 4 cards in the left column, droppable on the current project.
   - Landing: the signs stay decorative.
4. **Decision Shrine:** the 5 path cards become the drop zones, each on a glowing pixel pedestal. No second signpost scene. There is a draggable current-project card on the left.

## Audit: primary-action buttons and their replacements

| # | Where | Button | Replacement | Phase |
|---|---|---|---|---|
| 1 | Graveyard bottom bar | + PLANT A PROJECT | Draggable seed packet → planting plot → seed form → drag the filled seed card into the soil | 3 |
| 2 | Empty graveyard (GraveyardPage, States.tsx) | + PLANT A PROJECT | Same seed packet and plot | 3 |
| 3 | New-project wizard | Next / Back / Plant | Deleted; replaced by the seed form (extra fields editable later via Edit) | 3 |
| 4 | Project Found panel | INSPECT THIS IDEA ↗ | Drop on the LOOK CLOSER zone → full detail view | 1 |
| 5 | Dashboard stone tooltip | OPEN PROJECT | Removed; the tooltip text reads "Drag to decide · click to look" | 1 |
| 6 | Decision Shrine path cards | click → SELECTED | The cards become drop zones; the click/SELECTED state is removed | 2 |
| 7 | Decision Shrine | Choose This Path | Removed; the drop commits, with an undo toast | 2 |
| 8 | Archive path / Archive dialog | Archive (confirm) | A drop on ARCHIVE archives immediately; undo replaces the confirm | 2 |
| 9 | Edit dialog | Save | Draggable "project card" → SAVE stamp zone | 5 |
| 10 | Archive page | Restore + confirm | Drag the archived card onto a "Bring back" sprout zone | 5 |
| 11 | Archive page | Delete + confirm | Drag onto a "Let go" zone; deletion waits 5s behind the undo toast | 5 |
| 12 | Settings | Delete all data + confirm | Drag the "graveyard" card onto a "Clear" zone, with undo | 5 |
| 13 | Settings | Add samples / Export / Import | Samples → drag onto a zone; Import → drop a .json file on a zone; Export → drag the backup crate onto a Download zone | 5 |
| 14 | Landing finale | BRING AN IDEA BACK TO LIFE → | Becomes a plain link to the graveyard | 3 |

**These stay as normal clicks:**
- Navigation: nav tabs, Log in / Get Started, the hero CTA, How it Works, Explore, the chapter dots, OPEN DECISION SHRINE, GO TO ARCHIVE, View.
- Filtering and viewing: filter chips, search, the pager.
- Edit, which only opens the form.
- Close / Esc / Cancel.
- The tag "×" inside forms.
- "Try again" on the error screen.

## Architecture

**Store**
- Extend the existing `ProjectsContext`, which persists to IndexedDB. Don't create a second store.
- `decide(id, path)`:
  - Continue → status active ("In Progress").
  - Restart → active, and progress set to 0.
  - Pivot → active, plus a "Pivoting" tag.
  - Repurpose and Archive → archived.
  - Every decision records a timeline event, which drives "Last decision: X · just now" in the panel and the Journal.
- `reasons: StallReason[]`, migrated from `stallReason`, with no duplicates.
- `undo()`, using a snapshot taken before each change. It appears as an undo toast (5s, with an "Undo" link) and also works with Ctrl+Z.
- Counts (chips, "N ideas resting", the landing stats bar) come from the store and update live.
- **Shift+R** restores the 12 demo projects. It is ignored while typing in a field.

**Drag layer**
- Use `@dnd-kit/core` and `@dnd-kit/utilities`, with one `<DndContext>` per page.
- Sensors: Pointer (6px activation distance), Touch (150ms delay, 6px tolerance) and Keyboard.
- Collision detection: `pointerWithin`, falling back to `rectIntersection`.
- One `<DragOverlay>`, portalled to body.
- z-index scale: scene 0 · stones 10 · foreground 20 · bars 50 · dock 60 · tooltips 80 · panels 100 · drag overlay 120 · toasts 130.
- Add aria-live announcements on pick-up, hover and drop.

**Dashboard Action Dock**
- It is hidden until a drag starts. Then it slides up just above the bottom bar (200ms).
- It holds 6 pixel zones of about 150×110px each:
  - LOOK CLOSER (gold, lantern icon)
  - CONTINUE (mint, sprout icon)
  - RESTART (coral, circular arrow)
  - PIVOT (lavender, branching arrow)
  - REPURPOSE (light blue, gears)
  - ARCHIVE (pink, chest)

**Drag feel**
- Pick-up: scale 1.06, tilt 3°, a hard 6px pixel shadow, a grabbing cursor, and a dashed "ghost slot" left in the original place.
- During a drag:
  - Valid zones pulse gently.
  - Invalid zones dim to 40%.
  - The hovered zone brightens, gets a 4px gold border, lifts 4px, its icon bounces once, and its label changes to "Drop to RESTART".
- Drop: the card snaps into the zone (150ms), then a burst of 8–10 pixel particles plays in the zone's colour.
- Cancel: the card flies back to its slot (200ms).
- On Archive, the stone sinks into the ground (300ms) and moves to the Archive tab.
- Turn off the stone hover glow while dragging.

**Discoverability and accessibility**
- Grab cursor on every draggable, plus a 2×3 pixel grip mark on top of each stone.
- A one-time onboarding hint: a pixel hand drags a stone to the dock, with the tooltip "Drag a stone to decide its fate". Remember it was shown in localStorage.
- Empty zones show "Drop a stone here".
- Full keyboard support (Space to pick up, arrows to move, Space to drop, Esc to cancel), with gold focus rings.
- `prefers-reduced-motion` turns off the pulse, tilt and particles, but drops still work.

**Performance**
- Animate transform and opacity only.
- Wrap Stone, Zone and the scene layers in `React.memo`.
- Drag state stays inside dnd-kit and the overlay, so the scene never re-renders during a drag.
- Use at most 1–2 CSS filter glows at once and at most about 12 particles.
- Target 60fps during a drag at 1440×900 (check in the DevTools Performance panel).

**Cleanup**
- Remove the old primary buttons completely: code, styles and dead handlers.
- Every new UI piece uses our existing pixel components and fonts.
- Nothing may overlap text.

## Phases (after each: build, tests, a console check, then commit and push)
1. Store changes, dnd-kit setup, and the dashboard Action Dock with all 6 zones working (pulse, hover, particles, fly-back, archive sink, live counts), plus the undo toast and Ctrl+Z. Removes #4 and #5.
2. Decision Shrine: the path cards become drop zones on pedestals, with the draggable current-project card. Removes #6–8.
3. Seed packet, planting plot, seed form (with a shake if the name is empty), and the grow-up animation. Removes #1–3 and #14.
4. Reason cards: the dashboard rack and the Shrine column, shown as chips in the panel; dragging a chip out removes it.
5. Onboarding hint, grip marks, a keyboard and reduced-motion pass, an fps check, and #9–13.

**Minimum to ship: phases 1–3.** Phases 4–5 are only if time allows.

## Progress log
- [ ] Phase 1: store + dnd-kit + Action Dock + undo
- [ ] Phase 2: Decision Shrine drop zones
- [ ] Phase 3: seed packet planting
- [ ] Phase 4: reason cards
- [ ] Phase 5: polish, accessibility, performance, settings/archive/edit

Notes:
- (add notes here after each phase: what changed, known issues, what's next)

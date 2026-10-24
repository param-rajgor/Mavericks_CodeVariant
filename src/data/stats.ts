/** Hardcoded stats-bar and filter-chip numbers (spec §2, §3). These are the mockups'
 * flavour numbers for a larger implied graveyard and intentionally don't equal
 * PROJECTS.length (only 6 of the "12" are shown in full demo detail). */

export const STATS = {
  projectsResting: 12,
  readyToRevive: 3,
  newIdeas: 1,
} as const;

export type FilterId = 'all' | 'stalled' | 'active' | 'archived';

export const FILTERS: { id: FilterId; label: string; count: number }[] = [
  { id: 'all', label: 'ALL', count: 12 },
  { id: 'stalled', label: 'STALLED', count: 4 },
  { id: 'active', label: 'ACTIVE', count: 2 },
  { id: 'archived', label: 'ARCHIVED', count: 2 },
];

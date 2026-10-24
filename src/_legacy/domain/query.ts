import { analyzeProject, projectToInput } from './analysis';
import { parseDate } from './dates';
import type { Project, Status } from './types';

export type StatusFilter = 'all' | Status;
export type SortKey = 'score' | 'last-worked' | 'progress' | 'name';

export interface ProjectQuery {
  search: string;
  status: StatusFilter;
  domain: string;
  tag: string;
  sort: SortKey;
}

export const DEFAULT_QUERY: ProjectQuery = { search: '', status: 'all', domain: '', tag: '', sort: 'last-worked' };

export const isQueryDefault = (q: ProjectQuery) =>
  q.search === '' && q.status === 'all' && q.domain === '' && q.tag === '';

export const SORT_LABELS: Record<SortKey, string> = {
  score: 'Relaunch Score',
  'last-worked': 'Last worked',
  progress: 'Progress',
  name: 'Name',
};

export function liveScore(p: Project, now: Date): number | null {
  return analyzeProject(projectToInput(p), now).total;
}

/** "All" means every project that is not archived, matching the default portfolio view. */
export function queryProjects(projects: readonly Project[], q: ProjectQuery, now: Date = new Date()): Project[] {
  const needle = q.search.trim().toLowerCase();
  const rows = projects.filter((p) => {
    if (q.status === 'all' ? p.status === 'archived' : p.status !== q.status) return false;
    if (q.domain && p.domain !== q.domain) return false;
    if (q.tag && !p.tags.some((t) => t.toLowerCase() === q.tag.toLowerCase())) return false;
    if (!needle) return true;
    return (
      p.name.toLowerCase().includes(needle) ||
      p.description.toLowerCase().includes(needle) ||
      p.tags.some((t) => t.toLowerCase().includes(needle))
    );
  });

  const scores = new Map(rows.map((p) => [p.id, liveScore(p, now)]));
  const worked = (p: Project) => (p.lastWorkedAt ? parseDate(p.lastWorkedAt).getTime() : 0);

  return rows.sort((a, b) => {
    switch (q.sort) {
      case 'score': {
        // Projects without a score sink to the bottom.
        const d = (scores.get(b.id) ?? -1) - (scores.get(a.id) ?? -1);
        return d || a.name.localeCompare(b.name);
      }
      case 'progress':
        return b.progress - a.progress || a.name.localeCompare(b.name);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return worked(b) - worked(a) || a.name.localeCompare(b.name);
    }
  });
}

export function statusCounts(projects: readonly Project[]): Record<StatusFilter, number> {
  const c: Record<StatusFilter, number> = { all: 0, active: 0, stalled: 0, 'needs-direction': 0, archived: 0 };
  for (const p of projects) {
    c[p.status]++;
    if (p.status !== 'archived') c.all++;
  }
  return c;
}

export const allTags = (projects: readonly Project[]) =>
  [...new Set(projects.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));

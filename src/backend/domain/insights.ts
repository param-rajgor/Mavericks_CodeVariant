/** Everything the dashboard-style screens derive from the real project list. Pure, so it is testable. */
import { analyzeProject, projectToInput } from '@/backend/domain/analysis';
import { daysSince } from '@/backend/domain/dates';
import { PATHS } from '@/backend/domain/paths';
import type { AssetCategory, PathId, Project, Status } from '@/backend/domain/types';

/** How each status looks and reads in the pixel UI. The text label always travels with the colour. */
export const STATUS_UI: Record<Status, { filter: string; chip: string; bg: string; border: string; fg: string; dot: string }> = {
  active: { filter: 'Active', chip: 'In Progress', bg: '#a9e8bf', border: '#5fb37e', fg: '#1f5534', dot: '#9ce6bd' },
  stalled: { filter: 'Stalled', chip: 'Stalled', bg: '#f7b39c', border: '#d9806a', fg: '#6e2a22', dot: '#f7b39c' },
  'needs-direction': { filter: 'To Revisit', chip: 'To Revisit', bg: '#ffd36e', border: '#d9a23a', fg: '#5a3b0c', dot: '#ffd36e' },
  archived: { filter: 'Archived', chip: 'Archived', bg: '#ece4fb', border: '#a796d8', fg: '#4b3f7a', dot: '#ece4fb' },
};

export const STATUS_ORDER: Status[] = ['active', 'stalled', 'needs-direction', 'archived'];

export function liveAnalysis(p: Project, now = new Date()) {
  return analyzeProject(projectToInput(p), now);
}

/** Days since the project was last worked on; falls back to its last update. */
export function idleDays(p: Project, now = new Date()): number {
  return daysSince((p.lastWorkedAt ?? p.updatedAt).slice(0, 10), now);
}

/** "2 months ago" style label used on tombstones. `short` gives "2 mo ago". */
export function ago(p: Project, short = false, now = new Date()): string {
  const d = idleDays(p, now);
  const unit = (n: number, long: string, abbr: string) => (short ? `${n} ${abbr} ago` : `${n} ${long}${n === 1 ? '' : 's'} ago`);
  if (d < 1) return 'today';
  if (d < 7) return d === 1 ? (short ? '1 day ago' : 'yesterday') : `${d} ${short ? 'days' : 'days'} ago`;
  if (d < 30) return unit(Math.floor(d / 7), 'week', 'wk');
  if (d < 365) return unit(Math.floor(d / 30), 'month', 'mo');
  return unit(Math.floor(d / 365), 'year', 'yr');
}

export function recency(projects: readonly Project[]): Project[] {
  return [...projects].sort((a, b) => (b.lastWorkedAt ?? b.updatedAt).localeCompare(a.lastWorkedAt ?? a.updatedAt));
}

/* ----------------------------------------------------------------- journey */

export interface JourneyStep {
  n: number;
  title: string;
  blurb: string;
  done: boolean;
}

export interface Journey {
  steps: JourneyStep[];
  done: number;
  level: number;
  levelName: string;
  /** Plain-language line under the progress bar. */
  note: string;
}

/**
 * Five steps, each earned by real actions:
 * 1 log a stalled idea, 2 understand why (a reason is recorded), 3 pick a path, 4 act on it, 5 every open idea has a path.
 */
export function journeyOf(projects: readonly Project[]): Journey {
  const open = projects.filter((p) => p.status !== 'archived');
  const some = projects.length > 0;
  const understood = projects.some((p) => p.stallReason != null);
  const decided = projects.some((p) => p.selectedPath != null);
  const acted = projects.some((p) => p.timeline.some((e) => e.type === 'restarted' || e.type === 'archived' || e.type === 'progress-updated' || e.type === 'restored'));
  const clear = some && open.every((p) => p.selectedPath != null);
  const meta = [
    ['Stalled Ideas', 'Where you began', some],
    ['Understand', 'Learn why they stalled', understood],
    ['Decision', 'Pick a path for each', decided],
    ['Take Action', 'Do the next small step', acted],
    ['A Clearer Tomorrow', 'Your next relaunch', clear],
  ] as const;
  // steps are earned in order, so a later step only counts once the earlier ones do
  let broken = false;
  const steps = meta.map(([title, blurb, ok], i) => {
    if (!ok) broken = true;
    return { n: i + 1, title, blurb, done: !broken };
  });
  const done = steps.filter((s) => s.done).length;
  const level = done >= 5 ? 3 : done >= 3 ? 2 : 1;
  const levelName = level === 3 ? 'A Clearer Tomorrow' : level === 2 ? 'Finding Direction' : 'Digging In';
  const next = steps.find((s) => !s.done);
  const left = open.filter((p) => p.selectedPath == null).length;
  const note = !next
    ? 'Every open idea has a path. Nice work.'
    : next.n === 5
      ? `${left === 1 ? 'One more decision' : `${left} more decisions`} and you reach a clearer tomorrow. Counts come from your real projects.`
      : `Next: ${next.title.toLowerCase()}. Counts come from your real projects.`;
  return { steps, done, level, levelName, note };
}

/* ------------------------------------------------------------- suggestions */

export interface Suggestion {
  key: string;
  tone: 'continue' | 'review' | 'rethink' | 'archive';
  title: string;
  detail: string;
  to: string;
}

/** Up to four gentle next steps, picked from the real projects. */
export function suggestionsFor(projects: readonly Project[], now = new Date()): Suggestion[] {
  const open = projects.filter((p) => p.status !== 'archived');
  const out: Suggestion[] = [];
  const active = recency(open.filter((p) => p.status === 'active'))[0];
  if (active) out.push({ key: 'c', tone: 'continue', title: `Continue ${active.name}`, detail: `Last worked ${ago(active, false, now)}`, to: `/decision?project=${active.id}` });
  const stalled = [...open.filter((p) => p.status === 'stalled')].sort((a, b) => idleDays(b, now) - idleDays(a, now))[0];
  if (stalled) out.push({ key: 'r', tone: 'review', title: `Review ${stalled.name}`, detail: `Stalled for ${ago(stalled, false, now).replace(' ago', '')}`, to: `/decision?project=${stalled.id}` });
  const lost = [...open.filter((p) => p.status === 'needs-direction')].sort((a, b) => idleDays(b, now) - idleDays(a, now))[0];
  if (lost) out.push({ key: 't', tone: 'rethink', title: `Rethink ${lost.name}`, detail: `Direction unclear · ${ago(lost, false, now).replace(' ago', '')}`, to: `/decision?project=${lost.id}` });
  const old = [...open].filter((p) => idleDays(p, now) > 180 && (p.currentInterest ?? 3) <= 2).sort((a, b) => idleDays(b, now) - idleDays(a, now))[0];
  if (old) out.push({ key: 'a', tone: 'archive', title: `Archive ${old.name}`, detail: `No activity in ${ago(old, false, now).replace(' ago', '')}`, to: `/decision?project=${old.id}` });
  return out.slice(0, 4);
}

/* ---------------------------------------------------------------- insights */

export const ACTIVITY_BUCKETS = [
  { key: 'w1', label: '≤1 wk', max: 7 },
  { key: 'w4', label: '1–4 wk', max: 30 },
  { key: 'm3', label: '1–3 mo', max: 90 },
  { key: 'm6', label: '3–6 mo', max: 180 },
  { key: 'm6p', label: '6 mo+', max: Infinity },
] as const;

export const ASSET_ROWS: Array<{ key: AssetCategory; label: string }> = [
  { key: 'code', label: 'Code' },
  { key: 'design', label: 'Design' },
  { key: 'research', label: 'Research' },
  { key: 'data', label: 'Data' },
  { key: 'documentation', label: 'Docs' },
];

export interface RevisitRow {
  project: Project;
  score: number;
  path: PathId | null;
  why: string;
}

export interface Insights {
  total: number;
  counts: Record<Status, number>;
  /** Not archived and either stalled, waiting for direction, or untouched for over a month. */
  ready: number;
  untouchedOver30: number;
  activity: Array<{ key: string; label: string; projects: Project[] }>;
  assets: Array<{ key: AssetCategory; label: string; count: number }>;
  noAssetInfo: number;
  scatter: Array<{ project: Project; interest: number | null; progress: number }>;
  revisit: RevisitRow[];
}

export function insightsOf(projects: readonly Project[], now = new Date()): Insights {
  const counts: Record<Status, number> = { active: 0, stalled: 0, 'needs-direction': 0, archived: 0 };
  projects.forEach((p) => counts[p.status]++);
  const open = projects.filter((p) => p.status !== 'archived');
  const activity: Insights['activity'] = ACTIVITY_BUCKETS.map((b) => ({ key: b.key, label: b.label, projects: [] }));
  projects.forEach((p) => {
    const d = idleDays(p, now);
    const i = ACTIVITY_BUCKETS.findIndex((b) => d <= b.max);
    activity[i < 0 ? activity.length - 1 : i].projects.push(p);
  });
  const rows: RevisitRow[] = open
    .map((p) => {
      const a = liveAnalysis(p, now);
      return { project: p, score: a.total ?? -1, path: a.recommendation?.path ?? null, why: a.recommendation?.reasons[0] ?? '' };
    })
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score || a.project.name.localeCompare(b.project.name));
  return {
    total: projects.length,
    counts,
    ready: open.filter((p) => p.status !== 'active' || idleDays(p, now) > 30).length,
    untouchedOver30: projects.filter((p) => idleDays(p, now) > 30).length,
    activity,
    assets: ASSET_ROWS.map((r) => ({ ...r, count: projects.filter((p) => p.assets.includes(r.key)).length })),
    noAssetInfo: projects.filter((p) => p.assets.length === 0).length,
    scatter: projects.filter((p) => p.status !== 'archived').map((p) => ({ project: p, interest: p.currentInterest, progress: p.progress })),
    revisit: rows.slice(0, 3),
  };
}

export const pathLabel = (p: PathId | null) => (p ? PATHS[p].label : 'Not decided');

/* ------------------------------------------------------------ headline numbers */

export interface GraveyardStats {
  /** Every idea in the graveyard. */
  resting: number;
  /** Open ideas whose Relaunch Score says they are worth another look. */
  ready: number;
  /** Ideas the user logged themselves in the last 30 days. */
  newIdeas: number;
}

export function graveyardStats(projects: readonly Project[], now = new Date()): GraveyardStats {
  const cutoff = now.getTime() - 30 * 86_400_000;
  return {
    resting: projects.length,
    ready: projects.filter((p) => p.status !== 'archived' && (liveAnalysis(p, now).total ?? 0) >= 60).length,
    newIdeas: projects.filter((p) => !p.isDemo && new Date(p.createdAt).getTime() >= cutoff).length,
  };
}

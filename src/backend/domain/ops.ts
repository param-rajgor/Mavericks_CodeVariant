/**
 * Pure state transitions for a project. Each takes the old project and returns the new one
 * with derived fields (score snapshot, recommendation) and timeline events already applied.
 * The store only persists the result.
 */
import { analyzeProject, projectToInput } from '@/backend/domain/analysis';
import { PATHS, STATUS_META } from '@/backend/domain/paths';
import { diffEvents, makeEvent, newId, pathSelectedEvent, type EventDraft } from '@/backend/domain/timeline';
import { draftToFields, type ProjectDraft } from '@/backend/domain/draft';
import type { OpenStatus, PathId, Project, StallReason, TimelineEvent } from '@/backend/domain/types';

type Fields = ReturnType<typeof draftToFields>;

function withDerived(p: Project, now: Date): Project {
  const a = analyzeProject(projectToInput(p), now);
  return { ...p, score: a.total, scoreStatus: a.status, recommendedPath: a.recommendation?.path ?? null };
}

/** Score and recommendation events, emitted only when the numbers actually moved. */
function derivedEvents(before: Project | null, after: Project): EventDraft[] {
  const out: EventDraft[] = [];
  if (after.score != null && (before == null || before.score !== after.score || before.scoreStatus !== after.scoreStatus)) {
    out.push({
      type: 'score-recalculated',
      description:
        before?.score != null
          ? `Relaunch Score moved from ${before.score} to ${after.score}${after.scoreStatus === 'provisional' ? ' (provisional)' : ''}.`
          : `Relaunch Score calculated: ${after.score}${after.scoreStatus === 'provisional' ? ' (provisional)' : ''}.`,
      meta: { from: before?.score ?? null, to: after.score },
    });
  }
  if (after.recommendedPath && (before == null || before.recommendedPath !== after.recommendedPath)) {
    out.push({
      type: 'recommendation-generated',
      description: `Suggested path: ${PATHS[after.recommendedPath].label}.`,
      meta: { path: after.recommendedPath },
    });
  }
  return out;
}

function append(p: Project, drafts: EventDraft[], now: Date): Project {
  // Space timestamps by a millisecond so order is stable when several events share a moment.
  const events: TimelineEvent[] = drafts.map((d, i) => makeEvent(d, new Date(now.getTime() + i)));
  return { ...p, timeline: [...p.timeline, ...events], updatedAt: now.toISOString() };
}

export function createProject(draft: ProjectDraft, now: Date = new Date()): Project {
  const f = draftToFields(draft);
  const base: Project = {
    id: newId(),
    ...f,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    score: null,
    scoreStatus: 'insufficient',
    recommendedPath: null,
    selectedPath: null,
    archiveNote: '',
    archivedAt: null,
    previousStatus: null,
    timeline: [],
  };
  const derived = withDerived(base, now);
  return append(derived, [{ type: 'created', description: `Logged "${derived.name}" in the graveyard.` }, ...derivedEvents(null, derived)], now);
}

export function editProject(old: Project, patch: Partial<Fields>, now: Date = new Date()): Project {
  const next = withDerived({ ...old, ...patch }, now);
  return append(next, [...diffEvents(old, next), ...derivedEvents(old, next)], now);
}

/** Records new progress; marks the project as worked on today unless told otherwise. */
export function updateProgress(old: Project, progress: number, lastWorkedAt: string | null, now: Date = new Date()): Project {
  return editProject(old, { progress: Math.min(100, Math.max(0, Math.round(progress))), lastWorkedAt: lastWorkedAt ?? old.lastWorkedAt }, now);
}

/** Choosing Continue/Restart/Pivot means you are working on it again, so the project becomes Active. */
export function choosePath(old: Project, path: PathId, now: Date = new Date()): Project {
  if (path === 'archive') throw new Error('Use archiveProject for the archive path.');
  let next: Project = { ...old, selectedPath: path };
  const events: EventDraft[] = [pathSelectedEvent(path, old.selectedPath)];
  if (path === 'restart') events.push({ type: 'restarted', description: 'Restarting with a smaller scope and a clearer plan.' });
  if (path !== 'repurpose' && old.status !== 'active') {
    next = { ...next, status: 'active' as OpenStatus };
    events.push({
      type: 'status-changed',
      description: `Status changed from ${STATUS_META[old.status].label} to ${STATUS_META.active.label}.`,
      meta: { from: old.status, to: 'active' },
    });
  }
  return append(next, events, now);
}

export function archiveProject(old: Project, note: string, now: Date = new Date()): Project {
  const trimmed = note.trim();
  const events: EventDraft[] = [];
  if (old.selectedPath !== 'archive') events.push(pathSelectedEvent('archive', old.selectedPath));
  events.push({ type: 'archived', description: 'Archived. History and assets are kept.' });
  if (trimmed) events.push({ type: 'archive-note-added', description: 'Added an archive note.' });
  const next: Project = {
    ...old,
    status: 'archived',
    previousStatus: old.status === 'archived' ? old.previousStatus : (old.status as OpenStatus),
    selectedPath: 'archive',
    archiveNote: trimmed || old.archiveNote,
    archivedAt: now.toISOString(),
  };
  return append(next, events, now);
}

export function restoreProject(old: Project, status: OpenStatus, now: Date = new Date()): Project {
  const reopened: Project = {
    ...old,
    status,
    selectedPath: old.selectedPath === 'archive' ? null : old.selectedPath,
    archivedAt: null,
  };
  const next = withDerived(reopened, now);
  return append(next, [{ type: 'restored', description: `Restored as ${STATUS_META[status].label}. Everything from before is still here.` }, ...derivedEvents(old, next)], now);
}

/**
 * The one decision a user makes by dropping a project on a path (Canvas Protocol).
 * Continue → active. Restart → active, progress back to 0. Pivot → active, tagged "Pivoting".
 * Repurpose and Archive → archived. Every decision is a "path-selected" event in the timeline.
 */
export function decideProject(old: Project, path: PathId, now: Date = new Date()): Project {
  if (path === 'archive') return archiveProject(old, '', now);
  if (path === 'repurpose') {
    const events: EventDraft[] = [pathSelectedEvent('repurpose', old.selectedPath)];
    if (old.status !== 'archived') events.push({ type: 'archived', description: 'Archived so its parts can be reused. History and assets are kept.' });
    return append(
      {
        ...old,
        status: 'archived',
        previousStatus: old.status === 'archived' ? old.previousStatus : (old.status as OpenStatus),
        selectedPath: 'repurpose',
        archivedAt: old.archivedAt ?? now.toISOString(),
      },
      events,
      now,
    );
  }
  // reopening an archived project first, so its history says it came back
  const base = old.status === 'archived' ? { ...old, status: 'stalled' as OpenStatus, archivedAt: null } : old;
  let next = choosePath(base, path, now);
  if (path === 'restart' && next.progress !== 0) next = editProject(next, { progress: 0 }, now);
  if (path === 'pivot' && !next.tags.some((t) => t.toLowerCase() === 'pivoting')) next = { ...next, tags: [...next.tags, 'Pivoting'] };
  return next;
}

/** The most recent decision recorded in a project's timeline, if any. */
export function lastDecision(p: Project): { path: PathId; at: string } | null {
  for (let i = p.timeline.length - 1; i >= 0; i--) {
    const e = p.timeline[i];
    if (e.type === 'path-selected' && typeof e.meta?.path === 'string') return { path: e.meta.path as PathId, at: e.at };
  }
  return null;
}

/** Projects keep a list of reasons; the first one also fills the older single `stallReason` field the score reads. */
export function withReasons(p: Project, reasons: StallReason[]): Project {
  const unique = [...new Set(reasons)];
  return { ...p, reasons: unique, stallReason: unique[0] ?? null };
}

/** Older records only have `stallReason`; give them the list form, and keep both fields in step. */
export function normaliseReasons(p: Project): Project {
  let reasons = Array.isArray(p.reasons) ? [...new Set(p.reasons)] : [];
  if (p.stallReason && !reasons.includes(p.stallReason)) reasons = [p.stallReason, ...reasons];
  const stallReason = p.stallReason ?? reasons[0] ?? null;
  if (Array.isArray(p.reasons) && reasons.length === p.reasons.length && reasons.every((r, i) => r === p.reasons![i]) && stallReason === p.stallReason) return p;
  return { ...p, reasons, stallReason };
}

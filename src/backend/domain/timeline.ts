import { ASSET_META, PATHS, STATUS_META } from '@/backend/domain/paths';
import type { EventType, Project, TimelineEvent } from '@/backend/domain/types';

export const EVENT_LABELS: Record<EventType, string> = {
  created: 'Project created',
  edited: 'Details edited',
  'progress-updated': 'Progress updated',
  'status-changed': 'Status changed',
  'assets-changed': 'Assets changed',
  'score-recalculated': 'Score recalculated',
  'recommendation-generated': 'Recommendation generated',
  'path-selected': 'Path selected',
  restarted: 'Project restarted',
  archived: 'Archived',
  'archive-note-added': 'Archive note added',
  restored: 'Restored from archive',
};

export const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export type EventDraft = Pick<TimelineEvent, 'type' | 'description' | 'meta'>;

export function makeEvent(draft: EventDraft, at: Date = new Date(), demo = false): TimelineEvent {
  return { id: newId(), at: at.toISOString(), ...draft, ...(demo ? { demo: true } : {}) };
}

const sameList = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Events that describe what changed between two versions of a project. Does not include score events. */
export function diffEvents(before: Project, after: Project): EventDraft[] {
  const out: EventDraft[] = [];

  if (before.progress !== after.progress) {
    out.push({
      type: 'progress-updated',
      description: `Progress updated from ${before.progress}% to ${after.progress}%.`,
      meta: { from: before.progress, to: after.progress },
    });
  }
  if (before.status !== after.status && after.status !== 'archived' && before.status !== 'archived') {
    out.push({
      type: 'status-changed',
      description: `Status changed from ${STATUS_META[before.status].label} to ${STATUS_META[after.status].label}.`,
      meta: { from: before.status, to: after.status },
    });
  }

  const added = after.assets.filter((a) => !before.assets.includes(a));
  const removed = before.assets.filter((a) => !after.assets.includes(a));
  if (added.length || removed.length) {
    const parts: string[] = [];
    if (added.length) parts.push(`added ${added.map((a) => ASSET_META[a].label.toLowerCase()).join(', ')}`);
    if (removed.length) parts.push(`removed ${removed.map((a) => ASSET_META[a].label.toLowerCase()).join(', ')}`);
    out.push({ type: 'assets-changed', description: `Assets: ${parts.join('; ')}.` });
  }

  const changed: string[] = [];
  if (before.name !== after.name) changed.push('name');
  if (before.description !== after.description) changed.push('description');
  if (before.domain !== after.domain) changed.push('domain');
  if (!sameList(before.tags, after.tags)) changed.push('tags');
  if (!sameList(before.completedItems, after.completedItems)) changed.push('what has been built');
  if (!sameList(before.remainingItems, after.remainingItems)) changed.push('what remains');
  if (before.assetNotes !== after.assetNotes) changed.push('asset notes');
  if (before.stallReason !== after.stallReason || before.stallReasonDetails !== after.stallReasonDetails) changed.push('why it stopped');
  if (before.currentInterest !== after.currentInterest || before.interestNote !== after.interestNote) changed.push('current interest');
  if (before.lastWorkedAt !== after.lastWorkedAt) changed.push('last-worked date');
  if (before.startedAt !== after.startedAt) changed.push('start date');
  if (changed.length) out.push({ type: 'edited', description: `Edited ${changed.join(', ')}.` });

  return out;
}

export function pathSelectedEvent(path: Project['selectedPath'], previous: Project['selectedPath']): EventDraft {
  const label = path ? PATHS[path].label : 'none';
  return {
    type: 'path-selected',
    description: previous && previous !== path ? `Changed path from ${PATHS[previous].label} to ${label}.` : `Chose ${label}: ${path ? PATHS[path].tagline : ''}`,
    meta: { path: path ?? null, previous: previous ?? null },
  };
}

/** Newest first, consistently, everywhere. */
export const byNewest = (a: TimelineEvent, b: TimelineEvent) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0);

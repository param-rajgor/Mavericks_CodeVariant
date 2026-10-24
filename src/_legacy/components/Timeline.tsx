import { Archive, ArchiveRestore, Calculator, Compass, FilePlus, Flag, Lightbulb, Pencil, Puzzle, RefreshCw, TrendingUp, type LucideIcon } from 'lucide-react';
import type { EventType, TimelineEvent } from '../domain/types';
import { EVENT_LABELS, byNewest } from '../domain/timeline';
import { formatDateTime } from '../domain/dates';

const ICONS: Record<EventType, LucideIcon> = {
  created: FilePlus,
  edited: Pencil,
  'progress-updated': TrendingUp,
  'status-changed': Flag,
  'assets-changed': Puzzle,
  'score-recalculated': Calculator,
  'recommendation-generated': Lightbulb,
  'path-selected': Compass,
  restarted: RefreshCw,
  archived: Archive,
  'archive-note-added': Pencil,
  restored: ArchiveRestore,
};

export interface TimelineRow {
  event: TimelineEvent;
  projectName?: string;
  projectId?: string;
}

/** A vertical timeline, newest first. Sample events are labelled. */
export function TimelineList({ rows }: { rows: TimelineRow[] }) {
  const sorted = [...rows].sort((a, b) => byNewest(a.event, b.event));
  return (
    <ol className="relative space-y-0 border-l-4 border-lavender/60 pl-6" aria-label="Project history, newest first">
      {sorted.map(({ event, projectName, projectId }) => {
        const Icon = ICONS[event.type];
        return (
          <li key={event.id} className="relative pb-6 last:pb-0">
            <span aria-hidden className="absolute -left-[2.15rem] top-0.5 grid size-8 place-items-center rounded-sm border-[3px] border-night bg-cream shadow-[2px_2px_0_#17183E]">
              <Icon className="size-4" />
            </span>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h4 className="text-sm font-extrabold">{EVENT_LABELS[event.type]}</h4>
              <time dateTime={event.at} className="font-mono text-xs text-muted">
                {formatDateTime(event.at)}
              </time>
              {event.demo && <span className="chip !bg-cream !text-[#6B4A00]">Sample event</span>}
            </div>
            {projectName && projectId && (
              <p className="text-xs font-bold text-twilight">
                <a href={`#/projects/${projectId}`} className="underline underline-offset-2">
                  {projectName}
                </a>
              </p>
            )}
            <p className="mt-0.5 text-sm text-muted">{event.description}</p>
          </li>
        );
      })}
    </ol>
  );
}


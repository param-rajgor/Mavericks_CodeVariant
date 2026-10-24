import type { Project } from '@/backend/domain/types';
import { liveAnalysis } from '@/backend/domain/insights';
import { PROJECT_ICONS } from '@/frontend/graveyard/gravestone/icons';
import { StatusPill } from '@/frontend/graveyard/gravestone/StatusPill';
import { toStone } from '@/frontend/graveyard/stone';

/** One project as a wide card: stone icon, name, status, a line about it and a progress bar. */
export function ProjectRow({ project, onOpen }: { project: Project; onOpen: (id: string) => void }) {
  const s = toStone(project);
  const Icon = PROJECT_ICONS[s.icon];
  const score = liveAnalysis(project).total;
  return (
    <button
      type="button"
      onClick={() => onOpen(project.id)}
      aria-label={`${s.name}. ${s.status}. Last visited ${s.lastVisited}. Open details.`}
      className="rl-panel flex w-full items-center gap-5 p-4 text-left transition-transform hover:-translate-y-0.5"
    >
      <span className="notched grid size-16 shrink-0 place-items-center bg-stone">
        <Icon size={32} color="#4a3e80" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-3">
          <span className="font-pixel text-2xl font-bold leading-tight text-soft [overflow-wrap:anywhere]">{s.name}</span>
          <StatusPill status={s.status} />
        </span>
        <span className="mt-1 block text-[1.05rem] text-dim">{s.description}</span>
        <span className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.95rem] font-bold text-dim">
          <span>Last visited {s.lastVisited}</span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-28 border-2 border-[#3a2f6e] bg-night" aria-hidden="true">
              <span className="block h-full bg-mint" style={{ width: `${s.progress}%` }} />
            </span>
            {s.progress}%
          </span>
          {score != null && <span>Score {score}</span>}
        </span>
      </span>
    </button>
  );
}

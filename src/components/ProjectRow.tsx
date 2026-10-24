import type { Project } from '../domain/types';
import { STATUS_UI, ago, liveAnalysis } from '../domain/insights';
import { Island, Lantern, Tomb } from '../ui/pixel';

/** A wide card for one project: a small island and tombstone beside the details. Used on phones and in list view. */
export function ProjectRow({ project, variant = 0, onOpen, detailed = false }: { project: Project; variant?: number; onOpen: (id: string) => void; detailed?: boolean }) {
  const ui = STATUS_UI[project.status];
  const score = detailed ? liveAnalysis(project).total : null;
  return (
    <button
      type="button"
      data-ghost="tomb"
      onClick={() => onOpen(project.id)}
      aria-label={`${project.name}. ${ui.chip}. Last worked ${ago(project)}. Open details.`}
      className="rl-panel flex w-full items-center gap-4 p-3 pr-5 text-left transition-transform hover:-translate-y-0.5 sm:gap-6"
    >
      <span className="relative block w-28 shrink-0 sm:w-36" style={{ aspectRatio: '40 / 30' }}>
        <Island variant={variant} className="absolute inset-x-0 bottom-0 w-full" />
        <Tomb className="absolute left-1/2 w-[34%] -translate-x-1/2" style={{ bottom: '38%', aspectRatio: '18 / 24', height: 'auto' }} />
        <Lantern className="absolute" style={{ left: '10%', bottom: '14%', width: '6%' }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-title text-2xl font-bold leading-tight text-soft [overflow-wrap:anywhere] sm:text-3xl">{project.name}</span>
        <span className="mt-2 inline-flex rounded-md border-2 border-night px-2.5 py-0.5 text-sm font-extrabold" style={{ background: ui.bg, color: ui.fg }}>
          {ui.chip}
        </span>
        {detailed && (
          <span className="mt-2 block text-sm text-dim">
            {project.description}
          </span>
        )}
        <span className="mt-2 block font-mono text-xs text-dim">
          Last worked {ago(project)}
          {detailed && ` · ${project.progress}% done`}
          {score != null && ` · Score ${score}`}
        </span>
      </span>
    </button>
  );
}

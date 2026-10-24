import { useMemo } from 'react';
import { analyzeProject, projectToInput } from '../domain/analysis';
import { PATH_LIST } from '../domain/paths';
import type { PathId, Project } from '../domain/types';
import { Link } from '../lib/router';
import { PageHeader, StatusBadge } from '../components/ui';
import { PATH_ICONS } from '../components/ui';
import { useProjects } from '../store/ProjectsContext';

export function PathsPage() {
  const { projects } = useProjects();

  const grouped = useMemo(() => {
    const g: Record<PathId, Array<{ p: Project; chosen: boolean }>> = { continue: [], restart: [], pivot: [], repurpose: [], archive: [] };
    for (const p of projects) {
      const path = p.selectedPath ?? analyzeProject(projectToInput(p)).recommendation?.path;
      if (path) g[path].push({ p, chosen: !!p.selectedPath });
    }
    return g;
  }, [projects]);

  return (
    <>
      <PageHeader title="Relaunch Paths" subtitle="Five clear options for every unfinished project. None of them is a failure." />
      <div className="grid gap-5 md:grid-cols-2">
        {PATH_LIST.map((path) => {
          const Icon = PATH_ICONS[path.id];
          const items = grouped[path.id];
          return (
            <section key={path.id} aria-labelledby={`path-${path.id}`} className="rounded-md border-[3px] p-5" style={{ background: path.soft, borderColor: path.accent, color: path.ink }}>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-sm border-[3px] border-night" style={{ background: path.accent }}>
                  <Icon aria-hidden className="size-6 text-night" />
                </span>
                <div>
                  <h2 id={`path-${path.id}`} className="text-xl font-extrabold">{path.label}</h2>
                  <p className="text-sm font-bold">{path.verb}</p>
                </div>
              </div>
              <p className="mt-3 text-sm">{path.meaning}</p>
              <p className="mt-2 text-sm"><span className="font-extrabold">Best when: </span>{path.bestWhen}</p>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {path.examples.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <div className="mt-4 rounded-md bg-white/70 p-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wide">Your projects here ({items.length})</h3>
                {items.length ? (
                  <ul className="mt-1 divide-y divide-line">
                    {items.map(({ p, chosen }) => (
                      <li key={p.id}>
                        <Link to={`/projects/${p.id}/decision`} className="flex min-h-11 flex-wrap items-center gap-2 py-1 text-night hover:underline">
                          <span className="text-sm font-extrabold">{p.name}</span>
                          <StatusBadge status={p.status} />
                          <span className="text-xs font-semibold text-muted">{chosen ? 'chosen' : 'suggested'}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-muted">No projects on this path yet.</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

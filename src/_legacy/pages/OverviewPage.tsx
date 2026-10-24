import { useMemo } from 'react';
import { ArrowRight, FolderOpen, Gauge, Hourglass, Sparkles, Sprout, Archive as ArchiveIcon, Compass } from 'lucide-react';
import { useProjects } from '../store/ProjectsContext';
import { analyzeProject, projectToInput } from '../domain/analysis';
import { timeAgo } from '../domain/dates';
import { Link } from '../lib/router';
import { EmptyState, LinkButton, PageHeader, PathBadge, SectionTitle, StatusBadge } from '../components/ui';
import { Button } from '../components/ui';
import { useSafe } from '../components/Toast';

function Stat({ label, value, icon: Icon, to, note }: { label: string; value: number; icon: typeof Gauge; to: string; note?: string }) {
  return (
    <Link to={to} className="rl-panel group flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5">
      <span className="grid size-11 shrink-0 place-items-center rounded-sm border-[3px] border-night bg-cream">
        <Icon aria-hidden className="size-5" />
      </span>
      <span>
        <span className="block font-mono text-2xl font-semibold leading-none">{value}</span>
        <span className="block text-sm font-extrabold">{label}</span>
        {note && <span className="block text-xs text-muted">{note}</span>}
      </span>
    </Link>
  );
}

export function OverviewPage() {
  const { projects, actions } = useProjects();
  const safe = useSafe();

  const data = useMemo(() => {
    const now = new Date();
    const scored = projects.map((p) => ({ p, score: analyzeProject(projectToInput(p), now).total, path: analyzeProject(projectToInput(p), now).recommendation?.path ?? null }));
    const open = scored.filter((x) => x.p.status !== 'archived');
    return {
      total: projects.length,
      active: projects.filter((p) => p.status === 'active').length,
      stalled: projects.filter((p) => p.status === 'stalled').length,
      archived: projects.filter((p) => p.status === 'archived').length,
      needDecision: open.filter((x) => !x.p.selectedPath),
      recent: [...projects].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 4),
      high: open.filter((x) => (x.score ?? 0) >= 70).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 4),
    };
  }, [projects]);

  if (projects.length === 0) {
    return (
      <>
        <PageHeader title="Overview" subtitle="A calm look at where your ideas stand." />
        <EmptyState
          icon={FolderOpen}
          title="Nothing to overview yet"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <LinkButton to="/projects/new" variant="gold">Log your first project</LinkButton>
              <Button onClick={() => safe(() => actions.loadSamples(), 'Could not load samples')}>Load sample projects</Button>
            </div>
          }
        >
          Once you log a project, these numbers are calculated from what you have stored on this device.
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Overview" subtitle="A calm look at where your ideas stand." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Total projects" value={data.total} icon={FolderOpen} to="/projects" />
        <Stat label="Active" value={data.active} icon={Sprout} to="/projects" />
        <Stat label="Stalled" value={data.stalled} icon={Hourglass} to="/projects" note="Paused, not failed" />
        <Stat label="Archived" value={data.archived} icon={ArchiveIcon} to="/archive" />
        <Stat label="Waiting for a decision" value={data.needDecision.length} icon={Compass} to="/projects" note="No path chosen yet" />
        <Stat label="High Relaunch Score" value={data.high.length} icon={Sparkles} to="/projects" note="70 or more" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="recent">
          <SectionTitle id="recent">Recently updated</SectionTitle>
          <ul className="rl-panel-flat divide-y-2 divide-line">
            {data.recent.map((p) => (
              <li key={p.id}>
                <Link to={`/projects/${p.id}`} className="flex min-h-14 items-center gap-3 p-3 hover:bg-[#f7f4ff]">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold">{p.name}</span>
                    <span className="block text-xs text-muted">Updated {timeAgo(p.updatedAt)}</span>
                  </span>
                  <StatusBadge status={p.status} />
                  <ArrowRight aria-hidden className="size-4 shrink-0 text-twilight" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="high">
          <SectionTitle id="high">Worth a second look</SectionTitle>
          {data.high.length ? (
            <ul className="rl-panel-flat divide-y-2 divide-line">
              {data.high.map(({ p, score, path }) => (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}/decision`} className="flex min-h-14 items-center gap-3 p-3 hover:bg-[#f7f4ff]">
                    <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-night font-mono text-sm font-semibold text-soft">{score}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-extrabold">{p.name}</span>
                      <span className="text-xs text-muted">See the reasoning</span>
                    </span>
                    {path && <PathBadge path={path} />}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rl-panel-flat p-4 text-sm text-muted">No project scores 70 or above right now. Updating progress or interest can change that.</p>
          )}
        </section>
      </div>
    </>
  );
}

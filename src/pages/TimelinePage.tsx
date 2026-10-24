import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { useProjects } from '../store/ProjectsContext';
import { navigate } from '../lib/router';
import { EmptyState, LinkButton, PageHeader } from '../components/ui';
import { TimelineList } from '../components/Timeline';
import { MissingProject } from './ProjectDetailPage';

export function TimelinePage({ projectId }: { projectId?: string }) {
  const { projects, get } = useProjects();
  const selected = projectId ? get(projectId) : undefined;

  const rows = useMemo(
    () =>
      projects
        .filter((p) => !projectId || p.id === projectId)
        .flatMap((p) => p.timeline.map((event) => ({ event, projectName: p.name, projectId: p.id }))),
    [projects, projectId],
  );

  if (projectId && !selected) return <MissingProject />;

  return (
    <>
      <PageHeader
        title="Timeline"
        subtitle={selected ? `The journey of ${selected.name}, newest first.` : 'Every recorded event across your projects, newest first.'}
        actions={
          <label className="block">
            <span className="mb-1 block text-xs font-extrabold">Show</span>
            <select className="rl-input !w-auto" value={projectId ?? ''} onChange={(e) => navigate(e.target.value ? `/timeline?project=${encodeURIComponent(e.target.value)}` : '/timeline')}>
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        }
      />
      {rows.length === 0 ? (
        <EmptyState icon={Clock} title="No history yet" action={<LinkButton to="/projects/new" variant="gold">Log a project</LinkButton>}>
          Events appear here as you create, update, decide on and archive projects. Nothing is invented for you.
        </EmptyState>
      ) : (
        <div className="rl-panel-flat p-4 pl-8 sm:p-6 sm:pl-10">
          <TimelineList rows={rows} />
        </div>
      )}
    </>
  );
}

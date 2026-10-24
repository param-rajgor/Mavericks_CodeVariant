import { useMemo, useState } from 'react';
import { useProjects } from '../store/ProjectsContext';
import { useShell } from '../components/shellContext';
import { RestoreDialog } from '../components/ProjectDialogs';
import { DeleteDialog } from '../components/ProjectDialogs';
import { EmptyArchive } from '../components/States';
import { Button, PageHeader } from '../components/ui';
import { Island, Tomb } from '../ui/pixel';
import { ASSET_META, STATUS_META } from '../domain/paths';
import { STATUS_UI } from '../domain/insights';
import type { Project } from '../domain/types';

const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
const monthDay = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fullDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

function ArchiveCard({ project, variant }: { project: Project; variant: number }) {
  const { openDetail } = useShell();
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const at = project.archivedAt ?? project.updatedAt;
  const prev = STATUS_META[project.previousStatus ?? 'stalled'].label;
  const ui = STATUS_UI.archived;

  return (
    <li className="flex flex-col">
      <div aria-hidden className="relative mx-auto -mb-6 w-[62%]" style={{ maxWidth: 220 }}>
        <Island variant={variant + 1} className="w-full" />
        <Tomb className="absolute left-1/2 w-[34%] -translate-x-1/2" style={{ bottom: '52%', aspectRatio: '18 / 24', height: 'auto' }} />
      </div>
      <article className="rl-panel relative flex flex-1 flex-col p-5" aria-labelledby={`arch-${project.id}`}>
        <header className="flex items-start justify-between gap-3">
          <h2 id={`arch-${project.id}`} className="font-title text-3xl font-bold leading-tight text-soft [overflow-wrap:anywhere]">
            {project.name}
          </h2>
          <span className="rl-status shrink-0" style={{ background: ui.bg, color: ui.fg }}>
            {ui.chip}
          </span>
        </header>
        <p className="mt-1 font-mono text-xs text-dim">{fullDate(at)}</p>
        <p className="mt-3 text-[15px] leading-snug text-soft">{project.archiveNote ? `“${project.archiveNote}”` : 'No archive note. It rests quietly.'}</p>
        <dl className="mt-3 grid grid-cols-[6rem_1fr] gap-y-1.5 text-sm">
          <dt className="font-mono text-xs uppercase text-dim">Assets</dt>
          <dd className="font-bold text-soft">{project.assets.length ? project.assets.map((a) => ASSET_META[a].label).join(' · ') : 'None recorded'}</dd>
          <dt className="font-mono text-xs uppercase text-dim">Previously</dt>
          <dd className="font-bold text-soft">{prev}</dd>
        </dl>
        <ol className="mt-4 space-y-1.5 border-l-[3px] border-twilight pl-3 text-[13px] text-cream" aria-label="Short history">
          <li>{monthYear(project.startedAt)} · Started</li>
          <li>
            {prev} · Last worked
          </li>
          <li className="font-bold text-soft">
            Archived {monthDay(at)} · Rested
          </li>
        </ol>
        <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
          <Button variant="ghost" small onClick={() => openDetail(project.id)}>
            Open Details
          </Button>
          <Button variant="ghost" small onClick={() => openDetail(project.id)}>
            View History
          </Button>
          <Button variant="mint" small onClick={() => setRestoring(true)}>
            Restore
          </Button>
          <Button variant="rose" small onClick={() => setConfirm(true)} aria-expanded={confirm}>
            Delete
          </Button>
        </div>
        {confirm && (
          <div role="group" aria-label={`Confirm deleting ${project.name}`} className="mt-4 rounded-xl border-[3px] p-4" style={{ borderColor: '#ff9db5', background: '#2a1a3f' }}>
            <p className="font-extrabold text-soft">Delete {project.name} for good?</p>
            <p className="mt-1 text-xs text-dim">This cannot be undone. Restore it instead if you might want it back.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Button variant="ghost" small onClick={() => setConfirm(false)} data-autofocus>
                Keep it
              </Button>
              <Button variant="rose-solid" small onClick={() => setDeleting(true)}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </article>
      <RestoreDialog project={project} open={restoring} onClose={() => setRestoring(false)} />
      <DeleteDialog project={project} open={deleting} onClose={() => setDeleting(false)} onDone={() => setConfirm(false)} />
    </li>
  );
}

export function ArchivePage() {
  const { projects } = useProjects();
  const { search } = useShell();
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter((p) => p.status === 'archived' && (!q || p.name.toLowerCase().includes(q) || p.archiveNote.toLowerCase().includes(q)))
      .sort((a, b) => (b.archivedAt ?? '').localeCompare(a.archivedAt ?? ''));
  }, [projects, search]);

  return (
    <div className="mx-auto max-w-[88rem]">
      <PageHeader title="Archive" subtitle="Resting is not failing. Everything here can come back." />
      {rows.length === 0 ? (
        <div className="mt-6 max-w-xl">
          <EmptyArchive />
        </div>
      ) : (
        <ul className="mt-12 grid gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p, i) => (
            <ArchiveCard key={p.id} project={p} variant={i} />
          ))}
        </ul>
      )}
    </div>
  );
}

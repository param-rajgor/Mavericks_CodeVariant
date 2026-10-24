import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { ASSET_META, STATUS_META } from '@/backend/domain/paths';
import type { Project } from '@/backend/domain/types';
import { useChrome } from '@/frontend/shell/AppChrome';
import { Button, PageHeader } from '@/frontend/ui/primitives';
import { StatusPill } from '@/frontend/graveyard/gravestone/StatusPill';
import { PROJECT_ICONS } from '@/frontend/graveyard/gravestone/icons';
import { toStone } from '@/frontend/graveyard/stone';
import { DeleteDialog, RestoreDialog } from '@/frontend/workspace/components/ProjectDialogs';
import { EmptyArchive } from '@/frontend/workspace/components/States';

const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
const monthDay = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fullDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

function ArchiveCard({ project }: { project: Project }) {
  const { openDetail } = useChrome();
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const stone = toStone(project);
  const Icon = PROJECT_ICONS[stone.icon];
  const at = project.archivedAt ?? project.updatedAt;
  const prev = STATUS_META[project.previousStatus ?? 'stalled'].label;

  return (
    <li className="flex">
      <article className="rl-panel flex w-full flex-col p-5" aria-labelledby={`arch-${project.id}`}>
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="notched grid size-12 shrink-0 place-items-center bg-stone">
              <Icon size={26} color="#4a3e80" aria-hidden="true" />
            </span>
            <h2 id={`arch-${project.id}`} className="font-pixel text-2xl font-bold leading-tight text-soft [overflow-wrap:anywhere]">
              {project.name}
            </h2>
          </div>
          <StatusPill status="Archived" />
        </header>
        <p className="mt-2 text-[0.9rem] font-bold tracking-wide text-dim">{fullDate(at)}</p>
        <p className="mt-3 text-[1.05rem] leading-snug text-soft">{project.archiveNote ? `“${project.archiveNote}”` : 'No archive note. It rests quietly.'}</p>
        <dl className="mt-4 grid grid-cols-[6.5rem_1fr] gap-y-1.5 text-base">
          <dt className="text-[0.85rem] font-extrabold uppercase text-dim">Assets</dt>
          <dd className="font-bold text-soft">{project.assets.length ? project.assets.map((a) => ASSET_META[a].label).join(' · ') : 'None recorded'}</dd>
          <dt className="text-[0.85rem] font-extrabold uppercase text-dim">Previously</dt>
          <dd className="font-bold text-soft">{prev}</dd>
        </dl>
        <ol className="mt-4 space-y-1.5 border-l-[3px] border-twilight pl-3 text-[0.95rem] text-dim" aria-label="Short history">
          <li>{monthYear(project.startedAt)} · Started</li>
          <li>{prev} · Last worked</li>
          <li className="font-bold text-soft">Archived {monthDay(at)} · Rested</li>
        </ol>
        <div className="mt-auto grid grid-cols-2 gap-x-3 gap-y-4 pt-6">
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
          <div role="group" aria-label={`Confirm deleting ${project.name}`} className="mt-5 border-[3px] border-blossom bg-deep p-4">
            <p className="text-lg font-extrabold text-soft">Delete {project.name} for good?</p>
            <p className="mt-1 text-[0.95rem] text-dim">This cannot be undone. Restore it instead if you might want it back.</p>
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
  const [search, setSearch] = useState('');
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter((p) => p.status === 'archived' && (!q || p.name.toLowerCase().includes(q) || p.archiveNote.toLowerCase().includes(q)))
      .sort((a, b) => (b.archivedAt ?? '').localeCompare(a.archivedAt ?? ''));
  }, [projects, search]);

  return (
    <div>
      <PageHeader title="Archive" subtitle="Resting is not failing. Everything here can come back." />
      <label className="notched mb-6 flex min-h-12 max-w-sm items-center gap-2 border-2 border-twilight bg-deep px-4">
        <Search aria-hidden className="size-5 shrink-0 text-dim" />
        <span className="sr-only">Search the archive</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the archive..." className="w-full bg-transparent text-base font-semibold text-soft outline-none placeholder:text-[#a99fd3]" />
      </label>
      {rows.length === 0 ? (
        <div className="max-w-xl">
          <EmptyArchive />
        </div>
      ) : (
        <ul className="grid gap-x-7 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <ArchiveCard key={p.id} project={p} />
          ))}
        </ul>
      )}
    </div>
  );
}

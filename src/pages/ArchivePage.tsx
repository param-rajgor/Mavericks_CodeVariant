import { useMemo, useState } from 'react';
import { Archive as ArchiveIcon, ArchiveRestore, Search, SearchX, Trash2 } from 'lucide-react';
import { useProjects } from '../store/ProjectsContext';
import { formatDate } from '../domain/dates';
import { ASSET_META } from '../domain/paths';
import type { Project } from '../domain/types';
import { Link } from '../lib/router';
import { Button, EmptyState, LinkButton, PageHeader, SampleChip, TagList } from '../components/ui';
import { DeleteDialog, RestoreDialog } from '../components/ProjectDialogs';

export function ArchivePage() {
  const { projects } = useProjects();
  const [search, setSearch] = useState('');
  const [restoring, setRestoring] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const archived = useMemo(() => projects.filter((p) => p.status === 'archived'), [projects]);
  const rows = useMemo(() => {
    const n = search.trim().toLowerCase();
    return archived
      .filter((p) => !n || [p.name, p.description, p.archiveNote, ...p.tags].some((t) => t.toLowerCase().includes(n)))
      .sort((a, b) => (b.archivedAt ?? '').localeCompare(a.archivedAt ?? ''));
  }, [archived, search]);

  return (
    <>
      <PageHeader title="Archive" subtitle="Projects you closed on purpose. Nothing is lost: history, assets and notes are all kept." />

      {archived.length === 0 ? (
        <EmptyState icon={ArchiveIcon} title="Your archive is empty" action={<LinkButton to="/projects" variant="gold">Go to My Projects</LinkButton>}>
          Archived projects will appear here when you choose to close them. Letting go is a valid and valuable outcome.
        </EmptyState>
      ) : (
        <>
          <label className="relative mb-4 block max-w-md">
            <span className="sr-only">Search the archive</span>
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input type="search" className="rl-input !pl-9" placeholder="Search archived projects and notes…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>

          {rows.length === 0 ? (
            <EmptyState icon={SearchX} title="No archived projects match" action={<Button onClick={() => setSearch('')}>Clear search</Button>}>
              No projects match this search. Try another term.
            </EmptyState>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {rows.map((p) => (
                <li key={p.id} className="rl-panel flex flex-col gap-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold">
                      <Link to={`/projects/${p.id}`} className="hover:underline">{p.name}</Link>
                    </h2>
                    {p.isDemo && <SampleChip />}
                  </div>
                  <p className="text-sm text-muted">{p.description}</p>
                  <blockquote className="rounded-md border-l-4 border-[#F29BB4] bg-[#FBDDE6] p-3 text-sm text-[#8F2549]">
                    {p.archiveNote || 'No archive note was added.'}
                  </blockquote>
                  <TagList tags={p.assets.map((a) => ASSET_META[a].label)} />
                  <p className="text-xs text-muted">Archived {formatDate(p.archivedAt)} · {p.timeline.length} events of history kept</p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Button variant="gold" small onClick={() => setRestoring(p)}>
                      <ArchiveRestore aria-hidden className="size-4" /> Restore
                    </Button>
                    <LinkButton to={`/projects/${p.id}`} small>Open</LinkButton>
                    <Button variant="ghost" small onClick={() => setDeleting(p)} aria-label={`Delete ${p.name} permanently`}>
                      <Trash2 aria-hidden className="size-4" /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {restoring && <RestoreDialog project={restoring} open onClose={() => setRestoring(null)} />}
      {deleting && <DeleteDialog project={deleting} open onClose={() => setDeleting(null)} />}
    </>
  );
}

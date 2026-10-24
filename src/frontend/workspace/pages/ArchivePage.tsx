import { useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Search, GripVertical } from 'lucide-react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { ASSET_META, STATUS_META } from '@/backend/domain/paths';
import type { Project } from '@/backend/domain/types';
import { useChrome } from '@/frontend/shell/AppChrome';
import { PageHeader } from '@/frontend/ui/primitives';
import { StatusPill } from '@/frontend/graveyard/gravestone/StatusPill';
import { PROJECT_ICONS } from '@/frontend/graveyard/gravestone/icons';
import { toStone } from '@/frontend/graveyard/stone';
import { EmptyArchive } from '@/frontend/workspace/components/States';
import { DragLayer, type DragItem } from '@/frontend/dnd/DragLayer';
import { DropZone } from '@/frontend/dnd/DropZone';
import { SPROUT } from '@/frontend/ui/PixelSprite';
import { CHEST_ICON } from '@/frontend/dnd/icons';
import { useToast } from '@/frontend/ui/Toast';

const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
const monthDay = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fullDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

function ArchiveCard({ project }: { project: Project }) {
  const { openDetail } = useChrome();
  const stone = toStone(project);
  const Icon = PROJECT_ICONS[stone.icon];
  const at = project.archivedAt ?? project.updatedAt;
  const prev = STATUS_META[project.previousStatus ?? 'stalled'].label;

  const data: DragItem = useMemo(
    () => ({
      kind: 'stone',
      label: project.name,
      projectId: project.id,
      archived: true,
      preview: (
        <div className="p-3 bg-[#1e1c48] border-2 border-lavender shadow-[0_4px_0_#14122e] text-center min-w-[160px]">
          <span className="font-display text-lg text-soft block leading-tight">{project.name}</span>
          <span className="text-[10px] text-dim block uppercase">Archived Project</span>
        </div>
      ),
    }),
    [project],
  );

  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: `archive-card-${project.id}`,
    data,
  });

  return (
    <li className="flex w-full">
      <article
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        data-draggable
        className={`rl-panel flex w-full flex-col p-5 select-none transition-all ${
          isDragging ? 'ghost-slot opacity-40 scale-95' : 'hover:-translate-y-1 cursor-grab'
        }`}
        aria-labelledby={`arch-${project.id}`}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <GripVertical className="size-4 text-dim shrink-0" />
            <span className="notched grid size-12 shrink-0 place-items-center bg-stone">
              <Icon size={26} color="#4a3e80" aria-hidden="true" />
            </span>
            <h2 id={`arch-${project.id}`} className="font-display text-2xl font-bold leading-tight text-soft [overflow-wrap:anywhere]">
              {project.name}
            </h2>
          </div>
          <StatusPill status="Archived" />
        </header>
        <p className="mt-2 text-base font-bold tracking-wide text-dim">{fullDate(at)}</p>
        <p className="mt-3 text-lg leading-snug text-soft">{project.archiveNote ? `“${project.archiveNote}”` : 'No archive note. It rests quietly.'}</p>
        <dl className="mt-4 grid grid-cols-[6.5rem_1fr] gap-y-1.5 text-base">
          <dt className="text-base font-extrabold uppercase text-dim">Assets</dt>
          <dd className="font-bold text-soft">{project.assets.length ? project.assets.map((a) => ASSET_META[a].label).join(' · ') : 'None recorded'}</dd>
          <dt className="text-base font-extrabold uppercase text-dim">Previously</dt>
          <dd className="font-bold text-soft">{prev}</dd>
        </dl>
        <ol className="mt-4 space-y-1.5 border-l-[3px] border-twilight pl-3 text-lg text-dim" aria-label="Short history">
          <li>{monthYear(project.startedAt)} · Started</li>
          <li>{prev} · Last worked</li>
          <li className="font-bold text-soft">Archived {monthDay(at)} · Rested</li>
        </ol>

        {/* Footer: Details link + drag hint (Audit #10, #11 - primary buttons replaced by drop zones) */}
        <div className="mt-auto pt-5 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openDetail(project.id);
            }}
            className="font-display text-base text-gold hover:underline"
          >
            Open Details ↗
          </button>
          <span className="font-display text-xs text-mint uppercase tracking-wider">
            ✋ Drag to Action Zone
          </span>
        </div>
      </article>
    </li>
  );
}

export function ArchivePage() {
  const { projects, actions } = useProjects();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter((p) => p.status === 'archived' && (!q || p.name.toLowerCase().includes(q) || p.archiveNote.toLowerCase().includes(q)))
      .sort((a, b) => (b.archivedAt ?? '').localeCompare(a.archivedAt ?? ''));
  }, [projects, search]);

  const handleRestore = async (item: DragItem) => {
    if (!item.projectId) return;
    await actions.restore(item.projectId, 'active');
    toast.success(`${item.label} restored`, undefined, {
      label: 'Undo',
      run: () => void actions.undo(),
    });
  };

  const handleDelete = async (item: DragItem) => {
    if (!item.projectId) return;
    await actions.remove(item.projectId);
    toast.info(`${item.label} let go`, undefined, {
      label: 'Undo',
      run: () => void actions.undo(),
    });
  };

  return (
    <DragLayer>
      <div className="space-y-6">
        <PageHeader title="Archive" subtitle="Resting is not failing. Everything here can come back." />

        {/* Canvas Protocol Action Dock for Archive (Audit #10 & #11) */}
        <section
          aria-label="Archive Action Zones"
          className="sticky top-2 z-30 p-4 bg-[#141232]/95 backdrop-blur-md border-2 border-lavender shadow-[0_6px_0_#0d0c1f]"
        >
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-white/10 mb-3 gap-2">
            <span className="font-display text-sm text-gold uppercase tracking-wider flex items-center gap-2">
              <span className="size-2 rounded-full bg-gold animate-pulse" />
              THE CANVAS PROTOCOL · DRAG AN ARCHIVED CARD INTO AN ACTION ZONE
            </span>
            <span className="text-xs text-mint font-display uppercase font-bold tracking-wider">
              {rows.length} Projects Resting
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DropZone
              id="zone-restore-archive"
              label="BRING BACK (RESTORE)"
              description="Drag any card here to restore it directly to the active graveyard"
              color="#9ce6bd"
              icon={SPROUT}
              accepts={(i) => i.kind === 'stone' && !!i.projectId}
              onDrop={handleRestore}
              idleHint="Drop card here to restore"
              width="100%"
              height={90}
            />

            <DropZone
              id="zone-delete-archive"
              label="LET GO (DELETE)"
              description="Drag any card here to permanently let go (5s instant undo toast)"
              color="#f6b9ab"
              icon={CHEST_ICON}
              accepts={(i) => i.kind === 'stone' && !!i.projectId}
              onDrop={handleDelete}
              idleHint="Drop card here to delete"
              width="100%"
              height={90}
            />
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <label className="notched flex min-h-12 max-w-sm flex-1 items-center gap-2 border-2 border-twilight bg-deep px-4">
            <Search aria-hidden className="size-5 shrink-0 text-dim" />
            <span className="sr-only">Search the archive</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name or note..."
              className="w-full bg-transparent text-base font-semibold text-soft outline-none placeholder:text-[#a99fd3]"
            />
          </label>
          {search && (
            <span className="font-display text-sm text-dim">
              Found {rows.length} match{rows.length === 1 ? '' : 'es'}
            </span>
          )}
        </div>

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
    </DragLayer>
  );
}

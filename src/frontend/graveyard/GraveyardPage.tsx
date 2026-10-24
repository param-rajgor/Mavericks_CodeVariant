import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { queryProjects } from '@/backend/domain/query';
import { useRoute } from '@/frontend/routing/router';
import { NavBar } from '@/frontend/navigation/NavBar';
import { Scene } from '@/frontend/scene/Scene';
import { useChrome } from '@/frontend/shell/AppChrome';
import { Heading } from './Heading';
import { ProjectFoundSlot } from './ProjectFoundPanel';
import { CONTROL_BAR_H, ControlBar } from './ControlBar';
import { Gravestone, StoneFace } from './gravestone/Gravestone';
import { ActionDock } from './ActionDock';
import { SeedPacket } from './SeedPacket';
import { DragLayer, type DragItem } from '@/frontend/dnd/DragLayer';
import { matchesFilter, toStone, type FilterId, type Stone } from './stone';

const PER_PAGE = 6;
const STONE_W = 230;
const GAP = 20;

/** Shrinks the row of stones so a full page of six fits the window without wrapping. */
function useRowZoom() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  // The row sits inside 24px side padding, so measure against the space actually left for it (plus a little
  // slack). Using the full window width made the row a few pixels too wide at ~1440px, and six stones wrapped
  // onto two lines, floating up over the heading.
  const row = PER_PAGE * STONE_W + (PER_PAGE - 1) * GAP;
  return w >= 900 ? Math.min(1, (w - 48 - 16) / row) : Math.min(1, (w - 24) / (3 * STONE_W + 2 * GAP));
}

/** A stone that is also a data card: drag it onto an Action Zone, or click it to look. */
const DraggableStone = memo(function DraggableStone({ stone, selected, tooltip, onToggle }: { stone: Stone; selected: boolean; tooltip: boolean; onToggle: (id: string) => void }) {
  const data = useMemo<DragItem>(
    () => ({
      kind: 'stone',
      label: stone.name,
      projectId: stone.id,
      archived: stone.status === 'Archived',
      preview: (
        <div style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: 127, height: 121 }}>
          <StoneFace project={stone} />
        </div>
      ),
    }),
    [stone],
  );
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: `stone-${stone.id}`, data });
  const drag = useMemo(() => ({ setNodeRef, listeners, attributes, isDragging }), [setNodeRef, listeners, attributes, isDragging]);
  const click = useCallback(() => onToggle(stone.id), [onToggle, stone.id]);
  return (
    <div className={isDragging ? 'ghost-slot' : undefined}>
      <Gravestone project={stone} variant="dashboard" layoutId={`stone-${stone.id}`} selected={selected} tooltip={tooltip && !isDragging} onClick={click} drag={drag} />
    </div>
  );
});

export function GraveyardPage() {
  return (
    <DragLayer>
      <Graveyard />
    </DragLayer>
  );
}

function Graveyard() {
  const { projects } = useProjects();
  const route = useRoute();
  const { openNew, openDetail } = useChrome();
  const [selectedId, setSelectedId] = useState<string | null>(route.name === 'graveyard' ? (route.select ?? null) : null);
  const [filter, setFilter] = useState<FilterId>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const zoom = useRowZoom();

  // Every stone, in sort order; the filter and search only dim the ones that do not match.
  const ordered = useMemo(() => queryProjects(projects, { search: '', status: 'all', domain: '', tag: '', sort: 'last-worked', includeArchived: true }), [projects]);
  const stones = useMemo(() => ordered.map((p) => toStone(p)), [ordered]);
  const query = search.trim().toLowerCase();
  const matches = (s: Stone) => matchesFilter(s, filter) && (query === '' || s.name.toLowerCase().includes(query));

  const counts = useMemo(() => {
    const all = projects.map((p) => toStone(p));
    return {
      all: all.length,
      stalled: all.filter((s) => matchesFilter(s, 'stalled')).length,
      active: all.filter((s) => matchesFilter(s, 'active')).length,
      archived: all.filter((s) => matchesFilter(s, 'archived')).length,
    } satisfies Record<FilterId, number>;
  }, [projects]);

  // Jump to the page that holds the selected stone (e.g. when arriving from the landing page).
  useEffect(() => {
    if (!selectedId) return;
    const i = stones.findIndex((s) => s.id === selectedId);
    if (i >= 0) setPage(Math.floor(i / PER_PAGE));
    // only when the selection arrives from outside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  const pages = Math.max(1, Math.ceil(stones.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const visible = stones.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const selected = stones.find((s) => s.id === selectedId) ?? null;
  const closePanel = useCallback(() => setSelectedId(null), []);
  const toggle = useCallback((id: string) => setSelectedId((cur) => (cur === id ? null : id)), []);
  // archived stones sink into the ground for 300ms before the list re-sorts
  const [sinking, setSinking] = useState<string | null>(null);
  const sinkTimer = useRef(0);
  const sink = useCallback((id: string) => {
    setSinking(id);
    clearTimeout(sinkTimer.current);
    sinkTimer.current = window.setTimeout(() => setSinking(null), 320);
  }, []);
  useEffect(() => () => clearTimeout(sinkTimer.current), []);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: CONTROL_BAR_H + 14 }}>
      <Scene variant="dashboard" />

      <div style={{ position: 'relative', zIndex: 'var(--z-bars)' }}>
        <NavBar variant="dashboard" />
      </div>

      <main id="main" style={{ position: 'relative', zIndex: 'var(--z-stones)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '28px 32px 0' }}>
          <div style={{ position: 'relative' }}>
            <Heading />
            <ProjectFoundSlot project={selected} onInspect={() => selected && openDetail(selected.id)} onClose={closePanel} />
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '24px 24px 0' }}>
          {stones.length === 0 ? (
            <div className="rl-panel rl-panel-hi" style={{ padding: 28, maxWidth: 420, textAlign: 'center' }}>
              <h2 className="rl-title" style={{ fontSize: 28 }}>Your graveyard is waiting for its first idea.</h2>
              <p style={{ margin: '12px 0 18px', color: 'var(--color-text-secondary)', fontSize: 17 }}>Add one unfinished project to begin.</p>
              <div style={{ marginTop: 12 }}>
                <SeedPacket onClick={openNew} />
              </div>
            </div>
          ) : (
            <>
              <ul style={{ zoom, display: 'flex', gap: GAP, flexWrap: window.innerWidth >= 900 ? 'nowrap' : 'wrap', justifyContent: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
                {visible.map((s, i) => {
                  const ok = matches(s);
                  return (
                    <motion.li
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: ok ? 1 : 0.25, y: ok ? 0 : 10, scale: 1 }}
                      transition={{ duration: 0.25, delay: i * 0.05, ease: 'easeOut' }}
                    >
                      <div className={sinking === s.id ? 'stone-sink' : undefined}>
                        <DraggableStone stone={s} selected={selectedId === s.id} tooltip={!selected} onToggle={toggle} />
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
              {pages > 1 && (
                <div role="group" aria-label="More stones" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--color-text-primary)' }}>
                  <button type="button" className="rl-btn rl-btn-ghost rl-btn-sm" onClick={() => setPage(Math.max(0, safePage - 1))} disabled={safePage === 0} aria-label="Previous stones">
                    <ChevronLeft size={18} />
                  </button>
                  <span>
                    {safePage + 1} / {pages}
                  </span>
                  <button type="button" className="rl-btn rl-btn-ghost rl-btn-sm" onClick={() => setPage(Math.min(pages - 1, safePage + 1))} disabled={safePage >= pages - 1} aria-label="Next stones">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <ActionDock onSink={sink} />
      <ControlBar
        filter={filter}
        counts={counts}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        onPlant={openNew}
      />
    </div>
  );
}

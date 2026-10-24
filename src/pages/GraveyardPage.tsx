import { useState } from 'react';
import { useProjects } from '../store/ProjectsContext';
import { useShell } from '../components/shellContext';
import { FilterChips, SortSelect, useProjectView } from '../components/ProjectFilters';
import { IslandTomb } from '../components/IslandTomb';
import { ProjectRow } from '../components/ProjectRow';
import { EmptyGraveyard } from '../components/States';
import { PageHeader } from '../components/ui';
import { Bridge, Ghost, Signpost } from '../ui/pixel';
import { liveAnalysis } from '../domain/insights';

const MAP_MAX = 7;

/** Island slots for the map, as percentages of its width and height. Four on the ridge, three in the meadow. */
const SLOTS = [
  { left: 4, top: 25, width: 19 },
  { left: 30, top: 25, width: 19 },
  { left: 56, top: 25, width: 19 },
  { left: 80, top: 25, width: 19 },
  { left: 15, top: 67, width: 19 },
  { left: 41, top: 67, width: 19 },
  { left: 67, top: 67, width: 19 },
] as const;

/** The glowing dotted trail that links the islands in the order they appear. */
function Trail() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1157 560" preserveAspectRatio="none">
      <path
        d="M156 250 C 120 350 190 460 283 476 C 400 495 480 495 584 480 C 690 495 780 495 885 476 C 990 460 1060 380 1036 262 C 960 300 830 300 758 252 C 650 300 540 300 457 252"
        fill="none"
        stroke="#ffd98a"
        strokeWidth="5"
        strokeLinecap="square"
        strokeDasharray="1 14"
        opacity="0.95"
      />
    </svg>
  );
}

export function GraveyardPage() {
  const { projects } = useProjects();
  const { search, openNew, openDetail } = useShell();
  const view = useProjectView(projects, search);
  const [mode, setMode] = useState<'map' | 'grid'>('map');
  const mapRows = view.rows.slice(0, MAP_MAX);
  const beyond = view.rows.length - mapRows.length;

  const seg = (m: 'map' | 'grid', label: string) => (
    <button
      type="button"
      aria-pressed={mode === m}
      onClick={() => setMode(m)}
      className={`min-h-12 px-6 text-[15px] font-extrabold ${mode === m ? 'bg-lavender text-night' : 'text-cream hover:bg-panel-2'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-[88rem]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="The Graveyard" subtitle="Every unfinished idea has a story." />
        <div className="mt-1 flex flex-col items-start gap-2 sm:items-end">
          <div className="flex items-center gap-3">
            <div role="group" aria-label="View" className="hidden overflow-hidden rounded-xl border-[3px] border-twilight bg-panel shadow-[0_4px_0_#0d0e2b] sm:flex">
              {seg('map', 'Map')}
              {seg('grid', 'Grid')}
            </div>
            <SortSelect view={view} className="w-56" />
          </div>
          <p className="font-mono text-xs text-cream [text-shadow:0_2px_0_#0d0e2b]">Other sort: Relaunch Score · scores are guides, not predictions</p>
        </div>
      </div>

      <div className="mt-2">
        <FilterChips view={view} compact />
      </div>

      {view.rows.length === 0 ? (
        <div className="mt-8 max-w-xl">
          <EmptyGraveyard filtered={projects.length > 0} onNew={openNew} />
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-4 lg:hidden">
            {view.rows.map((p, i) => (
              <li key={p.id}>
                <ProjectRow project={p} variant={i} onOpen={openDetail} detailed />
              </li>
            ))}
          </ul>

          {mode === 'map' ? (
            <div className="relative mt-4 hidden w-full lg:block" style={{ aspectRatio: '1157 / 560' }}>
              <Trail />
              <Bridge className="absolute" style={{ left: '22.5%', top: '30%', width: '8%' }} />
              <Bridge className="absolute" style={{ left: '48.8%', top: '30%', width: '7.4%' }} />
              <Bridge className="absolute" style={{ left: '34.5%', top: '72%', width: '6.4%' }} />
              <Ghost className="ghost-float absolute z-20" style={{ left: '9.5%', top: '-1%', width: '3.6%' }} />
              {mapRows.map((p, i) => {
                const s = SLOTS[i];
                const score = liveAnalysis(p).total;
                return (
                  <IslandTomb
                    key={p.id}
                    project={p}
                    variant={i}
                    shortAgo
                    onOpen={openDetail}
                    hint={score == null ? 'Relaunch Score pending' : `Relaunch Score ${score}`}
                    className="absolute"
                    style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%` }}
                  />
                );
              })}
              {beyond > 0 && (
                <button type="button" data-ghost="button" onClick={() => setMode('grid')} className="absolute text-center" style={{ left: '88.5%', top: '70%', width: '11%' }} aria-label={`${beyond} more beyond the ridge. Show the grid.`}>
                  <Signpost className="w-full" />
                  <span className="absolute inset-x-[8%] top-[4%] font-pixel text-[0.5rem] leading-[1.4] text-cream [text-shadow:1px_1px_0_#3a2418]">+{beyond} MORE BEYOND THE RIDGE →</span>
                </button>
              )}
            </div>
          ) : (
            <ul className="mt-8 hidden grid-cols-3 gap-x-6 gap-y-16 pt-20 lg:grid xl:grid-cols-4">
              {view.rows.map((p, i) => (
                <li key={p.id}>
                  <IslandTomb project={p} variant={i} shortAgo onOpen={openDetail} hint={`Relaunch Score ${liveAnalysis(p).total ?? '—'}`} className="w-full" />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

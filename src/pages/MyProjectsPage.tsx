import { useMemo, useState } from 'react';
import { ArrowRight, Eye, Lightbulb, LayoutGrid, List, Archive as ArchiveIcon, type LucideIcon } from 'lucide-react';
import { useProjects } from '../store/ProjectsContext';
import { Link } from '../lib/router';
import { useShell } from '../components/shellContext';
import { FilterChips, SortSelect, useProjectView } from '../components/ProjectFilters';
import { IslandTomb } from '../components/IslandTomb';
import { ProjectRow } from '../components/ProjectRow';
import { PageHeader } from '../components/ui';
import { Bridge, Ghost, PixelIcon, Signpost } from '../ui/pixel';
import { STATUS_ORDER, STATUS_UI, journeyOf, suggestionsFor, type Suggestion } from '../domain/insights';
import { EmptyGraveyard } from '../components/States';

const SHOWN = 4;

/** Where the four islands sit, as a percentage of the map. Two rows, offset like stepping stones. */
const SLOTS = [
  { left: 0, top: 27, width: 34 },
  { left: 45, top: 27, width: 34 },
  { left: 19, top: 65, width: 34 },
  { left: 56, top: 65, width: 34 },
] as const;

const TONE: Record<Suggestion['tone'], { bg: string; icon: LucideIcon | 'play' }> = {
  continue: { bg: '#a8e6a1', icon: 'play' },
  review: { bg: '#ffab83', icon: Eye },
  rethink: { bg: '#c9a8ff', icon: Lightbulb },
  archive: { bg: '#8fd6ff', icon: ArchiveIcon },
};

export function JourneyPanel() {
  const { projects } = useProjects();
  const counts = useMemo(() => {
    const c = { active: 0, stalled: 0, 'needs-direction': 0, archived: 0 };
    projects.forEach((p) => c[p.status]++);
    return c;
  }, [projects]);
  return (
    <section className="rl-panel p-5" aria-labelledby="journey-h">
      <h2 id="journey-h" className="mb-3 text-xl font-extrabold text-soft">
        Your Journey
      </h2>
      <Link to="/progress" className="flex items-center gap-4 rounded-xl bg-[#101240] p-4 shadow-[inset_0_0_0_3px_#2b2a6d] transition-transform hover:-translate-y-0.5">
        <PixelIcon name="sprout" size={46} />
        <span>
          <span className="block font-title text-4xl font-bold leading-none text-soft">{projects.length}</span>
          <span className="mt-1 block text-lg font-extrabold text-soft">Projects</span>
        </span>
      </Link>
      <ul className="mt-4 space-y-2.5">
        {STATUS_ORDER.map((s) => (
          <li key={s} className="flex items-center gap-3 font-bold text-cream">
            <span aria-hidden className="size-4 shrink-0" style={{ background: STATUS_UI[s].dot }} />
            {counts[s]} {STATUS_UI[s].filter}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function NextStepsPanel() {
  const { projects } = useProjects();
  const items = useMemo(() => suggestionsFor(projects), [projects]);
  return (
    <section className="rl-panel p-5" aria-labelledby="next-h">
      <h2 id="next-h" className="mb-3 text-xl font-extrabold text-soft">
        Suggested Next Steps
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-dim">Log a project and gentle suggestions will show up here.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((s) => {
            const t = TONE[s.tone];
            const Icon = t.icon === 'play' ? null : t.icon;
            return (
              <li key={s.key}>
                <Link to={s.to} className="flex min-h-[64px] items-center gap-3 rounded-xl bg-panel-2 p-2.5 pr-3 shadow-[inset_0_0_0_2px_#2f2d78] transition-transform hover:-translate-y-0.5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg text-night" style={{ background: t.bg }}>
                    {Icon ? <Icon aria-hidden className="size-5" strokeWidth={2.6} /> : <PixelIcon name="play" size={20} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-extrabold leading-tight text-soft">{s.title}</span>
                    <span className="block text-[13px] leading-tight text-dim">{s.detail}</span>
                  </span>
                  <ArrowRight aria-hidden className="size-5 shrink-0 text-soft" strokeWidth={3} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ViewToggle({ mode, onChange }: { mode: 'map' | 'list'; onChange: (m: 'map' | 'list') => void }) {
  const btn = (m: 'map' | 'list', Icon: typeof List, label: string) => (
    <button
      type="button"
      aria-pressed={mode === m}
      aria-label={label}
      onClick={() => onChange(m)}
      className={`grid size-12 place-items-center transition-colors ${mode === m ? 'bg-lavender text-night' : 'text-cream hover:bg-panel-2'}`}
    >
      <Icon aria-hidden className="size-5" strokeWidth={3} />
    </button>
  );
  return (
    <div role="group" aria-label="View" className="flex overflow-hidden rounded-xl border-[3px] border-twilight bg-panel shadow-[0_4px_0_#0d0e2b]">
      {btn('map', LayoutGrid, 'Show as islands')}
      {btn('list', List, 'Show as a list')}
    </div>
  );
}

export function MyProjectsPage() {
  const { projects } = useProjects();
  const { search, openNew, openDetail } = useShell();
  const view = useProjectView(projects, search);
  const [mode, setMode] = useState<'map' | 'list'>('map');
  const shown = view.rows.slice(0, SHOWN);
  const j = useMemo(() => journeyOf(projects), [projects]);
  const more = view.rows.length > SHOWN;

  return (
    <div className="mx-auto grid max-w-[88rem] gap-6 xl:grid-cols-[minmax(0,1fr)_18.5rem]">
      <section aria-labelledby="page-title" className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader title="My Projects" />
          <div className="mt-1 hidden items-center gap-3 sm:flex">
            <ViewToggle mode={mode} onChange={setMode} />
            <SortSelect view={view} className="w-56" />
          </div>
        </div>

        <FilterChips view={view} compact />
        <p className="mt-3 font-mono text-[13px] text-cream [text-shadow:0_2px_0_#0d0e2b]">
          {view.rows.length === 0 ? 'Nothing matches that yet' : `Your ${shown.length} most recently touched idea${shown.length === 1 ? '' : 's'}`}
          {' · '}
          <Link to="/graveyard" className="font-bold text-gold underline underline-offset-4">
            View all {view.rows.length} →
          </Link>
        </p>

        {/* mobile journey card, as in the phone design */}
        <div className="rl-panel mt-4 p-4 xl:hidden">
          <h2 className="text-lg font-extrabold text-soft">Your Journey</h2>
          <p className="mt-1 text-sm text-dim">
            Level {j.level} · {j.done} of 5 steps
          </p>
          <div className="mt-3 h-3 rounded-sm bg-[#0f1038]">
            <div className="h-full rounded-sm bg-[#3ddc84]" style={{ width: `${(j.done / 5) * 100}%` }} />
          </div>
        </div>

        {view.rows.length === 0 ? (
          <div className="mt-8">
            <EmptyGraveyard filtered={projects.length > 0} onNew={openNew} />
          </div>
        ) : mode === 'list' ? (
          <ul className="mt-6 space-y-4">
            {view.rows.map((p, i) => (
              <li key={p.id}>
                <ProjectRow project={p} variant={i} onOpen={openDetail} detailed />
              </li>
            ))}
          </ul>
        ) : (
          <>
            {/* phone and tablet: cards */}
            <ul className="mt-6 space-y-4 lg:hidden">
              {shown.map((p, i) => (
                <li key={p.id}>
                  <ProjectRow project={p} variant={i} onOpen={openDetail} />
                </li>
              ))}
            </ul>
            {/* desktop: floating islands joined by bridges */}
            <div className="relative mt-2 hidden w-full lg:block" style={{ aspectRatio: '790 / 640' }}>
              <Bridge className="absolute" style={{ left: '33.5%', top: '33%', width: '11%' }} />
              <Bridge className="absolute" style={{ left: '52.5%', top: '70%', width: '4.5%' }} />
              <Ghost className="ghost-float absolute" style={{ left: '-2%', top: '38%', width: '8%' }} />
              {shown.map((p, i) => {
                const s = SLOTS[i];
                return (
                  <IslandTomb
                    key={p.id}
                    project={p}
                    variant={i}
                    onOpen={openDetail}
                    className="absolute"
                    style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%` }}
                  />
                );
              })}
              <Link to="/graveyard" data-ghost="button" aria-label="Explore your ideas in the graveyard" className="absolute" style={{ left: '84%', top: '62%', width: '16%' }}>
                <Signpost className="w-full" />
                <span className="absolute inset-x-[10%] top-[6%] text-center font-pixel text-[0.55rem] leading-[1.35] text-cream [text-shadow:1px_1px_0_#3a2418] [container-type:inline-size]">
                  EXPLORE YOUR IDEAS →
                </span>
              </Link>
            </div>
          </>
        )}
        {more && mode === 'map' && (
          <p className="mt-4 text-sm text-dim">
            +{view.rows.length - SHOWN} more resting in the{' '}
            <Link to="/graveyard" className="font-bold text-gold underline underline-offset-4">
              graveyard
            </Link>
            .
          </p>
        )}
        {/* sort on phones, where the toolbar is hidden */}
        <div className="mt-6 flex items-center gap-3 sm:hidden">
          <SortSelect view={view} className="w-full" />
        </div>
      </section>

      <aside className="space-y-5 xl:mt-4" aria-label="Your journey and next steps">
        <JourneyPanel />
        <NextStepsPanel />
      </aside>
    </div>
  );
}

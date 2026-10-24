import { useMemo, useState } from 'react';
import { ArrowRight, Archive as ArchiveIcon, Eye, Lightbulb, Play, Search, type LucideIcon } from 'lucide-react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { STATUS_ORDER, STATUS_UI, journeyOf, suggestionsFor, type Suggestion } from '@/backend/domain/insights';
import { Link } from '@/frontend/routing/router';
import { useChrome } from '@/frontend/shell/AppChrome';
import { PageHeader } from '@/frontend/ui/primitives';
import { PixelSprite, SPROUT } from '@/frontend/ui/PixelSprite';
import { FilterChips, SortSelect, useProjectView } from '@/frontend/workspace/components/ProjectFilters';
import { ProjectRow } from '@/frontend/workspace/components/ProjectRow';
import { EmptyGraveyard } from '@/frontend/workspace/components/States';

const TONE: Record<Suggestion['tone'], { bg: string; icon: LucideIcon }> = {
  continue: { bg: '#9ce6bd', icon: Play },
  review: { bg: '#f6b9ab', icon: Eye },
  rethink: { bg: '#d8b7ff', icon: Lightbulb },
  archive: { bg: '#9fb4ee', icon: ArchiveIcon },
};

/** The count of ideas by status, with the same colours as the stones. */
export function JourneyPanel() {
  const { projects } = useProjects();
  const counts = useMemo(() => {
    const c = { active: 0, stalled: 0, 'needs-direction': 0, archived: 0 };
    projects.forEach((p) => c[p.status]++);
    return c;
  }, [projects]);
  return (
    <section className="rl-panel p-5" aria-labelledby="journey-h">
      <h2 id="journey-h" className="mb-3 font-pixel text-2xl font-bold text-soft">
        Your Journey
      </h2>
      <Link to="/progress" className="flex items-center gap-4 bg-deep p-4 transition-transform hover:-translate-y-0.5">
        <PixelSprite sprite={SPROUT} px={4} />
        <span>
          <span className="block font-pixel text-4xl font-bold leading-none text-soft">{projects.length}</span>
          <span className="mt-1 block text-lg font-extrabold text-soft">Projects</span>
        </span>
      </Link>
      <ul className="mt-4 space-y-2.5">
        {STATUS_ORDER.map((s) => (
          <li key={s} className="flex items-center gap-3 text-[1.05rem] font-bold text-soft">
            <span aria-hidden className="size-4 shrink-0 border-2 border-night" style={{ background: STATUS_UI[s].bg }} />
            {counts[s]} {STATUS_UI[s].chip}
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
      <h2 id="next-h" className="mb-3 font-pixel text-2xl font-bold text-soft">
        Suggested Next Steps
      </h2>
      {items.length === 0 ? (
        <p className="text-base text-dim">Plant a project and gentle suggestions will show up here.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((s) => {
            const t = TONE[s.tone];
            const Icon = t.icon;
            return (
              <li key={s.key}>
                <Link to={s.to} className="flex min-h-[68px] items-center gap-3 border-2 border-twilight bg-panel-2 p-2.5 pr-3 transition-transform hover:-translate-y-0.5">
                  <span className="grid size-11 shrink-0 place-items-center text-ink" style={{ background: t.bg }}>
                    <Icon aria-hidden className="size-5" strokeWidth={2.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.05rem] font-extrabold leading-tight text-soft">{s.title}</span>
                    <span className="block text-[0.95rem] leading-tight text-dim">{s.detail}</span>
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

/** "Project Journal": every idea as a readable card, plus your journey and the next small steps. */
export function JournalPage() {
  const { projects } = useProjects();
  const { openNew, openDetail } = useChrome();
  const [search, setSearch] = useState('');
  const view = useProjectView(projects, search);
  const j = useMemo(() => journeyOf(projects), [projects]);

  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <section className="min-w-0" aria-labelledby="page-title">
        <PageHeader title="Project Journal" subtitle="Every idea has a story. Read yours, then pick the next small step." />

        <div className="mb-5 flex flex-wrap items-center gap-4">
          <label className="notched flex min-h-12 min-w-[14rem] flex-1 items-center gap-2 border-2 border-twilight bg-deep px-4 sm:max-w-sm">
            <Search aria-hidden className="size-5 shrink-0 text-dim" />
            <span className="sr-only">Search your projects</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your projects..." className="w-full bg-transparent text-base font-semibold text-soft outline-none placeholder:text-[#a99fd3]" />
          </label>
          <SortSelect view={view} className="w-56" />
        </div>
        <FilterChips view={view} compact />

        {/* the same journey card the phone design shows */}
        <div className="rl-panel mt-5 p-4 xl:hidden">
          <h2 className="text-lg font-extrabold text-soft">Your Journey</h2>
          <p className="mt-1 text-base text-dim">
            Level {j.level} · {j.done} of 5 steps
          </p>
          <div className="mt-3 h-3 border-2 border-[#3a2f6e] bg-night">
            <div className="h-full bg-mint" style={{ width: `${(j.done / 5) * 100}%` }} />
          </div>
        </div>

        {view.rows.length === 0 ? (
          <div className="mt-8">
            <EmptyGraveyard filtered={projects.length > 0} onNew={openNew} />
          </div>
        ) : (
          <ul className="mt-6 space-y-5">
            {view.rows.map((p) => (
              <li key={p.id}>
                <ProjectRow project={p} onOpen={openDetail} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="space-y-6 xl:mt-4" aria-label="Your journey and next steps">
        <JourneyPanel />
        <NextStepsPanel />
      </aside>
    </div>
  );
}

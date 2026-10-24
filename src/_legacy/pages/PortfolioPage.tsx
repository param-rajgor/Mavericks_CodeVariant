import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup } from 'motion/react';
import { FolderOpen, LayoutGrid, List, Plus, Search, SearchX, X } from 'lucide-react';
import { useProjects } from '../store/ProjectsContext';
import { DEFAULT_QUERY, SORT_LABELS, allTags, isQueryDefault, queryProjects, statusCounts, type ProjectQuery, type SortKey, type StatusFilter } from '../domain/query';
import { DOMAIN_LIST, STATUS_META } from '../domain/paths';
import { Button, EmptyState, LinkButton, PageHeader } from '../components/ui';
import { Tabs } from '../components/Tabs';
import { ProjectCard } from '../components/ProjectCard';
import { useSafe } from '../components/Toast';

const FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: STATUS_META.active.label },
  { id: 'stalled', label: STATUS_META.stalled.label },
  { id: 'needs-direction', label: STATUS_META['needs-direction'].label },
  { id: 'archived', label: STATUS_META.archived.label },
];

const EMPTY_BY_STATUS: Partial<Record<StatusFilter, string>> = {
  stalled: 'No stalled projects. Your active projects are all moving forward.',
  active: 'Nothing is active right now. Pick a project and choose Continue or Restart when you are ready.',
  'needs-direction': 'Nothing is waiting on a decision. Nicely done.',
  archived: 'Your archive is empty. Archived projects will appear here when you choose to close them.',
};

export function PortfolioPage() {
  const { projects, actions } = useProjects();
  const safe = useSafe();
  const [q, setQ] = useState<ProjectQuery>(DEFAULT_QUERY);
  const [view, setView] = useState<'list' | 'cards'>('list');
  const set = (patch: Partial<ProjectQuery>) => setQ((s) => ({ ...s, ...patch }));

  const counts = useMemo(() => statusCounts(projects), [projects]);
  const tags = useMemo(() => allTags(projects), [projects]);
  const rows = useMemo(() => queryProjects(projects, q), [projects, q]);

  return (
    <>
      <PageHeader
        title="My Projects"
        subtitle="Every idea has a story. Pick up where you left off."
        actions={
          <LinkButton to="/projects/new" variant="gold">
            <Plus aria-hidden className="size-4" /> New Project
          </LinkButton>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Your graveyard is empty"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <LinkButton to="/projects/new" variant="gold">
                Log your first project
              </LinkButton>
              <Button onClick={() => safe(() => actions.loadSamples(), 'Could not load samples')}>Load sample projects</Button>
            </div>
          }
        >
          Log an unfinished project in about two minutes, or load a few clearly-labelled samples to look around.
        </EmptyState>
      ) : (
        <>
          <Tabs
            idBase="portfolio"
            label="Filter by status"
            value={q.status}
            onChange={(status) => set({ status })}
            tabs={FILTERS.map((f) => ({ ...f, count: counts[f.id] }))}
          />

          <div className="mt-4 flex flex-wrap items-end gap-3" role="search">
            <label className="relative block min-w-[14rem] flex-1">
              <span className="sr-only">Search projects by name, description or tag</span>
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input type="search" className="rl-input !pl-9" placeholder="Search projects…" value={q.search} onChange={(e) => set({ search: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-extrabold">Category</span>
              <select className="rl-input !w-auto" value={q.domain} onChange={(e) => set({ domain: e.target.value })}>
                <option value="">All categories</option>
                {DOMAIN_LIST.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-extrabold">Tag</span>
              <select className="rl-input !w-auto" value={q.tag} onChange={(e) => set({ tag: e.target.value })}>
                <option value="">All tags</option>
                {tags.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-extrabold">Sort by</span>
              <select className="rl-input !w-auto" value={q.sort} onChange={(e) => set({ sort: e.target.value as SortKey })}>
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
            <div role="group" aria-label="Layout" className="flex">
              <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} aria-label="List view" className={`grid size-11 place-items-center rounded-l-md border-2 border-night ${view === 'list' ? 'bg-night text-soft' : 'bg-white'}`}>
                <List aria-hidden className="size-4" />
              </button>
              <button type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')} aria-label="Card view" className={`-ml-0.5 grid size-11 place-items-center rounded-r-md border-2 border-night ${view === 'cards' ? 'bg-night text-soft' : 'bg-white'}`}>
                <LayoutGrid aria-hidden className="size-4" />
              </button>
            </div>
            {!isQueryDefault(q) && (
              <Button variant="ghost" onClick={() => setQ({ ...DEFAULT_QUERY, sort: q.sort })}>
                <X aria-hidden className="size-4" /> Clear filters
              </Button>
            )}
          </div>

          <p className="mt-3 text-sm text-muted" aria-live="polite">
            Showing {rows.length} {rows.length === 1 ? 'project' : 'projects'}
            {q.status === 'all' && counts.archived > 0 ? ' (archived ones live under Archived)' : ''}
          </p>

          <div className="mt-3">
            {rows.length === 0 ? (
              isQueryDefault(q) || (q.status !== 'all' && !q.search && !q.domain && !q.tag) ? (
                <EmptyState
                  icon={FolderOpen}
                  title="Nothing here yet"
                  action={
                    q.status === 'archived' ? undefined : (
                      <LinkButton to="/projects/new" variant="gold">
                        Log a project
                      </LinkButton>
                    )
                  }
                >
                  {EMPTY_BY_STATUS[q.status] ?? 'Log a project to get started.'}
                </EmptyState>
              ) : (
                <EmptyState icon={SearchX} title="No projects match" action={<Button onClick={() => setQ({ ...DEFAULT_QUERY, sort: q.sort })}>Clear filters</Button>}>
                  No projects match this search. Try another term or clear your filters.
                </EmptyState>
              )
            ) : (
              <LayoutGroup>
                <div id={`portfolio-panel-${q.status}`} role="tabpanel" aria-labelledby={`portfolio-tab-${q.status}`} className={view === 'cards' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'grid gap-4'}>
                  <AnimatePresence mode="popLayout">
                    {rows.map((p) => (
                      <ProjectCard key={p.id} project={p} layout={view} />
                    ))}
                  </AnimatePresence>
                </div>
              </LayoutGroup>
            )}
          </div>
        </>
      )}
    </>
  );
}

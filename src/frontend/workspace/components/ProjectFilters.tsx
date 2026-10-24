import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Project } from '@/backend/domain/types';
import { queryProjects, SORT_LABELS, type SortKey, type StatusFilter } from '@/backend/domain/query';
import { STATUS_ORDER, STATUS_UI } from '@/backend/domain/insights';

export interface ProjectView {
  status: StatusFilter;
  setStatus: (s: StatusFilter) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  rows: Project[];
  counts: Record<StatusFilter, number>;
}

/** Filter + sort state for a list of projects. "All" includes archived ones, as in the design. */
export function useProjectView(projects: readonly Project[], search: string, initialSort: SortKey = 'last-worked'): ProjectView {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>(initialSort);
  const rows = useMemo(
    () => queryProjects(projects, { search, status, domain: '', tag: '', sort, includeArchived: true }),
    [projects, search, status, sort],
  );
  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: projects.length, active: 0, stalled: 0, 'needs-direction': 0, archived: 0 };
    projects.forEach((p) => c[p.status]++);
    return c;
  }, [projects]);
  return { status, setStatus, sort, setSort, rows, counts };
}

/** Status filter chips. Each carries a text label and count; the square is only a colour hint. */
export function FilterChips({ view, compact = false }: { view: ProjectView; compact?: boolean }) {
  const items: Array<{ key: StatusFilter; label: string; dot?: string }> = [
    { key: 'all', label: 'All' },
    ...STATUS_ORDER.map((s) => ({ key: s as StatusFilter, label: STATUS_UI[s].filter, dot: STATUS_UI[s].dot })),
  ];
  return (
    <div role="group" aria-label="Filter by status" className={`flex gap-3 ${compact ? 'overflow-x-auto pb-2 scrollbar-thin' : 'flex-wrap'}`}>
      {items.map((it) => (
        <button key={it.key} type="button" className="rl-chipbtn" aria-pressed={view.status === it.key} onClick={() => view.setStatus(it.key)}>
          {it.dot && <span aria-hidden className="size-3.5 shrink-0" style={{ background: it.dot }} />}
          {it.label} ({view.counts[it.key]})
        </button>
      ))}
    </div>
  );
}

export function SortSelect({ view, className = '' }: { view: ProjectView; className?: string }) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Sort projects</span>
      <select
        value={view.sort}
        onChange={(e) => view.setSort(e.target.value as SortKey)}
        className="h-12 w-full appearance-none  border-[3px] border-twilight bg-panel pl-4 pr-11 text-lg font-extrabold text-cream shadow-[0_4px_0_#0d0e2b]"
      >
        {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
          <option key={k} value={k}>
            Sort: {SORT_LABELS[k]}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-cream" strokeWidth={3} />
    </label>
  );
}

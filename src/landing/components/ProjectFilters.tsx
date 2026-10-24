import { Search } from "lucide-react";
import { STATUS_FILTERS, STATUS_LABEL } from "@/src/landing/data/view";
import type { StatusFilter } from "@/src/landing/data/types";

interface Props {
  filter: StatusFilter;
  onFilter: (f: StatusFilter) => void;
  query: string;
  onQuery: (q: string) => void;
  counts: Record<StatusFilter, number>;
}

export function ProjectFilters({ filter, onFilter, query, onQuery, counts }: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div role="group" aria-label="Filter projects by status" className="flex flex-wrap gap-2.5">
        {STATUS_FILTERS.map((f) => {
          const on = filter === f;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => onFilter(f)}
              className={`min-h-[44px] border-[3px] px-3.5 font-mono text-[12px] font-bold uppercase tracking-wide transition-colors [transition-timing-function:steps(2)] ${
                on
                  ? "border-gold bg-gold text-navy"
                  : "border-twilight bg-navy/70 text-cream hover:border-lavender hover:bg-twilight/50"
              }`}
            >
              {on && <span aria-hidden="true">▸ </span>}
              {STATUS_LABEL[f]} <span className={on ? "opacity-80" : "text-lavender"}>({counts[f]})</span>
            </button>
          );
        })}
      </div>

      <label className="relative block w-full lg:max-w-xs">
        <span className="sr-only">Search projects by name or description</span>
        <Search
          size={18}
          strokeWidth={3}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lavender"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search the graveyard…"
          className="px-input pl-10"
          autoComplete="off"
        />
      </label>
    </div>
  );
}

import { ChevronDown, Search, Sprout } from 'lucide-react';
import { PixelButton } from '@/frontend/ui/PixelButton';
import { FILTER_LABELS, type FilterId } from './stone';
import { SORT_LABELS, type SortKey } from '@/backend/domain/query';

interface ControlBarProps {
  filter: FilterId;
  counts: Record<FilterId, number>;
  onFilterChange: (id: FilterId) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  onPlant: () => void;
}

const divider = <span aria-hidden="true" className="bar-divider" style={{ width: 2, height: 28, background: 'var(--color-stone-outline)', flexShrink: 0 }} />;

/** The fixed bottom bar: filter chips, live search, sort and "plant a project". */
export function ControlBar({ filter, counts, onFilterChange, search, onSearchChange, sort, onSortChange, onPlant }: ControlBarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Filter and search your projects"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '14px 28px',
        background: 'var(--color-night-indigo)',
        borderTop: '2px solid var(--color-lavender)',
        fontFamily: 'var(--font-ui)',
        flexWrap: 'wrap',
      }}
    >
      <div role="group" aria-label="Filter by status" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTER_LABELS.map((f) => (
          <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => onFilterChange(f.id)} className="rl-chipbtn">
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>

      {divider}

      <label className="notched" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', border: '2px solid var(--color-stone-outline)', flex: '1 1 220px', maxWidth: 340 }}>
        <Search size={18} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} aria-hidden="true" />
        <span className="sr-only">Search your projects</span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search your projects..."
          style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 16, width: '100%' }}
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--color-text-secondary)' }}>
        SORT BY:
        <span className="notched" style={{ position: 'relative', display: 'flex', alignItems: 'center', border: '2px solid var(--color-stone-outline)', color: 'var(--color-text-primary)' }}>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            style={{ appearance: 'none', background: 'transparent', border: 'none', color: 'inherit', font: 'inherit', fontSize: 15, padding: '8px 32px 8px 12px', textTransform: 'uppercase' }}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k} style={{ background: '#1e1c48' }}>
                {k === 'last-worked' ? 'Last visited' : SORT_LABELS[k]}
              </option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" style={{ position: 'absolute', right: 10, pointerEvents: 'none' }} />
        </span>
      </label>

      {divider}

      <PixelButton variant="lavender" size="sm" onClick={onPlant} cornerIcon={<Sprout size={20} style={{ color: 'var(--color-grass-light)' }} />} style={{ marginLeft: 'auto' }}>
        + PLANT A PROJECT
      </PixelButton>
    </div>
  );
}

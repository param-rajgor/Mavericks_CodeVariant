import { Search } from 'lucide-react';
import { SeedPacket } from './SeedPacket';
import { FILTER_LABELS, type FilterId } from './stone';

interface ControlBarProps {
  filter: FilterId;
  counts: Record<FilterId, number>;
  onFilterChange: (id: FilterId) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onPlant: () => void;
}

/** Height of the bar, border included. The graveyard page keeps this much room free at the bottom. */
export const CONTROL_BAR_H = 72;

const ROW_H = 44;

/** The fixed bottom bar, one thin row: filter chips, live search, and "plant a project" on the far right. */
export function ControlBar({ filter, counts, onFilterChange, search, onSearchChange, onPlant }: ControlBarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Filter and search your projects"
      className="control-bar"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 'var(--z-bars)',
        boxSizing: 'border-box',
        height: CONTROL_BAR_H,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        background: 'var(--color-night-indigo)',
        borderTop: '2px solid var(--color-lavender)',
        fontFamily: 'var(--font-display)',
      }}
    >
      <div role="group" aria-label="Filter by status" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {FILTER_LABELS.map((f) => (
          <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => onFilterChange(f.id)} className="rl-chipbtn" style={{ height: ROW_H, minHeight: ROW_H }}>
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>

      <span aria-hidden="true" className="bar-divider" style={{ width: 2, height: 28, background: 'var(--color-stone-outline)', flexShrink: 0 }} />

      {/* the only flexible item: it grows into the free space and is the first thing to shrink */}
      <label className="notched" style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 8, height: ROW_H, padding: '0 14px', border: '2px solid var(--color-stone-outline)', flex: '1 1 auto', minWidth: 140, maxWidth: 520 }}>
        <Search size={18} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} aria-hidden="true" />
        <span className="sr-only">Search your projects</span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search your projects..."
          style={{ minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontSize: 18, width: '100%' }}
        />
      </label>

      {/* Draggable Seed Packet replacing + PLANT A PROJECT button (Audit #1) */}
      <div style={{ margin: '0 4px 0 auto', flexShrink: 0 }}>
        <SeedPacket onClick={onPlant} />
      </div>
    </div>
  );
}

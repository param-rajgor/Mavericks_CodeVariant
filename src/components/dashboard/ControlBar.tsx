import { Search, ChevronDown, Sprout } from 'lucide-react';
import { PixelButton } from '../nav/PixelButton';
import { FILTERS, type FilterId } from '../../data/stats';

interface ControlBarProps {
  filter: FilterId;
  onFilterChange: (id: FilterId) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const divider = <span style={{ width: 2, height: 24, background: 'var(--color-stone-outline)', flexShrink: 0 }} />;

export function ControlBar({ filter, onFilterChange, search, onSearchChange }: ControlBarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '14px 28px',
        background: 'var(--color-night-indigo)',
        borderTop: '2px solid var(--color-lavender)',
        fontFamily: 'var(--font-ui)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            className="notched"
            style={{
              padding: '8px 14px',
              fontFamily: 'var(--font-ui)',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              border: '2px solid var(--color-stone-outline)',
              background: filter === f.id ? 'var(--color-lavender)' : 'transparent',
              color: filter === f.id ? 'var(--color-text-dark)' : 'var(--color-text-secondary)',
              transform: filter === f.id ? 'translateY(2px)' : 'none',
            }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {divider}

      <div
        className="notched"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          border: '2px solid var(--color-stone-outline)',
          flex: '1 1 220px',
          maxWidth: 320,
        }}
      >
        <Search size={14} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search your projects..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            width: '100%',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
        SORT BY:
        <span
          className="notched"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '7px 12px',
            border: '2px solid var(--color-stone-outline)',
            color: 'var(--color-text-primary)',
          }}
        >
          LAST VISITED <ChevronDown size={12} />
        </span>
      </div>

      {divider}

      <PixelButton variant="lavender" size="sm" cornerIcon={<Sprout size={14} style={{ color: 'var(--color-grass-dark)' }} />}>
        + PLANT A PROJECT
      </PixelButton>
    </div>
  );
}

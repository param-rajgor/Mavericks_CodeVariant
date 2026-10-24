import type { CSSProperties, ReactNode } from 'react';
import { BookOpen, Sparkles, Archive, Sprout } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { PixelSprite, ROCKET } from '../PixelSprite';
import { STATS } from '../../data/stats';

function Brand() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 20,
        color: 'var(--color-text-primary)',
      }}
    >
      <PixelSprite sprite={ROCKET} px={3} />
      RELAUNCH
    </span>
  );
}

/* A simple rounded-top tombstone glyph — lucide has nothing thematic that isn't
 * horror-flavoured (spec §10 rules out skulls etc). */
function TombstoneIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 15V7a5 5 0 0 1 10 0v8H3Z" fill="currentColor" />
    </svg>
  );
}

const DASHBOARD_TABS: { id: string; label: string; icon: ReactNode; active?: boolean }[] = [
  { id: 'graveyard', label: 'Graveyard', icon: <TombstoneIcon />, active: true },
  { id: 'journal', label: 'Project Journal', icon: <BookOpen size={16} /> },
  { id: 'decision', label: 'Decision Shrine', icon: <Sparkles size={16} /> },
  { id: 'archive', label: 'Archive', icon: <Archive size={16} /> },
];

const barStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 28px',
  background: 'var(--color-night-indigo)',
  borderBottom: '2px solid var(--color-lavender)',
  fontFamily: 'var(--font-ui)',
};

interface NavBarProps {
  variant: 'landing' | 'dashboard';
  onLogin?: () => void;
  onGetStarted?: () => void;
}

export function NavBar({ variant, onLogin, onGetStarted }: NavBarProps) {
  if (variant === 'landing') {
    // Sits directly on the sky: no solid bar, no border line.
    return (
      <nav style={{ ...barStyle, background: 'transparent', borderBottom: 'none', padding: '18px 36px' }}>
        <Brand />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>How it Works</span>
          <Sparkles size={12} style={{ color: 'var(--color-gold)' }} />
          <span>Explore</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <PixelButton variant="dark-outline" size="sm" onClick={onLogin}>
            Log in
          </PixelButton>
          <PixelButton variant="lavender" size="sm" onClick={onGetStarted}>
            Get Started
          </PixelButton>
        </div>
      </nav>
    );
  }

  return (
    <nav style={barStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Brand />
        <span style={{ width: 2, height: 24, background: 'var(--color-stone-outline)' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          {DASHBOARD_TABS.map((tab) => (
            <span
              key={tab.id}
              className="notched"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                fontSize: 14,
                background: tab.active ? 'var(--color-lavender)' : 'transparent',
                color: tab.active ? 'var(--color-text-dark)' : 'var(--color-text-secondary)',
                border: tab.active ? '2px solid var(--color-text-primary)' : '2px solid transparent',
              }}
            >
              {tab.icon}
              {tab.label}
            </span>
          ))}
        </div>
      </div>
      <span
        className="notched"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          fontFamily: 'var(--font-ui)',
          fontWeight: 800,
          fontSize: 13,
          border: '2px solid var(--color-lavender)',
          color: 'var(--color-text-primary)',
        }}
      >
        <Sprout size={14} style={{ color: 'var(--color-mint)' }} />
        {STATS.projectsResting} ideas resting
      </span>
    </nav>
  );
}

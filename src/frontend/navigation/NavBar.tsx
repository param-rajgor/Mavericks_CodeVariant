import type { CSSProperties, ReactNode } from 'react';
import { Archive, BookOpen, ChartColumn, Settings, Sparkles, Sprout } from 'lucide-react';
import { Link, useRoute, type Route } from '@/frontend/routing/router';
import { useProjects } from '@/backend/store/ProjectsContext';
import { journeyOf } from '@/backend/domain/insights';
import { PixelButton } from '@/frontend/ui/PixelButton';
import { PixelSprite, ROCKET } from '@/frontend/ui/PixelSprite';

function Brand({ to }: { to: string }) {
  return (
    <Link
      to={to}
      aria-label="Relaunch, back to the landing page"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--color-text-primary)', textDecoration: 'none' }}
    >
      <PixelSprite sprite={ROCKET} px={3} />
      RELAUNCH
    </Link>
  );
}

/* A simple rounded-top tombstone glyph; nothing in the icon set is thematic without being spooky. */
function TombstoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 15V7a5 5 0 0 1 10 0v8H3Z" fill="currentColor" />
    </svg>
  );
}

const TABS: Array<{ route: Route['name']; to: string; label: string; icon: ReactNode }> = [
  { route: 'graveyard', to: '/graveyard', label: 'Graveyard', icon: <TombstoneIcon /> },
  { route: 'journal', to: '/journal', label: 'Project Journal', icon: <BookOpen size={18} /> },
  { route: 'insights', to: '/insights', label: 'Insights', icon: <ChartColumn size={18} /> },
  { route: 'decision', to: '/decision', label: 'Decision Shrine', icon: <Sparkles size={18} /> },
  { route: 'archive', to: '/archive', label: 'Archive', icon: <Archive size={18} /> },
];

const barStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '14px 28px',
  background: 'var(--color-night-indigo)',
  borderBottom: '2px solid var(--color-lavender)',
  fontFamily: 'var(--font-ui)',
};

const pillBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 14px',
  fontFamily: 'var(--font-ui)',
  fontWeight: 800,
  fontSize: 15,
  border: '2px solid var(--color-lavender)',
  color: 'var(--color-text-primary)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

interface NavBarProps {
  variant: 'landing' | 'dashboard';
  onLogin?: () => void;
  onGetStarted?: () => void;
  /** The landing page scrolls its story; these jump to the matching chapter. */
  onHow?: () => void;
  onExplore?: () => void;
}

export function NavBar({ variant, onLogin, onGetStarted, onHow, onExplore }: NavBarProps) {
  const route = useRoute();
  const { projects } = useProjects();

  if (variant === 'landing') {
    // Sits directly on the sky: no solid bar, no border line.
    return (
      <nav aria-label="Main" style={{ ...barStyle, background: 'transparent', borderBottom: 'none', padding: '18px 36px' }}>
        <Brand to="/" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--color-text-secondary)' }} className="landing-links">
          <Link
            to="/progress"
            onClick={onHow ? (e) => { e.preventDefault(); onHow(); } : undefined}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            How it Works
          </Link>
          <Sparkles size={14} style={{ color: 'var(--color-gold)' }} aria-hidden="true" />
          <Link
            to="/graveyard"
            onClick={onExplore ? (e) => { e.preventDefault(); onExplore(); } : undefined}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            Explore
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <PixelButton className="landing-login" variant="dark-outline" size="sm" onClick={onLogin} aria-label="Log in. No account is needed, this opens your graveyard.">
            Log in
          </PixelButton>
          <PixelButton variant="lavender" size="sm" onClick={onGetStarted}>
            Get Started
          </PixelButton>
        </div>
      </nav>
    );
  }

  const j = journeyOf(projects);
  return (
    <nav aria-label="Main" style={{ ...barStyle, position: 'sticky', top: 0, zIndex: 30 }}>
      <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }}>
        <Brand to="/" />
        <span aria-hidden="true" className="nav-divider" style={{ width: 2, height: 28, background: 'var(--color-stone-outline)' }} />
        <div className="scrollbar-thin nav-tabs" style={{ display: 'flex', gap: 6, overflowX: 'auto', minWidth: 0 }}>
          {TABS.map((tab) => {
            const active = route.name === tab.route;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                aria-current={active ? 'page' : undefined}
                className="notched nav-tab"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 800,
                  fontSize: 16,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  background: active ? 'var(--color-lavender)' : 'transparent',
                  color: active ? 'var(--color-text-dark)' : 'var(--color-text-secondary)',
                  border: active ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                }}
              >
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Link to="/progress" className="notched nav-extra" style={pillBase} aria-label={`Level ${j.level}, ${j.done} of 5 steps. Open your progress.`}>
          LEVEL {j.level} · {j.done}/5
        </Link>
        <span className="notched nav-extra" style={pillBase}>
          <Sprout size={16} style={{ color: 'var(--color-mint)' }} aria-hidden="true" />
          {projects.length} ideas resting
        </span>
        <Link to="/settings" aria-label="Settings and your data" className="notched" style={{ ...pillBase, padding: 8, background: route.name === 'settings' ? 'var(--color-lavender)' : 'transparent', color: route.name === 'settings' ? 'var(--color-text-dark)' : 'var(--color-text-primary)' }}>
          <Settings size={18} aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}

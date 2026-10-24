import { useMemo } from 'react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { graveyardStats } from '@/backend/domain/insights';
import { demoProjects } from '@/backend/domain/seed';
import { PixelSprite, FOLDER, SPROUT, BULB } from '@/frontend/ui/PixelSprite';
import { useChrome } from '@/frontend/shell/AppChrome';

/** The three live numbers under the stones, counted from the saved projects. */
export function StatsBar() {
  const { projects } = useProjects();
  const { openNew } = useChrome();
  const stats = useMemo(() => graveyardStats(projects.length ? projects : demoProjects()), [projects]);
  const items = [
    { sprite: FOLDER, label: `${stats.resting} PROJECTS RESTING` },
    { sprite: SPROUT, label: `${stats.ready} READY TO REVIVE` },
  ];
  const cell = {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 32px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 'clamp(15px, 1.35vw, 24px)',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap' as const,
  };
  return (
    <div role="group" aria-label="Graveyard statistics" className="pixel-frame" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', background: 'var(--color-night-indigo)', ['--bc' as string]: 'var(--color-lavender)', pointerEvents: 'auto' }}>
      {items.map(({ sprite, label }) => (
        <div key={label} style={{ ...cell, borderRight: '2px solid var(--color-stone-outline)' }}>
          <PixelSprite sprite={sprite} px={3} />
          {label}
        </div>
      ))}
      <button type="button" onClick={openNew} style={{ ...cell, background: 'transparent', border: 'none' }} aria-label="Plant a new idea">
        <PixelSprite sprite={BULB} px={3} />
        {stats.newIdeas > 0 ? `${stats.newIdeas} NEW ${stats.newIdeas === 1 ? 'IDEA' : 'IDEAS'}` : 'PLANT A NEW IDEA'}
      </button>
    </div>
  );
}

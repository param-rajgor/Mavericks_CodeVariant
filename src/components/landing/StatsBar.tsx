import { STATS } from '../../data/stats';
import { PixelSprite, FOLDER, SPROUT, BULB } from '../PixelSprite';

const ITEMS = [
  { sprite: FOLDER, label: `${STATS.projectsResting} PROJECTS RESTING` },
  { sprite: SPROUT, label: `${STATS.readyToRevive} READY TO REVIVE` },
  { sprite: BULB, label: `${STATS.newIdeas} NEW IDEA` },
];

export function StatsBar() {
  return (
    <div
      className="notched hard-shadow"
      style={{ display: 'flex', background: 'var(--color-night-indigo)', border: '3px solid var(--color-lavender)' }}
    >
      {ITEMS.map(({ sprite, label }, i) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 32px',
            borderLeft: i > 0 ? '2px solid var(--color-stone-outline)' : 'none',
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            color: 'var(--color-text-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          <PixelSprite sprite={sprite} px={3} />
          {label}
        </div>
      ))}
    </div>
  );
}

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Stone as Project } from '@/frontend/graveyard/stone';
import { StatusPill } from '@/frontend/graveyard/gravestone/StatusPill';
import { GravestoneTooltip } from '@/frontend/graveyard/gravestone/Tooltip';
import { Vine } from '@/frontend/graveyard/gravestone/Vine';
import { PROJECT_ICONS } from '@/frontend/graveyard/gravestone/icons';

const SPARKLES = [
  { left: -8, top: 70 },
  { left: 26, top: 14 },
  { left: 110, top: -10 },
  { left: 194, top: 12 },
  { left: 228, top: 66 },
];

// Exact stack from the brief: crisp 4px gold edge that follows the silhouette + soft halo.
const GLOW_ON =
  'drop-shadow(4px 0 0 #FFD166) drop-shadow(-4px 0 0 #FFD166) drop-shadow(0 4px 0 #FFD166) drop-shadow(0 -4px 0 #FFD166) drop-shadow(0 0 14px rgba(255,209,102,.45))';
// Same list with transparent colours, so the 150ms transition interpolates instead of snapping.
const GLOW_OFF =
  'drop-shadow(4px 0 0 rgba(255,209,102,0)) drop-shadow(-4px 0 0 rgba(255,209,102,0)) drop-shadow(0 4px 0 rgba(255,209,102,0)) drop-shadow(0 -4px 0 rgba(255,209,102,0)) drop-shadow(0 0 14px rgba(255,209,102,0))';

function PixelSparkle() {
  return (
    <svg width={10} height={10} viewBox="0 0 5 5" shapeRendering="crispEdges" aria-hidden="true">
      <rect x={2} y={0} width={1} height={5} fill="#FFD166" />
      <rect x={0} y={2} width={5} height={1} fill="#FFD166" />
      <rect x={2} y={2} width={1} height={1} fill="#FFF1C2" />
    </svg>
  );
}

/* A purely visual variation, the same on both pages: the featured stone is heavy with vines, and a few others carry a small one. */
function vineFor(project: Project): 'heavy' | 'small' | undefined {
  if (project.featured) return 'heavy';
  let h = 0;
  for (let i = 0; i < project.id.length; i++) h += project.id.charCodeAt(i);
  return h % 3 === 0 ? 'small' : undefined;
}

function seedFor(id: string) {
  let s = 0;
  for (let i = 0; i < id.length; i++) s += id.charCodeAt(i);
  return s;
}

const STONE_WIDTH = 230;
const STONE_HEIGHT = 220;

/** A staircase arch (not a smooth ellipse) so the silhouette itself reads as pixel
 * art, snapped to an 8px grid, mirrored left/right from the apex. */
function stairDomePath(w: number, archY: number, bottomY: number, inset: number, peakY: number, steps: number) {
  const grid = 8;
  const snap = (v: number) => Math.round(v / grid) * grid;
  const cx = w / 2;
  const halfW = cx - inset;

  const half: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = -halfW + t * halfW;
    const yRatio = Math.sqrt(Math.max(0, 1 - (x / halfW) ** 2));
    const y = archY - yRatio * (archY - peakY);
    half.push({ x: snap(cx + x), y: snap(y) });
  }
  // de-duplicate consecutive identical points from snapping
  const left = half.filter((p, i) => i === 0 || p.x !== half[i - 1].x || p.y !== half[i - 1].y);
  const right = left
    .slice(0, -1)
    .reverse()
    .map((p) => ({ x: w - p.x, y: p.y }));
  const ridge = [...left, ...right];

  const pts = [`${inset},${bottomY}`, `${inset},${archY}`];
  for (const p of ridge) pts.push(`${p.x},${p.y}`);
  pts.push(`${w - inset},${bottomY}`);
  return `M${pts.join(' L')} Z`;
}

/** The stone shape only — transparent background, stepped pixel arch, flat bottom
 * (spec: outline #3A2F6E, fill #C3B5E6, light edge #E2D8F7, shaded edge
 * #9C8CCB/#7A6AAE). No photo crops, no background rectangle. */
function StoneShape({ seed }: { seed: number }) {
  const w = STONE_WIDTH;
  const h = STONE_HEIGHT;
  const inset = 4;
  const archY = 64 + (seed % 3) * 8; // spring line, small per-stone variation
  const peakY = 16 + (seed % 2) * 6;
  const bottomY = h - inset;
  const d = stairDomePath(w, archY, bottomY, inset, peakY, 5);
  const clipId = `stone-clip-${seed}`;

  // Finer dithered shading (6 steps) instead of 3 flat blocks, for real gradation.
  const bands = [
    { x: 0, frac: 0.16, fill: '#E2D8F7', opacity: 0.95 },
    { x: 0.16, frac: 0.16, fill: '#E2D8F7', opacity: 0.55 },
    { x: 0.32, frac: 0.2, fill: '#C3B5E6', opacity: 0 },
    { x: 0.52, frac: 0.16, fill: '#9C8CCB', opacity: 0.35 },
    { x: 0.68, frac: 0.16, fill: '#9C8CCB', opacity: 0.6 },
    { x: 0.84, frac: 0.16, fill: '#7A6AAE', opacity: 0.75 },
  ];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
      </defs>

      <path d={d} fill="#C3B5E6" />
      {bands.map((b, i) => (
        <rect key={i} x={w * b.x} y={0} width={w * b.frac + 1} height={h} fill={b.fill} opacity={b.opacity} clipPath={`url(#${clipId})`} />
      ))}

      {/* inner bevel: a crisp highlight line just inside the top-left edge, a crisp
       * shadow line just inside the bottom-right edge — the "carved" cue. */}
      <path d={d} fill="none" stroke="#F8F3FF" strokeWidth={10} opacity={0.5} clipPath={`url(#${clipId})`} transform="translate(-6,-6)" />
      <path d={d} fill="none" stroke="#4A3E80" strokeWidth={10} opacity={0.45} clipPath={`url(#${clipId})`} transform="translate(6,6)" />

      <path d={d} fill="none" stroke="#3A2F6E" strokeWidth={4} />
    </svg>
  );
}

interface GravestoneProps {
  project: Project;
  variant: 'landing' | 'dashboard';
  /** Dashboard only: the stone keeps its glow after being clicked (spec §3). */
  selected?: boolean;
  /** Shared-element id for the landing → dashboard transition. */
  layoutId?: string;
  onClick?: () => void;
  onOpenProject?: () => void;
}

export function Gravestone({ project, variant, selected, layoutId, onClick, onOpenProject }: GravestoneProps) {
  const [hovered, setHovered] = useState(false);
  const Icon = PROJECT_ICONS[project.icon];
  const seed = seedFor(project.id);
  const vine = vineFor(project);
  const showGlow = hovered || !!selected || (variant === 'landing' && project.featured);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AnimatePresence>
        {hovered && <GravestoneTooltip project={project} variant={variant} onOpen={onOpenProject} />}
      </AnimatePresence>

      <motion.button
        type="button"
        layoutId={layoutId}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={onClick}
        animate={{ y: hovered ? -6 : 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{
          position: 'relative',
          width: STONE_WIDTH,
          height: STONE_HEIGHT,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'block',
        }}
      >
        <div style={{ filter: showGlow ? GLOW_ON : GLOW_OFF, transition: 'filter 150ms ease-out' }}>
          <StoneShape seed={seed} />
        </div>

        {vine && <Vine size={vine} />}

        <div
          style={{
            position: 'absolute',
            top: 62,
            left: 10,
            right: 10,
            bottom: 18,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--font-ui)',
          }}
        >
          <Icon size={34} color="#4A3E80" />
          <span
            style={{
              fontWeight: 800,
              fontSize: 22,
              lineHeight: 1.15,
              color: '#2E2560',
              textAlign: 'center',
            }}
          >
            {project.name}
          </span>
          <StatusPill status={project.status} />
        </div>

        <AnimatePresence>
          {hovered &&
            SPARKLES.map((pos, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 1, 0], y: -26 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, delay: i * 0.06, ease: 'easeOut' }}
                style={{ position: 'absolute', ...pos, pointerEvents: 'none', lineHeight: 0 }}
              >
                <PixelSparkle />
              </motion.span>
            ))}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

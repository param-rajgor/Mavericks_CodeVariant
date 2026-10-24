import type { CSSProperties, ReactNode } from 'react';
import { FLOWER_P, FLOWER_PAL, FLOWER_W, LANTERN, LANTERN_PAL } from '@/frontend/scene/draw';
import { at, u } from '@/frontend/scene/stage';
import { PixelSprite, type SpriteDef } from '@/frontend/ui/PixelSprite';
import { CROSS, SUNRISE } from './art';
import { NEW_OBJECT, OBJ_CODE, OBJ_DATA, OBJ_DESIGN, OBJ_DONE, OBJ_RESEARCH, OBJ_TODO } from './sprites';
import { PATHS_COPY, REASONS } from './timeline';

/** Small text that stays readable on any screen: scales with the art, but never below 13px. */
const small = (n: number): CSSProperties => ({ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: `max(13px, ${u(n)})`, lineHeight: 1.15 });

const outlined: CSSProperties = { textShadow: '0 2px 0 #1E1C48, 2px 0 0 #1E1C48, -2px 0 0 #1E1C48, 0 -2px 0 #1E1C48' };

/** A sprite placed at art pixel (x, y), top-left anchored. */
function Spot({ x, y, children, style }: { x: number; y: number; children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...at(x, y), ...style }}>{children}</div>;
}

/* -------------------------------------------------------------- panel A: the graveyard */

const ARTIFACTS: Array<{ sprite: SpriteDef; x: number; y: number; label: string }> = [
  { sprite: OBJ_CODE, x: 146, y: 88, label: 'CODE' },
  { sprite: OBJ_DESIGN, x: 176, y: 76, label: 'DESIGN' },
  { sprite: OBJ_DATA, x: 204, y: 88, label: 'DATA' },
  { sprite: OBJ_RESEARCH, x: 232, y: 76, label: 'RESEARCH' },
  { sprite: OBJ_DONE, x: 260, y: 88, label: 'COMPLETED' },
  { sprite: OBJ_TODO, x: 290, y: 76, label: 'REMAINING' },
];

/** Floating pieces of work above the stones, and sparks that lift off whichever stone the ghost is touching. */
export function GraveyardProps({ px, centers }: { px: number; centers: number[] }) {
  return (
    <>
      {ARTIFACTS.map((a, i) => (
        <Spot key={a.label} x={a.x} y={a.y} style={{ opacity: `var(--art${i})`, transform: `translateY(calc((1 - var(--art${i})) * ${u(6)}))` }}>
          <div className="journey-bob" style={{ animationDelay: `${-i * 0.6}s`, textAlign: 'center', width: u(18), marginLeft: u(-9 + 5) }}>
            <PixelSprite sprite={a.sprite} px={px * 1.1} style={{ margin: '0 auto' }} />
            <div style={{ ...small(2.5), ...outlined, color: '#F8F3FF', marginTop: u(1), whiteSpace: 'nowrap' }}>{a.label}</div>
          </div>
        </Spot>
      ))}
      {centers.map((cx, i) => (
        <Spot key={i} x={cx - 8} y={112} style={{ width: u(16), height: u(14), opacity: `var(--touch${i})` }}>
          {[0.1, 0.35, 0.6, 0.85, 0.5].map((f, k) => (
            <span key={k} className="journey-rise" style={{ position: 'absolute', left: `${f * 100}%`, bottom: 0, width: u(1.4), height: u(1.4), background: '#FFD166', animationDelay: `${-k * 0.55}s` }} />
          ))}
        </Spot>
      ))}
    </>
  );
}

/* -------------------------------------------------------------- panel B: reasons and the crossroads */

const REASON_X = [18, 40, 62, 84];

/** Four small signposts beside the path: why projects sometimes stall. They light up as the ghost passes. */
export function ReasonPosts() {
  return (
    <>
      {REASONS.map((r, i) => (
        <Spot key={r} x={REASON_X[i] - 10} y={126} style={{ width: u(20) }}>
          <div
            style={{
              ...small(2.5),
              textAlign: 'center',
              color: '#2E1E18',
              background: '#C89A63',
              border: `${u(0.7)} solid #2E1E18`,
              padding: `${u(1)} ${u(0.6)}`,
              boxShadow: `0 0 calc(var(--rs${i}) * ${u(7)}) calc(var(--rs${i}) * ${u(1.4)}) rgba(255, 209, 102, 0.85)`,
              filter: `brightness(calc(0.85 + var(--rs${i}) * 0.35))`,
              minHeight: u(11),
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {r}
          </div>
          <div style={{ width: u(2), height: u(18), background: '#6B4A3A', margin: '0 auto' }} />
        </Spot>
      ))}
    </>
  );
}

/** Path glows and the fragments that become a new object. */
export function CrossroadsProps({ px }: { px: number }) {
  return (
    <>
      {CROSS.posts.map((x, i) => (
        <Spot
          key={i}
          x={x - 17}
          y={134}
          style={{ width: u(34), height: u(18), borderRadius: '50%', background: `radial-gradient(ellipse, ${PATHS_COPY[i].accent}, transparent 68%)`, opacity: `calc(var(--l${i}) * 0.75)` }}
        >
          {null}
        </Spot>
      ))}

      {/* fragments of an old project coming together */}
      {[
        [-30, 10],
        [-16, -14],
        [20, -8],
        [32, 12],
        [2, 20],
      ].map(([dx, dy], i) => (
        <Spot
          key={i}
          x={CROSS.posts[3] + dx / 4}
          y={126 + dy / 4}
          style={{ width: u(3), height: u(3), background: ['#8FD3F0', '#D7F3FF', '#5FA8D8', '#BCE6F7', '#8FD3F0'][i], transform: `translate(calc((1 - var(--rp)) * ${u(dx)}), calc((1 - var(--rp)) * ${u(dy)}))`, opacity: 'calc(1 - var(--rp) * 0.95)' }}
        >
          {null}
        </Spot>
      ))}
      <Spot x={CROSS.posts[3] - 6} y={118} style={{ opacity: 'var(--rp)', filter: 'drop-shadow(0 0 6px rgba(143,211,240,0.9))' }}>
        <div className="journey-bob">
          <PixelSprite sprite={NEW_OBJECT} px={px * 1.2} />
        </div>
      </Spot>
    </>
  );
}

/* -------------------------------------------------------------- panel C: the sunrise */

const flowerSprite = (rows: string[], i: number): SpriteDef => ({
  rows,
  palette: { ...FLOWER_PAL, ...(i % 4 === 1 ? { w: '#9CE6BD', p: '#9CE6BD' } : i % 4 === 2 ? { w: '#F6B9AB', p: '#F6B9AB' } : i % 4 === 3 ? { w: '#D8B7FF', p: '#D8B7FF' } : {}) },
});
const LANTERN_SPRITE: SpriteDef = { rows: LANTERN, palette: LANTERN_PAL };
const POSTS = [4, 30, 56, 82, 108, 134, 160, 186, 212, 238];

/** Flowers that open along the path, lanterns that glow and then melt into the sunlight, fireflies that lift off. */
export function SunriseProps({ px }: { px: number }) {
  const flowers = Array.from({ length: 16 }, (_, i) => ({ x: 10 + i * 16 + (i % 3) * 3, i }));
  const island = [292, 306, 322, 338, 348];
  return (
    <>
      {POSTS.map((x) => (
        <Spot key={x} x={x - 4} y={139} style={{ width: u(10), height: u(14) }}>
          <div className="journey-flicker" style={{ position: 'absolute', inset: u(-5), background: 'radial-gradient(circle, rgba(255,200,100,0.7), transparent 65%)', opacity: 'var(--lg)' }} />
          <div style={{ position: 'absolute', left: u(1), top: 0 }}>
            <PixelSprite sprite={LANTERN_SPRITE} px={px * 0.9} />
          </div>
        </Spot>
      ))}
      {flowers.map(({ x, i }) => (
        <Spot key={x} x={x} y={143} style={{ transformOrigin: '50% 100%', transform: `scale(clamp(0, calc((var(--bloom) - ${(i * 0.045).toFixed(3)}) * 5), 1))` }}>
          <PixelSprite sprite={flowerSprite(i % 2 ? FLOWER_W : FLOWER_P, i)} px={px * 1.15} />
        </Spot>
      ))}
      {island.map((x, k) => (
        <Spot key={x} x={x} y={SUNRISE.islandTop - 6} style={{ transformOrigin: '50% 100%', transform: `scale(clamp(0, calc((var(--bloom) - ${(0.45 + k * 0.05).toFixed(2)}) * 5), 1))` }}>
          <PixelSprite sprite={flowerSprite(k % 2 ? FLOWER_W : FLOWER_P, k + 1)} px={px * 1.3} />
        </Spot>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <Spot key={i} x={16 + i * 28} y={150} style={{ opacity: 'var(--fly)' }}>
          <span className="journey-lift" style={{ display: 'block', width: u(1.3), height: u(1.3), background: '#FFE08A', boxShadow: '0 0 8px #FFD166', animationDelay: `${-i * 0.9}s` }} />
        </Spot>
      ))}
    </>
  );
}

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

/** Art resolution: one art pixel = 5 screen pixels at 1920×1080. */
export const ART_W = 384;
export const ART_H = 216;

/** Where the landing stones stand, in art pixels. Shared by the canvas (shadow
 * patches, front grass) and the DOM stone row so they line up exactly. */
export const GROUND_Y = 172;
export const STONE_ART_W = 46; // 230px / 5
export const STONE_GAP_ART = 10; // 50px / 5
export const STONE_ROW_X = 124;
export const LANDING_STONE_CENTERS = [0, 1, 2, 3].map((i) => STONE_ROW_X + i * (STONE_ART_W + STONE_GAP_ART) + STONE_ART_W / 2);

function measure() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Cover the viewport, anchored to the bottom so the ground line never moves off-screen.
  const s = Math.max(w / ART_W, h / ART_H);
  return { s, left: (w - ART_W * s) / 2, top: h - ART_H * s };
}

export function useArtScale() {
  const [g, setG] = useState(measure);
  useEffect(() => {
    const onResize = () => setG(measure());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return g;
}

/** A full-viewport layer whose inner box is the 384×216 art grid scaled to cover.
 * Exposes `--s` (screen px per art px) to children. */
export function Stage({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const { s, left, top } = useArtScale();
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      <div style={{ position: 'absolute', left, top, width: ART_W * s, height: ART_H * s, ['--s' as string]: s }}>{children}</div>
    </div>
  );
}

/** Position at art pixel (x, y) inside a Stage. */
export const at = (x: number, y: number): CSSProperties => ({
  position: 'absolute',
  left: `${(x / ART_W) * 100}%`,
  top: `${(y / ART_H) * 100}%`,
});

/** A length of n art pixels inside a Stage. */
export const u = (n: number) => `calc(var(--s) * ${n}px)`;

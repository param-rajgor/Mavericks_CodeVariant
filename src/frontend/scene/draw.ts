import { ART_W, ART_H, GROUND_Y, LANDING_STONE_CENTERS } from '@/frontend/scene/stage';

export type C = CanvasRenderingContext2D;
export type SceneVariant = 'landing' | 'dashboard';
export type Palette = Record<string, string>;

/* ------------------------------------------------------------------ primitives */

export function px(c: C, x: number, y: number, col: string) {
  c.fillStyle = col;
  c.fillRect(x, y, 1, 1);
}

export function rect(c: C, x: number, y: number, w: number, h: number, col: string) {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
/** Ordered dither: true for roughly `d` (0–1) of pixels, in a stable pattern. */
export const dither = (x: number, y: number, d: number) => (BAYER[y & 3][x & 3] + 0.5) / 16 < d;

export function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Mask {
  get(x: number, y: number): boolean;
  set(x: number, y: number): void;
}

export function mask(): Mask {
  const d = new Uint8Array(ART_W * ART_H);
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < ART_W && y < ART_H;
  return {
    get: (x, y) => inside(x, y) && d[y * ART_W + x] === 1,
    set: (x, y) => {
      if (inside(x, y)) d[y * ART_W + x] = 1;
    },
  };
}

export function maskEllipse(m: Mask, cx: number, cy: number, rx: number, ry: number) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - cy) / ry;
      if (nx * nx + ny * ny <= 1) m.set(x, y);
    }
}

export function forMask(m: Mask, fn: (x: number, y: number) => void) {
  for (let y = 0; y < ART_H; y++) for (let x = 0; x < ART_W; x++) if (m.get(x, y)) fn(x, y);
}

export function sprite(c: C, x: number, y: number, rows: string[], pal: Palette, flip = false) {
  const w = Math.max(...rows.map((r) => r.length));
  rows.forEach((raw, j) => {
    const row = raw.padEnd(w, '.');
    for (let i = 0; i < w; i++) {
      const col = pal[row[flip ? w - 1 - i : i]];
      if (col) px(c, x + i, y + j, col);
    }
  });
}

/** A pointed leaf rasterised on the art grid at any angle (degrees, 0 = right, -90 = up). */
const LEAF = { outline: '#16302A', dark: '#2C5A44', light: '#3F7A58', rib: '#21473A' };
export function drawLeaf(c: C, bx: number, by: number, angleDeg: number, len: number, wid: number) {
  const a = (angleDeg * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const R = len + wid;
  for (let y = Math.floor(by - R); y <= Math.ceil(by + R); y++)
    for (let x = Math.floor(bx - R); x <= Math.ceil(bx + R); x++) {
      const dx = x + 0.5 - bx;
      const dy = y + 0.5 - by;
      const u = dx * ux + dy * uy;
      const v = -dx * uy + dy * ux;
      if (u < 0 || u > len) continue;
      const hw = (wid / 2) * Math.pow(Math.sin((Math.PI * u) / len), 0.75);
      if (Math.abs(v) > hw) continue;
      let col = v < 0 ? LEAF.light : LEAF.dark;
      if (Math.abs(v) < 0.6 && u > len * 0.08 && u < len * 0.85) col = LEAF.rib;
      if (Math.abs(v) > hw - 1 || u > len - 1.5) col = LEAF.outline;
      px(c, x, y, col);
    }
}

/* ------------------------------------------------------------------ sprites */

export const TUFTS = [
  ['...l...', '.l.g.l.', '.gGgGg.', 'lgGgGgg', 'gGGGGGg'],
  ['..l..l.', 'l.g.lg.', 'gGg.gGl', 'gGgGgGg'],
  ['l..l..l', 'g.lg.lg', 'gGgGgGg'],
];
export const TUFT_PAL: Palette = { l: '#B4D27A', g: '#93C062', G: '#5E9143' };

export const FLOWER_W = ['.w.', 'wyw', '.w.', '.G.'];
export const FLOWER_P = ['p.p', '.y.', 'p.p', '.G.'];
export const FLOWER_PAL: Palette = { w: '#F8F3FF', y: '#FFD166', p: '#EDB0D5', G: '#4C7A3A' };

/* Sleeping calico, curled, head on the right, tail wrapped round the front. */
export const CAT = [
  '..........................O.....O.....',
  '.........................OrO...OwO....',
  '........................OrrO..OwpwO...',
  '..........OOOOOOOOO....OrrrwOOOwwwwO..',
  '........OOrrrrwwwwwOO.OrrrwwwwwwwwwO..',
  '......OOrrrrRrwwwwwwwOOwwwwwwwwwwwwwO.',
  '.....OrrrRRRrwwwwwwwwwwwwwwwwwwwwwwwO.',
  '....OrrrRRRrrwwwwwwwwwwwwweeewwweeewO.',
  '...OwrrrrrrwwwwwwwwwwwwwwwwwwwwwpwwwO.',
  '...OwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwO..',
  '..OwwwwwwwwwwwwwrrrwwwwwwwwwwwwwwwsO..',
  '..OwwwwwwwwwwwwrrRrrwwwwwwwwwwwwwsO...',
  '..OswwwwwwwwwwwwrrrwwwwwwwwwwwwwssO...',
  '.OOOsswwwwwwwwwwwwwwwwwwwwwwwwssOO....',
  'OrrrOOssssswwwwwwwwwwwwwssssssOO......',
  'OrRrrrOOOOsssssssssssssssOOOOO........',
  '.OrrrrrrrrrrrrOOOOOOOOOOOO............',
  '..OOOOOOOOOOOO........................',
];
export const CAT_PAL: Palette = { O: '#4A3550', w: '#F8F3FF', s: '#D3C5E6', r: '#F2A35E', R: '#C9713A', e: '#4A3550', p: '#F2A7C3' };

export const LANTERN = ['..ooo..', '.oDDDo.', 'ooooooo', 'oyYYYyo', 'oYWWWYo', 'oYWWWYo', 'oyYYYyo', 'ooooooo', '.oDDDo.', '...o...'];
export const LANTERN_PAL: Palette = { o: '#2E1E18', D: '#5A3F2A', y: '#E0A63A', Y: '#FFBE55', W: '#FFF1C2' };

const SIGN_ROCKET = ['.....ww', '....www', '..w.ww.', '...www.', '..wwww.', '.ww.w..', 'w......'];

/* ------------------------------------------------------------------ 1. sky + 2. sun */

export const SKY: [number, string][] = [
  [0, '#24234F'],
  [18, '#28255A'],
  [34, '#2E2A66'],
  [48, '#363073'],
  [60, '#3F3781'],
  [71, '#4A3F8E'],
  [80, '#56489B'],
  [88, '#6553A9'],
  [95, '#7662BA'],
  [101, '#8B71C4'],
  [106, '#A47FC3'],
  [111, '#C08DC0'],
  [116, '#DB9BBC'],
  [121, '#EFA8B6'],
  [127, '#F6B9AB'],
];

const SUN: Record<SceneVariant, { cx: number; cy: number; r: number }> = {
  landing: { cx: 244, cy: 106, r: 22 },
  dashboard: { cx: 196, cy: 108, r: 20 },
};

function drawSun(c: C, v: SceneVariant) {
  const { cx, cy, r } = SUN[v];
  drawSunAt(c, cx, cy, r);
}

/** The setting / rising sun: stripe gaps across its lower half and a peach halo kept close to its edge. */
export function drawSunAt(c: C, cx: number, cy: number, r: number) {
  // Peach glow kept close to the sun (spec: no big hazy bloom).
  const R = 6;
  for (let y = cy - r - R; y <= cy + r + R; y++)
    for (let x = cx - r - R; x <= cx + r + R; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) - r;
      if (d <= 0 || d > R) continue;
      const dens = d < 2 ? 0.7 : d < 4 ? 0.32 : 0.12;
      if (dither(x, y, dens)) px(c, x, y, d < 3 ? '#F6B9AB' : '#E8A6B8');
    }
  const gaps = [
    [3.5, 4.5],
    [7.5, 9],
    [11.5, 13.5],
    [15.5, 18.5],
  ];
  for (let y = cy - r; y < cy + r; y++) {
    const dy = y + 0.5 - cy;
    if (gaps.some(([a, b]) => dy > a && dy < b)) continue;
    const half = Math.sqrt(Math.max(0, r * r - dy * dy));
    const t = (y - (cy - r)) / (2 * r);
    const col = t < 0.16 ? '#FFF0B8' : t < 0.34 ? '#FFE28E' : t < 0.52 ? '#FFD166' : t < 0.7 ? '#FFBE55' : '#F8A66C';
    const x0 = Math.round(cx - half);
    rect(c, x0, y, Math.round(cx + half) - x0, 1, col);
  }
}

export function drawSky(c: C, v: SceneVariant, withSun = true) {
  SKY.forEach(([y0, col], i) => {
    const y1 = i + 1 < SKY.length ? SKY[i + 1][0] : ART_H;
    rect(c, 0, y0, ART_W, y1 - y0, col);
    if (i + 1 < SKY.length) {
      const next = SKY[i + 1][1];
      for (let x = 0; x < ART_W; x++) {
        if (dither(x, y1 - 1, 0.5)) px(c, x, y1 - 1, next);
        if (dither(x, y1 - 2, 0.2)) px(c, x, y1 - 2, next);
      }
    }
  });
  const r = rng(v === 'landing' ? 7 : 11);
  for (let i = 0; i < 80; i++) {
    const x = Math.floor(r() * ART_W);
    const y = Math.floor(r() * 96);
    const b = r();
    px(c, x, y, b > 0.75 ? '#F8F3FF' : b > 0.4 ? '#D8B7FF' : '#8F80C8');
  }
  if (withSun) drawSun(c, v);
}

/* ------------------------------------------------------------------ 3. clouds */

type Cloud = { discs: [number, number, number][]; base: [number, number, number, number] };
const CLOUDS: Record<SceneVariant, Cloud[]> = {
  landing: [
    { discs: [[234, 41, 6], [243, 35, 8], [254, 37, 7], [263, 42, 5]], base: [227, 40, 42, 6] },
    { discs: [[192, 54, 4], [199, 50, 6], [208, 53, 5]], base: [186, 53, 27, 4] },
    { discs: [[206, 92, 4], [214, 89, 5], [222, 92, 4]], base: [201, 91, 26, 3] },
    { discs: [[290, 82, 3], [297, 79, 5], [305, 82, 4]], base: [285, 81, 25, 3] },
  ],
  dashboard: [
    { discs: [[150, 66, 4], [157, 62, 6], [166, 65, 4]], base: [145, 64, 26, 4] },
    { discs: [[230, 84, 4], [238, 80, 6], [247, 83, 4]], base: [225, 82, 27, 4] },
    { discs: [[300, 44, 5], [309, 39, 7], [319, 43, 5]], base: [293, 42, 31, 5] },
  ],
};

export function drawClouds(c: C, v: SceneVariant) {
  const m = mask();
  for (const cl of CLOUDS[v]) {
    cl.discs.forEach(([x, y, r]) => maskEllipse(m, x, y, r, r));
    const [bx, by, bw, bh] = cl.base;
    for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) m.set(x, y);
  }
  // Lit pink from below by the sun, cool lavender rim on top.
  forMask(m, (x, y) => {
    let col = '#A792D8';
    if (!m.get(x, y + 1)) col = '#F6B9AB';
    else if (!m.get(x, y + 2)) col = '#EDB0D5';
    else if (!m.get(x, y + 3) && dither(x, y, 0.5)) col = '#D3A2D6';
    else if (!m.get(x, y - 1) || !m.get(x - 1, y)) col = '#DCCBF5';
    else if (!m.get(x, y - 2) && dither(x, y, 0.5)) col = '#C2AEEA';
    px(c, x, y, col);
  });
}

/* ------------------------------------------------------------------ 4. mountains */

export type Layer = {
  base: number;
  peaks: [number, number, number][];
  wob: number;
  seed: number;
  fill: string;
  hi: string;
  shade: string;
  trees?: boolean;
};

export const MOUNTAINS: Record<SceneVariant, Layer[]> = {
  landing: [
    { base: 118, peaks: [[30, 14, 50], [110, 12, 48], [196, 16, 40], [282, 28, 58], [360, 14, 40]], wob: 1.2, seed: 1, fill: '#8F7BCB', hi: '#BBA0DA', shade: '#7C69BC' },
    { base: 132, peaks: [[14, 12, 40], [88, 9, 38], [168, 12, 40], [246, 9, 36], [326, 15, 46]], wob: 1, seed: 4, fill: '#6A58AE', hi: '#8E79C8', shade: '#58499C' },
    { base: 146, peaks: [[56, 9, 46], [148, 7, 40], [232, 8, 42], [330, 10, 52]], wob: 1.4, seed: 7, fill: '#4B3F90', hi: '#5F519F', shade: '#3C337E', trees: true },
  ],
  dashboard: [
    { base: 118, peaks: [[40, 12, 48], [130, 16, 44], [206, 14, 40], [290, 22, 56], [370, 12, 40]], wob: 1.2, seed: 2, fill: '#8F7BCB', hi: '#BBA0DA', shade: '#7C69BC' },
    { base: 132, peaks: [[30, 10, 40], [110, 12, 40], [246, 20, 30], [330, 12, 44]], wob: 1, seed: 5, fill: '#6A58AE', hi: '#8E79C8', shade: '#58499C' },
    { base: 146, peaks: [[70, 8, 46], [160, 7, 40], [250, 9, 42], [340, 10, 52]], wob: 1.4, seed: 8, fill: '#4B3F90', hi: '#5F519F', shade: '#3C337E', trees: true },
  ],
};

export function ridgeAt(L: Layer, x: number) {
  let h = 0;
  for (const [cx, ph, pw] of L.peaks) {
    const d = Math.abs(x - cx) / pw;
    if (d < 1) h = Math.max(h, ph * (1 - 0.4 * d - 0.6 * d * d));
  }
  return Math.round(L.base - h + L.wob * Math.sin(x / 9 + L.seed) + L.wob * 0.6 * Math.sin(x / 4.3 + L.seed * 2));
}

export function drawMountains(c: C, v: SceneVariant, only?: number) {
  MOUNTAINS[v].forEach((L, i) => {
    if (only !== undefined && only !== i) return;
    for (let x = 0; x < ART_W; x++) {
      let t = ridgeAt(L, x);
      if (L.trees && hash(x >> 2, 3) > 0.45) t -= [1, 2, 2, 1][x & 3];
      rect(c, x, t, 1, ART_H - t, L.fill);
      // Lit ridge: pink where the far range faces the sun, lavender elsewhere.
      const hi = i === 0 && Math.abs(x - SUN[v].cx) < 70 ? '#E9B4C6' : L.hi;
      px(c, x, t, hi);
      if (dither(x, t + 1, 0.5)) px(c, x, t + 1, hi);
      // Each range darkens slightly toward its base, in a soft dithered step.
      for (let y = t + 12; y < t + 15; y++) if (dither(x, y, (y - t - 11) / 4)) px(c, x, y, L.shade);
      rect(c, x, t + 15, 1, ART_H - t - 15, L.shade);
    }
  });
}

function drawCastle(c: C, dx = 64, dy = -8) {
  const D = '#2B275A';
  const L = '#3A3472';
  rect(c, 236 + dx, 100 + dy, 18, 18, D);
  rect(c, 229 + dx, 95 + dy, 7, 23, D);
  rect(c, 254 + dx, 97 + dy, 7, 21, D);
  rect(c, 242 + dx, 90 + dy, 6, 10, D);
  const roof = (x0: number, w: number, yBase: number) => {
    for (let i = 0; w - i * 2 > 0; i++) rect(c, x0 + i, yBase - i, w - i * 2, 1, D);
  };
  roof(229 + dx, 7, 94 + dy);
  roof(254 + dx, 7, 96 + dy);
  roof(242 + dx, 6, 89 + dy);
  rect(c, 244 + dx, 81 + dy, 1, 6, D);
  rect(c, 245 + dx, 81 + dy, 4, 3, '#B995FF');
  for (let x = 236; x < 254; x += 2) px(c, x + dx, 99 + dy, D);
  rect(c, 229 + dx, 95 + dy, 1, 23, L);
  rect(c, 236 + dx, 100 + dy, 1, 18, L);
  const windows: [number, number, number, number][] = [
    [240 + dx, 104 + dy, 2, 2],
    [247 + dx, 104 + dy, 2, 2],
    [243 + dx, 110 + dy, 2, 3],
    [231 + dx, 100 + dy, 1, 2],
    [257 + dx, 102 + dy, 1, 2],
    [244 + dx, 93 + dy, 2, 2],
  ];
  for (const [x, y, w, h] of windows) {
    for (let gy = y - 2; gy < y + h + 2; gy++) for (let gx = x - 2; gx < x + w + 2; gx++) if (dither(gx, gy, 0.25)) px(c, gx, gy, '#8A6A5A');
    rect(c, x, y, w, h, '#FFD166');
  }
}

/* ------------------------------------------------------------------ 5. meadow */

export function meadowTop(x: number) {
  return Math.round(156 + 2.5 * Math.sin(x / 31 + 0.5) + 1.5 * Math.sin(x / 11 + 1.3) + 4 * Math.exp(-(((x - 240) / 80) ** 2)));
}

function drawMeadow(c: C, v: SceneVariant, stoneCenters: number[]) {
  for (let x = 0; x < ART_W; x++) {
    const t = meadowTop(x);
    for (let y = t; y < ART_H; y++) {
      const d = y - t;
      let col: string;
      if (d === 0) col = '#B4D27A';
      else if (d === 1) col = dither(x, y, 0.5) ? '#B4D27A' : '#93C062';
      else if (d < 4) col = '#93C062';
      else if (d < 5) col = dither(x, y, 0.5) ? '#93C062' : '#76A84F';
      else if (d < 11) col = '#76A84F';
      else if (d < 15) col = dither(x, y, (d - 10) / 5) ? '#5E9143' : '#76A84F';
      else if (d < 26) col = '#5E9143';
      else if (d < 32) col = dither(x, y, (d - 25) / 7) ? '#4C7A3A' : '#5E9143';
      else col = '#4C7A3A';
      px(c, x, y, col);
    }
  }

  const r = rng(v === 'landing' ? 21 : 23);
  for (let i = 0; i < 500; i++) {
    const x = Math.floor(r() * ART_W);
    const t = meadowTop(x);
    const y = t + 4 + Math.floor(r() * (ART_H - t - 4));
    const d = y - t;
    if (r() < 0.5) px(c, x, y, d < 11 ? '#5E9143' : d < 26 ? '#4C7A3A' : '#3F6B33');
    else {
      const lite = d < 11 ? '#93C062' : d < 26 ? '#76A84F' : '#5E9143';
      px(c, x, y, lite);
      px(c, x, y - 1, lite);
    }
  }

  // A darker dithered shadow patch under each stone.
  for (const cx of stoneCenters)
    for (let y = GROUND_Y - 3; y <= GROUND_Y + 3; y++)
      for (let x = Math.floor(cx - 28); x <= Math.ceil(cx + 28); x++) {
        const nx = (x + 0.5 - cx) / 28;
        const ny = (y + 0.5 - GROUND_Y) / 3.5;
        if (nx * nx + ny * ny <= 1 && dither(x, y, 0.65)) px(c, x, y, '#3F6B33');
      }

  for (let i = 0; i < 18; i++) {
    const x = Math.floor(r() * (ART_W - 8));
    const y = meadowTop(x) + 6 + Math.floor(r() * 30);
    const tuft = TUFTS[i % TUFTS.length];
    sprite(c, x, y - tuft.length, tuft, TUFT_PAL, i % 2 === 0);
  }
  for (let i = 0; i < 22; i++) {
    const x = Math.floor(r() * (ART_W - 4));
    const y = meadowTop(x) + 3 + Math.floor(r() * 34);
    sprite(c, x, y - 4, i % 3 ? FLOWER_W : FLOWER_P, FLOWER_PAL);
  }
}

/* ------------------------------------------------------------------ 6. tree + lanterns */

function drawTree(c: C, flip: boolean, lanterns: number[]) {
  const Xc = (x: number) => (flip ? ART_W - x : x); // continuous mirror
  const Xp = (x: number) => (flip ? ART_W - 1 - x : x); // pixel mirror

  const back = mask();
  for (let y = 58; y <= 188; y++) {
    const t = (y - 58) / 130;
    const cx = 368 - (1 - t) * 8;
    let w = 9 + t * 9;
    if (y > 170) w += (y - 170) * 1.1;
    for (let x = Math.round(cx - w / 2); x <= Math.round(cx + w / 2); x++) back.set(Xp(x), y);
  }
  const limb = (m: Mask, x0: number, y0: number, x1: number, y1: number, r0: number, r1: number) => {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const r = r0 + (r1 - r0) * t;
      maskEllipse(m, Xc(x0 + (x1 - x0) * t), y0 + (y1 - y0) * t - Math.sin(Math.PI * t) * 2, r, r);
    }
  };
  limb(back, 364, 64, 330, 40, 3.2, 1.6);
  limb(back, 348, 52, 300, 36, 2.6, 1.2);
  limb(back, 366, 62, 384, 38, 3, 2);
  limb(back, 358, 70, 316, 56, 2.6, 1.4);

  const paintBark = (m: Mask) =>
    forMask(m, (x, y) => {
      const lit = flip ? !m.get(x + 1, y) : !m.get(x - 1, y);
      const lit2 = flip ? !m.get(x + 2, y) : !m.get(x - 2, y);
      const dark = flip ? !m.get(x - 1, y) : !m.get(x + 1, y);
      let col = '#6B4A3A';
      if (!m.get(x, y + 1) || dark) col = '#3E2A22';
      else if (lit) col = '#A57A55';
      else if (!m.get(x, y - 1) || lit2) col = '#8C6448';
      else if (hash(x, y >> 2) > 0.82) col = '#553A2E';
      px(c, x, y, col);
    });
  paintBark(back);

  const CANOPY: [number, number, number][] = [
    [258, 50, 7], [270, 44, 10], [262, 60, 7], [284, 34, 11], [300, 26, 10], [318, 22, 11],
    [338, 24, 12], [358, 22, 11], [376, 28, 10], [296, 48, 12], [322, 42, 13], [348, 40, 13],
    [372, 46, 11], [310, 60, 9], [286, 62, 8], [334, 58, 10], [358, 60, 9], [380, 58, 8],
  ];
  // Blossom puffs, each lit on its own (bright toward the sun, shaded underneath),
  // drawn top-to-bottom so lower puffs overlap the ones behind them.
  const puffs = [...CANOPY].sort((a, b) => a[1] - b[1]);
  for (const [x0, cy, r] of puffs) {
    const cx = Xc(x0);
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > r) continue;
        const lx = flip ? -dx : dx;
        const lit = -(lx * 0.55 + dy * 0.83) / r;
        let col = lit > 0.55 ? '#F3D8FF' : lit > 0.2 ? '#E2C2FB' : lit > -0.15 ? '#C9A2F0' : lit > -0.5 ? '#AE87E2' : '#9370D0';
        if (r - dist < 1.2 && lit < 0.1) col = '#7A58BC';
        else if (lit > -0.35 && hash(x >> 1, y >> 1) > 0.88) col = '#EDB0D5';
        px(c, x, y, col);
      }
  }

  // The lower branch the lanterns hang from sits in front of the canopy.
  const front = mask();
  limb(front, 364, 74, 288, 68, 3.2, 1.4);
  limb(front, 322, 70, 300, 62, 1.6, 1);
  paintBark(front);

  for (const lx of lanterns) {
    const x = Xp(lx);
    rect(c, x, 69, 1, 7, '#2E1E18');
    sprite(c, x - 3, 76, LANTERN, LANTERN_PAL);
  }
}

/* ------------------------------------------------------------------ 7. sign */

function drawSign(c: C) {
  rect(c, 346, 104, 4, 72, '#6B4A3A');
  rect(c, 346, 104, 1, 72, '#8C6448');
  rect(c, 349, 104, 1, 72, '#3E2A22');
  rect(c, 333, 96, 30, 18, '#2E1E18');
  rect(c, 334, 97, 28, 16, '#8A5A3B');
  rect(c, 334, 97, 28, 2, '#A0704A');
  rect(c, 334, 105, 28, 1, '#6B4A3A');
  rect(c, 334, 111, 28, 2, '#6B4A3A');
  px(c, 336, 99, '#3E2A22');
  px(c, 359, 99, '#3E2A22');
  sprite(c, 344, 100, SIGN_ROCKET, { w: '#F8F3FF' });
}

/* ------------------------------------------------------------------ 8. rock + cat */

function drawRock(c: C, cx: number, cy: number, rx: number, ry: number) {
  const m = mask();
  maskEllipse(m, cx, cy, rx, ry);
  forMask(m, (x, y) => {
    const ny = (y + 0.5 - cy) / ry;
    const nx = (x + 0.5 - cx) / rx;
    let col = '#8B7BC0';
    if (!m.get(x, y - 1) || !m.get(x - 1, y) || !m.get(x + 1, y)) col = '#3A2F6E';
    else if (!m.get(x, y - 2)) col = '#C3B5E6';
    else if (ny < -0.45 && nx < 0.3) col = '#A898D6';
    else if (ny > 0.15 || nx > 0.6) col = '#7A6AAE';
    else if ((ny > -0.05 || nx > 0.45) && dither(x, y, 0.5)) col = '#7A6AAE';
    px(c, x, y, col);
  });
}

function drawBush(c: C) {
  const leaves: [number, number, number, number, number][] = [
    [-2, 170, -72, 24, 9],
    [-4, 166, -44, 22, 8],
    [-2, 172, -100, 18, 8],
    [6, 170, -58, 18, 7],
  ];
  for (const [x, y, a, l, w] of leaves) drawLeaf(c, x, y, a, l, w);
}

/* ------------------------------------------------------------------ dashboard props */

function drawLaptopBooks(c: C) {
  const books: [number, number, number, string, string][] = [
    [6, 194, 34, '#B995FF', '#8A63E8'],
    [8, 190, 30, '#9CE6BD', '#5FB37E'],
    [5, 186, 32, '#F7B39C', '#D9806A'],
  ];
  for (const [x, y, w, f, s] of books) {
    rect(c, x, y, w, 4, '#2E2560');
    rect(c, x + 1, y + 1, w - 2, 2, f);
    rect(c, x + 1, y + 2, w - 2, 1, s);
    rect(c, x + w - 5, y + 1, 3, 2, '#F8F3FF');
  }
  rect(c, 10, 168, 26, 17, '#2E2560');
  rect(c, 11, 169, 24, 15, '#B995FF');
  rect(c, 12, 170, 22, 13, '#2A2563');
  const glyph: [number, number][] = [
    [16, 175], [15, 176], [14, 177], [15, 178], [16, 179],
    [22, 174], [22, 175], [21, 176], [21, 177], [20, 178], [20, 179],
    [26, 175], [27, 176], [28, 177], [27, 178], [26, 179],
  ];
  for (const [x, y] of glyph) px(c, x, y, '#9CE6BD');
  rect(c, 6, 185, 34, 2, '#2E2560');
  rect(c, 7, 185, 32, 1, '#C3B5E6');
}

/* ------------------------------------------------------------------ composed back layer */

export function drawLand(c: C, v: SceneVariant) {
  drawMountains(c, v);
  drawLandFront(c, v);
}

/** Everything in the back layer that stands on the ground: castle, meadow, tree, sign, rock and cat. */
export function drawLandFront(c: C, v: SceneVariant) {
  if (v === 'dashboard') drawCastle(c);
  drawMeadow(c, v, v === 'landing' ? LANDING_STONE_CENTERS : []);
  if (v === 'landing') {
    drawTree(c, false, [300, 324]);
    drawSign(c);
    drawBush(c);
    drawRock(c, 34, 175, 30, 10);
    sprite(c, 15, 148, CAT, CAT_PAL);
    // Plant the rock and sign post in the grass rather than on top of it.
    [6, 14, 24, 33, 42, 51, 59].forEach((x, i) => sprite(c, x, 186 - TUFTS[i % 3].length, TUFTS[i % 3], TUFT_PAL, i % 2 === 0));
    sprite(c, 344, 177 - TUFTS[0].length, TUFTS[0], TUFT_PAL);
    sprite(c, 26, 182, FLOWER_P, FLOWER_PAL);
    sprite(c, 48, 183, FLOWER_W, FLOWER_PAL);
  } else {
    drawTree(c, true, [307, 325, 343]);
    drawLaptopBooks(c);
    drawRock(c, 362, 204, 22, 9);
    sprite(c, 343, 178, CAT, CAT_PAL, true);
  }
}

/* ------------------------------------------------------------------ 10. grass in front of stones */

export function drawFrontGrass(c: C) {
  const centers = LANDING_STONE_CENTERS;
  const x0 = Math.round(centers[0] - 30);
  const x1 = Math.round(centers[centers.length - 1] + 30);
  for (let x = x0; x <= x1; x++) {
    const h = 2 + Math.floor(hash(x, 5) * 4);
    const tip = GROUND_Y - h;
    for (let y = tip; y <= GROUND_Y + 4; y++) {
      const k = y - tip;
      const col = k === 0 ? (hash(x, 9) > 0.5 ? '#B4D27A' : '#93C062') : k === 1 ? '#93C062' : k < 4 ? '#76A84F' : '#5E9143';
      px(c, x, y, col);
    }
  }
  const r = rng(31);
  for (let i = 0; i < 16; i++) {
    const x = x0 + Math.floor(r() * (x1 - x0 - 7));
    const tuft = TUFTS[i % TUFTS.length];
    sprite(c, x, GROUND_Y + 3 - tuft.length, tuft, TUFT_PAL, i % 2 === 1);
  }
  for (let i = 0; i < 12; i++) {
    const x = x0 + Math.floor(r() * (x1 - x0 - 3));
    sprite(c, x, GROUND_Y - 1 + Math.floor(r() * 4), i % 2 ? FLOWER_W : FLOWER_P, FLOWER_PAL);
  }
}

/* ------------------------------------------------------------------ 11. corner leaves */

export function drawFrontLeaves(c: C) {
  const L: [number, number, number, number, number][] = [
    [-4, 222, -78, 44, 14],
    [-6, 214, -52, 46, 15],
    [2, 224, -30, 38, 13],
    [-8, 200, -92, 30, 11],
    [10, 226, -62, 30, 11],
    [-2, 226, -12, 30, 11],
  ];
  for (const [x, y, a, len, w] of L) drawLeaf(c, x, y, a, len, w);
  for (const [x, y, a, len, w] of L) drawLeaf(c, ART_W - x, y, -180 - a, len, w);
}

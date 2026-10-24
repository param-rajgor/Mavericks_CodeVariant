/**
 * Pixel-art drawing for the scroll story: the crossroads island, the long sunrise bridge, the dawn sky and
 * the mountain strips. Everything is drawn on the same 384x216 art grid as the landing scene, one panel per
 * canvas, and uses the scene's own helpers so the three environments look like one world.
 *
 * World layout (art pixels): panel 0 = the graveyard (the landing scene), panel 1 = the crossroads,
 * panel 2 = the sunrise. Panel p starts at x = p * 384.
 */
import {
  FLOWER_P,
  FLOWER_PAL,
  FLOWER_W,
  LANTERN,
  LANTERN_PAL,
  MOUNTAINS,
  SKY,
  TUFTS,
  TUFT_PAL,
  dither,
  drawSky,
  drawSunAt,
  forMask,
  hash,
  mask,
  maskEllipse,
  meadowTop,
  px,
  rect,
  ridgeAt,
  rng,
  sprite,
  type C,
  type Layer,
  type Palette,
} from '@/frontend/scene/draw';
import { ART_H, ART_W } from '@/frontend/scene/stage';

/* ------------------------------------------------------------------ colour */

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export function mix(a: string, b: string, t: number): string {
  const x = hex(a);
  const y = hex(b);
  const m = (i: number) => Math.round(x[i] + (y[i] - x[i]) * t).toString(16).padStart(2, '0');
  return `#${m(0)}${m(1)}${m(2)}`;
}
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/* ------------------------------------------------------------------ sky and sun */

export const drawSkyTwilight = (c: C) => drawSky(c, 'landing', false);

/** Violet at the top, rose and peach in the middle, cream gold at the horizon. */
const DAWN_SKY = ['#7A6AD0', '#8A74D8', '#9A7EDF', '#AC8AE3', '#C096E2', '#D4A3DD', '#E6AFD0', '#F2BCC4', '#F9C9B6', '#FFD6A5', '#FFE0A0', '#FFE8AA', '#FFEFB8', '#FFF4C8', '#FFF8D6'];

export function drawSkyDawn(c: C) {
  SKY.forEach(([y0], i) => {
    const y1 = i + 1 < SKY.length ? SKY[i + 1][0] : ART_H;
    rect(c, 0, y0, ART_W, y1 - y0, DAWN_SKY[i]);
    if (i + 1 < SKY.length) {
      for (let x = 0; x < ART_W; x++) {
        if (dither(x, y1 - 1, 0.5)) px(c, x, y1 - 1, DAWN_SKY[i + 1]);
        if (dither(x, y1 - 2, 0.2)) px(c, x, y1 - 2, DAWN_SKY[i + 1]);
      }
    }
  });
}

export const SUN_TWILIGHT = { cx: 244, cy: 106, r: 22 };
export const SUN_DAWN = { cx: 262, cy: 108, r: 30 };
export const drawSunTwilight = (c: C) => drawSunAt(c, SUN_TWILIGHT.cx, SUN_TWILIGHT.cy, SUN_TWILIGHT.r);
export const drawSunDawn = (c: C) => drawSunAt(c, SUN_DAWN.cx, SUN_DAWN.cy, SUN_DAWN.r);

/* ------------------------------------------------------------------ mountains */

/** Peaks in world coordinates (0-768), continuing the landing scene's own peaks into the next panel. */
const STRIP_PEAKS: [number, number, number][][] = [
  [...MOUNTAINS.landing[0].peaks, [440, 13, 46], [520, 18, 50], [610, 12, 44], [700, 20, 56]],
  [...MOUNTAINS.landing[1].peaks, [420, 10, 40], [500, 13, 44], [590, 10, 40], [680, 14, 48]],
  [...MOUNTAINS.landing[2].peaks, [430, 8, 44], [520, 9, 46], [610, 8, 42], [710, 10, 50]],
];
const DAWN_RANGE = [
  { fill: '#E7B8D6', hi: '#FFE6CB', shade: '#CF9CC8' },
  { fill: '#C79ACB', hi: '#F2C6DA', shade: '#AA7FB7' },
  { fill: '#9C78B8', hi: '#C79AC9', shade: '#80629F' },
];

/** One mountain range of one 384-wide strip, in twilight or dawn colours. Strip 1 continues strip 0 seamlessly. */
export function rangeDrawer(strip: 0 | 1, layer: 0 | 1 | 2, dawn: boolean) {
  return (c: C) => {
    const base: Layer = MOUNTAINS.landing[layer];
    const L: Layer = strip === 0 ? base : { ...base, peaks: STRIP_PEAKS[layer] };
    const xOff = strip * ART_W;
    const col = dawn ? DAWN_RANGE[layer] : { fill: base.fill, hi: base.hi, shade: base.shade };
    for (let x = 0; x < ART_W; x++) {
      let t = ridgeAt(L, x + xOff);
      if (L.trees && hash((x + xOff) >> 2, 3) > 0.45) t -= [1, 2, 2, 1][x & 3];
      rect(c, x, t, 1, ART_H - t, col.fill);
      px(c, x, t, col.hi);
      if (dither(x, t + 1, 0.5)) px(c, x, t + 1, col.hi);
      for (let y = t + 12; y < t + 15; y++) if (dither(x, y, (y - t - 11) / 4)) px(c, x, y, col.shade);
      rect(c, x, t + 15, 1, ART_H - t - 15, col.shade);
    }
  };
}

/* ------------------------------------------------------------------ ground */

const GREEN_TWILIGHT = ['#B4D27A', '#93C062', '#76A84F', '#5E9143', '#4C7A3A'];
const GREEN_DAWN = ['#EEF6B0', '#C8E684', '#A3CE66', '#82B553', '#659B43'];
/** 0 in the graveyard, 1 at the sunrise: the grass warms as the world moves on. */
const warmth = (worldX: number) => clamp01((worldX - ART_W) / (ART_W * 2));
const greens = (t: number) => GREEN_TWILIGHT.map((g, i) => mix(g, GREEN_DAWN[i], t));

function meadowColumn(c: C, x: number, top: number, g: string[], bottom = ART_H) {
  for (let y = top; y < bottom; y++) {
    const d = y - top;
    let col: string;
    if (d === 0) col = g[0];
    else if (d === 1) col = dither(x, y, 0.5) ? g[0] : g[1];
    else if (d < 4) col = g[1];
    else if (d < 5) col = dither(x, y, 0.5) ? g[1] : g[2];
    else if (d < 11) col = g[2];
    else if (d < 15) col = dither(x, y, (d - 10) / 5) ? g[3] : g[2];
    else if (d < 26) col = g[3];
    else if (d < 32) col = dither(x, y, (d - 25) / 7) ? g[4] : g[3];
    else col = g[4];
    px(c, x, y, col);
  }
}

function speckle(c: C, xOff: number, seed: number, topAt: (x: number) => number, x0: number, x1: number, count: number) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = x0 + Math.floor(r() * (x1 - x0));
    const g = greens(warmth(x + xOff));
    const top = topAt(x);
    const y = top + 4 + Math.floor(r() * (ART_H - top - 4));
    const d = y - top;
    if (r() < 0.5) px(c, x, y, d < 11 ? g[3] : g[4]);
    else {
      const lite = d < 11 ? g[1] : d < 26 ? g[2] : g[3];
      px(c, x, y, lite);
      px(c, x, y - 1, lite);
    }
  }
}

function tufts(c: C, xOff: number, seed: number, xs: number[], topAt: (x: number) => number) {
  const r = rng(seed);
  xs.forEach((x, i) => {
    const g = greens(warmth(x + xOff));
    const tuft = TUFTS[i % TUFTS.length];
    const pal: Palette = { l: g[0], g: g[1], G: g[3] };
    sprite(c, x, topAt(x) + 5 + Math.floor(r() * 10) - tuft.length, tuft, pal, i % 2 === 0);
  });
}

/* ------------------------------------------------------------------ props */

const OUT = '#2E1E18';

/** The wooden bridge. `deck(x)` gives the y of the planks; posts and a rope rail stand on it. */
export function drawBridge(c: C, x0: number, x1: number, deck: (x: number) => number) {
  for (let x = x0; x < x1; x += 3) {
    const y = deck(x);
    const alt = ((x - x0) / 3) % 2 === 0;
    rect(c, x, y, 3, 3, alt ? '#C89A63' : '#B8864F');
    rect(c, x, y + 3, 3, 1, '#6B4A3A');
    px(c, x + 1, y, alt ? '#E0B882' : '#CFA06A');
  }
  rect(c, x0, deck(x0) + 4, x1 - x0, 1, '#4A3550');
  for (let x = x0; x < x1; x++) {
    const y = deck(x);
    if (x % 26 === 4) {
      rect(c, x, y - 9, 2, 10, '#4A3550');
      px(c, x, y - 9, '#8C6448');
    }
    // rope rail: sags between the posts
    const phase = ((x - x0 - 4) % 26 + 26) % 26;
    const sag = Math.round(2.2 * Math.sin((Math.PI * phase) / 26));
    px(c, x, y - 8 + sag, '#A57A55');
    px(c, x, y - 4 + Math.round(sag * 0.6), '#6B4A3A');
  }
}

/** A floating island: grass lip, hanging vines, then a dirt cone that tapers to a point. */
export function drawIsland(c: C, cx: number, top: number, halfW: number, depth: number, seed: number, warm = 0) {
  const g = greens(warm);
  const r = rng(seed);
  const m = mask();
  for (let row = 0; row < depth; row++) {
    const t = row / depth;
    const hw = row < 3 ? halfW : halfW * Math.pow(1 - t, 0.8) + 1;
    for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) m.set(x, top + row);
  }
  forMask(m, (x, y) => {
    const row = y - top;
    let col: string;
    if (row === 0) col = g[0];
    else if (row === 1) col = dither(x, y, 0.5) ? g[0] : g[1];
    else if (row === 2) col = g[1];
    else if (row < 5) col = row === 3 ? g[2] : dither(x, y, 0.5) ? g[2] : '#8B5E3C';
    else {
      col = '#8B5E3C';
      const h = hash(x >> 1, y >> 1);
      if (h > 0.84) col = '#6B4A3A';
      else if (h < 0.1) col = '#A57A55';
      if (x > cx + (m.get(x + 1, y) ? 0 : -1) && !m.get(x + 2, y)) col = '#4A3550';
      else if (!m.get(x - 2, y) && x < cx) col = '#A57A55';
    }
    px(c, x, y, col);
  });
  // vines and roots hanging below the grass lip
  for (let x = Math.round(cx - halfW) + 2; x < Math.round(cx + halfW) - 2; x += 3) {
    if (r() < 0.55) {
      const len = 3 + Math.floor(r() * 7);
      for (let k = 0; k < len; k++) if (m.get(x, top + 5 + k)) px(c, x, top + 5 + k, k === len - 1 ? g[3] : g[2]);
    }
  }
}

/** A signpost: pole, board with a coloured trim, and a hook. Text is added on top as real HTML. */
function drawPost(c: C, x: number, ground: number, accent: string) {
  rect(c, x - 1, ground - 26, 3, 27, '#6B4A3A');
  rect(c, x - 1, ground - 26, 1, 27, '#8C6448');
  rect(c, x + 1, ground - 26, 1, 27, '#3E2A22');
  rect(c, x - 14, ground - 31, 29, 11, OUT);
  rect(c, x - 13, ground - 30, 27, 9, '#8A5A3B');
  rect(c, x - 13, ground - 30, 27, 2, accent);
  rect(c, x - 13, ground - 22, 27, 1, '#6B4A3A');
  px(c, x - 12, ground - 28, '#3E2A22');
  px(c, x + 12, ground - 28, '#3E2A22');
}

function lantern(c: C, x: number, y: number, flame: string) {
  const pal: Palette = { ...LANTERN_PAL, Y: flame, y: mix(flame, '#5A3F2A', 0.35), W: '#FFFFFF' };
  sprite(c, x, y, LANTERN, pal);
}

const FLOWER_COLORS: Palette[] = [
  FLOWER_PAL,
  { ...FLOWER_PAL, w: '#9CE6BD', p: '#9CE6BD' },
  { ...FLOWER_PAL, w: '#F6B9AB', p: '#F6B9AB' },
  { ...FLOWER_PAL, w: '#D8B7FF', p: '#D8B7FF' },
];
function flower(c: C, x: number, y: number, k: number) {
  sprite(c, x, y - 4, k % 2 ? FLOWER_W : FLOWER_P, FLOWER_COLORS[k % FLOWER_COLORS.length]);
}

/* ------------------------------------------------------------------ panel A: the path out of the graveyard */

/** Where the dirt path runs, in world x: it winds in front of the stones and climbs to the bridge. */
export function pathY(wx: number): number {
  const t = clamp01((wx - 250) / 240);
  return Math.round(190 - 34 * t * t * (3 - 2 * t) + 4 * Math.sin(wx / 19) * (1 - t * 0.5));
}

/** The path overlay for one panel, drawn above the meadow. */
export function drawPath(panel: 0 | 1) {
  return (c: C) => {
    const xOff = panel * ART_W;
    const x0 = panel === 0 ? 36 : 0;
    const x1 = panel === 0 ? ART_W : 100;
    for (let x = x0; x < x1; x++) {
      const y = pathY(x + xOff);
      const edge = Math.min(x - x0, x1 - x);
      const wid = Math.min(3, 1 + Math.floor(edge / 6)) + (y < 170 ? 0 : 1);
      for (let k = -wid; k <= wid; k++) {
        const col = Math.abs(k) === wid ? (dither(x, y + k, 0.5) ? '#B9A06A' : '#C9B27A') : k === -wid + 1 ? '#E3D3A0' : '#D8C48E';
        px(c, x, y + k, col);
      }
      if (hash(x, 77) > 0.9) px(c, x, y + 1, '#A58C58');
    }
  };
}

/* ------------------------------------------------------------------ panel B: the crossroads */

export const CROSS = {
  cliffX: 96,
  bridgeEnd: 150,
  islandCx: 251,
  islandHalf: 101,
  islandTop: 150,
  /** The five signposts, left to right: Continue, Restart, Pivot, Repurpose, Archive. */
  posts: [176, 213, 251, 289, 326],
  accents: ['#9CE6BD', '#F6B9AB', '#B995FF', '#8FD3F0', '#EDB0D5'],
};

export const bridgeDeckB = (x: number) => (x < CROSS.bridgeEnd ? Math.round(154 - ((x - CROSS.cliffX) * 4) / (CROSS.bridgeEnd - CROSS.cliffX)) : 150);

const VALLEY = (x: number) => 186 + Math.round(1.6 * Math.sin((x + 384) / 14));

/** Blossom puffs, lit from the sun side: the part of the graveyard tree that reaches over into the next panel. */
function blossom(c: C, puffs: [number, number, number][]) {
  for (const [cx, cy, r] of [...puffs].sort((a, b) => a[1] - b[1]))
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > r) continue;
        const lit = -(dx * 0.55 + dy * 0.83) / r;
        let col = lit > 0.55 ? '#F3D8FF' : lit > 0.2 ? '#E2C2FB' : lit > -0.15 ? '#C9A2F0' : lit > -0.5 ? '#AE87E2' : '#9370D0';
        if (r - dist < 1.2 && lit < 0.1) col = '#7A58BC';
        else if (lit > -0.35 && hash(x >> 1, y >> 1) > 0.88) col = '#EDB0D5';
        px(c, x, y, col);
      }
}

export function drawGroundB(c: C) {
  const xOff = ART_W;
  // the end of the blossom canopy that hangs over from the graveyard
  blossom(c, [[-4, 22, 10], [8, 34, 11], [-2, 46, 9], [16, 24, 9], [10, 50, 8]]);
  rect(c, 0, 36, 22, 3, '#6B4A3A');
  rect(c, 0, 36, 22, 1, '#A57A55');
  const top = (x: number) => (x < CROSS.cliffX + 4 ? meadowTop(x + xOff) : VALLEY(x));
  for (let x = 0; x < ART_W; x++) {
    meadowColumn(c, x, top(x), greens(warmth(x + xOff)));
  }
  // the cliff the meadow ends in
  for (let x = CROSS.cliffX - 2; x < CROSS.cliffX + 5; x++)
    for (let y = meadowTop(x + xOff) + 1; y < VALLEY(x + 6); y++) {
      const h = hash(x, y >> 1);
      px(c, x, y, x > CROSS.cliffX + 2 ? '#4A3550' : h > 0.8 ? '#6B4A3A' : h < 0.15 ? '#A57A55' : '#8B5E3C');
    }
  speckle(c, xOff, 41, top, 0, ART_W, 220);
  tufts(c, xOff, 5, [6, 30, 52, 74, 130, 220, 300, 350], (x) => (x < CROSS.cliffX ? meadowTop(x + xOff) : VALLEY(x)));
  // little tombstones on the path home, the last of the graveyard
  drawBridge(c, CROSS.cliffX, CROSS.bridgeEnd + 2, bridgeDeckB);
  drawIsland(c, CROSS.islandCx, CROSS.islandTop, CROSS.islandHalf, 46, 11, 0.12);
  // the island's own props
  CROSS.posts.forEach((x, i) => drawPost(c, x, CROSS.islandTop, CROSS.accents[i]));
  // 1 · CONTINUE: vines climbing the post, flowers, a mint lantern
  {
    const x = CROSS.posts[0];
    for (let k = 0; k < 24; k++) {
      px(c, x - 3 + Math.round(2 * Math.sin(k / 2.4)), CROSS.islandTop - k, '#4C7A3A');
      if (k % 4 === 1) rect(c, x - 5 + (k % 8 === 1 ? 0 : 6), CROSS.islandTop - k, 2, 2, '#93C062');
    }
    flower(c, x - 18, CROSS.islandTop, 1);
    flower(c, x + 9, CROSS.islandTop, 0);
    lantern(c, x + 12, CROSS.islandTop - 19, '#9CE6BD');
  }
  // 2 · RESTART: a workbench, a blueprint, a golden lantern, new sprouts
  {
    const x = CROSS.posts[1];
    rect(c, x - 12, CROSS.islandTop - 10, 24, 2, '#C89A63');
    rect(c, x - 12, CROSS.islandTop - 8, 24, 1, '#6B4A3A');
    rect(c, x - 11, CROSS.islandTop - 8, 2, 8, '#8A5A3B');
    rect(c, x + 9, CROSS.islandTop - 8, 2, 8, '#8A5A3B');
    rect(c, x - 9, CROSS.islandTop - 15, 15, 5, '#2F64C4');
    rect(c, x - 8, CROSS.islandTop - 14, 13, 3, '#4A7FD8');
    for (let k = 0; k < 4; k++) px(c, x - 7 + k * 3, CROSS.islandTop - 13, '#F8F3FF');
    lantern(c, x + 7, CROSS.islandTop - 21, '#FFBE55');
    sprite(c, x - 20, CROSS.islandTop - 4, TUFTS[1], { l: '#B4E89A', g: '#93C062', G: '#5E9143' });
  }
  // 3 · PIVOT: stone steps up to a second, smaller island
  {
    const x = CROSS.posts[2];
    for (let i = 0; i < 5; i++) {
      rect(c, x + 6 + i * 6, CROSS.islandTop - 3 - i * 7, 7, 3, '#B995FF');
      rect(c, x + 6 + i * 6, CROSS.islandTop - i * 7, 7, 1, '#7A6AAE');
      px(c, x + 6 + i * 6, CROSS.islandTop - 3 - i * 7, '#D8B7FF');
    }
    drawIsland(c, x + 38, CROSS.islandTop - 50, 14, 14, 29, 0.2);
    lantern(c, x + 36, CROSS.islandTop - 62, '#B995FF');
  }
  // 4 · REPURPOSE: a cyan lantern; the fragments and the new object are animated HTML on top
  {
    const x = CROSS.posts[3];
    lantern(c, x + 12, CROSS.islandTop - 19, '#8FD3F0');
    for (let k = 0; k < 6; k++) rect(c, x - 14 + k * 5, CROSS.islandTop - 1 - (k % 2), 2, 2, '#5FA8D8');
  }
  // 5 · ARCHIVE: a wooden chest, flowers and a rose lantern
  {
    const x = CROSS.posts[4];
    rect(c, x - 9, CROSS.islandTop - 11, 18, 10, OUT);
    rect(c, x - 8, CROSS.islandTop - 10, 16, 8, '#8A5A3B');
    rect(c, x - 8, CROSS.islandTop - 10, 16, 3, '#A57A55');
    rect(c, x - 1, CROSS.islandTop - 8, 3, 4, '#FFD166');
    rect(c, x - 8, CROSS.islandTop - 6, 16, 1, '#6B4A3A');
    flower(c, x - 18, CROSS.islandTop, 3);
    flower(c, x + 14, CROSS.islandTop, 2);
    lantern(c, x + 12, CROSS.islandTop - 21, '#EDB0D5');
  }
  // the bridge carries on to the right, towards the light
  drawBridge(c, CROSS.islandCx + CROSS.islandHalf - 2, ART_W, () => 150);
}

/* ------------------------------------------------------------------ panel C: the sunrise */

export const SUNRISE = { bridgeEnd: 268, islandCx: 322, islandHalf: 62, islandTop: 152 };

const VALLEY_C = (x: number) => 188 + Math.round(1.8 * Math.sin((x + 768) / 16));

export function drawGroundC(c: C) {
  const xOff = ART_W * 2;
  for (let x = 0; x < ART_W; x++) meadowColumn(c, x, VALLEY_C(x), greens(warmth(x + xOff)));
  speckle(c, xOff, 53, VALLEY_C, 0, ART_W, 200);
  tufts(c, xOff, 9, [20, 70, 120, 170, 230], VALLEY_C);
  // the graveyard, far behind and at peace: three small stones on the valley floor
  [[36, 'a'], [52, 'b'], [66, 'c']].forEach(([x], i) => {
    const sx = x as number;
    const sy = VALLEY_C(sx) - 1;
    rect(c, sx, sy - 9, 7, 10, '#3A2F6E');
    rect(c, sx + 1, sy - 8, 5, 9, i === 1 ? '#D8CFF1' : '#C3B5E6');
    rect(c, sx + 2, sy - 10, 3, 1, '#3A2F6E');
    rect(c, sx + 3, sy - 6, 1, 3, '#7A6AAE');
  });
  drawBridge(c, 0, SUNRISE.bridgeEnd, () => 150);
  drawIsland(c, SUNRISE.islandCx, SUNRISE.islandTop, SUNRISE.islandHalf, 40, 17, 1);
  // a young blossom tree on the final island
  const tx = 356;
  rect(c, tx - 2, 118, 4, 36, '#6B4A3A');
  rect(c, tx - 2, 118, 1, 36, '#A57A55');
  rect(c, tx + 1, 118, 1, 36, '#3E2A22');
  const puffs: [number, number, number][] = [[tx - 10, 108, 8], [tx + 6, 100, 10], [tx + 20, 110, 8], [tx - 2, 116, 9], [tx + 12, 118, 8]];
  for (const [px0, cy, rr] of puffs)
    for (let y = cy - rr; y <= cy + rr; y++)
      for (let x = px0 - rr; x <= px0 + rr; x++) {
        const dx = x + 0.5 - px0;
        const dy = y + 0.5 - cy;
        const d = Math.hypot(dx, dy);
        if (d > rr) continue;
        const lit = -(dx * 0.55 + dy * 0.83) / rr;
        px(c, x, y, lit > 0.5 ? '#FFE3F2' : lit > 0.15 ? '#F5C8E8' : lit > -0.2 ? '#E6A8DC' : '#C98CCB');
      }
  sprite(c, 300, SUNRISE.islandTop - 2 - TUFTS[0].length, TUFTS[0], TUFT_PAL);
}

/* ------------------------------------------------------------------ helpers shared with the stage */

export { maskEllipse };

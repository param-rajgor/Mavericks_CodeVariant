import { memo, useMemo, type CSSProperties } from 'react';

/**
 * Pixel-art sprites, drawn from character grids and rendered as crisp SVG paths.
 * A "." (or space) is transparent; every other character looks up a colour in the sprite's palette.
 */
export type Palette = Record<string, string>;

function toPaths(rows: readonly string[], palette: Palette) {
  const byColor = new Map<string, string>();
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      const color = palette[ch];
      if (!color) {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      byColor.set(color, `${byColor.get(color) ?? ''}M${x} ${y}h${end - x}v1h-${end - x}z`);
      x = end;
    }
  });
  return [...byColor.entries()];
}

export interface SpriteData {
  rows: readonly string[];
  palette: Palette;
}

export const PixelArt = memo(function PixelArt({
  sprite,
  className,
  style,
  stretch = false,
  title,
}: {
  sprite: SpriteData;
  className?: string;
  style?: CSSProperties;
  /** Fill the box exactly instead of keeping the sprite's aspect ratio. */
  stretch?: boolean;
  title?: string;
}) {
  const w = Math.max(...sprite.rows.map((r) => r.length));
  const h = sprite.rows.length;
  const paths = useMemo(() => toPaths(sprite.rows, sprite.palette), [sprite]);
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      style={style}
      shapeRendering="crispEdges"
      preserveAspectRatio={stretch ? 'none' : 'xMidYMid meet'}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {paths.map(([color, d]) => (
        <path key={color} d={d} fill={color} />
      ))}
    </svg>
  );
});

/** Small deterministic random generator so procedural sprites never change between renders. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function grid(w: number, h: number) {
  return Array.from({ length: h }, () => Array<string>(w).fill('.'));
}
const join = (g: string[][]) => g.map((r) => r.join(''));

/* ------------------------------------------------------------------ island */

function makeIsland(seed: number, W = 40, H = 26): SpriteData {
  const rand = rng(seed);
  const g = grid(W, H);
  const mid = (W - 1) / 2;
  const topRows = 5;
  for (let y = 0; y < H; y++) {
    const t = Math.max(0, (y - topRows) / (H - topRows));
    const hw = y < topRows ? W / 2 - (y === 0 ? 2 : y === 1 ? 1 : 0) : Math.max(1.5, (W / 2 - 1) * Math.pow(1 - t, 0.85));
    for (let x = 0; x < W; x++) {
      if (Math.abs(x - mid) > hw - 0.5) continue;
      let c: string;
      if (y === 0) c = 'L';
      else if (y === 1) c = rand() < 0.2 ? 'L' : 'g';
      else if (y === 2) c = 'g';
      else if (y === 3) c = 'd';
      else if (y === 4) c = rand() < 0.5 ? 'b' : 'd';
      else {
        const r = rand();
        c = r < 0.12 ? 'B' : r < 0.22 ? 'l' : 'b';
        if (x >= mid + hw - 2) c = 'B';
        else if (x <= mid - hw + 1.5) c = 'l';
      }
      g[y][x] = c;
    }
  }
  // dirt streaks
  for (let i = 0; i < 6; i++) {
    const y = 7 + Math.floor(rand() * (H - 12));
    const x0 = Math.floor(mid - 6 + rand() * 12);
    for (let k = 0; k < 3 + Math.floor(rand() * 3); k++) if (g[y][x0 + k] === 'b') g[y][x0 + k] = 'B';
  }
  // hanging vines and moss along the grass lip
  for (let x = 0; x < W; x++) {
    if (g[4][x] !== '.' && rand() < 0.28) {
      const len = 1 + Math.floor(rand() * 4);
      for (let k = 0; k < len; k++) if (g[5 + k][x] !== '.') g[5 + k][x] = k === len - 1 ? 'd' : 'g';
    }
  }
  // flowers on the lip
  for (let i = 0; i < 4; i++) {
    const x = 3 + Math.floor(rand() * (W - 6));
    if (g[0][x] !== '.') g[0][x] = i % 2 ? 'p' : 'y';
  }
  return { rows: join(g), palette: { L: '#a6dc86', g: '#7dbd65', d: '#4f9a4d', b: '#8d5530', B: '#693a1f', l: '#a8693a', p: '#f1a0e8', y: '#ffc857' } };
}

/* ---------------------------------------------------------------- tombstone */

function makeTomb(): SpriteData {
  const W = 18;
  const H = 24;
  const g = grid(W, H);
  const widths = [8, 12, 14, 16, 16, 16];
  for (let y = 0; y < H; y++) {
    const w = y < widths.length ? widths[y] : 16;
    const x0 = Math.floor((W - w) / 2);
    for (let x = x0; x < x0 + w; x++) {
      let c = 'f';
      if (y === 0 || y === H - 1 || x === x0 || x === x0 + w - 1) c = 'o';
      else if (y === 1 || (x === x0 + 1 && y < H - 1)) c = 'h';
      else if (x >= x0 + w - 3) c = 's';
      if (y >= H - 3 && y < H - 1 && c !== 'o') c = x % 3 === 0 ? 'm' : 's';
      g[y][x] = c;
    }
  }
  // moss over the top-left shoulder
  [[2, 3], [2, 4], [3, 2], [3, 3], [4, 2], [5, 2], [6, 2]].forEach(([y, x]) => (g[y][x] = 'm'));
  [[8, 1], [9, 1], [10, 2]].forEach(([y, x]) => (g[y][x] = 'm'));
  // cracks
  [[16, 11], [17, 11], [17, 12]].forEach(([y, x]) => (g[y][x] = 's'));
  return { rows: join(g), palette: { o: '#4b3f8f', f: '#c9b6f5', h: '#e3d8fb', s: '#a38fe0', m: '#6fb25a' } };
}

/* ------------------------------------------------------------ cherry canopy */

function makeCherryTree(): SpriteData {
  const rand = rng(11);
  const W = 44;
  const H = 40;
  const g = grid(W, H);
  const blobs = [[22, 11, 17, 10], [10, 15, 10, 8], [34, 15, 10, 8], [22, 17, 19, 7]];
  for (let y = 0; y < 26; y++)
    for (let x = 0; x < W; x++) {
      const inside = blobs.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1);
      if (!inside) continue;
      const r = rand();
      g[y][x] = y < 9 ? (r < 0.15 ? 'l' : 'P') : y > 18 ? (r < 0.25 ? 'D' : 'P') : r < 0.07 ? 'l' : r < 0.14 ? 'D' : 'P';
    }
  // trunk
  for (let y = 24; y < H; y++) for (let x = 19; x < 26; x++) g[y][x] = x === 19 || x === 25 ? 'k' : x < 22 ? 'T' : 't';
  [[27, 14], [28, 13], [26, 28], [27, 29], [28, 30]].forEach(([y, x]) => g[y]?.[x] !== undefined && (g[y][x] = 'T'));
  [[30, 27], [31, 26], [29, 28]].forEach(([y, x]) => (g[y][x] = 'T'));
  return { rows: join(g), palette: { P: '#e48bd9', l: '#f8c3f0', D: '#c46bbd', T: '#7a4d34', t: '#5f3a26', k: '#3c2a52' } };
}

/* ------------------------------------------------------- small hand sprites */

export const LANTERN: SpriteData = {
  rows: ['...k...', '..kkk..', '.bbbbb.', '.bYYYb.', '.bYWYb.', '.bYWYb.', '.bYYYb.', '.bbbbb.', '..kkk..'],
  palette: { k: '#3c2a52', b: '#7a4d34', Y: '#ffb347', W: '#fff2b0' },
};

export const BRIDGE: SpriteData = {
  rows: [
    'kkkkkkkkkkkkkkkkkkkkkkkk',
    'wwwwwwwwwwwwwwwwwwwwwwww',
    'kk..k..k..k..k..k..k..kk',
    'kk..k..k..k..k..k..k..kk',
    'wwwwwwwwwwwwwwwwwwwwwwww',
    'wdwwwdwwwwdwwwdwwwwdwwwd',
    'kkkkkkkkkkkkkkkkkkkkkkkk',
  ],
  palette: { k: '#4a2f22', w: '#c89a63', d: '#9a6c3e' },
};

export const SIGNPOST: SpriteData = {
  rows: [
    'kkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kwwwwwwwwwwwwwwwwwwwwwwwwk',
    'kwhwwwwwwwwwwwwwwwwwwwwhwk',
    'kwwwwwwwwwwwwwwwwwwwwwwwwk',
    'kwwwwwwwwwwwwwwwwwwwwwwwwk',
    'kwhwwwwwwwwwwwwwwwwwwwwhwk',
    'kwwwwwwwwwwwwwwwwwwwwwwwwk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkk',
    '.........kkkkkk...........',
    '.........kddddk...........',
    '.........kddddk...........',
    '.........kddddk...........',
    '.........kddddk...........',
    '.........kddddk...........',
  ],
  palette: { k: '#3a2418', w: '#9b6a42', h: '#c89a63', d: '#6d4527' },
};

export const ROCKET: SpriteData = {
  rows: [
    '..........oooo..',
    '........oopppoo.',
    '.......opppppppo',
    '......ovvvwppppo',
    '.....ovvvwwwpppo',
    '....ovvvwkkwppo.',
    '...ovvvwwkkwpo..',
    '..ovvvvwwwwpo...',
    '.oyovvvvwwpoo...',
    'oyyyoovvvoo.....',
    'ooyyyooooo......',
    '.ooyooo.........',
    '..ooo...........',
  ],
  palette: { o: '#2c2570', p: '#a982f2', v: '#fff6e8', w: '#d9c9ff', k: '#7fd4ff', y: '#ffab4d' },
};

export const GHOST: SpriteData = {
  rows: [
    '....oooooo....',
    '..ooWWWWWWoo..',
    '.oWWWWWWWWWWo.',
    '.oWWWWWWWWWWo.',
    'oWWWkkWWkkWWWo',
    'oWWWkkWWkkWWWo',
    'oWPPWWWWWWPPWo',
    'oWPPWWkkWWPPWo',
    'oWWWWWWWWWWWWo',
    'oWWWWWWWWWWWWo',
    'oWWWWWWWWWWWWo',
    'oWWoWWWWWWoWWo',
    'ooo.oWWWWo.ooo',
    '....oo..oo....',
  ],
  palette: { o: '#8f6fe8', W: '#fff9f2', k: '#241c5a', P: '#f4a6d8' },
};

export const GHOST_SLEEPY: SpriteData = {
  rows: GHOST.rows.map((r, i) => (i === 4 ? 'oWWWkkWWkkWWWo' : i === 5 ? 'oWWWWWWWWWWWWo' : r)),
  palette: GHOST.palette,
};

export const CAT_ROCK: SpriteData = {
  rows: [
    '..oo.oo.....................',
    '.oOOooOOo...................',
    '.oOOOOOOooooooooooooo.......',
    'oOOOOOWWWWWWWWWWWWWWWoo.....',
    'oWWWWWWWWWWWOOOOWWWWWWWo....',
    'oWkkWWkkWWWWOOOOOWWWWWWWo...',
    'oWWWpWWWWWWWWOOWWWWWWWWWWo..',
    '.oWWWWWWWWWWWWWWWWWWWWWWWWo.',
    '..ooWWWWWWWWWWWWWWWWWWWWWoo.',
    '....oooooooooooooooooooooo..',
    '.rrrrrrrrrrrrrrrrrrrrrrrrrr.',
    'rrRRrrrrrrrrrrrrrrrrrrRRrrrr',
    'rrrrrrrrrrrrrrrrrrrrrrrrrrrr',
    '.rrrrrrrrrrrrrrrrrrrrrrrrrr.',
  ],
  palette: { o: '#3c2a52', W: '#fff4ea', O: '#f0a25a', k: '#3c2a52', p: '#f4a6d8', r: '#8575b8', R: '#6b5ba3' },
};

/* --------------------------------------------------------------- nav icons */

export const ICONS = {
  house: {
    rows: ['....oo....', '...oRRo...', '..oRRRRo..', '.oRRRRRRo.', 'oRRRRRRRRo', '.wwwwwwww.', '.wwwddwww.', '.wwwddwww.', '.wwwddwww.'],
    palette: { o: '#7a3a1c', R: '#ff9a62', w: '#fff1d2', d: '#7a4d34' },
  },
  tomb: {
    rows: ['..oooooo..', '.oLLLLLLo.', 'oLLLLLLLLo', 'oLLLvvLLLo', 'oLLLvvLLLo', 'oLLLLLLLLo', 'oLLLLLLLLo', 'gggggggggg'],
    palette: { o: '#5543a5', L: '#cdbbf7', v: '#5543a5', g: '#7dbd65' },
  },
  chart: {
    rows: ['......yy..', '..bb..yy..', '..bb..yy..', '..bb..yy..', 'pp.bb.yy..', 'pp.bb.yy..', 'ppbbbbyy..', 'wwwwwwwwww'],
    palette: { b: '#7fd4ff', y: '#ffc857', p: '#a982f2', w: '#fff1d2' },
  },
  sign: {
    rows: ['.....kk.....', '..yyyyyyyy..', '.yyyyyyyyyy.', '..yyyyyyyy..', '.....kk.....', '..pppppppp..', '.pppppppppp.', '..pppppppp..', '.....kk.....'],
    palette: { y: '#ffc857', p: '#ff9db5', k: '#7a4d34' },
  },
  chest: {
    rows: ['.oooooooo.', 'oPPPPPPPPo', 'oPPPyyPPPo', 'oooooyyooo', 'obbbbyybbo', 'obbbbbbbbo', 'obbbbbbbbo', 'oooooooooo'],
    palette: { o: '#5a2f1c', P: '#ff9a82', y: '#ffc857', b: '#b8743d' },
  },
  gear: {
    rows: ['...pp.pp...', '..pppppp...', '.ppp..ppp..', 'ppp.ww.ppp.', '.pp.ww.pp..', '.ppp..ppp..', '..pppppp...', '...pp.pp...'],
    palette: { p: '#a982f2', w: '#fff1d2' },
  },
  sprout: {
    rows: ['.gg....gg.', 'gggg..gggg', 'gggggggggg', '.ggggggg..', '....gg....', '....gg....', '..bbbbbb..'],
    palette: { g: '#58cf7a', b: '#7a4d34' },
  },
  folder: {
    rows: ['.ppp......', 'pppppppppp', 'pLLLLLLLLp', 'pLLLLLLLLp', 'pLLLLLLLLp', 'pppppppppp'],
    palette: { p: '#7b5bd6', L: '#b79cff' },
  },
  bulb: {
    rows: ['..yyyy..', '.yYYYYy.', 'yYWYYYYy', 'yYWYYYYy', '.yYYYYy.', '..yyyy..', '..kkkk..', '...kk...'],
    palette: { y: '#e0a21c', Y: '#ffd35a', W: '#fff6c4', k: '#7a6a8a' },
  },
  play: {
    rows: ['gg......', 'gggg....', 'gggggg..', 'gggggggg', 'gggggg..', 'gggg....', 'gg......'],
    palette: { g: '#2e3a2c' },
  },
} satisfies Record<string, SpriteData>;

export type IconName = keyof typeof ICONS;

const OUTLINE = 'drop-shadow(1px 0 0 #17183e) drop-shadow(-1px 0 0 #17183e) drop-shadow(0 1px 0 #17183e) drop-shadow(0 -1px 0 #17183e)';

/** `outline` adds a dark edge so a sprite stays readable on a light highlight. */
export function PixelIcon({ name, size = 28, className, outline = false }: { name: IconName; size?: number; className?: string; outline?: boolean }) {
  const s = ICONS[name];
  return <PixelArt sprite={s} className={className} style={{ width: size, height: (size * s.rows.length) / Math.max(...s.rows.map((r) => r.length)), filter: outline ? OUTLINE : undefined }} />;
}

/* ------------------------------------------------------ exported instances */

export const ISLANDS = [makeIsland(3), makeIsland(8), makeIsland(21), makeIsland(34), makeIsland(55)];
export const TOMB = makeTomb();
export const CHERRY = makeCherryTree();
/** The same tree in the lilac of the landing scene. */
export const CHERRY_LILAC: SpriteData = { rows: CHERRY.rows, palette: { ...CHERRY.palette, P: '#c79df0', l: '#e8cdff', D: '#a579dc' } };

export function Island({ variant = 0, className, style }: { variant?: number; className?: string; style?: CSSProperties }) {
  return <PixelArt sprite={ISLANDS[variant % ISLANDS.length]} className={className} style={style} />;
}
export const Tomb = ({ className, style }: { className?: string; style?: CSSProperties }) => <PixelArt sprite={TOMB} stretch className={className} style={style} />;
export const Lantern = ({ className, style }: { className?: string; style?: CSSProperties }) => <PixelArt sprite={LANTERN} className={className} style={style} />;
export const Bridge = ({ className, style }: { className?: string; style?: CSSProperties }) => <PixelArt sprite={BRIDGE} className={className} style={style} />;
export const Ghost = ({ className, style, sleepy }: { className?: string; style?: CSSProperties; sleepy?: boolean }) => (
  <PixelArt sprite={sleepy ? GHOST_SLEEPY : GHOST} className={className} style={style} />
);
export const Rocket = ({ className, style }: { className?: string; style?: CSSProperties }) => <PixelArt sprite={ROCKET} className={className} style={style} />;
export const Signpost = ({ className, style }: { className?: string; style?: CSSProperties }) => <PixelArt sprite={SIGNPOST} className={className} style={style} />;

/** The cherry tree with the sleeping cat, used in the sidebar corner. */
export function TreeAndCat({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <PixelArt sprite={CHERRY} style={{ position: 'absolute', left: 0, bottom: 38, width: '78%' }} />
      <PixelArt sprite={CAT_ROCK} style={{ position: 'absolute', left: '6%', bottom: 18, width: '62%' }} />
      <PixelArt sprite={LANTERN} style={{ position: 'absolute', right: 6, bottom: 62, width: '10%' }} />
    </div>
  );
}

/** A sprite drawn inside an existing <svg>, positioned and scaled in that svg's units. */
export function SpriteG({ sprite, x, y, width, opacity, flip }: { sprite: SpriteData; x: number; y: number; width: number; opacity?: number; flip?: boolean }) {
  const w = Math.max(...sprite.rows.map((r) => r.length));
  const paths = useMemo(() => toPaths(sprite.rows, sprite.palette), [sprite]);
  return (
    <g transform={flip ? `translate(${x + width} ${y}) scale(${-width / w} ${width / w})` : `translate(${x} ${y}) scale(${width / w})`} opacity={opacity} shapeRendering="crispEdges">
      {paths.map(([color, d]) => (
        <path key={color} d={d} fill={color} />
      ))}
    </g>
  );
}

import { memo, type CSSProperties } from 'react';

export type SpriteDef = { rows: string[]; palette: Record<string, string> };

/* One <path> per colour, built from horizontal runs, instead of one <rect> per pixel. Same pixels, a fraction
 * of the DOM nodes: the scroll story restyles its tree every frame, so node count is what makes it lag. */
const pathCache = new WeakMap<SpriteDef, { w: number; h: number; paths: [string, string][] }>();

function spritePaths(sprite: SpriteDef) {
  const hit = pathCache.get(sprite);
  if (hit) return hit;
  const h = sprite.rows.length;
  const w = Math.max(...sprite.rows.map((r) => r.length));
  const byColour = new Map<string, string>();
  sprite.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const fill = sprite.palette[row[x]];
      let end = x + 1;
      while (end < row.length && row[end] === row[x]) end++;
      if (fill) byColour.set(fill, `${byColour.get(fill) ?? ''}M${x} ${y}h${end - x}v1h${x - end}z`);
      x = end;
    }
  });
  const out = { w, h, paths: [...byColour.entries()] };
  pathCache.set(sprite, out);
  return out;
}

/** Renders a character-grid sprite as crisp SVG pixels. `px` = screen pixels per sprite pixel. */
export const PixelSprite = memo(function PixelSprite({ sprite, px = 2, style }: { sprite: SpriteDef; px?: number; style?: CSSProperties }) {
  const { w, h, paths } = spritePaths(sprite);
  return (
    <svg width={w * px} height={h * px} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden="true" style={{ display: 'block', ...style }}>
      {paths.map(([fill, d]) => (
        <path key={fill} d={d} fill={fill} />
      ))}
    </svg>
  );
});

/** Drawn already tilted 45° on the grid — rotating a pixel sprite with CSS would smear it. */
export const ROCKET: SpriteDef = {
  rows: [
    '................',
    '............ooo.',
    '..........oowwwo',
    '.........owwwwwo',
    '........owwoowwo',
    '.......owwollowo',
    '......owwwollowo',
    '..ooo.owwwwoowo.',
    '.oPPPowwwwwwwo..',
    '.oPPowwwwwwwo...',
    '..oowwwwwwwo....',
    '...ofowwwwoPo...',
    '..offfowwoPPo...',
    '.offFfooooPPo...',
    '..fFfo...oooo...',
    '................',
  ],
  palette: { o: '#1C1840', w: '#F8F3FF', l: '#C3B5E6', P: '#8A63E8', f: '#FFD166', F: '#FF8A3D' },
};

export const FOLDER: SpriteDef = {
  rows: [
    '............',
    '.oooo.......',
    'oPPPPo......',
    'oPPPPPoooooo',
    'oPPPPPPPPPPo',
    'oooooooooooo',
    'ollllllllllo',
    'opppppppppPo',
    'opppppppppPo',
    'opppppppppPo',
    'oPPPPPPPPPPo',
    'oooooooooooo',
  ],
  palette: { o: '#3A2F6E', P: '#8A63E8', p: '#B995FF', l: '#D8B7FF' },
};

export const SPROUT: SpriteDef = {
  rows: [
    '............',
    'oooo....oooo',
    'ollgo..ogllo',
    'olggGooGgglo',
    '.oggGooGggo.',
    '..oooGGooo..',
    '.....oGo....',
    '.....oGo....',
    '...oooooo...',
    '..obbbbbBo..',
    '...oBBBBo...',
    '....oooo....',
  ],
  palette: { o: '#1F5534', g: '#76C46A', G: '#4E9A47', l: '#B4E89A', b: '#8A5A3B', B: '#5E3A22' },
};

export const BULB: SpriteDef = {
  rows: [
    '....oooo....',
    '...oyyyyo...',
    '..oyllyyyo..',
    '..oylyyyYo..',
    '..oyyyyyYo..',
    '..oyyyyYYo..',
    '...oyyYYo...',
    '....oyYo....',
    '....oggo....',
    '....oGGo....',
    '....oggo....',
    '.....oo.....',
  ],
  palette: { o: '#5A3B0C', y: '#FFD166', Y: '#E0A63A', l: '#FFF4C8', g: '#C3B5E6', G: '#9C8CCB' },
};

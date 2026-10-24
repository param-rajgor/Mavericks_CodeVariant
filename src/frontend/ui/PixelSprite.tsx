import type { CSSProperties, ReactElement } from 'react';

export type SpriteDef = { rows: string[]; palette: Record<string, string> };

/** Renders a character-grid sprite as crisp SVG pixels. `px` = screen pixels per sprite pixel. */
export function PixelSprite({ sprite, px = 2, style }: { sprite: SpriteDef; px?: number; style?: CSSProperties }) {
  const h = sprite.rows.length;
  const w = Math.max(...sprite.rows.map((r) => r.length));
  const cells: ReactElement[] = [];
  sprite.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const fill = sprite.palette[row[x]];
      if (fill) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    }
  });
  return (
    <svg width={w * px} height={h * px} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden="true" style={{ display: 'block', ...style }}>
      {cells}
    </svg>
  );
}

/** Drawn already tilted 45° on the grid — rotating a pixel sprite with CSS would smear it. */
export const ROCKET: SpriteDef = {
  rows: [
    '..........oooo..',
    '.........olllLo.',
    '........ollLLLo.',
    '.......owwlLLo..',
    '......owwwwlo...',
    '.....owwbbwwo...',
    '..oo.owbccbwo...',
    '.oLLowwbccbo....',
    '.oLLowwwbbwo....',
    '..ooowwwwwo.....',
    '....owgwwo.oo...',
    '...ofoggo.oLLo..',
    '..ofFfoo..oLLo..',
    '.ofFrFo....oo...',
    '.fFrf...........',
    'ff..............',
  ],
  palette: {
    o: '#2E2560',
    w: '#F8F3FF',
    g: '#C3B5E6',
    l: '#D8B7FF',
    L: '#B995FF',
    b: '#57449A',
    c: '#9C8CCB',
    f: '#FFC94D',
    F: '#FF8A3D',
    r: '#E8603C',
  },
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

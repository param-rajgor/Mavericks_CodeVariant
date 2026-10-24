import { SPROUT, type SpriteDef } from '@/frontend/ui/PixelSprite';
import type { PathId } from '@/backend/domain/types';

/** Pixel icons for the Action Zones, 12×12, outlined in the stone outline colour so they read on any zone. */
const O = '#2E2560';

export const LANTERN_ICON: SpriteDef = {
  rows: [
    '....oooo....',
    '...o....o...',
    '..oooooooo..',
    '..oyYYYYyo..',
    '..oYWWWWYo..',
    '..oYWWWWYo..',
    '..oYWWWWYo..',
    '..oyYYYYyo..',
    '..oooooooo..',
    '....oyyo....',
    '.....oo.....',
    '............',
  ],
  palette: { o: O, y: '#E0A63A', Y: '#FFBE55', W: '#FFF1C2' },
};

export const RESTART_ICON: SpriteDef = {
  rows: [
    '....oooo.o..',
    '..oo....ooo.',
    '.o......oco.',
    '.o.....oooo.',
    'o...........',
    'o..........o',
    'o..........o',
    '.o........o.',
    '.o........o.',
    '..oo....oo..',
    '....oooo....',
    '............',
  ],
  palette: { o: O, c: '#F6B9AB' },
};

export const PIVOT_ICON: SpriteDef = {
  rows: [
    '........ooo.',
    '.......oLLo.',
    '......oLLo..',
    '.....oLLo...',
    '.oo.oLLo....',
    'oLLoLLo.....',
    'oLLLLo......',
    '.oLLo.......',
    '.oLLLLLLLoo.',
    '.oLLLLLLLLLo',
    '..ooooooooo.',
    '............',
  ],
  palette: { o: O, L: '#D8B7FF' },
};

export const GEARS_ICON: SpriteDef = {
  rows: [
    '..o.o.......',
    '.oBoBo......',
    'oBBBBBo.o.o.',
    '.oBooBooBoBo',
    'oBBooBBoBBBo',
    '.oBBBBooBoBo',
    '..o.o.oBBBBo',
    '.......oBoo.',
    '......oBBBBo',
    '.......oBoBo',
    '........o.o.',
    '............',
  ],
  palette: { o: O, B: '#BFE3FF' },
};

export const CHEST_ICON: SpriteDef = {
  rows: [
    '............',
    '..oooooooo..',
    '.oPPPPPPPPo.',
    'oPPPPPPPPPPo',
    'oooooyyooooo',
    'obbbbyybbbbo',
    'obbbbbbbbbbo',
    'obbbbbbbbbbo',
    'obbbbbbbbbbo',
    'oooooooooooo',
    '............',
    '............',
  ],
  palette: { o: O, P: '#EDB0D5', y: '#FFD166', b: '#B98A6A' },
};

export const PATH_ICONS: Record<PathId, SpriteDef> = {
  continue: SPROUT,
  restart: RESTART_ICON,
  pivot: PIVOT_ICON,
  repurpose: GEARS_ICON,
  archive: CHEST_ICON,
};

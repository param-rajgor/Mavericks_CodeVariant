import type { SpriteDef } from '@/frontend/ui/PixelSprite';

/** The ghost: white, a lavender outline, tiny dark eyes and a wavy hem. Eyes shift to look left or right. */
const GHOST_ROWS = [
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
];
const GHOST_PAL = { o: '#8F6FE8', W: '#FFF9F2', k: '#2E2560', P: '#F4A6D8' };
const shift = (dx: number) => GHOST_ROWS.map((r, i) => (i === 4 || i === 5 ? (dx < 0 ? 'oWWkkWWkkWWWWo' : 'oWWWWkkWWkkWWo') : r));
export const GHOST_CENTER: SpriteDef = { rows: GHOST_ROWS, palette: GHOST_PAL };
export const GHOST_LEFT: SpriteDef = { rows: shift(-1), palette: GHOST_PAL };
export const GHOST_RIGHT: SpriteDef = { rows: shift(1), palette: GHOST_PAL };

/* Floating objects: the work that still exists inside a forgotten project. */
export const OBJ_CODE: SpriteDef = {
  rows: ['..........', '.cc....cc.', 'cc..cc..cc', 'cc.cc...cc', 'cc..cc..cc', '.cc....cc.', '..........'],
  palette: { c: '#8FD3F0' },
};
export const OBJ_DESIGN: SpriteDef = {
  rows: ['oooooooooo.', 'opppppppppo', 'opWWppWWppo', 'opWppWWppWo', 'opppWWppppo', 'opppppyppoo', 'oooooooyyo.'],
  palette: { o: '#3A2F6E', p: '#F5C3E6', W: '#FFFFFF', y: '#FFD166' },
};
export const OBJ_DATA: SpriteDef = {
  rows: ['....oo....', '..ooLLoo..', 'ooLLLLLLoo', 'oLLLLLLLLo', 'oMMMoDDDDo', 'oMMMoDDDDo', 'oMMMoDDDDo', '.ooMoDDoo.', '...ooo....'],
  palette: { o: '#1F5534', L: '#C9F5C3', M: '#8FDC9E', D: '#5CB87A' },
};
export const OBJ_RESEARCH: SpriteDef = {
  rows: ['..ooooo...', '.oWWWWWo..', 'oWbbWWWWo.', 'oWWWWbbWo.', 'oWbbWWWWoo', '.oWWWWWoLo', '..ooooooLLo', '.......oLLo'],
  palette: { o: '#7A4D34', W: '#FFF1D2', b: '#B99268', L: '#FFD166' },
};
export const OBJ_DONE: SpriteDef = {
  rows: ['ooooooooo', 'oGGGGGGGo', 'oGGGGGoGo', 'oGoGGoGGo', 'oGGoooGGo', 'oGGGoGGGo', 'oGGGGGGGo', 'ooooooooo'],
  palette: { o: '#1F5534', G: '#A9E8BF' },
};
export const OBJ_TODO: SpriteDef = {
  rows: ['ooooooooooo', 'oFFFFFFFFFo', 'oWoWWWWWWWo', 'oFFFFFFFFFo', 'oWoWWWWWWWo', 'oFFFFFFFFFo', 'oWoWWWWWoFo', 'ooooooooooo'],
  palette: { o: '#7A4D34', F: '#FFF1D2', W: '#B99268' },
};

/** A small cube the fragments of an old project turn into. */
export const NEW_OBJECT: SpriteDef = {
  rows: ['....oo....', '..ooLLoo..', 'ooLLLLLLoo', 'oLLLLLLLLo', 'oMMMoDDDDo', 'oMMMoDDDDo', 'oMMMoDDDDo', '.ooMoDDoo.', '...ooo....'],
  palette: { o: '#1E4F6B', L: '#D7F3FF', M: '#8FD3F0', D: '#5FA8D8' },
};

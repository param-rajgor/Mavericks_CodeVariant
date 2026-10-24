/**
 * The script of the story. One number, `p` (0 at the first screen, 1 at the sunrise), drives everything:
 * where the ghost is, where the camera is, how far the sky has warmed and how far into each scene we are.
 * All positions are in art pixels of the 3-panel world (384 each): graveyard, crossroads, sunrise.
 */
import { LANDING_STONE_CENTERS } from '@/frontend/scene/stage';
import { CROSS, SUNRISE } from './art';

export const PANEL = 384;
export const WORLD_W = PANEL * 3;

export const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
export const ease = (t: number) => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 before `a`, 1 after `b`, eased in between. */
export const ramp = (p: number, a: number, b: number) => ease(clamp((p - a) / (b - a)));
/** A bump that is 1 at `c`, fading to 0 `w` either side. */
export const bump = (p: number, c: number, w: number) => clamp(1 - Math.abs(p - c) / w);

/** The three scenes, in scroll terms. */
export const SCENES = { graveyard: [0, 0.35], crossroads: [0.35, 0.75], sunrise: [0.75, 1] } as const;

const B = PANEL;
const C = PANEL * 2;
const [S1, S2, S3, S4] = LANDING_STONE_CENTERS;
const HOVER = 104; // the ghost floats just above the stones
const [P1, P2, P3, P4, P5] = CROSS.posts;
const DECK = CROSS.islandTop - 20;

/** Ghost keyframes: [scroll, world x, world y of its centre]. The same x twice in a row is a pause. */
const GHOST: ReadonlyArray<readonly [number, number, number]> = [
  [0, 96, 146],
  [0.05, 96, 146],
  [0.085, S1, HOVER],
  [0.125, S1, HOVER],
  [0.15, S2, HOVER],
  [0.185, S2, HOVER],
  [0.21, S3, HOVER],
  [0.245, S3, HOVER],
  [0.27, S4, HOVER],
  [0.295, S4, HOVER],
  [0.32, B + 24, 140],
  [0.35, B + 90, 144],
  [0.38, B + 128, 138],
  [0.405, B + 160, DECK - 4],
  [0.43, B + P1, DECK],
  [0.465, B + P1, DECK],
  [0.485, B + P2, DECK],
  [0.52, B + P2, DECK],
  [0.54, B + P3, DECK],
  [0.575, B + P3, DECK],
  [0.595, B + P4, DECK],
  [0.63, B + P4, DECK],
  [0.65, B + P5, DECK],
  [0.675, B + P5, DECK],
  [0.7, B + CROSS.islandCx, DECK - 8],
  [0.74, B + CROSS.islandCx, DECK - 8],
  [0.77, B + 352, 144],
  [0.82, C + 40, 144],
  [0.92, C + 190, 144],
  [0.97, C + SUNRISE.islandCx - 24, SUNRISE.islandTop - 18],
  [1, C + SUNRISE.islandCx - 24, SUNRISE.islandTop - 18],
];

export function ghostAt(p: number): { x: number; y: number } {
  const k = GHOST;
  if (p <= k[0][0]) return { x: k[0][1], y: k[0][2] };
  for (let i = 1; i < k.length; i++) {
    if (p <= k[i][0]) {
      const t = ease((p - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
      return { x: lerp(k[i - 1][1], k[i][1], t), y: lerp(k[i - 1][2], k[i][2], t) };
    }
  }
  const last = k[k.length - 1];
  return { x: last[1], y: last[2] };
}

/** Warmth of the whole world: 0 is twilight, 1 is full sunrise. */
const DAWN: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.3, 0],
  [0.62, 0.3],
  [0.76, 0.5],
  [0.92, 0.9],
  [1, 1],
];
export function dawnAt(p: number): number {
  for (let i = 1; i < DAWN.length; i++) {
    if (p <= DAWN[i][0]) return lerp(DAWN[i - 1][1], DAWN[i][1], ease((p - DAWN[i - 1][0]) / (DAWN[i][0] - DAWN[i - 1][0])));
  }
  return 1;
}

/** Things the ghost glances at, as world x. */
export const INTEREST = [S1, S2, S3, S4, B + P1, B + P2, B + P3, B + P4, B + P5, B + CROSS.islandCx, C + SUNRISE.islandCx];

/* ------------------------------------------------------------------ copy */

export interface Caption {
  id: string;
  from: number;
  to: number;
  kicker?: string;
  text: string;
  sub?: string;
  list?: string[];
}

/** Short, atmospheric lines. Fades in and out over `fade` of scroll. */
export const CAPTIONS: Caption[] = [
  { id: 'c1', from: 0.075, to: 0.16, kicker: 'The forgotten graveyard', text: 'Every unfinished project has a story.' },
  { id: 'c2', from: 0.165, to: 0.255, text: 'Some need more time. Some need a new direction. Some are ready to rest.' },
  { id: 'c3', from: 0.26, to: 0.345, text: 'Before you give up on an idea, understand what remains.' },
  { id: 'c4', from: 0.365, to: 0.415, kicker: 'The crossroads of possibilities', text: 'Five paths. None of them is failure.' },
];

export const REASONS = ['Lack of time', 'Lost interest', 'Technical difficulty', 'Unclear direction'];

export interface PathCopy {
  label: string;
  line: string;
  accent: string;
}
export const PATHS_COPY: PathCopy[] = [
  { label: 'CONTINUE', line: 'Keep building what matters.', accent: '#9CE6BD' },
  { label: 'RESTART', line: 'Start again with a clearer plan.', accent: '#F6B9AB' },
  { label: 'PIVOT', line: 'Take your idea somewhere new.', accent: '#B995FF' },
  { label: 'REPURPOSE', line: 'Give your existing work a new purpose.', accent: '#8FD3F0' },
  { label: 'ARCHIVE', line: 'Let it rest. Keep what you learned.', accent: '#EDB0D5' },
];

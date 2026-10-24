/**
 * Relaunch Score and path recommendation.
 *
 * Pure and deterministic: the same inputs and `now` always give the same output.
 * There is no ML and no network call. Every number shown in the UI comes from here.
 *
 * SCORE = weighted average of five factors, each normalised to 0-100 first.
 *
 *   Completion          30%  progress percentage, used as entered
 *   Recoverable reason  25%  how fixable the reason for stopping is (REASON_RECOVERABILITY)
 *   Reusable assets     20%  number of distinct asset categories that exist (ASSET_COUNT_SCORE)
 *   Freshness           15%  days since last worked (FRESHNESS_BANDS); floor of 20, never "worthless"
 *   Current interest    10%  (interest - 1) / 4 * 100
 *
 * MISSING DATA: a factor with no input is `null`, never silently 0. The score is then
 * renormalised over the factors we do know and labelled "provisional". If the known
 * factors carry less than MIN_KNOWN_WEIGHT of the total weight, no score is produced.
 *
 * RECOMMENDATION: each path gets a "fit" (0-100) from the normalised factors plus the
 * reason for stopping, using the formulas in `pathFits`. The highest fit wins; ties go
 * to the earlier path in PATH_IDS. The total score is deliberately NOT an input: a
 * project can be worth reviving (high score) yet best repurposed, or low-scoring yet
 * worth a pivot.
 */
import { ASSET_META, PATHS } from './paths';
import { daysSince } from './dates';
import type { AssetCategory, PathId, Project, ScoreStatus, StallReason } from './types';
import { PATH_IDS } from './types';

export type FactorKey = 'completion' | 'recoverableReason' | 'reusableAssets' | 'freshness' | 'currentInterest';

export const WEIGHTS: Record<FactorKey, number> = {
  completion: 30,
  recoverableReason: 25,
  reusableAssets: 20,
  freshness: 15,
  currentInterest: 10,
};

export const FACTOR_LABELS: Record<FactorKey, string> = {
  completion: 'Completion',
  recoverableReason: 'Recoverable reason',
  reusableAssets: 'Reusable assets',
  freshness: 'Freshness',
  currentInterest: 'Current interest',
};

export const FACTOR_KEYS = Object.keys(WEIGHTS) as FactorKey[];

/** Below this share of the total weight we say "more information needed" instead of guessing. */
export const MIN_KNOWN_WEIGHT = 60;

/** How easily each reason for stopping can be addressed. Lost interest is the hardest to recover from. */
export const REASON_RECOVERABILITY: Record<StallReason, number> = {
  'lack-of-time': 85,
  'competing-priorities': 80,
  'unclear-direction': 70,
  'missing-resources': 60,
  'technical-difficulty': 55,
  other: 50,
  'lost-interest': 30,
};

const REASON_EXPLANATION: Record<StallReason, string> = {
  'lack-of-time': 'Running out of time is usually temporary, so this is easy to recover from.',
  'competing-priorities': 'Something else came first; that can change, so this is quite recoverable.',
  'unclear-direction': 'A missing plan can be fixed with a clearer scope or a new direction.',
  'missing-resources': 'Missing resources can sometimes be found, but it may take effort.',
  'technical-difficulty': 'A hard technical problem can be solved or avoided, though it may need new ideas.',
  other: 'A reason outside the usual list. Treated as neutral.',
  'lost-interest': 'When the spark has faded, reviving the project is harder; reusing it may suit better.',
};

/** Distinct asset categories -> reuse value. */
export const ASSET_COUNT_SCORE = [0, 40, 65, 85, 100] as const;

/** [maximum days since last worked, score]. Anything older gets FRESHNESS_FLOOR. */
export const FRESHNESS_BANDS: ReadonlyArray<readonly [number, number]> = [
  [14, 100],
  [30, 85],
  [90, 65],
  [180, 45],
  [365, 30],
];
export const FRESHNESS_FLOOR = 20;

export function freshnessScore(days: number): number {
  for (const [max, score] of FRESHNESS_BANDS) if (days <= max) return score;
  return FRESHNESS_FLOOR;
}

export function assetsScore(count: number): number {
  return ASSET_COUNT_SCORE[Math.min(Math.max(count, 0), ASSET_COUNT_SCORE.length - 1)];
}

/** What the engine needs. `null` means "not provided". Project and wizard drafts both satisfy this. */
export interface AnalysisInput {
  progress: number | null;
  stallReason: StallReason | null;
  assets: readonly AssetCategory[] | null;
  lastWorkedAt: string | null;
  currentInterest: number | null;
  remainingItems?: readonly string[];
}

export interface FactorResult {
  key: FactorKey;
  label: string;
  weight: number;
  /** Normalised 0-100, or null when the input is missing. */
  value: number | null;
  /** Points added to the total (0-100 scale). Null when missing. Renormalised if the score is provisional. */
  contribution: number | null;
  explanation: string;
}

export interface Recommendation {
  path: PathId;
  fits: Record<PathId, number>;
  /** Why this path was picked, in plain words. */
  reasons: string[];
  /** Other paths that scored close enough to be worth considering. */
  alternatives: PathId[];
  /** Words that remind the user this is advice, not a verdict. */
  caveat: string;
}

export interface Analysis {
  status: ScoreStatus;
  total: number | null;
  factors: FactorResult[];
  missing: FactorKey[];
  recommendation: Recommendation | null;
  nextSteps: string[];
  warnings: string[];
}

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export function projectToInput(p: Project): AnalysisInput {
  return {
    progress: p.progress,
    stallReason: p.stallReason,
    assets: p.assets,
    lastWorkedAt: p.lastWorkedAt,
    currentInterest: p.currentInterest,
    remainingItems: p.remainingItems,
  };
}

function normalise(input: AnalysisInput, now: Date): Record<FactorKey, { value: number | null; explanation: string }> {
  const out = {} as Record<FactorKey, { value: number | null; explanation: string }>;

  // Completion
  if (input.progress == null || Number.isNaN(input.progress)) {
    out.completion = { value: null, explanation: 'Progress has not been entered yet.' };
  } else {
    const p = clamp(input.progress);
    const tone =
      p >= 60
        ? 'Substantial work already exists.'
        : p >= 30
          ? 'A meaningful foundation is in place.'
          : 'Early days. There is less to carry forward, which is not a bad thing.';
    out.completion = { value: p, explanation: `${Math.round(p)}% complete. ${tone}` };
  }

  // Recoverable reason
  if (!input.stallReason) {
    out.recoverableReason = { value: null, explanation: 'The reason it stopped has not been recorded.' };
  } else {
    out.recoverableReason = {
      value: REASON_RECOVERABILITY[input.stallReason],
      explanation: REASON_EXPLANATION[input.stallReason],
    };
  }

  // Reusable assets
  if (input.assets == null) {
    out.reusableAssets = { value: null, explanation: 'Existing assets have not been listed yet.' };
  } else {
    const n = new Set(input.assets).size;
    out.reusableAssets = {
      value: assetsScore(n),
      explanation:
        n === 0
          ? 'No reusable assets recorded.'
          : `${n} kind${n === 1 ? '' : 's'} of reusable work: ${[...new Set(input.assets)].map((a) => ASSET_META[a].label.toLowerCase()).join(', ')}.`,
    };
  }

  // Freshness
  if (!input.lastWorkedAt) {
    out.freshness = { value: null, explanation: 'No last-worked date, so freshness is unknown.' };
  } else {
    const d = daysSince(input.lastWorkedAt, now);
    const v = freshnessScore(d);
    out.freshness = {
      value: v,
      explanation:
        d <= 14
          ? 'Worked on within the last two weeks, so context is still fresh.'
          : d <= 90
            ? `Last worked ${d} days ago. Easy to remember where you were.`
            : 'It has been a while, but an old project is never automatically worthless.',
    };
  }

  // Current interest
  if (input.currentInterest == null) {
    out.currentInterest = { value: null, explanation: 'Current interest has not been rated yet.' };
  } else {
    const i = clamp(input.currentInterest, 1, 5);
    out.currentInterest = {
      value: ((i - 1) / 4) * 100,
      explanation:
        i >= 4
          ? 'You are still drawn to this, which counts for a lot.'
          : i === 3
            ? 'Some interest remains.'
            : 'Interest is low. That points towards reusing or closing it, not shame.',
    };
  }
  return out;
}

/** Fit of each path, 0-100. See file header for the intent behind each formula. */
export function pathFits(f: { C: number; R: number; A: number; F: number; I: number }, directionIssue: boolean): Record<PathId, number> {
  const { C, R, A, F, I } = f;
  return {
    continue: 0.35 * C + 0.35 * I + 0.2 * R + 0.1 * F,
    restart: 0.4 * I + 0.3 * R + 0.3 * (100 - C),
    pivot: 0.4 * I + 0.3 * (directionIssue ? 100 : 30) + 0.15 * A + 0.15 * Math.min(100, (C / 60) * 100),
    repurpose: 0.5 * A + 0.3 * (100 - I) + 0.2 * (100 - R),
    archive: 0.6 * (100 - I) + 0.25 * (100 - A) + 0.15 * (100 - R),
  };
}

export function stepsForPath(input: AnalysisInput, path: PathId): string[] {
  const defaults = PATHS[path].defaultSteps;
  const remaining = (input.remainingItems ?? []).filter(Boolean);
  let steps: string[] = [];
  if (path === 'continue' || path === 'restart') {
    steps = remaining.slice(0, path === 'continue' ? 2 : 1);
  } else if (path === 'repurpose') {
    steps = [...new Set(input.assets ?? [])].map((a) => ASSET_META[a].reuseStep).slice(0, 2);
  }
  for (const d of defaults) {
    if (steps.length >= 3) break;
    if (!steps.includes(d)) steps.push(d);
  }
  return steps.slice(0, 3);
}

function recommend(
  input: AnalysisInput,
  v: Record<FactorKey, number | null>,
): Recommendation {
  // Unknown factors take a neutral 50 for the recommendation only, and the reasons say so.
  const assumed: string[] = [];
  const pick = (k: FactorKey, label: string) => {
    if (v[k] == null) assumed.push(label);
    return v[k] ?? 50;
  };
  const C = pick('completion', 'progress');
  const R = pick('recoverableReason', 'the reason it stopped');
  const A = pick('reusableAssets', 'reusable assets');
  const F = pick('freshness', 'last-worked date');
  const I = pick('currentInterest', 'current interest');
  const directionIssue = input.stallReason === 'unclear-direction' || input.stallReason === 'lost-interest';

  const fits = pathFits({ C, R, A, F, I }, directionIssue);
  (Object.keys(fits) as PathId[]).forEach((k) => (fits[k] = round1(clamp(fits[k]))));
  const ranked = [...PATH_IDS].sort((a, b) => fits[b] - fits[a] || PATH_IDS.indexOf(a) - PATH_IDS.indexOf(b));
  const path = ranked[0];
  const alternatives = ranked.slice(1).filter((p) => fits[path] - fits[p] <= 12).slice(0, 2);

  const reasons: string[] = [];
  const interestHigh = I >= 75;
  const interestLow = I <= 25;
  switch (path) {
    case 'continue':
      reasons.push(`You have ${Math.round(C)}% of it built and ${interestHigh ? 'your interest is high' : 'some interest remains'}.`);
      if (R >= 70) reasons.push('What stopped you looks recoverable.');
      break;
    case 'restart':
      reasons.push(C < 40 ? 'There is not much built yet, so a smaller fresh start costs little.' : 'A smaller scope could get you moving again.');
      if (I >= 50) reasons.push('You are still interested in the idea.');
      if (R >= 60) reasons.push('The reason it stopped can be addressed with a clearer plan.');
      break;
    case 'pivot':
      reasons.push(directionIssue ? 'The direction, not the idea, seems to be what stalled.' : 'The core looks worth keeping even if the approach changes.');
      if (I >= 50) reasons.push('Interest is still there to carry a new direction.');
      if (A >= 65) reasons.push('Existing assets can carry over.');
      break;
    case 'repurpose':
      reasons.push('The work you have is worth more than the project it was built for.');
      if (!interestHigh) reasons.push('Interest in finishing it as planned is modest.');
      if (A >= 65) reasons.push('You have several kinds of reusable assets.');
      break;
    case 'archive':
      reasons.push(interestLow ? 'Interest is low, and that is a perfectly good reason to stop.' : 'Little pulls you back to this one.');
      if (A < 65) reasons.push('There is not much reusable work to rescue.');
      reasons.push('Closing it with a note frees your attention for something else.');
      break;
  }
  if (assumed.length) reasons.push(`We assumed a neutral value for ${assumed.join(', ')}. Adding it may change this suggestion.`);

  return {
    path,
    fits,
    reasons,
    alternatives,
    caveat: 'This is a suggestion based on what you entered, not a verdict. You always choose.',
  };
}

export function analyzeProject(input: AnalysisInput, now: Date = new Date()): Analysis {
  const norm = normalise(input, now);
  const missing = FACTOR_KEYS.filter((k) => norm[k].value == null);
  const knownWeight = FACTOR_KEYS.filter((k) => norm[k].value != null).reduce((s, k) => s + WEIGHTS[k], 0);

  const enough = knownWeight >= MIN_KNOWN_WEIGHT;
  const status: ScoreStatus = missing.length === 0 ? 'complete' : enough ? 'provisional' : 'insufficient';

  const factors: FactorResult[] = FACTOR_KEYS.map((key) => {
    const { value, explanation } = norm[key];
    const contribution = value == null || !enough ? null : round1((value * WEIGHTS[key]) / knownWeight);
    return { key, label: FACTOR_LABELS[key], weight: WEIGHTS[key], value: value == null ? null : round1(value), contribution, explanation };
  });

  const total = enough ? Math.round(clamp(FACTOR_KEYS.reduce((s, k) => s + ((norm[k].value ?? 0) * WEIGHTS[k]), 0) / knownWeight)) : null;

  const warnings: string[] = [];
  if (status === 'provisional') {
    warnings.push(`Provisional: missing ${missing.map((k) => FACTOR_LABELS[k].toLowerCase()).join(', ')}. The score uses the ${knownWeight}% of weight we do know.`);
  }
  if (status === 'insufficient') {
    warnings.push('We need a little more information before suggesting a score. Add progress and why it stopped to begin.');
  }

  if (!enough) return { status, total: null, factors, missing, recommendation: null, nextSteps: [], warnings };

  const values = Object.fromEntries(FACTOR_KEYS.map((k) => [k, norm[k].value])) as Record<FactorKey, number | null>;
  const recommendation = recommend(input, values);
  return { status, total, factors, missing, recommendation, nextSteps: stepsForPath(input, recommendation.path), warnings };
}

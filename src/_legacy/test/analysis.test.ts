import { describe, expect, it } from 'vitest';
import {
  analyzeProject,
  assetsScore,
  FACTOR_KEYS,
  freshnessScore,
  MIN_KNOWN_WEIGHT,
  REASON_RECOVERABILITY,
  WEIGHTS,
  type AnalysisInput,
} from '../domain/analysis';
import { daysAgoStr } from '../domain/dates';
import { STALL_REASONS } from '../domain/types';

const NOW = new Date('2026-06-15T12:00:00');
const full = (over: Partial<AnalysisInput> = {}): AnalysisInput => ({
  progress: 60,
  stallReason: 'lack-of-time',
  assets: ['code', 'documentation'],
  lastWorkedAt: daysAgoStr(10, NOW),
  currentInterest: 4,
  remainingItems: ['Ship the thing'],
  ...over,
});

describe('weights', () => {
  it('match the presentation and sum to 100', () => {
    expect(WEIGHTS).toEqual({ completion: 30, recoverableReason: 25, reusableAssets: 20, freshness: 15, currentInterest: 10 });
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });
});

describe('factor normalisation', () => {
  it('maps freshness bands and never reaches zero', () => {
    expect(freshnessScore(0)).toBe(100);
    expect(freshnessScore(14)).toBe(100);
    expect(freshnessScore(15)).toBe(85);
    expect(freshnessScore(90)).toBe(65);
    expect(freshnessScore(365)).toBe(30);
    expect(freshnessScore(5000)).toBe(20);
  });
  it('maps asset counts with a cap', () => {
    expect([0, 1, 2, 3, 4, 6].map(assetsScore)).toEqual([0, 40, 65, 85, 100, 100]);
  });
  it('rates every reason between 0 and 100 with lost interest lowest', () => {
    for (const r of STALL_REASONS) expect(REASON_RECOVERABILITY[r]).toBeGreaterThanOrEqual(0);
    expect(Math.min(...Object.values(REASON_RECOVERABILITY))).toBe(REASON_RECOVERABILITY['lost-interest']);
  });
});

describe('score total', () => {
  it('matches a hand calculation', () => {
    // C60*.30=18, R85*.25=21.25, A65*.20=13, F100*.15=15, I75*.10=7.5 => 74.75 => 75
    const a = analyzeProject(full(), NOW);
    expect(a.status).toBe('complete');
    expect(a.total).toBe(75);
  });
  it('factor contributions add up to the total', () => {
    const a = analyzeProject(full(), NOW);
    const sum = a.factors.reduce((s, f) => s + (f.contribution ?? 0), 0);
    expect(Math.abs(sum - 74.75)).toBeLessThan(0.3);
    expect(a.factors.map((f) => f.key)).toEqual(FACTOR_KEYS);
    a.factors.forEach((f) => expect(f.contribution).toBeCloseTo((f.value! * f.weight) / 100, 0));
  });
  it('stays within 0-100 at the extremes', () => {
    const lo = analyzeProject({ progress: 0, stallReason: 'lost-interest', assets: [], lastWorkedAt: daysAgoStr(4000, NOW), currentInterest: 1 }, NOW);
    const hi = analyzeProject({ progress: 100, stallReason: 'lack-of-time', assets: ['code', 'design', 'data', 'research'], lastWorkedAt: daysAgoStr(0, NOW), currentInterest: 5 }, NOW);
    expect(lo.total).toBeGreaterThanOrEqual(0);
    expect(hi.total).toBeLessThanOrEqual(100);
    expect(hi.total!).toBeGreaterThan(lo.total!);
  });
  it('clamps out-of-range inputs', () => {
    const a = analyzeProject(full({ progress: 250, currentInterest: 99 }), NOW);
    expect(a.total).toBeLessThanOrEqual(100);
    expect(a.factors[0].value).toBe(100);
    expect(a.factors[4].value).toBe(100);
  });
  it('is deterministic', () => {
    expect(analyzeProject(full(), NOW)).toEqual(analyzeProject(full(), NOW));
  });
});

describe('missing data', () => {
  it('does not treat missing factors as zero: provisional score renormalises', () => {
    const a = analyzeProject(full({ currentInterest: null, lastWorkedAt: null }), NOW);
    expect(a.status).toBe('provisional');
    expect(a.missing).toEqual(['freshness', 'currentInterest']);
    // (18 + 21.25 + 13) / 75 * 100 = 69.67
    expect(a.total).toBe(70);
    expect(a.warnings[0]).toMatch(/provisional/i);
    expect(a.factors.find((f) => f.key === 'freshness')!.value).toBeNull();
  });
  it('declines to score with too little information', () => {
    const a = analyzeProject({ progress: 50, stallReason: null, assets: null, lastWorkedAt: null, currentInterest: null }, NOW);
    expect(a.status).toBe('insufficient');
    expect(a.total).toBeNull();
    expect(a.recommendation).toBeNull();
    expect(a.nextSteps).toEqual([]);
    expect(MIN_KNOWN_WEIGHT).toBeGreaterThan(WEIGHTS.completion);
  });
  it('treats an explicit empty asset list as known (nothing reusable), unlike null', () => {
    expect(analyzeProject(full({ assets: [] }), NOW).missing).toEqual([]);
    expect(analyzeProject(full({ assets: null }), NOW).missing).toEqual(['reusableAssets']);
  });
});

describe('recommendation', () => {
  it('recommends Continue for strong progress and high interest', () => {
    expect(analyzeProject(full({ progress: 80, currentInterest: 5 }), NOW).recommendation!.path).toBe('continue');
  });
  it('recommends Restart for a little progress, a recoverable reason and interest', () => {
    const a = analyzeProject(full({ progress: 10, currentInterest: 4, assets: ['design'] }), NOW);
    expect(a.recommendation!.path).toBe('restart');
  });
  it('recommends Pivot when direction is the issue and the core is worth keeping', () => {
    const a = analyzeProject(full({ progress: 40, stallReason: 'unclear-direction', currentInterest: 3, assets: ['code', 'design', 'data'], lastWorkedAt: daysAgoStr(7, NOW) }), NOW);
    expect(a.recommendation!.path).toBe('pivot');
  });
  it('recommends Repurpose for low interest but rich assets, not Archive', () => {
    const a = analyzeProject(full({ currentInterest: 1, stallReason: 'lost-interest', assets: ['code', 'design', 'data', 'research'], progress: 50 }), NOW);
    expect(a.recommendation!.path).toBe('repurpose');
  });
  it('recommends Archive for low interest and little to reuse', () => {
    const a = analyzeProject(full({ currentInterest: 1, stallReason: 'lost-interest', assets: [], progress: 20 }), NOW);
    expect(a.recommendation!.path).toBe('archive');
  });
  it('does not depend on the total score alone', () => {
    // Same-ish totals, different paths.
    const a = analyzeProject(full({ progress: 90, currentInterest: 5 }), NOW);
    const b = analyzeProject(full({ progress: 90, currentInterest: 1, assets: ['code', 'design', 'data'], stallReason: 'lost-interest' }), NOW);
    expect(a.recommendation!.path).not.toBe(b.recommendation!.path);
  });
  it('always offers three next steps and explains itself', () => {
    const a = analyzeProject(full(), NOW);
    expect(a.nextSteps).toHaveLength(3);
    expect(a.recommendation!.reasons.length).toBeGreaterThan(0);
    expect(a.recommendation!.caveat).toMatch(/suggestion/i);
  });
  it('uses the project\'s own remaining items first when continuing', () => {
    const a = analyzeProject(full({ progress: 80, currentInterest: 5, remainingItems: ['Write the tests'] }), NOW);
    expect(a.nextSteps[0]).toBe('Write the tests');
  });
  it('says when it assumed a neutral value', () => {
    const a = analyzeProject(full({ currentInterest: null }), NOW);
    expect(a.recommendation!.reasons.join(' ')).toMatch(/assumed a neutral value/);
  });
});

import { describe, expect, it } from 'vitest';
import { archiveProject, choosePath, createProject, editProject, restoreProject, updateProgress } from '../domain/ops';
import { emptyDraft, hasErrors, projectToDraft, validateAll, validateStep, type ProjectDraft } from '../domain/draft';
import { DEFAULT_QUERY, queryProjects, statusCounts } from '../domain/query';
import { dedupeSamples, demoProjects } from '../domain/seed';
import { buildBackup, parseBackup } from '../domain/backup';
import { byNewest } from '../domain/timeline';
import { daysAgoStr } from '../domain/dates';

const NOW = new Date('2026-06-15T12:00:00');
const later = (mins: number) => new Date(NOW.getTime() + mins * 60_000);

const draft = (over: Partial<ProjectDraft> = {}): ProjectDraft => ({
  ...emptyDraft(NOW),
  name: 'Test Project',
  description: 'A thing I started',
  domain: 'Software',
  tags: ['a', 'b'],
  startedAt: daysAgoStr(100, NOW),
  progress: 40,
  completedText: 'one\n two \n',
  remainingText: 'three',
  assets: ['code'],
  stallReason: 'lack-of-time',
  lastWorkedAt: daysAgoStr(30, NOW),
  currentInterest: 4,
  ...over,
});

describe('validation', () => {
  it('flags missing required fields per step', () => {
    expect(validateStep('idea', emptyDraft(NOW), NOW)).toMatchObject({ name: expect.any(String), description: expect.any(String), domain: expect.any(String) });
    expect(validateStep('progress', emptyDraft(NOW), NOW).progress).toBeDefined();
    expect(validateStep('stopped', emptyDraft(NOW), NOW).stallReason).toBeDefined();
    expect(validateStep('interest', emptyDraft(NOW), NOW).currentInterest).toBeDefined();
  });
  it('rejects future and inconsistent dates and out-of-range progress', () => {
    expect(validateStep('idea', draft({ startedAt: '2099-01-01' }), NOW).startedAt).toBeDefined();
    expect(validateStep('stopped', draft({ lastWorkedAt: daysAgoStr(200, NOW) }), NOW).lastWorkedAt).toMatch(/before the start/);
    expect(validateStep('progress', draft({ progress: 101 }), NOW).progress).toBeDefined();
  });
  it('accepts a complete draft', () => {
    expect(validateAll(draft(), NOW)).toBeNull();
    expect(hasErrors(validateStep('idea', draft(), NOW))).toBe(false);
  });
});

describe('create / edit', () => {
  it('creates a scored project with timeline events', () => {
    const p = createProject(draft(), NOW);
    expect(p.score).not.toBeNull();
    expect(p.recommendedPath).not.toBeNull();
    expect(p.completedItems).toEqual(['one', 'two']);
    expect(p.timeline.map((e) => e.type)).toEqual(['created', 'score-recalculated', 'recommendation-generated']);
    expect(new Set(p.timeline.map((e) => e.id)).size).toBe(p.timeline.length);
  });
  it('recalculates and logs when relevant fields change', () => {
    const p = createProject(draft(), NOW);
    const q = updateProgress(p, 90, daysAgoStr(0, NOW), later(5));
    expect(q.progress).toBe(90);
    expect(q.score).toBeGreaterThan(p.score!);
    const types = q.timeline.slice(p.timeline.length).map((e) => e.type);
    expect(types).toContain('progress-updated');
    expect(types).toContain('score-recalculated');
    expect(q.timeline.slice(0, p.timeline.length)).toEqual(p.timeline); // history is preserved
  });
  it('logs asset and detail edits separately and skips no-op edits', () => {
    const p = createProject(draft(), NOW);
    const noop = editProject(p, { name: p.name }, later(1));
    expect(noop.timeline).toHaveLength(p.timeline.length);
    const q = editProject(p, { assets: ['code', 'design'], description: 'Changed' }, later(2));
    const types = q.timeline.slice(p.timeline.length).map((e) => e.type);
    expect(types).toEqual(expect.arrayContaining(['assets-changed', 'edited']));
  });
  it('round-trips through a draft', () => {
    const p = createProject(draft(), NOW);
    expect(projectToDraft(p)).toMatchObject({ name: 'Test Project', completedText: 'one\ntwo', progress: 40 });
  });
});

describe('paths, archive, restore', () => {
  it('records a chosen path, activates the project, and allows changing it', () => {
    const p = createProject(draft({ status: 'stalled' }), NOW);
    const a = choosePath(p, 'restart', later(1));
    expect(a.selectedPath).toBe('restart');
    expect(a.status).toBe('active');
    expect(a.timeline.map((e) => e.type)).toEqual(expect.arrayContaining(['path-selected', 'restarted', 'status-changed']));
    const b = choosePath(a, 'pivot', later(2));
    expect(b.selectedPath).toBe('pivot');
    expect(b.timeline.at(-1)!.description).toMatch(/from Restart to Pivot/);
  });
  it('repurpose does not silently change status', () => {
    const p = createProject(draft({ status: 'stalled' }), NOW);
    expect(choosePath(p, 'repurpose', later(1)).status).toBe('stalled');
  });
  it('archives with a note, preserving assets and history, then restores', () => {
    const p = createProject(draft({ status: 'needs-direction' }), NOW);
    const arch = archiveProject(p, '  Learned a lot  ', later(1));
    expect(arch.status).toBe('archived');
    expect(arch.archiveNote).toBe('Learned a lot');
    expect(arch.assets).toEqual(p.assets);
    expect(arch.previousStatus).toBe('needs-direction');
    expect(arch.timeline.slice(0, p.timeline.length)).toEqual(p.timeline);
    expect(arch.timeline.map((e) => e.type)).toEqual(expect.arrayContaining(['archived', 'archive-note-added']));
    const back = restoreProject(arch, 'active', later(2));
    expect(back.status).toBe('active');
    expect(back.selectedPath).toBeNull();
    expect(back.archiveNote).toBe('Learned a lot'); // kept for reference
    expect(back.timeline.length).toBeGreaterThan(arch.timeline.length);
    expect(back.timeline.some((e) => e.type === 'restored')).toBe(true);
  });
  it('archive without a note does not add a note event', () => {
    const arch = archiveProject(createProject(draft(), NOW), '', later(1));
    expect(arch.timeline.some((e) => e.type === 'archive-note-added')).toBe(false);
  });
});

describe('portfolio query', () => {
  const demos = demoProjects(NOW);
  it('hides archived projects from the default view and shows them under Archived', () => {
    expect(queryProjects(demos, DEFAULT_QUERY, NOW).map((p) => p.name)).not.toContain('Portfolio v1');
    expect(queryProjects(demos, { ...DEFAULT_QUERY, status: 'archived' }, NOW).map((p) => p.name).sort()).toEqual(['Old Blog', 'Poetry Bot', 'Portfolio v1']);
  });
  it('searches name, description and tags', () => {
    expect(queryProjects(demos, { ...DEFAULT_QUERY, search: 'marketplace' }, NOW).map((p) => p.name)).toEqual(['CampusKart']);
    expect(queryProjects(demos, { ...DEFAULT_QUERY, search: 'analytics' }, NOW).map((p) => p.name)).toContain('SocialPulse');
    expect(queryProjects(demos, { ...DEFAULT_QUERY, search: 'python' }, NOW).map((p) => p.name)).toContain('ML Classifier');
    expect(queryProjects(demos, { ...DEFAULT_QUERY, search: 'zzz' }, NOW)).toHaveLength(0);
  });
  it('filters by status, domain and tag', () => {
    expect(queryProjects(demos, { ...DEFAULT_QUERY, status: 'stalled' }, NOW).map((p) => p.name).sort()).toEqual(['Budget Buddy', 'Pixel Planner', 'Recipe Remix', 'SocialPulse']);
    expect(queryProjects(demos, { ...DEFAULT_QUERY, domain: 'Business' }, NOW).map((p) => p.name)).toEqual(['CampusKart']);
    expect(queryProjects(demos, { ...DEFAULT_QUERY, tag: 'web' }, NOW).map((p) => p.name).sort()).toEqual(['CampusKart', 'SocialPulse']);
  });
  it('sorts by score, last worked and progress', () => {
    const scores = queryProjects(demos, { ...DEFAULT_QUERY, sort: 'score' }, NOW).map((p) => p.score!);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(queryProjects(demos, { ...DEFAULT_QUERY, sort: 'last-worked' }, NOW)[0].name).toBe('Habit Garden');
    expect(queryProjects(demos, { ...DEFAULT_QUERY, sort: 'progress' }, NOW)[0].name).toBe('Habit Garden');
  });
  it('counts statuses', () => {
    expect(statusCounts(demos)).toEqual({ all: 9, active: 3, stalled: 4, 'needs-direction': 2, archived: 3 });
  });
});

describe('sample projects', () => {
  const demos = demoProjects(NOW);
  it('include the four tombstones shown in the landing artwork', () => {
    const by = Object.fromEntries(demos.map((p) => [p.name, p]));
    expect(by['SocialPulse']).toMatchObject({ status: 'stalled', progress: 40 });
    expect(by['CampusKart']).toMatchObject({ status: 'active', progress: 40 });
    expect(by['ML Classifier']).toMatchObject({ status: 'needs-direction', progress: 25 });
    expect(by['Portfolio v1']).toMatchObject({ status: 'archived' });
    expect(by['Portfolio v1'].archiveNote.length).toBeGreaterThan(20);
  });
  it('are flagged as demo, including their timeline events', () => {
    for (const p of demos) {
      expect(p.isDemo).toBe(true);
      p.timeline.forEach((e) => expect(e.demo).toBe(true));
    }
  });
  it('cover a spread of recommendations so the demo shows different paths', () => {
    const by = Object.fromEntries(demos.map((p) => [p.name, p.recommendedPath]));
    expect(by['SocialPulse']).toBe('restart');
    expect(by['CampusKart']).toBe('pivot');
    expect(by['ML Classifier']).toBe('restart');
    expect(by['Habit Garden']).toBe('continue');
    expect(by['Recipe Remix']).toBe('repurpose');
    expect(by['Portfolio v1']).toBe('archive');
  });
  it('sorts newest first', () => {
    const t = [...demos[0].timeline].sort(byNewest);
    expect(t[0].at >= t.at(-1)!.at).toBe(true);
  });
});

describe('sample duplication', () => {
  it('uses stable ids, so seeding twice cannot duplicate', () => {
    expect(demoProjects(NOW).map((p) => p.id)).toEqual(demoProjects(NOW).map((p) => p.id));
    expect(new Set(demoProjects(NOW).map((p) => p.id)).size).toBe(12);
  });
  it('repairs existing duplicates and leaves user projects alone', () => {
    const mine = createProject(draft(), NOW);
    const dupes = [...demoProjects(NOW), ...demoProjects(NOW).map((p) => ({ ...p, id: p.id + '-copy' })), mine];
    const { keep, drop } = dedupeSamples(dupes);
    expect(keep).toHaveLength(13);
    expect(drop).toHaveLength(12);
    expect(keep).toContain(mine);
  });
});

describe('backup', () => {
  it('exports score inputs, path, timeline and archive notes, and re-imports cleanly', () => {
    const demos = demoProjects(NOW);
    const backup = buildBackup(demos, NOW);
    const portfolio = backup.projects.find((p) => p.name === 'Portfolio v1')!;
    expect(portfolio.archiveNote).toBeTruthy();
    expect(portfolio.timeline.length).toBeGreaterThan(0);
    expect(portfolio.analysis.factors).toHaveLength(5);
    const parsed = parseBackup(JSON.stringify(backup), NOW);
    expect(parsed.ok && parsed.projects.length).toBe(12);
  });
  it('rejects garbage without throwing', () => {
    expect(parseBackup('not json').ok).toBe(false);
    expect(parseBackup('{"app":"other","projects":[]}').ok).toBe(false);
    expect(parseBackup('{"app":"relaunch","schemaVersion":99,"projects":[]}').ok).toBe(false);
  });
  it('skips malformed projects and repairs bad field values', () => {
    const r = parseBackup(JSON.stringify({ app: 'relaunch', projects: [{ name: '' }, { name: 'Ok', status: 'bogus', progress: 500, assets: ['code', 'nope'] }] }), NOW);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.skipped).toBe(1);
      expect(r.projects[0]).toMatchObject({ status: 'stalled', progress: 100, assets: ['code'] });
    }
  });
});

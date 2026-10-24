import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { clearProjects, deleteProject, getAllProjects, getMeta, putProject, putProjects, resetDbConnection, setMeta } from '../storage/db';
import { demoProjects } from '../domain/seed';

beforeEach(() => {
  // A fresh database per test.
  (globalThis as unknown as { indexedDB: IDBFactory }).indexedDB = new IDBFactory();
  resetDbConnection();
});

describe('IndexedDB persistence', () => {
  it('starts empty', async () => {
    expect(await getAllProjects()).toEqual([]);
  });
  it('stores, updates and returns whole projects including timeline', async () => {
    const [p] = demoProjects();
    await putProject(p);
    await putProject({ ...p, progress: 99 });
    const all = await getAllProjects();
    expect(all).toHaveLength(1);
    expect(all[0].progress).toBe(99);
    expect(all[0].timeline).toEqual(p.timeline);
  });
  it('writes many at once, deletes one, and clears all', async () => {
    const ps = demoProjects();
    await putProjects(ps);
    expect(await getAllProjects()).toHaveLength(4);
    await deleteProject(ps[0].id);
    expect(await getAllProjects()).toHaveLength(3);
    await clearProjects();
    expect(await getAllProjects()).toEqual([]);
  });
  it('keeps metadata separately', async () => {
    expect(await getMeta('seeded')).toBeUndefined();
    await setMeta('seeded', true);
    expect(await getMeta('seeded')).toBe(true);
  });
});

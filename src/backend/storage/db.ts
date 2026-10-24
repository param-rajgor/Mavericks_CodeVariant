/**
 * Versioned IndexedDB persistence. Everything stays in this browser.
 *
 * Schema history:
 *   v1  stores: projects (keyPath id), meta (keyPath key)
 * Add new `case` branches to `upgrade` for later versions; never edit old ones.
 */
import type { Project } from '@/backend/domain/types';

export const DB_NAME = 'relaunch';
export const DB_VERSION = 1;

export class StorageError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}

function upgrade(db: IDBDatabase, oldVersion: number) {
  switch (oldVersion) {
    case 0:
      db.createObjectStore('projects', { keyPath: 'id' });
      db.createObjectStore('meta', { keyPath: 'key' });
    // falls through: later versions add their own migrations below
  }
}

let opening: Promise<IDBDatabase> | null = null;

export function openDb(): Promise<IDBDatabase> {
  if (opening) return opening;
  opening = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new StorageError('This browser does not allow local storage here (IndexedDB is unavailable).'));
      return;
    }
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      reject(new StorageError('Local storage is blocked in this browser window.', e));
      return;
    }
    req.onupgradeneeded = (ev) => upgrade(req.result, ev.oldVersion);
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => {
        db.close();
        opening = null;
      };
      resolve(db);
    };
    req.onerror = () => reject(new StorageError('Could not open local storage.', req.error));
    req.onblocked = () => reject(new StorageError('Local storage is busy. Close other Relaunch tabs and retry.'));
  }).catch((e) => {
    opening = null;
    throw e;
  });
  return opening;
}

/** Test hook: forget the cached connection. */
export function resetDbConnection() {
  opening = null;
}

function run<T>(store: 'projects' | 'meta', mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        let result: T | undefined;
        let tx: IDBTransaction;
        try {
          tx = db.transaction(store, mode);
        } catch (e) {
          reject(new StorageError('Could not read or write local storage.', e));
          return;
        }
        const req = fn(tx.objectStore(store));
        if (req) req.onsuccess = () => (result = req.result);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(new StorageError('Saving to local storage failed.', tx.error));
        tx.onabort = () => reject(new StorageError('Saving to local storage was interrupted.', tx.error));
      }),
  );
}

export async function getAllProjects(): Promise<Project[]> {
  return ((await run<Project[]>('projects', 'readonly', (s) => s.getAll())) ?? []) as Project[];
}

export async function putProject(p: Project): Promise<void> {
  await run('projects', 'readwrite', (s) => s.put(p));
}

export async function putProjects(ps: readonly Project[]): Promise<void> {
  await run('projects', 'readwrite', (s) => {
    ps.forEach((p) => s.put(p));
  });
}

export async function deleteProject(id: string): Promise<void> {
  await run('projects', 'readwrite', (s) => s.delete(id));
}

export async function clearProjects(): Promise<void> {
  await run('projects', 'readwrite', (s) => s.clear());
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const row = await run<{ key: string; value: T }>('meta', 'readonly', (s) => s.get(key));
  return row?.value;
}

export async function setMeta<T>(key: string, value: T): Promise<void> {
  await run('meta', 'readwrite', (s) => s.put({ key, value }));
}

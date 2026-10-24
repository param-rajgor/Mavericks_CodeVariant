import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { OpenStatus, PathId, Project, StallReason } from '@/backend/domain/types';
import type { ProjectDraft } from '@/backend/domain/draft';
import { archiveProject, choosePath, createProject, decideProject, editProject, normaliseReasons, restoreProject, updateProgress, withReasons } from '@/backend/domain/ops';
import { dedupeSamples, demoProjects, RETIRED_SAMPLE_IDS } from '@/backend/domain/seed';
import { buildBackup, parseBackup } from '@/backend/domain/backup';
import { draftToFields } from '@/backend/domain/draft';
import { todayStr } from '@/backend/domain/dates';
import * as db from '@/backend/storage/db';

type LoadState = 'loading' | 'ready' | 'error';

interface ImportSummary {
  added: number;
  replaced: number;
  skipped: number;
}

interface Actions {
  create(draft: ProjectDraft): Promise<Project>;
  edit(id: string, draft: ProjectDraft): Promise<Project>;
  setProgress(id: string, progress: number, workedToday: boolean): Promise<Project>;
  choosePath(id: string, path: Exclude<PathId, 'archive'>): Promise<Project>;
  archive(id: string, note: string): Promise<Project>;
  restore(id: string, status: OpenStatus): Promise<Project>;
  remove(id: string): Promise<void>;
  removeAll(): Promise<void>;
  loadSamples(): Promise<void>;
  exportJson(): string;
  importJson(text: string): Promise<ImportSummary>;
  /** Drop-to-decide: see `decideProject` for what each path does. */
  decide(id: string, path: PathId): Promise<Project>;
  addReason(id: string, reason: StallReason): Promise<Project>;
  removeReason(id: string, reason: StallReason): Promise<Project>;
  /** Puts back the twelve sample projects as they ship. Projects the user created are kept. */
  resetSamples(): Promise<void>;
  /** Reverts the most recent change. Resolves false when there is nothing to undo. */
  undo(): Promise<boolean>;
}

interface Ctx {
  state: LoadState;
  error: string | null;
  /** True when storage failed and the user chose to continue anyway; changes will not persist. */
  memoryOnly: boolean;
  projects: Project[];
  get(id: string): Project | undefined;
  retry(): void;
  continueWithoutSaving(): void;
  actions: Actions;
  /** True when there is a change that `actions.undo` can revert. */
  canUndo: boolean;
}

const UNDO_DEPTH = 20;

const ProjectsCtx = createContext<Ctx | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [memoryOnly, setMemoryOnly] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const memRef = useRef(false);
  memRef.current = memoryOnly;
  const projectsRef = useRef<Project[]>([]);
  projectsRef.current = projects;
  // Snapshots of the whole list taken before each change, newest last. The list is small, so whole copies are cheap.
  const history = useRef<Project[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const snapshot = useCallback(() => {
    history.current = [...history.current.slice(-(UNDO_DEPTH - 1)), projectsRef.current];
    setCanUndo(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    (async () => {
      try {
        let all = await db.getAllProjects();
        if (all.length === 0 && !(await db.getMeta<boolean>('seeded'))) {
          all = demoProjects();
          await db.putProjects(all);
          await db.setMeta('seeded', true);
          await db.setMeta('samplesV3', true);
        }
        // Swap out sample projects from earlier versions for the current set.
        const retired = all.filter((p) => (RETIRED_SAMPLE_IDS as readonly string[]).includes(p.id));
        if (retired.length) {
          const fresh = demoProjects().filter((d) => !all.some((p) => p.id === d.id));
          await Promise.all(retired.map((p) => db.deleteProject(p.id)));
          await db.putProjects(fresh);
          all = [...all.filter((p) => !retired.includes(p)), ...fresh];
        }
        // The sample set was redesigned to match the new look: swap the old samples for the new ones, once.
        // Projects the user created themselves are never touched.
        if (!(await db.getMeta<boolean>('samplesV3'))) {
          const oldDemos = all.filter((p) => p.isDemo);
          if (oldDemos.length) {
            await Promise.all(oldDemos.map((p) => db.deleteProject(p.id)));
            const fresh = demoProjects();
            await db.putProjects(fresh);
            all = [...all.filter((p) => !p.isDemo), ...fresh];
          }
          await db.setMeta('samplesV3', true);
        }
        // Repair duplicated sample projects left behind by an earlier double-seeding bug.
        const { keep, drop } = dedupeSamples(all);
        if (drop.length) {
          await Promise.all(drop.map((p) => db.deleteProject(p.id)));
          all = keep;
        }
        all = all.map(normaliseReasons);
        if (!cancelled) {
          setProjects(all);
          setState('ready');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Local storage is not available.');
          setState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  /** Persist first; only update the view if the write succeeded, so we never claim a save that failed. */
  const commit = useCallback(async (raw: Project) => {
    const p = normaliseReasons(raw);
    if (!memRef.current) await db.putProject(p);
    snapshot(); // the view still holds the old list here, which is what undo puts back
    setProjects((prev) => (prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]));
    return p;
  }, [snapshot]);

  const find = useCallback((id: string) => {
    const p = projectsRef.current.find((x) => x.id === id);
    if (!p) throw new Error('That project could not be found. It may have been deleted.');
    return p;
  }, []);

  const actions = useMemo<Actions>(
    () => ({
      create: (draft) => commit(createProject(draft)),
      edit: (id, draft) => {
        const old = find(id);
        const { status, ...rest } = draftToFields(draft);
        // Status edits are only allowed on open projects; archived ones stay archived.
        return commit(editProject(old, old.status === 'archived' ? rest : { ...rest, status }));
      },
      setProgress: (id, progress, workedToday) => {
        const old = find(id);
        return commit(updateProgress(old, progress, workedToday ? todayStr() : null));
      },
      choosePath: (id, path) => commit(choosePath(find(id), path)),
      archive: (id, note) => commit(archiveProject(find(id), note)),
      restore: (id, status) => commit(restoreProject(find(id), status)),
      remove: async (id) => {
        snapshot();
        if (!memRef.current) await db.deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      },
      removeAll: async () => {
        snapshot();
        if (!memRef.current) {
          await db.clearProjects();
          await db.setMeta('seeded', true); // never re-add samples after a deliberate wipe
        }
        setProjects([]);
      },
      loadSamples: async () => {
        snapshot();
        const samples = demoProjects();
        if (!memRef.current) await db.putProjects(samples);
        setProjects((prev) => [...samples, ...prev.filter((p) => !samples.some((s) => s.id === p.id))]);
      },
      exportJson: () => JSON.stringify(buildBackup(projectsRef.current), null, 2),
      importJson: async (text) => {
        const parsed = parseBackup(text);
        if (!parsed.ok) throw new Error(parsed.error);
        snapshot();
        if (!memRef.current) await db.putProjects(parsed.projects);
        const existing = new Set(projectsRef.current.map((p) => p.id));
        const replaced = parsed.projects.filter((p) => existing.has(p.id)).length;
        setProjects((prev) => {
          const byId = new Map(prev.map((p) => [p.id, p]));
          parsed.projects.forEach((p) => byId.set(p.id, p));
          return [...byId.values()];
        });
        return { added: parsed.projects.length - replaced, replaced, skipped: parsed.skipped };
      },
      decide: (id, path) => commit(decideProject(find(id), path)),
      addReason: (id, reason) => {
        const old = find(id);
        const list = old.reasons ?? [];
        return list.includes(reason) ? Promise.resolve(old) : commit(withReasons(old, [...list, reason]));
      },
      removeReason: (id, reason) => {
        const old = find(id);
        return commit(withReasons(old, (old.reasons ?? []).filter((r) => r !== reason)));
      },
      resetSamples: async () => {
        snapshot();
        const samples = demoProjects();
        const stale = projectsRef.current.filter((p) => p.isDemo && !samples.some((s) => s.id === p.id));
        if (!memRef.current) {
          await Promise.all(stale.map((p) => db.deleteProject(p.id)));
          await db.putProjects(samples);
        }
        setProjects((prev) => [...samples, ...prev.filter((p) => !p.isDemo)]);
      },
      undo: async () => {
        const before = history.current.pop();
        setCanUndo(history.current.length > 0);
        if (!before) return false;
        const now = projectsRef.current;
        if (!memRef.current) {
          const gone = now.filter((p) => !before.some((b) => b.id === p.id));
          await Promise.all(gone.map((p) => db.deleteProject(p.id)));
          await db.putProjects(before);
        }
        setProjects(before);
        return true;
      },
    }),
    [commit, find, snapshot],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      error,
      memoryOnly,
      projects,
      get: (id) => projects.find((p) => p.id === id),
      retry: () => {
        db.resetDbConnection();
        setAttempt((a) => a + 1);
      },
      continueWithoutSaving: () => {
        setMemoryOnly(true);
        setProjects([]);
        setState('ready');
      },
      actions,
      canUndo,
    }),
    [state, error, memoryOnly, projects, actions, canUndo],
  );

  return <ProjectsCtx.Provider value={value}>{children}</ProjectsCtx.Provider>;
}

export function useProjects(): Ctx {
  const c = useContext(ProjectsCtx);
  if (!c) throw new Error('useProjects must be used inside ProjectsProvider');
  return c;
}

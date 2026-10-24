import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { OpenStatus, PathId, Project } from '../domain/types';
import type { ProjectDraft } from '../domain/draft';
import { archiveProject, choosePath, createProject, editProject, restoreProject, updateProgress } from '../domain/ops';
import { demoProjects } from '../domain/seed';
import { buildBackup, parseBackup } from '../domain/backup';
import { draftToFields } from '../domain/draft';
import { todayStr } from '../domain/dates';
import * as db from '../storage/db';

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
}

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
        }
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
  const commit = useCallback(async (p: Project) => {
    if (!memRef.current) await db.putProject(p);
    setProjects((prev) => (prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]));
    return p;
  }, []);

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
        if (!memRef.current) await db.deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      },
      removeAll: async () => {
        if (!memRef.current) {
          await db.clearProjects();
          await db.setMeta('seeded', true); // never re-add samples after a deliberate wipe
        }
        setProjects([]);
      },
      loadSamples: async () => {
        const samples = demoProjects();
        if (!memRef.current) await db.putProjects(samples);
        setProjects((prev) => [...samples, ...prev]);
      },
      exportJson: () => JSON.stringify(buildBackup(projectsRef.current), null, 2),
      importJson: async (text) => {
        const parsed = parseBackup(text);
        if (!parsed.ok) throw new Error(parsed.error);
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
    }),
    [commit, find],
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
    }),
    [state, error, memoryOnly, projects, actions],
  );

  return <ProjectsCtx.Provider value={value}>{children}</ProjectsCtx.Provider>;
}

export function useProjects(): Ctx {
  const c = useContext(ProjectsCtx);
  if (!c) throw new Error('useProjects must be used inside ProjectsProvider');
  return c;
}

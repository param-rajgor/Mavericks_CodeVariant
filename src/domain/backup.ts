/** JSON backup: export includes score inputs and a score snapshot; import validates before touching storage. */
import { analyzeProject, projectToInput } from './analysis';
import { newId } from './timeline';
import {
  ASSET_CATEGORIES,
  DOMAINS,
  PATH_IDS,
  STALL_REASONS,
  STATUSES,
  type AssetCategory,
  type Domain,
  type PathId,
  type Project,
  type StallReason,
  type Status,
  type TimelineEvent,
} from './types';

export const BACKUP_VERSION = 1;

export interface Backup {
  app: 'relaunch';
  schemaVersion: number;
  exportedAt: string;
  note: string;
  projects: Array<Project & { analysis: ReturnType<typeof summarise> }>;
}

function summarise(p: Project, now: Date) {
  const a = analyzeProject(projectToInput(p), now);
  return {
    total: a.total,
    status: a.status,
    recommendedPath: a.recommendation?.path ?? null,
    factors: a.factors.map(({ key, weight, value, contribution }) => ({ key, weight, value, contribution })),
  };
}

export function buildBackup(projects: readonly Project[], now: Date = new Date()): Backup {
  return {
    app: 'relaunch',
    schemaVersion: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    note: 'Relaunch backup. All data comes from this browser; nothing was sent anywhere.',
    projects: projects.map((p) => ({ ...p, analysis: summarise(p, now) })),
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);
const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const oneOf = <T extends string>(v: unknown, list: readonly T[]): T | null => (typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : null);

function normaliseEvent(raw: unknown): TimelineEvent | null {
  if (!isObj(raw) || typeof raw.at !== 'string' || typeof raw.description !== 'string' || typeof raw.type !== 'string') return null;
  return {
    id: str(raw.id) || newId(),
    at: raw.at,
    type: raw.type as TimelineEvent['type'],
    description: raw.description,
    ...(isObj(raw.meta) ? { meta: raw.meta as TimelineEvent['meta'] } : {}),
    ...(raw.demo === true ? { demo: true } : {}),
  };
}

export function normaliseProject(raw: unknown, now: Date): Project | null {
  if (!isObj(raw) || typeof raw.name !== 'string' || !raw.name.trim()) return null;
  const iso = now.toISOString();
  const status = oneOf<Status>(raw.status, STATUSES) ?? 'stalled';
  const interest = typeof raw.currentInterest === 'number' && raw.currentInterest >= 1 && raw.currentInterest <= 5 ? Math.round(raw.currentInterest) : null;
  const p: Project = {
    id: str(raw.id) || newId(),
    name: raw.name.trim(),
    description: str(raw.description),
    domain: oneOf<Domain>(raw.domain, DOMAINS) ?? 'Other',
    tags: strList(raw.tags),
    startedAt: str(raw.startedAt, iso.slice(0, 10)),
    createdAt: str(raw.createdAt, iso),
    updatedAt: str(raw.updatedAt, iso),
    lastWorkedAt: typeof raw.lastWorkedAt === 'string' ? raw.lastWorkedAt : null,
    status,
    progress: typeof raw.progress === 'number' ? Math.min(100, Math.max(0, raw.progress)) : 0,
    completedItems: strList(raw.completedItems),
    remainingItems: strList(raw.remainingItems),
    assets: strList(raw.assets).filter((a): a is AssetCategory => (ASSET_CATEGORIES as readonly string[]).includes(a)),
    assetNotes: str(raw.assetNotes),
    stallReason: oneOf<StallReason>(raw.stallReason, STALL_REASONS),
    stallReasonDetails: str(raw.stallReasonDetails),
    currentInterest: interest,
    interestNote: str(raw.interestNote),
    score: null,
    scoreStatus: 'insufficient',
    recommendedPath: null,
    selectedPath: oneOf<PathId>(raw.selectedPath, PATH_IDS),
    archiveNote: str(raw.archiveNote),
    archivedAt: typeof raw.archivedAt === 'string' ? raw.archivedAt : null,
    previousStatus: oneOf(raw.previousStatus, ['active', 'stalled', 'needs-direction'] as const),
    timeline: Array.isArray(raw.timeline) ? raw.timeline.map(normaliseEvent).filter((e): e is TimelineEvent => e !== null) : [],
    ...(raw.isDemo === true ? { isDemo: true } : {}),
  };
  const a = analyzeProject(projectToInput(p), now);
  return { ...p, score: a.total, scoreStatus: a.status, recommendedPath: a.recommendation?.path ?? null };
}

export type ParseResult = { ok: true; projects: Project[]; skipped: number } | { ok: false; error: string };

export function parseBackup(text: string, now: Date = new Date()): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  if (!isObj(json) || json.app !== 'relaunch' || !Array.isArray(json.projects)) {
    return { ok: false, error: 'This does not look like a Relaunch backup.' };
  }
  if (typeof json.schemaVersion === 'number' && json.schemaVersion > BACKUP_VERSION) {
    return { ok: false, error: 'This backup was made by a newer version of Relaunch.' };
  }
  const projects = json.projects.map((r) => normaliseProject(r, now)).filter((p): p is Project => p !== null);
  return { ok: true, projects, skipped: json.projects.length - projects.length };
}

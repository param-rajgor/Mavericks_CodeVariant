import type { Domain, Project, Status } from '@/backend/domain/types';
import { ASSET_META, STALL_REASON_META } from '@/backend/domain/paths';
import { ago } from '@/backend/domain/insights';

/**
 * How a project looks on a gravestone. The graveyard page and the landing page both read the
 * same stored projects through this one adapter, so a name or status can never differ between pages.
 */
export type StoneStatus = 'Stalled' | 'In Progress' | 'To Revisit' | 'Archived';
export type StoneIcon = 'code' | 'box' | 'chart' | 'laptop' | 'sprout' | 'pad';

export interface Stone {
  id: string;
  name: string;
  status: StoneStatus;
  icon: StoneIcon;
  description: string;
  /** 0-100 */
  progress: number;
  lastVisited: string;
  stack: string[];
  /** Empty when the project never stalled. */
  whyStalled: string;
  reusable: string;
  /** SocialPulse: vines and a gold glow at rest on the landing page. */
  featured: boolean;
}

export const STONE_STATUS: Record<Status, StoneStatus> = {
  active: 'In Progress',
  stalled: 'Stalled',
  'needs-direction': 'To Revisit',
  archived: 'Archived',
};

const DOMAIN_ICON: Partial<Record<Domain, StoneIcon>> = {
  Business: 'box',
  Research: 'chart',
  Creative: 'laptop',
  Academic: 'laptop',
  Personal: 'sprout',
};

function iconFor(p: Project): StoneIcon {
  const tags = p.tags.map((t) => t.toLowerCase());
  if (tags.some((t) => ['game', 'godot', 'unity'].includes(t))) return 'pad';
  if (tags.some((t) => ['pytorch', 'ml', 'tensorflow'].includes(t))) return 'chart';
  return DOMAIN_ICON[p.domain] ?? 'code';
}

export function toStone(p: Project, now = new Date()): Stone {
  const why = p.status === 'active' ? '' : p.stallReasonDetails || (p.stallReason ? STALL_REASON_META[p.stallReason].label : '');
  const reusable = p.assetNotes || (p.assets.length ? p.assets.map((a) => ASSET_META[a].label).join(', ') : 'Nothing recorded yet.');
  return {
    id: p.id,
    name: p.name,
    status: STONE_STATUS[p.status],
    icon: iconFor(p),
    description: p.description.replace(/\.$/, ''),
    progress: p.progress,
    lastVisited: ago(p, false, now),
    stack: p.tags,
    whyStalled: why,
    reusable,
    featured: p.name === 'SocialPulse',
  };
}

/* ------------------------------------------------------------------ filters */

export type FilterId = 'all' | 'stalled' | 'active' | 'archived';

export const FILTER_LABELS: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'ALL' },
  { id: 'stalled', label: 'STALLED' },
  { id: 'active', label: 'ACTIVE' },
  { id: 'archived', label: 'ARCHIVED' },
];

/** "Active" means anything that is not stalled or archived: in progress or waiting to be revisited. */
export function matchesFilter(s: Stone, filter: FilterId): boolean {
  if (filter === 'all') return true;
  if (filter === 'stalled') return s.status === 'Stalled';
  if (filter === 'archived') return s.status === 'Archived';
  return s.status === 'In Progress' || s.status === 'To Revisit';
}

/** The four stones on the landing page: the original quartet when they exist, otherwise the most recent ideas. */
const LANDING_NAMES = ['SocialPulse', 'CampusKart', 'ML Classifier', 'Portfolio v1'];
export function landingProjects(projects: readonly Project[]): Project[] {
  const picked = LANDING_NAMES.map((n) => projects.find((p) => p.name === n)).filter((p): p is Project => !!p);
  const rest = projects
    .filter((p) => !picked.includes(p))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return [...picked, ...rest].slice(0, 4);
}

export const STATUSES = ['active', 'stalled', 'needs-direction', 'archived'] as const;
export type Status = (typeof STATUSES)[number];
/** Statuses a user can pick directly; archiving has its own flow. */
export type OpenStatus = Exclude<Status, 'archived'>;

export const PATH_IDS = ['continue', 'restart', 'pivot', 'repurpose', 'archive'] as const;
export type PathId = (typeof PATH_IDS)[number];

export const ASSET_CATEGORIES = ['code', 'design', 'data', 'research', 'documentation', 'other'] as const;
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export const STALL_REASONS = [
  'lack-of-time',
  'lost-interest',
  'technical-difficulty',
  'unclear-direction',
  'missing-resources',
  'competing-priorities',
  'other',
] as const;
export type StallReason = (typeof STALL_REASONS)[number];

export const DOMAINS = ['Software', 'Academic', 'Business', 'Creative', 'Research', 'Personal', 'Other'] as const;
export type Domain = (typeof DOMAINS)[number];

export type EventType =
  | 'created'
  | 'edited'
  | 'progress-updated'
  | 'status-changed'
  | 'assets-changed'
  | 'score-recalculated'
  | 'recommendation-generated'
  | 'path-selected'
  | 'restarted'
  | 'archived'
  | 'archive-note-added'
  | 'restored';

export interface TimelineEvent {
  id: string;
  /** Full ISO timestamp. */
  at: string;
  type: EventType;
  description: string;
  meta?: Record<string, string | number | null>;
  /** True for events that ship with the sample projects. */
  demo?: boolean;
}

export type ScoreStatus = 'complete' | 'provisional' | 'insufficient';

export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
}

export interface SavedRepo {
  id: string;
  name: string;
  url: string;
  stars: number;
  description: string;
  verdict: 'solved' | 'inspiring' | 'irrelevant';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  domain: Domain;
  tags: string[];
  /** Date-only strings (YYYY-MM-DD) for user-entered dates; ISO timestamps for system dates. */
  startedAt: string;
  createdAt: string;
  updatedAt: string;
  lastWorkedAt: string | null;
  status: Status;
  progress: number;
  completedItems: string[];
  remainingItems: string[];
  assets: AssetCategory[];
  assetNotes: string;
  stallReason: StallReason | null;
  /** Every reason the user has pinned on it. The first is mirrored in `stallReason`, which the score reads. */
  reasons?: StallReason[];
  stallReasonDetails: string;
  /** 1 (barely) – 5 (very). */
  currentInterest: number | null;
  interestNote: string;
  /** Snapshot of the last calculation; views recompute live because freshness depends on today's date. */
  score: number | null;
  scoreStatus: ScoreStatus;
  recommendedPath: PathId | null;
  selectedPath: PathId | null;
  archiveNote: string;
  archivedAt: string | null;
  /** Status to offer again when a project is restored. */
  previousStatus: OpenStatus | null;
  timeline: TimelineEvent[];
  /** Sample record shipped with the app, not created by the user. */
  isDemo?: boolean;
  /** Concrete next-step tasks generated upon choosing a path. */
  tasks?: TaskItem[];
  /** Revisit reminder date label (e.g., 'In 3 months: 2027-01-24'). */
  revisitReminder?: string | null;
  /** Decision history timeline notes. */
  decisionNotes?: { path: PathId; note: string; at: string }[];
  /** Evaluated GitHub repos feeding market signals. */
  evaluatedRepos?: SavedRepo[];
  /** Answers to the 6-question questionnaire. */
  questionnaireAnswers?: Record<string, number | string>;
}

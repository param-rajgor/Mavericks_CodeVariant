/** The editable shape shared by the four-step "Log a project" flow and the edit dialog. */
import { ASSET_CATEGORIES, DOMAINS, STALL_REASONS } from './types';
import type { AnalysisInput } from './analysis';
import { isValidDateStr, todayStr } from './dates';
import type { AssetCategory, Domain, OpenStatus, Project, StallReason } from './types';

export interface ProjectDraft {
  name: string;
  description: string;
  domain: Domain | '';
  tags: string[];
  startedAt: string;
  progress: number | null;
  completedText: string;
  remainingText: string;
  assets: AssetCategory[];
  assetNotes: string;
  stallReason: StallReason | '';
  stallReasonDetails: string;
  lastWorkedAt: string;
  status: OpenStatus;
  currentInterest: number | null;
  interestNote: string;
}

export const emptyDraft = (now = new Date()): ProjectDraft => ({
  name: '',
  description: '',
  domain: '',
  tags: [],
  startedAt: todayStr(now),
  progress: null,
  completedText: '',
  remainingText: '',
  assets: [],
  assetNotes: '',
  stallReason: '',
  stallReasonDetails: '',
  lastWorkedAt: '',
  status: 'stalled',
  currentInterest: null,
  interestNote: '',
});

const toLines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);

export function projectToDraft(p: Project): ProjectDraft {
  return {
    name: p.name,
    description: p.description,
    domain: p.domain,
    tags: [...p.tags],
    startedAt: p.startedAt.slice(0, 10),
    progress: p.progress,
    completedText: p.completedItems.join('\n'),
    remainingText: p.remainingItems.join('\n'),
    assets: [...p.assets],
    assetNotes: p.assetNotes,
    stallReason: p.stallReason ?? '',
    stallReasonDetails: p.stallReasonDetails,
    lastWorkedAt: p.lastWorkedAt?.slice(0, 10) ?? '',
    status: p.status === 'archived' ? 'stalled' : p.status,
    currentInterest: p.currentInterest,
    interestNote: p.interestNote,
  };
}

/** Fields of a project that a draft controls. Validation must pass before calling this. */
export function draftToFields(d: ProjectDraft) {
  return {
    name: d.name.trim(),
    description: d.description.trim(),
    domain: (d.domain || 'Other') as Domain,
    tags: d.tags,
    startedAt: d.startedAt,
    progress: d.progress ?? 0,
    completedItems: toLines(d.completedText),
    remainingItems: toLines(d.remainingText),
    assets: d.assets,
    assetNotes: d.assetNotes.trim(),
    stallReason: (d.stallReason || null) as StallReason | null,
    stallReasonDetails: d.stallReasonDetails.trim(),
    lastWorkedAt: d.lastWorkedAt || null,
    status: d.status,
    currentInterest: d.currentInterest,
    interestNote: d.interestNote.trim(),
  };
}

/** Live-preview input. `assetsKnown` gates the assets factor until the user reaches that step. */
export function draftToAnalysisInput(d: ProjectDraft, assetsKnown = true): AnalysisInput {
  return {
    progress: d.progress,
    stallReason: d.stallReason || null,
    assets: assetsKnown ? d.assets : null,
    lastWorkedAt: d.lastWorkedAt && isValidDateStr(d.lastWorkedAt) ? d.lastWorkedAt : null,
    currentInterest: d.currentInterest,
    remainingItems: toLines(d.remainingText),
  };
}

export type DraftErrors = Partial<Record<keyof ProjectDraft, string>>;

export type StepId = 'idea' | 'progress' | 'stopped' | 'interest';
export const STEP_ORDER: StepId[] = ['idea', 'progress', 'stopped', 'interest'];

export function validateStep(step: StepId, d: ProjectDraft, now = new Date()): DraftErrors {
  const e: DraftErrors = {};
  const today = todayStr(now);
  if (step === 'idea') {
    if (!d.name.trim()) e.name = 'Give your project a name.';
    else if (d.name.trim().length > 80) e.name = 'Keep the name under 80 characters.';
    if (!d.description.trim()) e.description = 'A sentence or two about the idea will help future you.';
    else if (d.description.length > 600) e.description = 'Keep the description under 600 characters.';
    if (!d.domain || !DOMAINS.includes(d.domain)) e.domain = 'Pick the closest category.';
    if (!d.startedAt || !isValidDateStr(d.startedAt)) e.startedAt = 'Choose roughly when you started.';
    else if (d.startedAt > today) e.startedAt = 'The start date cannot be in the future.';
  }
  if (step === 'progress') {
    if (d.progress == null || Number.isNaN(d.progress)) e.progress = 'Estimate how far you got, from 0 to 100.';
    else if (d.progress < 0 || d.progress > 100) e.progress = 'Progress must be between 0 and 100.';
    if (d.assets.some((a) => !ASSET_CATEGORIES.includes(a))) e.assets = 'Unknown asset type.';
  }
  if (step === 'stopped') {
    if (!d.stallReason || !STALL_REASONS.includes(d.stallReason)) e.stallReason = 'Choose what fits best. There is no wrong answer.';
    if (d.lastWorkedAt) {
      if (!isValidDateStr(d.lastWorkedAt)) e.lastWorkedAt = 'Use a valid date.';
      else if (d.lastWorkedAt > today) e.lastWorkedAt = 'The last-worked date cannot be in the future.';
      else if (d.startedAt && d.lastWorkedAt < d.startedAt) e.lastWorkedAt = 'This is before the start date.';
    }
  }
  if (step === 'interest') {
    if (d.currentInterest == null || d.currentInterest < 1 || d.currentInterest > 5) e.currentInterest = 'Pick how interested you are right now.';
  }
  return e;
}

export const hasErrors = (e: DraftErrors) => Object.keys(e).length > 0;

export function validateAll(d: ProjectDraft, now = new Date()): { step: StepId; errors: DraftErrors } | null {
  for (const step of STEP_ORDER) {
    const errors = validateStep(step, d, now);
    if (hasErrors(errors)) return { step, errors };
  }
  return null;
}

export function isDraftDirty(d: ProjectDraft, base: ProjectDraft = emptyDraft()): boolean {
  return JSON.stringify({ ...d, startedAt: '' }) !== JSON.stringify({ ...base, startedAt: '' });
}

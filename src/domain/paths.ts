import type { AssetCategory, Domain, OpenStatus, PathId, StallReason, Status } from './types';

/** Colours here are the single source of truth for each path; `ink` is the AA-contrast text colour on `soft`. */
export interface PathMeta {
  id: PathId;
  label: string;
  verb: string;
  tagline: string;
  meaning: string;
  bestWhen: string;
  examples: string[];
  /** Saturated brand colour for fills and accents. */
  accent: string;
  /** Pale tint for card backgrounds. */
  soft: string;
  /** Dark text colour readable on `soft` (>= 4.5:1). */
  ink: string;
  /** Three first steps used when nothing more specific is known. */
  defaultSteps: [string, string, string];
}

export const PATHS: Record<PathId, PathMeta> = {
  continue: {
    id: 'continue',
    label: 'Continue',
    verb: 'Pick it back up',
    tagline: 'Build on what you already have and move forward.',
    meaning: 'Build on what you already have and move forward.',
    bestWhen: 'Strong progress and high current interest.',
    examples: ['Complete core features', 'Improve UI/UX', 'Conduct user testing'],
    accent: '#A8E6A1',
    soft: '#E3F6E0',
    ink: '#1D5A2C',
    defaultSteps: ['Complete the core features', 'Improve the UI/UX', 'Run a round of user testing'],
  },
  restart: {
    id: 'restart',
    label: 'Restart',
    verb: 'Start smaller',
    tagline: 'Start again with a smaller scope and a clearer plan.',
    meaning: 'Start again with a smaller scope and a clearer plan.',
    bestWhen: 'The idea is good, but the original approach needs a fresh start.',
    examples: ['Define an MVP', 'Set a realistic timeline', 'Gather the required resources'],
    accent: '#FFAB83',
    soft: '#FFE6D9',
    ink: '#8A3A12',
    defaultSteps: ['Define the smallest useful version (your MVP)', 'Set a realistic two-week timeline', 'Gather the resources you need'],
  },
  pivot: {
    id: 'pivot',
    label: 'Pivot',
    verb: 'Change direction',
    tagline: 'Change the idea or target audience while keeping the valuable core.',
    meaning: 'Change the idea or target audience while preserving valuable core elements.',
    bestWhen: 'The core idea still has potential but the current direction is not working.',
    examples: ['Identify a different audience', 'Change the approach', 'Preserve useful existing work'],
    accent: '#A982F2',
    soft: '#EADFFB',
    ink: '#48279A',
    defaultSteps: ['Name a different audience or problem', 'List the parts of the project worth keeping', 'Sketch the new direction in one paragraph'],
  },
  repurpose: {
    id: 'repurpose',
    label: 'Repurpose',
    verb: 'Reuse the parts',
    tagline: 'Use existing assets in a new way.',
    meaning: 'Use existing assets in a new way.',
    bestWhen: 'The code, design, data or research can be useful in a different context.',
    examples: ['Reuse code', 'Extract useful designs', 'Reuse data or research', 'Start a new project from these assets'],
    accent: '#6FC8E8',
    soft: '#D8F0FA',
    ink: '#0C5470',
    defaultSteps: ['List which assets are worth keeping', 'Pull them into a reusable form', 'Start a new project, or open-source the useful parts'],
  },
  archive: {
    id: 'archive',
    label: 'Archive',
    verb: 'Let go with clarity',
    tagline: 'Let it go with clarity. A valid and valuable outcome.',
    meaning: 'Let it go with clarity. This is a valid and valuable outcome.',
    bestWhen: 'Current interest is low or the project is no longer relevant.',
    examples: ['Record lessons learned', 'Preserve reusable assets', 'Add an archive note', 'Close the project intentionally'],
    accent: '#F29BB4',
    soft: '#FBDDE6',
    ink: '#8F2549',
    defaultSteps: ['Write down what you learned', 'Save any assets you might want later', 'Add an archive note and close it with intent'],
  },
};

export const PATH_LIST = Object.values(PATHS);

export interface StatusMeta {
  id: Status;
  label: string;
  /** Plain-language definition, shown in tooltips and help text. */
  definition: string;
  soft: string;
  ink: string;
}

/** Stalled is a calm amber, never alarm red. */
export const STATUS_META: Record<Status, StatusMeta> = {
  active: { id: 'active', label: 'Active', definition: 'You are working on it now.', soft: '#DDF3D6', ink: '#1D5A2C' },
  stalled: { id: 'stalled', label: 'Stalled', definition: 'Paused for now. Nothing wrong with that.', soft: '#FFE9B8', ink: '#6B4A00' },
  'needs-direction': {
    id: 'needs-direction',
    label: 'Needs direction',
    definition: 'Waiting for a decision about what to do next.',
    soft: '#EADFFB',
    ink: '#48279A',
  },
  archived: { id: 'archived', label: 'Archived', definition: 'Closed with intent. History and assets are kept.', soft: '#E5E4F1', ink: '#3B3C66' },
};

export const OPEN_STATUSES: OpenStatus[] = ['active', 'stalled', 'needs-direction'];

export const STALL_REASON_META: Record<StallReason, { label: string; hint: string }> = {
  'lack-of-time': { label: 'Lack of time', hint: 'Life got busy.' },
  'lost-interest': { label: 'Lost interest', hint: 'The spark faded.' },
  'technical-difficulty': { label: 'Technical difficulty', hint: 'Hit a problem that was hard to get past.' },
  'unclear-direction': { label: 'Unclear direction', hint: 'Not sure what it should become.' },
  'missing-resources': { label: 'Missing resources', hint: 'Needed money, tools, people or data.' },
  'competing-priorities': { label: 'Competing priorities', hint: 'Something else came first.' },
  other: { label: 'Another reason', hint: 'Tell us more below.' },
};

export const ASSET_META: Record<AssetCategory, { label: string; reuseStep: string }> = {
  code: { label: 'Code', reuseStep: 'Extract the reusable code into a small library or starter template' },
  design: { label: 'Design', reuseStep: 'Pull the designs and components into a reusable kit' },
  data: { label: 'Data', reuseStep: 'Clean and document the data so it can be reused' },
  research: { label: 'Research', reuseStep: 'Summarise the research into a one-page brief' },
  documentation: { label: 'Documentation', reuseStep: 'Turn the documentation into a template for future projects' },
  other: { label: 'Other', reuseStep: 'Write down what the other assets are and where they live' },
};

export const INTEREST_LABELS: Record<number, { label: string; hint: string }> = {
  1: { label: 'Barely', hint: "I don't feel pulled to it" },
  2: { label: 'A little', hint: 'Occasionally crosses my mind' },
  3: { label: 'Somewhat', hint: "I'd like to, if it were easier" },
  4: { label: 'Quite a lot', hint: "I'd happily work on it again" },
  5: { label: 'Very much', hint: 'I want to get back to it' },
};

export const DOMAIN_LIST: readonly Domain[] = ['Software', 'Academic', 'Business', 'Creative', 'Research', 'Personal', 'Other'];

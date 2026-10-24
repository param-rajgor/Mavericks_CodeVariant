/** Sample projects shown only when a user has no data. Everything here is flagged as demo. */
import { analyzeProject, projectToInput } from './analysis';
import { daysAgoStr } from './dates';
import { newId } from './timeline';
import type { EventType, Project, TimelineEvent } from './types';

function ev(at: Date, type: EventType, description: string): TimelineEvent {
  return { id: newId(), at: at.toISOString(), type, description, demo: true };
}

const daysBefore = (now: Date, d: number) => new Date(now.getTime() - d * 86_400_000);

type SeedFields = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'score' | 'scoreStatus' | 'recommendedPath' | 'timeline' | 'isDemo'>;

function build(id: string, now: Date, fields: SeedFields, history: Array<[number, EventType, string]>): Project {
  const a = analyzeProject(projectToInput({ ...fields } as Project), now);
  const timeline = history.map(([d, t, text]) => ev(daysBefore(now, d), t, text));
  const last = timeline.at(-1)?.at ?? now.toISOString();
  return {
    id,
    ...fields,
    createdAt: timeline[0]?.at ?? now.toISOString(),
    updatedAt: last,
    score: a.total,
    scoreStatus: a.status,
    recommendedPath: a.recommendation?.path ?? null,
    timeline,
    isDemo: true,
  };
}

export const SAMPLE_IDS = ['demo-socialpulse', 'demo-campuskart', 'demo-ml-classifier', 'demo-portfolio-v1', 'demo-recipe-remix', 'demo-habit-garden', 'demo-budget-buddy', 'demo-trail-notes', 'demo-flashcard-forge', 'demo-pixel-planner', 'demo-poetry-bot', 'demo-old-blog'] as const;
/** Sample projects from earlier versions, replaced on load by the current set. */
export const RETIRED_SAMPLE_IDS = ['demo-ai-study-app', 'demo-travel-planner', 'demo-ecommerce-site', 'demo-portfolio-redesign'] as const;

export function demoProjects(now: Date = new Date()): Project[] {
  const common = { assetNotes: '', previousStatus: null, archivedAt: null, archiveNote: '', selectedPath: null, interestNote: '' } as const;
  return [
    build(
      'demo-socialpulse',
      now,
      {
        ...common,
        name: 'SocialPulse',
        description: 'Social media analytics platform.',
        domain: 'Software',
        tags: ['Analytics', 'Web', 'Personal'],
        startedAt: daysAgoStr(240, now),
        lastWorkedAt: daysAgoStr(60, now),
        status: 'stalled',
        progress: 40,
        completedItems: ['Dashboard shell', 'API wrappers', 'Chart components'],
        remainingItems: ['Connect live data', 'Scheduled reports', 'User testing'],
        assets: ['code', 'design', 'research'],
        stallReason: 'competing-priorities',
        stallReasonDetails: 'Scope grew faster than my free time.',
        currentInterest: 4,
        interestNote: 'The chart components alone are worth keeping.',
      },
      [
        [240, 'created', 'Logged "SocialPulse" in the graveyard.'],
        [130, 'progress-updated', 'Progress updated from 30% to 55%.'],
        [60, 'status-changed', 'Status changed from Active to Stalled.'],
      ],
    ),
    build(
      'demo-campuskart',
      now,
      {
        ...common,
        name: 'CampusKart',
        description: 'A marketplace for buying and selling on campus.',
        domain: 'Business',
        tags: ['Web', 'Marketplace', 'Campus'],
        startedAt: daysAgoStr(150, now),
        lastWorkedAt: daysAgoStr(7, now),
        status: 'active',
        progress: 40,
        completedItems: ['Listing flow', 'Seller onboarding mockups'],
        remainingItems: ['Checkout', 'Messaging between buyers and sellers', 'Moderation'],
        assets: ['code', 'design', 'data'],
        stallReason: 'unclear-direction',
        stallReasonDetails: 'Unsure whether to focus on students or hostels first.',
        currentInterest: 3,
        interestNote: '',
      },
      [
        [150, 'created', 'Logged "CampusKart" in the graveyard.'],
        [30, 'progress-updated', 'Progress updated from 20% to 40%.'],
      ],
    ),
    build(
      'demo-ml-classifier',
      now,
      {
        ...common,
        name: 'ML Classifier',
        description: 'A machine-learning classification project.',
        domain: 'Research',
        tags: ['Python', 'ML', 'Data'],
        startedAt: daysAgoStr(260, now),
        lastWorkedAt: daysAgoStr(120, now),
        status: 'needs-direction',
        progress: 25,
        completedItems: ['Labelled dataset', 'Baseline notebook'],
        remainingItems: ['Define the real task', 'Try a simpler model', 'Write up the results'],
        assets: ['data'],
        stallReason: 'unclear-direction',
        stallReasonDetails: 'The original approach became too complicated.',
        currentInterest: 3,
        interestNote: '',
      },
      [
        [260, 'created', 'Logged "ML Classifier" in the graveyard.'],
        [120, 'status-changed', 'Status changed from Active to Needs direction.'],
      ],
    ),
    build(
      'demo-portfolio-v1',
      now,
      {
        ...common,
        name: 'Portfolio v1',
        description: 'My first personal portfolio website.',
        domain: 'Creative',
        tags: ['Web', 'Design', 'Personal'],
        startedAt: daysAgoStr(400, now),
        lastWorkedAt: daysAgoStr(300, now),
        status: 'archived',
        previousStatus: 'stalled',
        archivedAt: daysBefore(now, 20).toISOString(),
        archiveNote: 'I rebuilt it from a simple template and that was fine. Keeping the type scale and case-study layout for future projects.',
        selectedPath: 'archive',
        progress: 55,
        completedItems: ['Type scale', 'Case-study layout'],
        remainingItems: ['Responsive pass', 'Write the case studies'],
        assets: ['design', 'code'],
        assetNotes: 'Figma file and a half-built Astro site.',
        stallReason: 'lost-interest',
        stallReasonDetails: 'A template did the job, so the redesign stopped feeling necessary.',
        currentInterest: 1,
        interestNote: 'It no longer matters to me.',
      },
      [
        [400, 'created', 'Logged "Portfolio v1" in the graveyard.'],
        [20, 'path-selected', 'Chose Archive: Let it go with clarity. A valid and valuable outcome.'],
        [20, 'archived', 'Archived. History and assets are kept.'],
        [20, 'archive-note-added', 'Added an archive note.'],
      ],
    ),
    build(
      'demo-recipe-remix',
      now,
      {
        ...common,
        name: 'Recipe Remix',
        description: 'An app that remixes recipes from what is in the fridge.',
        domain: 'Software',
        tags: ['Food', 'Mobile'],
        startedAt: daysAgoStr(330, now),
        lastWorkedAt: daysAgoStr(120, now),
        status: 'stalled',
        progress: 35,
        completedItems: ['Ingredient parser', 'Recipe cards'],
        remainingItems: ['Remix engine', 'Shopping list'],
        assets: ['code', 'design'],
        stallReason: 'technical-difficulty',
        stallReasonDetails: 'The remix logic never felt right.',
        currentInterest: 3,
        interestNote: '',
      },
      [
        [330, 'created', 'Logged "Recipe Remix" in the graveyard.'],
        [120, 'status-changed', 'Status changed from Active to Stalled.'],
      ],
    ),
    build(
      'demo-habit-garden',
      now,
      {
        ...common,
        name: 'Habit Garden',
        description: 'Grow a pixel garden by keeping small daily habits.',
        domain: 'Personal',
        tags: ['Habits', 'Game'],
        startedAt: daysAgoStr(95, now),
        lastWorkedAt: daysAgoStr(3, now),
        status: 'active',
        progress: 60,
        completedItems: ['Plant sprites', 'Streak logic', 'Daily check-in'],
        remainingItems: ['Reminders', 'Garden themes'],
        assets: ['code', 'design', 'data'],
        stallReason: 'lack-of-time',
        stallReasonDetails: 'Evenings are short, so progress comes in small steps.',
        currentInterest: 5,
        interestNote: '',
      },
      [
        [95, 'created', 'Logged "Habit Garden" in the graveyard.'],
        [20, 'progress-updated', 'Progress updated from 40% to 60%.'],
      ],
    ),
    build(
      'demo-budget-buddy',
      now,
      {
        ...common,
        name: 'Budget Buddy',
        description: 'A friendly expense tracker for students.',
        domain: 'Software',
        tags: ['Finance', 'Mobile'],
        startedAt: daysAgoStr(300, now),
        lastWorkedAt: daysAgoStr(150, now),
        status: 'stalled',
        progress: 45,
        completedItems: ['Expense list', 'Category colours'],
        remainingItems: ['Charts', 'CSV import', 'Monthly summary'],
        assets: ['code', 'data'],
        stallReason: 'competing-priorities',
        stallReasonDetails: 'Exams took over.',
        currentInterest: 3,
        interestNote: '',
      },
      [
        [300, 'created', 'Logged "Budget Buddy" in the graveyard.'],
        [150, 'status-changed', 'Status changed from Active to Stalled.'],
      ],
    ),
    build(
      'demo-trail-notes',
      now,
      {
        ...common,
        name: 'Trail Notes',
        description: 'Offline field notes for hikers, with photos and maps.',
        domain: 'Creative',
        tags: ['Outdoors', 'Maps'],
        startedAt: daysAgoStr(280, now),
        lastWorkedAt: daysAgoStr(100, now),
        status: 'needs-direction',
        progress: 30,
        completedItems: ['Map prototype', 'Interview notes'],
        remainingItems: ['Pick the audience', 'Offline sync'],
        assets: ['research', 'design'],
        stallReason: 'unclear-direction',
        stallReasonDetails: 'The original direction stopped working.',
        currentInterest: 4,
        interestNote: '',
      },
      [
        [280, 'created', 'Logged "Trail Notes" in the graveyard.'],
        [100, 'status-changed', 'Status changed from Active to Needs direction.'],
      ],
    ),
    build(
      'demo-flashcard-forge',
      now,
      {
        ...common,
        name: 'Flashcard Forge',
        description: 'Turn lecture notes into flashcards automatically.',
        domain: 'Academic',
        tags: ['Study', 'Python'],
        startedAt: daysAgoStr(70, now),
        lastWorkedAt: daysAgoStr(5, now),
        status: 'active',
        progress: 50,
        completedItems: ['Note importer', 'Card generator'],
        remainingItems: ['Spaced repetition', 'Export to Anki'],
        assets: ['code', 'documentation'],
        stallReason: 'lack-of-time',
        stallReasonDetails: '',
        currentInterest: 4,
        interestNote: '',
      },
      [
        [70, 'created', 'Logged "Flashcard Forge" in the graveyard.'],
        [5, 'progress-updated', 'Progress updated from 30% to 50%.'],
      ],
    ),
    build(
      'demo-pixel-planner',
      now,
      {
        ...common,
        name: 'Pixel Planner',
        description: 'A week planner drawn entirely in pixel art.',
        domain: 'Creative',
        tags: ['Planner', 'Design'],
        startedAt: daysAgoStr(200, now),
        lastWorkedAt: daysAgoStr(75, now),
        status: 'stalled',
        progress: 20,
        completedItems: ['Sprite set'],
        remainingItems: ['Layout', 'Drag and drop', 'Sync'],
        assets: ['design'],
        stallReason: 'lost-interest',
        stallReasonDetails: 'The spark faded after the sprites.',
        currentInterest: 2,
        interestNote: '',
      },
      [
        [200, 'created', 'Logged "Pixel Planner" in the graveyard.'],
        [75, 'status-changed', 'Status changed from Active to Stalled.'],
      ],
    ),
    build(
      'demo-poetry-bot',
      now,
      {
        ...common,
        name: 'Poetry Bot',
        description: 'A bot that writes short poems from a prompt.',
        domain: 'Creative',
        tags: ['Python', 'Writing'],
        startedAt: daysAgoStr(250, now),
        lastWorkedAt: daysAgoStr(200, now),
        status: 'archived',
        progress: 65,
        completedItems: ['The core idea'],
        remainingItems: ['The rest'],
        assets: ['code', 'data'],
        stallReason: 'lost-interest',
        stallReasonDetails: '',
        currentInterest: 2,
        interestNote: '',
        previousStatus: 'stalled',
        archivedAt: daysBefore(now, 140).toISOString(),
        archiveNote: 'Fun to build; I moved on to the ML work. The prompt set is worth keeping.',
        selectedPath: 'archive',
      },
      [
        [250, 'created', 'Logged "Poetry Bot" in the graveyard.'],
        [140, 'path-selected', 'Chose Archive: Let it go with clarity. A valid and valuable outcome.'],
        [140, 'archived', 'Archived. History and assets are kept.'],
        [140, 'archive-note-added', 'Added an archive note.'],
      ],
    ),
    build(
      'demo-old-blog',
      now,
      {
        ...common,
        name: 'Old Blog',
        description: 'My first blog, written in plain HTML.',
        domain: 'Personal',
        tags: ['Writing', 'Web'],
        startedAt: daysAgoStr(420, now),
        lastWorkedAt: daysAgoStr(380, now),
        status: 'archived',
        progress: 80,
        completedItems: ['The core idea'],
        remainingItems: ['The rest'],
        assets: ['documentation'],
        stallReason: 'competing-priorities',
        stallReasonDetails: '',
        currentInterest: 1,
        interestNote: '',
        previousStatus: 'needs-direction',
        archivedAt: daysBefore(now, 60).toISOString(),
        archiveNote: 'Merged into Portfolio v2. Nothing here is needed anymore.',
        selectedPath: 'archive',
      },
      [
        [420, 'created', 'Logged "Old Blog" in the graveyard.'],
        [60, 'path-selected', 'Chose Archive: Let it go with clarity. A valid and valuable outcome.'],
        [60, 'archived', 'Archived. History and assets are kept.'],
        [60, 'archive-note-added', 'Added an archive note.'],
      ],
    ),
  ];
}

/** Keeps one copy of each sample project (by name). User-created projects are never touched. */
export function dedupeSamples(projects: Project[]): { keep: Project[]; drop: Project[] } {
  const seen = new Set<string>();
  const keep: Project[] = [];
  const drop: Project[] = [];
  for (const p of projects) {
    if (p.isDemo) {
      if (seen.has(p.name)) {
        drop.push(p);
        continue;
      }
      seen.add(p.name);
    }
    keep.push(p);
  }
  return { keep, drop };
}

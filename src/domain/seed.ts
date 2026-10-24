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

function build(now: Date, fields: SeedFields, history: Array<[number, EventType, string]>): Project {
  const a = analyzeProject(projectToInput({ ...fields } as Project), now);
  const timeline = history.map(([d, t, text]) => ev(daysBefore(now, d), t, text));
  const last = timeline.at(-1)?.at ?? now.toISOString();
  return {
    id: newId(),
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

export function demoProjects(now: Date = new Date()): Project[] {
  const common = { assetNotes: '', previousStatus: null, archivedAt: null, archiveNote: '', selectedPath: null, interestNote: '' } as const;
  return [
    build(
      now,
      {
        ...common,
        name: 'AI Study App',
        description: 'Turns lecture notes into quiz questions and flashcards, then schedules reviews.',
        domain: 'Software',
        tags: ['Study', 'Python', 'Personal'],
        startedAt: daysAgoStr(210, now),
        lastWorkedAt: daysAgoStr(60, now),
        status: 'stalled',
        progress: 60,
        completedItems: ['Question generator from notes', 'Flashcard review loop', 'Command-line prototype'],
        remainingItems: ['Improve the UI/UX', 'Run user testing with classmates', 'Add spaced-repetition scheduling'],
        assets: ['code', 'documentation'],
        stallReason: 'competing-priorities',
        stallReasonDetails: 'Exams took over and I never found my way back.',
        currentInterest: 4,
        interestNote: 'My friends keep asking if it is finished.',
      },
      [
        [210, 'created', 'Logged "AI Study App" in the graveyard.'],
        [120, 'progress-updated', 'Progress updated from 35% to 60%.'],
        [60, 'status-changed', 'Status changed from Active to Stalled.'],
      ],
    ),
    build(
      now,
      {
        ...common,
        name: 'Travel Planner',
        description: 'A web app that turns a list of places into a sensible day-by-day itinerary.',
        domain: 'Software',
        tags: ['Web', 'API', 'Personal'],
        startedAt: daysAgoStr(260, now),
        lastWorkedAt: daysAgoStr(120, now),
        status: 'needs-direction',
        progress: 25,
        completedItems: ['Trip data model', 'Map search spike'],
        remainingItems: ['Define the MVP', 'Itinerary builder', 'Booking API integration'],
        assets: ['design'],
        stallReason: 'unclear-direction',
        stallReasonDetails: 'Kept adding features instead of deciding who it was for.',
        currentInterest: 3,
        interestNote: '',
      },
      [
        [260, 'created', 'Logged "Travel Planner" in the graveyard.'],
        [120, 'status-changed', 'Status changed from Active to Needs direction.'],
      ],
    ),
    build(
      now,
      {
        ...common,
        name: 'E-commerce Site',
        description: 'A small online shop for handmade goods, with a cart and a product catalogue.',
        domain: 'Business',
        tags: ['Web', 'Design', 'Personal'],
        startedAt: daysAgoStr(150, now),
        lastWorkedAt: daysAgoStr(7, now),
        status: 'active',
        progress: 40,
        completedItems: ['Product catalogue pages', 'Cart UI'],
        remainingItems: ['Checkout flow', 'Payments', 'Admin panel'],
        assets: ['code', 'design', 'data'],
        stallReason: 'unclear-direction',
        stallReasonDetails: 'Not sure who the shop is really for.',
        currentInterest: 3,
        interestNote: '',
      },
      [
        [150, 'created', 'Logged "E-commerce Site" in the graveyard.'],
        [30, 'progress-updated', 'Progress updated from 20% to 40%.'],
      ],
    ),
    build(
      now,
      {
        ...common,
        name: 'Portfolio Redesign',
        description: 'A full redesign of my personal portfolio with case studies and a new type system.',
        domain: 'Creative',
        tags: ['Web', 'Design', 'Personal'],
        startedAt: daysAgoStr(400, now),
        lastWorkedAt: daysAgoStr(300, now),
        status: 'archived',
        previousStatus: 'stalled',
        archivedAt: daysBefore(now, 20).toISOString(),
        archiveNote:
          'I rebuilt my portfolio from a simple template instead, and it was fine. Keeping the type scale and the case-study layout for future projects.',
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
        [400, 'created', 'Logged "Portfolio Redesign" in the graveyard.'],
        [20, 'path-selected', 'Chose Archive: Let it go with clarity. A valid and valuable outcome.'],
        [20, 'archived', 'Archived. History and assets are kept.'],
        [20, 'archive-note-added', 'Added an archive note.'],
      ],
    ),
  ];
}

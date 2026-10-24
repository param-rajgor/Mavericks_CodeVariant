/** Hardcoded demo data — see docs/design-spec.md §4. Single source for both pages;
 * never duplicate a project's name, status or details elsewhere. */

export type ProjectStatus = 'Stalled' | 'In Progress' | 'To Revisit' | 'Archived';
export type ProjectIcon = 'code' | 'box' | 'chart' | 'laptop' | 'sprout' | 'pad';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  icon: ProjectIcon;
  description: string;
  /** 0–100 */
  progress: number;
  lastVisited: string;
  stack: string[];
  /** Empty when the project never stalled (e.g. still In Progress). */
  whyStalled: string;
  reusable: string;
  /** SocialPulse only: vines + gold glow at rest on the landing page (spec §2). */
  featured?: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: 'socialpulse',
    name: 'SocialPulse',
    status: 'Stalled',
    icon: 'code',
    description: 'Social media analytics platform',
    progress: 62,
    lastVisited: '2 months ago',
    stack: ['React', 'TypeScript', 'Supabase'],
    whyStalled: 'Time constraints and pending feature integrations.',
    reusable: 'Analytics modules, database schema, and UI components.',
    featured: true,
  },
  {
    id: 'campuskart',
    name: 'CampusKart',
    status: 'In Progress',
    icon: 'box',
    description: 'Campus marketplace for students',
    progress: 45,
    lastVisited: '1 week ago',
    stack: ['Next.js', 'Tailwind', 'Firebase'],
    whyStalled: '',
    reusable: 'Listing cards and auth flow.',
  },
  {
    id: 'mlclassifier',
    name: 'ML Classifier',
    status: 'To Revisit',
    icon: 'chart',
    description: 'Image classifier experiment',
    progress: 70,
    lastVisited: '3 months ago',
    stack: ['Python', 'PyTorch', 'FastAPI'],
    whyStalled: 'Accuracy plateaued; needed more data.',
    reusable: 'Training pipeline and data loaders.',
  },
  {
    id: 'portfolio',
    name: 'Portfolio v1',
    status: 'Archived',
    icon: 'laptop',
    description: 'First personal portfolio site',
    progress: 100,
    lastVisited: '1 year ago',
    stack: ['HTML', 'CSS', 'JavaScript'],
    whyStalled: 'Replaced by a newer version.',
    reusable: 'Section layouts and animations.',
  },
  {
    id: 'cozyhabit',
    name: 'Cozy Habit App',
    status: 'Stalled',
    icon: 'sprout',
    description: 'Gentle daily habit tracker',
    progress: 30,
    lastVisited: '5 months ago',
    stack: ['React Native', 'Expo'],
    whyStalled: 'Scope grew too fast.',
    reusable: 'Streak logic and illustrations.',
  },
  {
    id: 'gamejam',
    name: 'Game Jam 2025',
    status: 'Stalled',
    icon: 'pad',
    description: '48-hour jam platformer',
    progress: 55,
    lastVisited: '8 months ago',
    stack: ['Godot', 'GDScript'],
    whyStalled: 'Jam ended before polish.',
    reusable: 'Character controller and tileset.',
  },
];

/** The 4 stones shown on the landing page, in order (spec §2). */
export const LANDING_PROJECT_IDS = ['socialpulse', 'campuskart', 'mlclassifier', 'portfolio'] as const;

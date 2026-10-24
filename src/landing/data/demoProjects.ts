import type { Interest, PathId, Project, ProjectStatus, StatusFilter } from "./types";

export interface DemoProjectExtra extends Project {
  progress?: number;
  tags?: string[];
}

/** ILLUSTRATIVE SAMPLE CONTENT — matching the exact projects in the video reference. */
export const DEMO_PROJECTS: DemoProjectExtra[] = [
  {
    id: "demo-socialpulse",
    name: "SocialPulse",
    description: "Social media analytics platform.",
    status: "Stalled",
    lastWorked: "2 months ago",
    progress: 68,
    tags: ["React", "TypeScript", "Supabase"],
    assets: ["React dashboard", "API wrappers", "Chart components", "Competitor research"],
    icon: "code",
    nextStep: "repurpose",
    stalledReason: "Scope grew faster than free time",
    interest: "Medium",
    sample: true,
  },
  {
    id: "demo-campuskart",
    name: "CampusKart",
    description: "Campus marketplace for student gear.",
    status: "In Progress",
    lastWorked: "1 week ago",
    progress: 45,
    tags: ["Next.js", "Tailwind", "Stripe"],
    assets: ["Listing flow", "Seller onboarding mockups", "User interviews"],
    icon: "package",
    nextStep: "continue",
    stalledReason: "Paused during midterms",
    interest: "High",
    sample: true,
  },
  {
    id: "demo-ml-classifier",
    name: "ML Classifier",
    description: "Machine-learning classification project.",
    status: "To Revisit",
    lastWorked: "3 months ago",
    progress: 30,
    tags: ["Python", "PyTorch", "FastAPI"],
    assets: ["Labelled dataset", "Baseline notebook", "Experiment notes"],
    icon: "chart",
    nextStep: "restart",
    stalledReason: "Original approach became too complicated",
    interest: "High",
    sample: true,
  },
  {
    id: "demo-portfolio-v1",
    name: "Portfolio v1",
    description: "Personal portfolio and project showcase.",
    status: "Archived",
    lastWorked: "6 months ago",
    progress: 88,
    tags: ["React", "Tailwind", "Framer Motion"],
    assets: ["Hero illustrations", "Case-study copy", "Design tokens"],
    icon: "layers",
    nextStep: "archive",
    nextStepNote: "Archive, or reuse selected assets",
    interest: "Low",
    sample: true,
  },
  {
    id: "demo-cozy-habit",
    name: "Cozy Habit App",
    description: "Gamified habit tracker with cozy pixel companions.",
    status: "Stalled",
    lastWorked: "4 months ago",
    progress: 55,
    tags: ["React Native", "Expo", "PixelArt"],
    assets: ["Companion sprites", "Streak mechanics", "Widget layout"],
    icon: "sparkles",
    nextStep: "pivot",
    stalledReason: "Lost momentum after college resumed",
    interest: "High",
    sample: true,
  },
  {
    id: "demo-game-jam",
    name: "Game Jam 2025",
    description: "Roguelike dungeon crawler started in 48-hour sprint.",
    status: "Stalled",
    lastWorked: "5 months ago",
    progress: 40,
    tags: ["TypeScript", "Canvas", "GameDev"],
    assets: ["Tileset atlas", "Physics engine", "Enemy AI prototype"],
    icon: "code",
    nextStep: "repurpose",
    stalledReason: "Jam ended before boss mechanics were balanced",
    interest: "Medium",
    sample: true,
  },
];

/** ILLUSTRATIVE demo numbers for the statistics bar. */
export const DEMO_STATS = {
  projectsResting: 12,
  readyToRevive: 3,
  newIdeas: 1,
} as const;

export const STATUS_FILTERS: StatusFilter[] = ["All", "Stalled", "In Progress", "To Revisit", "Archived"];

export const STATUS_LABEL: Record<StatusFilter, string> = {
  All: "All (12)",
  Stalled: "Stalled (4)",
  "In Progress": "Active (2)",
  "To Revisit": "To Revisit",
  Archived: "Archived (2)",
};

/** Accent colours per status (sampled from video). */
export const STATUS_ACCENT: Record<ProjectStatus, string> = {
  Stalled: "#C9A4FF",
  "In Progress": "#A8E6A1",
  "To Revisit": "#FFC857",
  Archived: "#D9CCF5",
};

export const STALL_REASONS = [
  "Lost momentum",
  "Ran out of time",
  "Scope grew too large",
  "Got blocked by something",
  "A better idea came along",
  "Not sure — it just stopped",
] as const;

export const ASSET_OPTIONS = ["Code", "Designs", "Research", "Data", "Writing", "Notes"] as const;

export const INTERESTS: Interest[] = ["Low", "Medium", "High"];

/** Demo heuristic used when a user adds a project. Transparent and local only. */
export function suggestPath(input: {
  status: ProjectStatus;
  reason: string;
  assets: string[];
  interest?: Interest;
}): PathId {
  if (input.status === "Archived") return "archive";
  if (input.interest === "Low") return "archive";
  if (input.reason.includes("Scope") || input.reason.includes("blocked")) return "restart";
  if (input.reason.includes("better idea")) return "pivot";
  if (input.assets.length >= 3 && input.interest !== "High") return "repurpose";
  return "continue";
}

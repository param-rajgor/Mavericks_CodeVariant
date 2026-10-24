import type { Interest, PathId, Project, ProjectStatus, StatusFilter } from "./types";

/** ILLUSTRATIVE SAMPLE CONTENT — not real projects and not live analytics. */
export const DEMO_PROJECTS: Project[] = [
  {
    id: "demo-socialpulse",
    name: "SocialPulse",
    description: "Social media analytics platform.",
    status: "Stalled",
    lastWorked: "2 months ago",
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
    description: "Campus marketplace.",
    status: "In Progress",
    lastWorked: "1 week ago",
    assets: ["Listing flow", "Seller onboarding mockups", "User interviews"],
    icon: "package",
    nextStep: "continue",
    interest: "High",
    sample: true,
  },
  {
    id: "demo-ml-classifier",
    name: "ML Classifier",
    description: "Machine-learning classification project.",
    status: "To Revisit",
    lastWorked: "3 months ago",
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
    description: "Personal portfolio website.",
    status: "Archived",
    lastWorked: "6 months ago",
    assets: ["Hero illustrations", "Case-study copy", "Design tokens"],
    icon: "layers",
    nextStep: "archive",
    nextStepNote: "Archive, or reuse selected assets",
    interest: "Low",
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
  All: "All Projects",
  Stalled: "Stalled",
  "In Progress": "In Progress",
  "To Revisit": "To Revisit",
  Archived: "Archived",
};

/** Accent colours per status (also used for user-created tombstones). */
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
  interest: Interest;
}): PathId {
  if (input.status === "In Progress") return "continue";
  if (input.status === "Archived") return input.assets.length >= 3 ? "repurpose" : "archive";
  if (input.interest === "Low") return input.assets.length >= 2 ? "repurpose" : "archive";
  if (input.reason === "A better idea came along") return "pivot";
  if (input.reason === "Scope grew too large") return "restart";
  if (input.reason === "Ran out of time" && input.interest === "High") return "continue";
  return input.interest === "High" ? "restart" : "pivot";
}

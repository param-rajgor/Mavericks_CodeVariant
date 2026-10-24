export type PathId = "continue" | "restart" | "pivot" | "repurpose" | "archive";

export type ProjectStatus = "Stalled" | "In Progress" | "To Revisit" | "Archived";

export type ProjectIconKey = "code" | "package" | "chart" | "layers" | "sparkles";

export type Interest = "Low" | "Medium" | "High";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  /** Human-readable, e.g. "2 months ago" */
  lastWorked: string;
  assets: string[];
  icon: ProjectIconKey;
  /** Currently suggested path (updated in local React state only). */
  nextStep: PathId;
  /** Optional nuance shown next to the path until the user picks one. */
  nextStepNote?: string;
  stalledReason?: string;
  interest?: Interest;
  /** true for the illustrative seed projects, false for ones added by the user */
  sample: boolean;
  /** Live Relaunch Score (null when not enough information). */
  score?: number | null;
}

export interface RelaunchPath {
  id: PathId;
  label: string;
  tagline: string;
  bestWhen: string;
  steps: string[];
  color: string;
  icon: "play" | "rotate" | "branch" | "layers" | "archive";
}

export type StatusFilter = "All" | ProjectStatus;

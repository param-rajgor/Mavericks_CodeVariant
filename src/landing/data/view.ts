import type { Project as AppProject } from "@/src/domain/types";
import { timeAgo } from "@/src/domain/dates";
import { ASSET_META } from "@/src/domain/paths";
import { analyzeProject, projectToInput } from "@/src/domain/analysis";
import type { Project, ProjectIconKey, ProjectStatus, StatusFilter } from "./types";
import { DEMO_PROJECTS } from "./demoProjects";

export const STATUS_FILTERS: StatusFilter[] = ["All", "Stalled", "In Progress", "To Revisit", "Archived"];

export const STATUS_LABEL: Record<StatusFilter, string> = {
  All: "All (12)",
  Stalled: "Stalled (4)",
  "In Progress": "Active (2)",
  "To Revisit": "To Revisit",
  Archived: "Archived (2)",
};

/** Accent colours per status on the tombstones. */
export const STATUS_ACCENT: Record<ProjectStatus, string> = {
  Stalled: "#C9A4FF",
  "In Progress": "#A8E6A1",
  "To Revisit": "#FFC857",
  Archived: "#D9CCF5",
};

/** The landing page's four tombstone states map onto the app's real statuses. */
const STATUS_MAP: Record<AppProject["status"], ProjectStatus> = {
  active: "In Progress",
  stalled: "Stalled",
  "needs-direction": "To Revisit",
  archived: "Archived",
};

const ICON_BY_DOMAIN: Record<AppProject["domain"], ProjectIconKey> = {
  Software: "code",
  Business: "package",
  Research: "chart",
  Academic: "chart",
  Creative: "layers",
  Personal: "sparkles",
  Other: "sparkles",
};

/** Adapts a real stored project to the landing page's tombstone view-model. */
export function toLandingProject(p: AppProject, now: Date = new Date()): Project & { progress?: number; tags?: string[] } {
  const a = analyzeProject(projectToInput(p), now);
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    status: STATUS_MAP[p.status],
    lastWorked: timeAgo(p.lastWorkedAt, now),
    assets: p.assets.map((x) => ASSET_META[x]?.label ?? x),
    icon: ICON_BY_DOMAIN[p.domain] ?? "code",
    nextStep: p.selectedPath ?? a.recommendation?.path ?? "restart",
    stalledReason: p.stallReasonDetails || p.stallReason || undefined,
    sample: !!p.isDemo,
    score: a.total,
    progress: p.progress,
    tags: p.tags,
  };
}

/** If user has real stored projects, combine or prioritize them with reference demo projects */
export function getMergedProjects(userProjects: AppProject[]): (Project & { progress?: number; tags?: string[] })[] {
  if (userProjects && userProjects.length > 0) {
    const converted = userProjects.map((p) => toLandingProject(p));
    // Check if the demo reference projects (SocialPulse, CampusKart, etc) are in userProjects
    const existingNames = new Set(converted.map((p) => p.name.toLowerCase()));
    const missingReferenceProjects = DEMO_PROJECTS.filter(
      (dp) => !existingNames.has(dp.name.toLowerCase())
    );
    return [...converted, ...missingReferenceProjects];
  }
  return DEMO_PROJECTS;
}

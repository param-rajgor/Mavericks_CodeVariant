import type { Project as AppProject } from "@/src/domain/types";
import { timeAgo } from "@/src/domain/dates";
import { ASSET_META } from "@/src/domain/paths";
import { analyzeProject, projectToInput } from "@/src/domain/analysis";
import type { Project, ProjectIconKey, ProjectStatus, StatusFilter } from "./types";

export const STATUS_FILTERS: StatusFilter[] = ["All", "Stalled", "In Progress", "To Revisit", "Archived"];

export const STATUS_LABEL: Record<StatusFilter, string> = {
  All: "All Projects",
  Stalled: "Stalled",
  "In Progress": "In Progress",
  "To Revisit": "To Revisit",
  Archived: "Archived",
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
export function toLandingProject(p: AppProject, now: Date = new Date()): Project {
  const a = analyzeProject(projectToInput(p), now);
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    status: STATUS_MAP[p.status],
    lastWorked: timeAgo(p.lastWorkedAt, now),
    assets: p.assets.map((x) => ASSET_META[x].label),
    icon: ICON_BY_DOMAIN[p.domain],
    nextStep: p.selectedPath ?? a.recommendation?.path ?? "restart",
    stalledReason: p.stallReason ?? undefined,
    sample: !!p.isDemo,
    score: a.total,
  };
}

/** Tombstone filter -> app status. */
export const FILTER_TO_STATUS: Record<Exclude<StatusFilter, "All">, AppProject["status"]> = {
  Stalled: "stalled",
  "In Progress": "active",
  "To Revisit": "needs-direction",
  Archived: "archived",
};

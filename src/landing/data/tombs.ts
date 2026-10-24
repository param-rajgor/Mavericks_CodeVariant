import type { Project } from "@/src/domain/types";
import { analyzeProject, projectToInput } from "@/src/domain/analysis";

export type TombStatus = "Stalled" | "In Progress" | "To Revisit" | "Archived";

export interface Tomb {
  key: string;
  name: string;
  blurb: string;
  status: TombStatus;
  /** App route this tombstone opens. */
  href: string;
  /** false for placeholder tombstones shown when there is no real project data. */
  real: boolean;
}

/** Placeholder tombstones, used only to fill slots when there is no real project data. */
export const SAMPLE_TOMBS: Tomb[] = [
  { key: "s1", name: "SocialPulse", blurb: "Social media analytics platform.", status: "Stalled", href: "/projects/new", real: false },
  { key: "s2", name: "CampusKart", blurb: "A marketplace for campus life", status: "In Progress", href: "/projects/new", real: false },
  { key: "s3", name: "ML Classifier", blurb: "Machine-learning classification project", status: "To Revisit", href: "/projects/new", real: false },
  { key: "s4", name: "Portfolio v1", blurb: "Personal portfolio website", status: "Archived", href: "/projects/new", real: false },
];

/** The labels painted into the artwork, in order. A tombstone only gets an overlay plaque when it shows something else. */
export const BAKED_TOMBS: ReadonlyArray<{ name: string; status: TombStatus }> = [
  { name: "SocialPulse", status: "Stalled" },
  { name: "CampusKart", status: "In Progress" },
  { name: "ML Classifier", status: "To Revisit" },
  { name: "Portfolio v1", status: "Archived" },
];

export const STATUS_PILL: Record<TombStatus, { bg: string; fg: string }> = {
  Stalled: { bg: "#FFB391", fg: "#5A2410" },
  "In Progress": { bg: "#A8E6A1", fg: "#17421F" },
  "To Revisit": { bg: "#FFD66B", fg: "#4D3700" },
  Archived: { bg: "#DAD2F4", fg: "#2F2A5C" },
};

const MAP: Record<Project["status"], TombStatus> = {
  active: "In Progress",
  stalled: "Stalled",
  "needs-direction": "To Revisit",
  archived: "Archived",
};

/**
 * Real projects fill the four slots. A project whose name matches a painted label keeps that slot (so the
 * artwork's own label shows); other projects take the free slots, most recently touched first, open ones before archived.
 */
export function pickTombs(projects: readonly Project[]): Tomb[] {
  const toTomb = (p: Project): Tomb => ({ key: p.id, name: p.name, blurb: p.description, status: MAP[p.status], href: `/projects/${p.id}`, real: true });
  const slots: (Tomb | null)[] = BAKED_TOMBS.map((b) => {
    const p = projects.find((x) => x.name === b.name && MAP[x.status] === b.status);
    return p ? toTomb(p) : null;
  });
  const used = new Set(slots.filter(Boolean).map((t) => t!.key));
  const rest = projects
    .filter((p) => !used.has(p.id))
    .sort((a, b) => Number(a.status === "archived") - Number(b.status === "archived") || (a.updatedAt < b.updatedAt ? 1 : -1))
    .map(toTomb);
  return slots.map((t, i) => t ?? rest.shift() ?? SAMPLE_TOMBS[i]);
}

export interface LandingStats {
  resting: number;
  ready: number;
  sample: boolean;
}

export function landingStats(projects: readonly Project[]): LandingStats {
  if (projects.length === 0) return { resting: 12, ready: 3, sample: true };
  const open = projects.filter((p) => p.status !== "archived");
  return {
    resting: open.filter((p) => p.status === "stalled" || p.status === "needs-direction").length,
    ready: open.filter((p) => (analyzeProject(projectToInput(p)).total ?? 0) >= 60).length,
    sample: false,
  };
}

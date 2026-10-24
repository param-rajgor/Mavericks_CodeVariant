import {
  Archive,
  ChartColumn,
  CircleCheck,
  CirclePause,
  Code,
  GitBranch,
  Hammer,
  History,
  Layers,
  type LucideProps,
  Package,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";
import type { PathId, ProjectIconKey, ProjectStatus, RelaunchPath } from "@/src/data/types";

const PROJECT_ICONS: Record<ProjectIconKey, ComponentType<LucideProps>> = {
  code: Code,
  package: Package,
  chart: ChartColumn,
  layers: Layers,
  sparkles: Sparkles,
};

export function ProjectIcon({ name, ...props }: { name: ProjectIconKey } & LucideProps) {
  const Cmp = PROJECT_ICONS[name];
  return <Cmp strokeWidth={2.5} {...props} />;
}

const PATH_ICONS: Record<RelaunchPath["icon"], ComponentType<LucideProps>> = {
  play: Play,
  rotate: RotateCcw,
  branch: GitBranch,
  layers: Layers,
  archive: Archive,
};

export function PathIcon({ name, ...props }: { name: RelaunchPath["icon"] } & LucideProps) {
  const Cmp = PATH_ICONS[name];
  return <Cmp strokeWidth={2.5} {...props} />;
}

/** Status glyphs so status is never communicated by colour alone. */
const STATUS_ICONS: Record<ProjectStatus, ComponentType<LucideProps>> = {
  Stalled: CirclePause,
  "In Progress": Hammer,
  "To Revisit": History,
  Archived: CircleCheck,
};

export function StatusIcon({ status, ...props }: { status: ProjectStatus } & LucideProps) {
  const Cmp = STATUS_ICONS[status];
  return <Cmp strokeWidth={2.5} {...props} />;
}

/** 16×16 pixel-art rocket sprite. */
export function PixelRocket({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      {/* flame */}
      <rect x="3" y="12" width="2" height="2" fill="#FFAB83" />
      <rect x="4" y="11" width="1" height="1" fill="#FFC857" />
      <rect x="2" y="13" width="1" height="1" fill="#FFC857" />
      {/* fins */}
      <rect x="4" y="8" width="2" height="2" fill="#A982F2" />
      <rect x="7" y="11" width="2" height="2" fill="#A982F2" />
      {/* body */}
      <rect x="8" y="3" width="3" height="1" fill="#FFF1D2" />
      <rect x="6" y="4" width="6" height="1" fill="#FFF1D2" />
      <rect x="5" y="5" width="6" height="1" fill="#FFF1D2" />
      <rect x="5" y="6" width="6" height="1" fill="#FFF1D2" />
      <rect x="5" y="7" width="6" height="1" fill="#FFF1D2" />
      <rect x="6" y="8" width="5" height="1" fill="#E5D4F8" />
      <rect x="6" y="9" width="4" height="1" fill="#E5D4F8" />
      <rect x="7" y="10" width="3" height="1" fill="#C9A4FF" />
      {/* nose */}
      <rect x="12" y="2" width="2" height="2" fill="#F1A0E8" />
      <rect x="11" y="3" width="1" height="1" fill="#F1A0E8" />
      <rect x="13" y="1" width="1" height="1" fill="#F1A0E8" />
      {/* window */}
      <rect x="8" y="5" width="2" height="2" fill="#5543A5" />
      <rect x="8" y="5" width="1" height="1" fill="#7FD4FF" />
      {/* outline hints */}
      <rect x="4" y="7" width="1" height="1" fill="#17183E" />
      <rect x="6" y="10" width="1" height="1" fill="#17183E" />
    </svg>
  );
}

export function PixelArrow({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <rect x="0" y="3" width="8" height="2" fill="currentColor" />
      <rect x="3" y="1" width="2" height="1" fill="currentColor" />
      <rect x="5" y="2" width="2" height="1" fill="currentColor" />
      <rect x="5" y="5" width="2" height="1" fill="currentColor" />
      <rect x="3" y="6" width="2" height="1" fill="currentColor" />
    </svg>
  );
}

export function PixelSparkle({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path fill="currentColor" d="M3 0h1v2h1v1h2v1H5v1H4v2H3V5H2V4H0V3h2V2h1z" />
    </svg>
  );
}

export function pathColorVar(id: PathId): string {
  return `var(--color-path-${id})`;
}

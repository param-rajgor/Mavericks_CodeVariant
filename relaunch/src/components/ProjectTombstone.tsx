import { motion } from "motion/react";
import { STATUS_ACCENT } from "@/src/data/demoProjects";
import { PATH_BY_ID } from "@/src/data/relaunchPaths";
import type { Project } from "@/src/data/types";
import { PathBadge } from "./PathBadge";
import { ProjectIcon, StatusIcon } from "./icons";

interface Props {
  project: Project;
  onOpen: (id: string) => void;
  isNew?: boolean;
}

/** Pixel-art stone monument built from clipped CSS boxes (no emoji, no raster art). */
export function ProjectTombstone({ project, onOpen, isNew }: Props) {
  const accent = STATUS_ACCENT[project.status];
  const path = PATH_BY_ID[project.nextStep];
  const suggestion = project.nextStepNote ?? path.label;

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(project.id)}
      whileHover={{ y: -8 }}
      whileTap={{ y: -2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      data-status={project.status}
      aria-label={`${project.name}. ${project.description} Status: ${project.status}. Last worked ${project.lastWorked}. Suggested next step: ${suggestion}. Open details.`}
      className="tomb group relative mx-auto flex w-full max-w-[250px] flex-col items-stretch text-left"
      style={{ ["--accent" as string]: accent }}
    >
      {/* hover label */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-11 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap opacity-0 md:block transition-opacity [transition-timing-function:steps(2)] group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <span className="px-box block bg-soft px-3 py-1.5 font-mono text-[11px] font-bold uppercase text-navy" style={{ ["--d" as string]: "4px" }}>
          Next: {suggestion}
        </span>
      </span>

      {/* sparkles on hover */}
      {[
        ["8%", "18%", "0s"],
        ["88%", "30%", "0.35s"],
        ["20%", "62%", "0.7s"],
      ].map(([l, t, d], i) => (
        <span
          key={i}
          aria-hidden="true"
          className="tomb-spark absolute z-10 h-1.5 w-1.5"
          style={{ left: l, top: t, background: accent, animationDelay: d }}
        />
      ))}

      <span className="tomb-glow relative block">
        <span
          className="tomb-outer relative block p-[4px] transition-[background-color] duration-150 group-hover:bg-[var(--accent)]"
          style={{ background: "#0d0e2b" }}
        >
          <span className="tomb-inner tomb-stone relative flex min-h-[250px] flex-col items-center px-4 pb-7 pt-9 text-center">
            {/* vines */}
            <span
              aria-hidden="true"
              className="vine absolute left-1 top-8 h-20 w-2"
              style={{ background: "repeating-linear-gradient(180deg,#7dbd65 0 6px,#4f8741 6px 10px)" }}
            />
            <span
              aria-hidden="true"
              className="vine absolute left-3 top-14 h-9 w-2"
              style={{ background: "repeating-linear-gradient(180deg,#a8e6a1 0 4px,#5e9a4c 4px 8px)" }}
            />

            {isNew && (
              <span className="absolute right-3 top-9 bg-gold px-1.5 py-0.5 font-pixel text-[8px] text-navy">NEW</span>
            )}

            <span className="tomb-flag mb-3 flex h-12 w-12 items-center justify-center border-2 border-navy bg-navy/70" style={{ color: accent }}>
              <ProjectIcon name={project.icon} size={26} aria-hidden="true" />
            </span>
            <span className="font-pixel text-[11px] leading-snug text-soft [overflow-wrap:anywhere]">{project.name}</span>
            <span className="mt-2 text-[13px] leading-snug text-[#d8d3f5]">{project.description}</span>

            <span
              className="tomb-ping mt-3 inline-flex items-center gap-1.5 border-2 border-navy px-2 py-1 font-mono text-[11px] font-bold uppercase text-navy"
              style={{ background: accent }}
            >
              <StatusIcon status={project.status} size={13} aria-hidden="true" />
              {project.status}
            </span>
            <span className="mt-2 font-mono text-[11px] text-[#bdb7ea]">Last worked: {project.lastWorked}</span>
            <PathBadge id={project.nextStep} note={project.nextStepNote ? "Archive / reuse" : undefined} className="mt-3 md:hidden" />
          </span>
        </span>
      </span>
      <span aria-hidden="true" className="tomb-grass -mt-1 w-full" />
    </motion.button>
  );
}

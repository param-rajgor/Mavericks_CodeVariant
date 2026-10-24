import { useId, useState } from "react";
import { PATH_BY_ID, RELAUNCH_PATHS } from "@/src/data/relaunchPaths";
import { STATUS_ACCENT } from "@/src/data/demoProjects";
import type { PathId, Project } from "@/src/data/types";
import { scrollToId } from "@/src/lib/scroll";
import { Modal } from "./Modal";
import { PathBadge } from "./PathBadge";
import { PixelButton } from "./PixelButton";
import { PathIcon, ProjectIcon, StatusIcon } from "./icons";

interface Props {
  project: Project;
  onClose: () => void;
  onChoosePath: (projectId: string, path: PathId) => void;
  onSeeAllPaths: (projectId: string) => void;
}

export function ProjectDetailDialog({ project, onClose, onChoosePath, onSeeAllPaths }: Props) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const [showPaths, setShowPaths] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const accent = STATUS_ACCENT[project.status];
  const path = PATH_BY_ID[project.nextStep];

  return (
    <Modal titleId={titleId} descId={descId} onClose={onClose} accent={path.color} initialFocus="[data-autofocus]">
      <div className="p-6 pt-8 sm:p-8">
        <div className="flex items-start gap-4 pr-14">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center border-[3px] border-navy bg-navy" style={{ color: accent }}>
            <ProjectIcon name={project.icon} size={30} aria-hidden="true" />
          </span>
          <div>
            <h2 id={titleId} className="font-pixel text-[14px] leading-snug text-soft sm:text-[16px]">
              {project.name}
            </h2>
            <p id={descId} className="mt-2 text-[15px] leading-relaxed text-[#e4e0fa]">
              {project.description}
              {project.sample && <span className="ml-2 font-mono text-[11px] uppercase text-lavender">(sample project)</span>}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border-[3px] border-twilight bg-navy/70 p-3">
            <dt className="font-mono text-[11px] uppercase tracking-widest text-lavender">Current status</dt>
            <dd className="mt-2">
              <span
                className="inline-flex items-center gap-1.5 border-2 border-navy px-2 py-1 font-mono text-[12px] font-bold uppercase text-navy"
                style={{ background: accent }}
              >
                <StatusIcon status={project.status} size={14} aria-hidden="true" />
                {project.status}
              </span>
            </dd>
          </div>
          <div className="border-[3px] border-twilight bg-navy/70 p-3">
            <dt className="font-mono text-[11px] uppercase tracking-widest text-lavender">Last worked</dt>
            <dd className="mt-2 font-mono text-[14px] text-cream">{project.lastWorked}</dd>
          </div>
          {project.stalledReason && (
            <div className="border-[3px] border-twilight bg-navy/70 p-3">
              <dt className="font-mono text-[11px] uppercase tracking-widest text-lavender">Why it paused</dt>
              <dd className="mt-2 text-[14px] text-cream">{project.stalledReason}</dd>
            </div>
          )}
          {project.interest && (
            <div className="border-[3px] border-twilight bg-navy/70 p-3">
              <dt className="font-mono text-[11px] uppercase tracking-widest text-lavender">Interest level</dt>
              <dd className="mt-2 font-mono text-[14px] text-cream">{project.interest}</dd>
            </div>
          )}
        </dl>

        <section className="mt-6" aria-labelledby={`${uid}-assets`}>
          <h3 id={`${uid}-assets`} className="font-mono text-[11px] uppercase tracking-widest text-lavender">
            Existing assets
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {project.assets.length ? (
              project.assets.map((a) => (
                <li key={a} className="border-2 border-twilight bg-indigo px-2.5 py-1 font-mono text-[12px] text-cream">
                  {a}
                </li>
              ))
            ) : (
              <li className="text-[14px] text-[#c9c4ee]">No assets listed yet.</li>
            )}
          </ul>
        </section>

        <section className="mt-6 border-[3px] p-4" style={{ borderColor: path.color, background: "rgba(23,24,62,.7)" }} aria-labelledby={`${uid}-next`}>
          <h3 id={`${uid}-next`} className="font-mono text-[11px] uppercase tracking-widest text-lavender">
            Suggested next step
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <PathBadge id={project.nextStep} />
            <span className="text-[14px] text-cream">{project.nextStepNote ?? path.tagline}</span>
          </div>
        </section>

        {showPaths && (
          <div className="mt-5" role="group" aria-label="Choose a path for this project">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {RELAUNCH_PATHS.map((p) => {
                const on = project.nextStep === p.id && !project.nextStepNote;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        onChoosePath(project.id, p.id);
                        setConfirmed(`Next step set to ${p.label} (demo only — kept in this browser session's memory).`);
                      }}
                      className="flex min-h-[48px] w-full items-center gap-3 border-[3px] px-3 py-2 text-left text-[14px] font-bold text-navy"
                      style={{ background: p.color, borderColor: on ? "#FFF9F2" : "#17183E", boxShadow: on ? "0 0 0 3px #17183E" : undefined }}
                    >
                      <PathIcon name={p.icon} size={18} aria-hidden="true" />
                      <span className="flex-1">{p.label}</span>
                      {on && <span className="font-mono text-[10px] uppercase">selected</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[13px]" role="status" aria-live="polite">
              {confirmed ? <span className="text-mint">{confirmed}</span> : <span className="text-[#c9c4ee]">Pick a path to update this project's suggested next step.</span>}
            </p>
            <button
              type="button"
              className="mt-2 min-h-[44px] font-mono text-[12px] font-bold uppercase tracking-wide text-gold underline decoration-2 underline-offset-4 hover:text-cream"
              onClick={() => {
                onSeeAllPaths(project.id);
                onClose();
                window.setTimeout(() => scrollToId("paths"), 60);
              }}
            >
              Read about all five paths ↓
            </button>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-4">
          <PixelButton variant="gold" size="sm" accent="arrow" onClick={() => setShowPaths((v) => !v)}>
            {showPaths ? "Hide paths" : "View available paths"}
          </PixelButton>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            className="min-h-[44px] px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-cream underline decoration-2 underline-offset-4 hover:text-gold"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

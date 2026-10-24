import { useId, useState } from "react";
import { PATH_BY_ID, RELAUNCH_PATHS } from "@/src/landing/data/relaunchPaths";
import { STATUS_ACCENT, type DemoProjectExtra } from "@/src/landing/data/demoProjects";
import type { PathId, Project } from "@/src/landing/data/types";
import { scrollToId } from "@/src/landing/lib/scroll";
import { Modal } from "./Modal";
import { PathBadge } from "./PathBadge";
import { PixelButton } from "./PixelButton";
import { PathIcon, ProjectIcon, StatusIcon } from "./icons";

interface Props {
  project: DemoProjectExtra;
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

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <PixelButton
              variant="gold"
              size="sm"
              accent="arrow"
              data-autofocus
              onClick={() => {
                onChoosePath(project.id, project.nextStep);
                setConfirmed(`Saved ${path.label} for ${project.name}`);
                window.setTimeout(onClose, 850);
              }}
            >
              Take this path
            </PixelButton>
            <button
              type="button"
              className="font-mono text-[12px] font-bold uppercase text-gold underline underline-offset-4"
              onClick={() => setShowPaths((v) => !v)}
              aria-expanded={showPaths}
            >
              {showPaths ? "Hide other paths" : "Choose a different path"}
            </button>
          </div>

          {confirmed && (
            <p className="mt-3 font-mono text-[12px] text-mint" role="status">
              ✓ {confirmed}
            </p>
          )}

          {showPaths && (
            <div className="mt-4 border-t-2 border-twilight pt-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-lavender">Select any revival path:</p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {RELAUNCH_PATHS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChoosePath(project.id, p.id);
                      setConfirmed(`Updated to ${p.label}`);
                      window.setTimeout(onClose, 850);
                    }}
                    className="flex items-center gap-2 border-2 border-navy p-2 text-left font-mono text-[12px] text-navy transition-transform hover:scale-[1.02]"
                    style={{ background: p.color }}
                  >
                    <PathIcon name={p.icon} size={16} aria-hidden="true" />
                    <span className="font-bold">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="font-mono text-[12px] text-lavender underline underline-offset-4"
            onClick={() => {
              onSeeAllPaths(project.id);
              onClose();
              window.setTimeout(() => scrollToId("paths"), 60);
            }}
          >
            Explore all five paths in detail →
          </button>
          <PixelButton variant="ghost" size="sm" onClick={onClose}>
            Close
          </PixelButton>
        </div>
      </div>
    </Modal>
  );
}

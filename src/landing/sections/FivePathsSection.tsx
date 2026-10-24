import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { PathCard } from "@/src/landing/components/PathCard";
import { PathBadge } from "@/src/landing/components/PathBadge";
import { PixelButton } from "@/src/landing/components/PixelButton";
import { Reveal } from "@/src/landing/components/Reveal";
import { ScrollReveal } from "@/src/landing/components/ScrollReveal";
import { PathIcon } from "@/src/landing/components/icons";
import { RELAUNCH_PATHS, PATH_BY_ID } from "@/src/landing/data/relaunchPaths";
import type { PathId, Project } from "@/src/landing/data/types";
import { useReducedMotion } from "@/src/landing/hooks/useReducedMotion";
import { PathwayScene } from "./PathwayScene";

interface Props {
  projects: Project[];
  activeId: string;
  onActiveChange: (id: string) => void;
  /** Persists the choice and resolves to a message for the user. */
  onChoose: (projectId: string, path: PathId) => Promise<string>;
}

const SPANS = ["lg:col-span-2", "lg:col-span-2", "lg:col-span-2", "lg:col-span-3", "lg:col-span-3"];

export function FivePathsSection({ projects, activeId, onActiveChange, onChoose }: Props) {
  const uid = useId();
  const panelId = `${uid}-panel`;
  const [selected, setSelected] = useState<PathId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const reduced = useReducedMotion();

  const active = projects.find((p) => p.id === activeId) ?? projects[0];
  const path = selected ? PATH_BY_ID[selected] : null;

  return (
    <section id="paths" aria-labelledby="paths-title" className="relative z-10 bg-gradient-to-b from-navy/[0.92] via-indigo/[0.94] to-[#3a2f86]/[0.96]">
      <div className="mx-auto w-[90%] max-w-[1280px] pb-20 pt-20 sm:pb-24 sm:pt-28">
        <Reveal>
          <p className="font-pixel text-[10px] uppercase tracking-wider text-gold sm:text-[11px]">02 / CHOOSE YOUR NEXT CHAPTER</p>
        </Reveal>
        <Reveal as="h2" delay={0.05} className="mt-5 max-w-3xl text-[clamp(1.9rem,4.2vw,3.4rem)] font-extrabold leading-[1.08] text-soft">
          <span id="paths-title">Every project has a next move.</span>
        </Reveal>
        <Reveal as="p" delay={0.12} className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#e1dcf8]">
          Not every idea needs to be finished. Some need a fresh start, some need a new direction, and some are ready to rest.
        </Reveal>

        <ScrollReveal className="mt-12 grid grid-cols-1 gap-x-6 gap-y-8 pb-3 sm:grid-cols-2 lg:grid-cols-6">
          {RELAUNCH_PATHS.map((p, i) => (
            <div key={p.id} className={SPANS[i]}>
              <PathCard path={p} index={i} selected={selected === p.id} onSelect={(id) => { setSelected((cur) => (cur === id ? null : id)); setNotice(null); }} panelId={panelId} />
            </div>
          ))}
        </ScrollReveal>

        {/* focused detail panel */}
        <div id={panelId} className="mt-10" aria-live="polite">
          <AnimatePresence mode="wait">
            {path ? (
              <motion.div
                key={path.id}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="px-box bg-navy p-6 sm:p-8"
                style={{ ["--bc" as string]: path.color, ["--sh" as string]: path.color + "44" }}
              >
                <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="sprite-hop flex h-16 w-16 shrink-0 items-center justify-center border-[3px] border-navy text-navy" style={{ background: path.color }}>
                        <PathIcon name={path.icon} size={32} aria-hidden="true" />
                      </span>
                      <h3 className="font-pixel text-[16px] uppercase leading-snug sm:text-[20px]" style={{ color: path.color }}>
                        {path.label}
                      </h3>
                    </div>
                    <p className="mt-5 text-[20px] font-bold leading-snug text-soft">{path.tagline}</p>
                    <p className="mt-3 text-[16px] leading-relaxed text-[#e1dcf8]">{path.bestWhen}</p>
                    <h4 className="mt-6 font-mono text-[11px] uppercase tracking-widest text-lavender">Example next steps</h4>
                    <ul className="mt-3 space-y-2.5">
                      {path.steps.map((s) => (
                        <li key={s} className="flex items-start gap-3 text-[16px] text-cream">
                          <span aria-hidden="true" className="mt-[7px] h-2.5 w-2.5 shrink-0" style={{ background: path.color }} />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-[3px] p-5" style={{ borderColor: path.color + "99", background: "rgba(34,36,95,.6)" }}>
                    <label htmlFor={`${uid}-project`} className="block font-mono text-[11px] font-bold uppercase tracking-widest text-lavender">
                      Apply to project
                    </label>
                    <select id={`${uid}-project`} className="px-input mt-2" value={active?.id} onChange={(e) => { onActiveChange(e.target.value); setNotice(null); }}>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {active && (
                      <p className="mt-4 flex flex-wrap items-center gap-2 text-[14px] text-[#e1dcf8]">
                        Currently suggested:
                        <PathBadge id={active.nextStep} note={active.nextStepNote ? "Archive / reuse" : undefined} />
                      </p>
                    )}
                    <div className="mt-5">
                      <PixelButton
                        variant="gold"
                        size="sm"
                        accent="arrow"
                        disabled={!active}
                        onClick={async () => {
                          if (!active) return;
                          setNotice(await onChoose(active.id, path.id));
                        }}
                      >
                        Choose This Path
                      </PixelButton>
                    </div>
                    <p className="mt-4 min-h-[1.5em] text-[13px] leading-snug text-mint" role="status">
                      {notice}
                    </p>
                    {active && (
                      <a
                        href={`#/projects/${active.id}/decision`}
                        className="mt-2 inline-flex min-h-[44px] items-center font-mono text-[12px] font-bold uppercase tracking-wide text-gold underline decoration-2 underline-offset-4 hover:text-cream"
                      >
                        See the score and reasoning for {active.name}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.p key="empty" initial={false} className="border-[3px] border-dashed border-twilight p-6 text-center font-mono text-[13px] text-[#c9c4ee]">
                Select a signpost above to read what each path means and apply it to one of your projects.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <PathwayScene />
    </section>
  );
}

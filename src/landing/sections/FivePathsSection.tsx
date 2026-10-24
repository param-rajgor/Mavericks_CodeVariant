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
  onChoose: (projectId: string, path: PathId) => void;
}

const SPANS = ["lg:col-span-2", "lg:col-span-2", "lg:col-span-2", "lg:col-span-3", "lg:col-span-3"];

export function FivePathsSection({ projects, activeId, onActiveChange, onChoose }: Props) {
  const uid = useId();
  const panelId = `${uid}-panel`;
  const [selected, setSelected] = useState<PathId | null>("continue");
  const [notice, setNotice] = useState<string | null>(null);
  const reduced = useReducedMotion();

  const active = projects.find((p) => p.id === activeId) ?? projects[0];
  const path = selected ? PATH_BY_ID[selected] : null;

  return (
    <section id="paths" aria-labelledby="paths-title" className="relative z-10 bg-gradient-to-b from-navy/[0.94] via-indigo/[0.96] to-[#2A1B6B] border-t-2 border-[#5543A5]">
      <div className="mx-auto w-[90%] max-w-[1280px] pb-20 pt-16 sm:pb-24 sm:pt-24">
        <Reveal>
          <p className="font-pixel text-[10px] uppercase tracking-wider text-gold sm:text-[11px]">02 / CHOOSE YOUR NEXT CHAPTER</p>
        </Reveal>
        <Reveal as="h2" delay={0.05} className="mt-4 max-w-3xl text-[clamp(1.9rem,4.2vw,3.2rem)] font-extrabold leading-[1.08] text-soft">
          <span id="paths-title" className="font-pixel text-[clamp(1.4rem,2.8vw,2.4rem)] text-cream">
            EVERY PROJECT HAS A NEXT MOVE.
          </span>
        </Reveal>
        <Reveal as="p" delay={0.12} className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#e1dcf8]">
          Not every idea needs to be finished. Some need a fresh start, some need a pivot, and some are ready to rest with dignity.
        </Reveal>

        <ScrollReveal className="mt-10 grid grid-cols-1 gap-x-5 gap-y-6 pb-3 sm:grid-cols-2 lg:grid-cols-6">
          {RELAUNCH_PATHS.map((p, i) => (
            <div key={p.id} className={SPANS[i]}>
              <PathCard
                path={p}
                index={i}
                selected={selected === p.id}
                onSelect={(id) => {
                  setSelected((cur) => (cur === id ? null : id));
                  setNotice(null);
                }}
                panelId={panelId}
              />
            </div>
          ))}
        </ScrollReveal>

        {/* focused detail panel */}
        <div id={panelId} className="mt-10" aria-live="polite">
          <AnimatePresence mode="wait">
            {path && (
              <motion.div
                key={path.id}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="px-box bg-navy p-6 sm:p-8 border-2 border-gold"
                style={{ ["--bc" as string]: path.color, ["--sh" as string]: path.color + "44" }}
              >
                <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="sprite-hop flex h-14 w-14 shrink-0 items-center justify-center border-[3px] border-navy text-navy" style={{ background: path.color }}>
                        <PathIcon name={path.icon} size={28} aria-hidden="true" />
                      </span>
                      <h3 className="font-pixel text-[15px] uppercase leading-snug sm:text-[18px]" style={{ color: path.color }}>
                        {path.label}
                      </h3>
                    </div>
                    <p className="mt-4 text-[18px] font-bold leading-snug text-soft">{path.tagline}</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#e1dcf8]">{path.bestWhen}</p>
                    <h4 className="mt-5 font-mono text-[11px] uppercase tracking-widest text-lavender">Example next steps</h4>
                    <ul className="mt-2.5 space-y-2">
                      {path.steps.map((s) => (
                        <li key={s} className="flex items-start gap-2.5 text-[15px] text-cream">
                          <span aria-hidden="true" className="mt-[7px] h-2 w-2 shrink-0" style={{ background: path.color }} />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-[3px] p-5" style={{ borderColor: path.color + "99", background: "rgba(34,36,95,.6)" }}>
                    <label htmlFor={`${uid}-project`} className="block font-mono text-[11px] font-bold uppercase tracking-widest text-lavender">
                      Test on a project:
                    </label>
                    <select
                      id={`${uid}-project`}
                      className="px-input mt-2"
                      value={active?.id}
                      onChange={(e) => {
                        onActiveChange(e.target.value);
                        setNotice(null);
                      }}
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    {active && (
                      <div className="mt-4 border-t border-twilight/50 pt-3">
                        <p className="text-[14px] text-cream">{active.description}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="font-mono text-[11px] text-lavender">Current path:</span>
                          <PathBadge id={active.nextStep} />
                        </div>
                      </div>
                    )}

                    <div className="mt-5">
                      <PixelButton
                        variant="gold"
                        size="sm"
                        accent="arrow"
                        onClick={() => {
                          if (active) {
                            onChoose(active.id, path.id);
                            setNotice(`Saved "${path.label}" for ${active.name}!`);
                          }
                        }}
                      >
                        Assign {path.label} to {active?.name ?? "Project"}
                      </PixelButton>
                      {notice && (
                        <p className="mt-2 font-mono text-[12px] text-mint" role="status">
                          ✓ {notice}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ambient pixel pathway illustration */}
        <div className="mt-16">
          <PathwayScene />
        </div>
      </div>
    </section>
  );
}

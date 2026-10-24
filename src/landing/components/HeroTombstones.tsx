import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { STATUS_ACCENT, DEMO_PROJECTS, type DemoProjectExtra } from "@/src/landing/data/demoProjects";
import { ProjectIcon } from "./icons";

interface Props {
  projects?: DemoProjectExtra[];
  onSelectProject: (projectId: string) => void;
}

/**
 * The four hero landscape tombstones matching the opening scene of the video reference.
 * Integrated directly into the meadow foreground with grass, vines, glowing auras, and hover tooltips.
 */
export function HeroTombstones({ projects = DEMO_PROJECTS, onSelectProject }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Take the first 4 projects: SocialPulse, CampusKart, ML Classifier, Portfolio v1
  const heroItems = projects.slice(0, 4);

  return (
    <div
      data-tombstone="true"
      className="hero-tomb relative z-20 mx-auto w-full max-w-[1040px] px-2 sm:px-4"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5 md:gap-7 items-end">
        {heroItems.map((project, index) => {
          const accent = STATUS_ACCENT[project.status];
          const isHovered = hoveredId === project.id;
          const isSocialPulse = project.name.toLowerCase().includes("socialpulse");

          return (
            <div
              key={project.id}
              className="relative flex flex-col items-center group cursor-pointer"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectProject(project.id)}
            >
              {/* Tooltip speech bubble on hover (matching video 00:06 & 00:20) */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="pointer-events-none absolute -top-20 sm:-top-24 left-1/2 -translate-x-1/2 z-40 w-48 sm:w-56"
                  >
                    <div
                      className="px-box bg-soft p-2.5 sm:p-3 text-navy shadow-[0_8px_16px_rgba(13,14,43,0.7)]"
                      style={{ ["--bc" as string]: "#17183E", ["--sh" as string]: "#0D0E2B", ["--d" as string]: "4px" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-[9px] sm:text-[10px] font-bold text-navy truncate">
                          {project.name}
                        </span>
                        <span className="font-pixel text-[8px] text-twilight">→</span>
                      </div>
                      <p className="mt-1 text-[11px] sm:text-[12px] leading-snug text-[#4A4B7A] line-clamp-2">
                        {project.description}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between border-t border-[#DDD5F8] pt-1">
                        <span className="font-mono text-[9px] uppercase font-bold text-twilight">
                          Click to inspect
                        </span>
                        <span className="font-pixel text-[8px] px-1 py-0.2" style={{ backgroundColor: accent }}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    {/* Tooltip triangle tail */}
                    <div className="mx-auto -mt-[1px] h-2 w-3 [clip-path:polygon(50%_100%,0_0,100%_0)] bg-[#17183E]" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Physical Tombstone Monument */}
              <motion.div
                whileHover={{ y: -6 }}
                whileTap={{ y: -2 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`relative w-full max-w-[210px] transition-all duration-200 ${
                  isHovered || isSocialPulse
                    ? "drop-shadow-[0_0_12px_rgba(255,200,87,0.55)]"
                    : "drop-shadow-[0_4px_8px_rgba(13,14,43,0.6)]"
                }`}
              >
                {/* Stepped outer stone shape */}
                <div
                  className="tomb-outer p-[3px] sm:p-[4px] transition-colors duration-150"
                  style={{
                    backgroundColor: isHovered ? accent : "#1D1E45",
                    boxShadow: isHovered ? `0 0 16px ${accent}88` : undefined,
                  }}
                >
                  {/* Stepped inner stone body */}
                  <div className="tomb-inner relative flex min-h-[145px] sm:min-h-[175px] flex-col items-center bg-[#2B2C5C] px-2.5 pb-3.5 pt-5 sm:px-3 sm:pb-4 sm:pt-6 text-center">
                    {/* Vine climbing the left side on SocialPulse (and other stalled projects) */}
                    {(isSocialPulse || index === 0) && (
                      <div
                        aria-hidden="true"
                        className="vine absolute left-1 sm:left-1.5 top-5 sm:top-6 h-16 sm:h-20 w-2 pointer-events-none"
                        style={{ background: "repeating-linear-gradient(180deg,#7DBD65 0 6px,#4F8741 6px 10px)" }}
                      />
                    )}

                    {/* Small icon badge in stone */}
                    <div
                      className="mb-2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center border-2 border-navy bg-[#17183E]/80 transition-transform group-hover:scale-110"
                      style={{ color: accent }}
                    >
                      <ProjectIcon name={project.icon} size={index === 0 ? 20 : 18} aria-hidden="true" />
                    </div>

                    {/* Project Title */}
                    <h3 className="font-pixel text-[9px] sm:text-[11px] leading-tight text-soft px-text-shadow-sm truncate max-w-full">
                      {project.name}
                    </h3>

                    {/* Status Badge */}
                    <span
                      className="mt-2 inline-flex items-center gap-1 border border-navy px-1.5 py-0.5 sm:px-2 sm:py-1 font-mono text-[9px] sm:text-[10px] font-bold uppercase text-navy"
                      style={{ backgroundColor: accent }}
                    >
                      {project.status}
                    </span>

                    {/* Optional subtle subtitle on larger screens */}
                    <span className="mt-1.5 hidden font-mono text-[9px] text-[#C9C4EE] sm:block truncate max-w-[90%]">
                      {project.lastWorked}
                    </span>
                  </div>
                </div>

                {/* Pixel grass tuft anchoring the base */}
                <div
                  aria-hidden="true"
                  className="tomb-grass -mt-2 w-full relative z-10"
                />

                {/* Tiny daisies and flowers at the base */}
                <div className="pointer-events-none absolute -bottom-1 left-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-cream ring-1 ring-[#FFC857]" />
                  <div className="h-1 w-1 rounded-full bg-cream" />
                </div>
                <div className="pointer-events-none absolute -bottom-1 right-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-cream ring-1 ring-[#FFC857]" />
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

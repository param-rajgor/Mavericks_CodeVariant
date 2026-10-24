import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Sparkles, X, ArrowRight, ExternalLink } from "lucide-react";
import { STATUS_ACCENT, type DemoProjectExtra } from "@/src/landing/data/demoProjects";
import { ProjectIcon, StatusIcon } from "@/src/landing/components/icons";
import { PixelButton } from "@/src/landing/components/PixelButton";
import { Reveal } from "@/src/landing/components/Reveal";
import type { StatusFilter } from "@/src/landing/data/types";

interface Props {
  projects: DemoProjectExtra[];
  onOpenAppProject: (id: string) => void;
  onPlantProject: () => void;
}

/**
 * The Interactive Project Graveyard section matching 00:11 to 00:28 of the reference video.
 * Features:
 * - Subheader tabs: Graveyard, Project Journal, Decision Shrine, Archive
 * - Interactive filter tabs: ALL (12), STALLED (4), ACTIVE (2), ARCHIVED (2)
 * - Realtime project search
 * - Sort selector
 * - + PLANT A PROJECT button
 * - Animated meadow with tombstones
 * - Floating inspector card on the right: "✦ PROJECT FOUND! ✦"
 */
export function ProjectGraveyardSection({
  projects,
  onOpenAppProject,
  onPlantProject,
}: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>("demo-socialpulse");
  const [sortBy, setSortBy] = useState<"last-visited" | "progress" | "name">("last-visited");

  // Filter & Search logic
  const filteredProjects = useMemo(() => {
    let list = [...projects];

    if (activeFilter === "Stalled") {
      list = list.filter((p) => p.status === "Stalled");
    } else if (activeFilter === "Active" || activeFilter === "In Progress") {
      list = list.filter((p) => p.status === "In Progress");
    } else if (activeFilter === "Archived") {
      list = list.filter((p) => p.status === "Archived");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === "progress") {
      list.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [projects, activeFilter, searchQuery, sortBy]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: projects.length,
      stalled: projects.filter((p) => p.status === "Stalled").length,
      active: projects.filter((p) => p.status === "In Progress").length,
      archived: projects.filter((p) => p.status === "Archived").length,
    };
  }, [projects]);

  // Selected project for the Inspector Card
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) ?? filteredProjects[0] ?? null;
  }, [projects, selectedProjectId, filteredProjects]);

  return (
    <section
      id="graveyard"
      aria-labelledby="graveyard-heading"
      className="relative z-10 min-h-screen bg-[#131032]/95 px-grid py-14 sm:py-20 border-t-4 border-[#3A2A82]"
    >
      {/* Stepped green grass border trim at the top transition */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-3 h-3"
        style={{
          background:
            "repeating-linear-gradient(90deg, #4f8741 0 16px, #7dbd65 16px 24px, #4f8741 24px 36px, #5e9a4c 36px 44px)",
        }}
      />

      <div className="mx-auto w-[92%] max-w-[1400px]">
        {/* Graveyard Navigation Tabs Bar (matching 00:12 in the video) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#3A2A82] pb-5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-[#5543A5] border border-gold font-pixel text-[10px] text-cream shadow-[0_2px_0_0_#17183E]">
              <span>⚰️</span>
              <span>Graveyard</span>
            </span>
            <a
              href="#/timeline"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#17183E]/70 hover:bg-[#2A2B5C] border border-[#3A2A82] font-pixel text-[10px] text-[#C9C4EE] hover:text-cream transition-colors"
            >
              <span>📖</span>
              <span>Project Journal</span>
            </a>
            <a
              href="#/paths"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#17183E]/70 hover:bg-[#2A2B5C] border border-[#3A2A82] font-pixel text-[10px] text-[#C9C4EE] hover:text-cream transition-colors"
            >
              <span>🔮</span>
              <span>Decision Shrine</span>
            </a>
            <a
              href="#/archive"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#17183E]/70 hover:bg-[#2A2B5C] border border-[#3A2A82] font-pixel text-[10px] text-[#C9C4EE] hover:text-cream transition-colors"
            >
              <span>📦</span>
              <span>Archive</span>
            </a>
          </div>

          {/* Resting Ideas Pill */}
          <div className="flex items-center gap-2 border border-[#A8E6A1] bg-[#17183E] px-3 py-1 font-mono text-[11px] font-bold text-[#A8E6A1]">
            <span>🌱</span>
            <span>{projects.length} ideas resting</span>
          </div>
        </div>

        {/* Section Title & Subtitle */}
        <div className="mt-8 text-center sm:text-left">
          <Reveal>
            <h2
              id="graveyard-heading"
              className="font-pixel text-[clamp(1.5rem,3.2vw,2.8rem)] uppercase tracking-wide text-cream px-text-shadow"
            >
              YOUR PROJECT GRAVEYARD
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-2 font-mono text-[13px] sm:text-[15px] text-[#D8D3F5]">
              &lt; Every little idea gets a place to rest — and a chance to rise again. &gt;
            </p>
          </Reveal>
        </div>

        {/* Controls Toolbar: Filters, Search, Sort, Plant Button */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "All", label: `ALL (${counts.all})` },
              { id: "Stalled", label: `STALLED (${counts.stalled})` },
              { id: "Active", label: `ACTIVE (${counts.active})` },
              { id: "Archived", label: `ARCHIVED (${counts.archived})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 font-pixel text-[10px] uppercase transition-all duration-150 border-2 ${
                  activeFilter === f.id
                    ? "bg-[#5543A5] border-gold text-cream shadow-[0_2px_0_0_#17183E] translate-y-[-2px]"
                    : "bg-[#17183E]/80 border-[#3A2A82] text-[#A982F2] hover:bg-[#252654] hover:text-soft"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search, Sort, and Plant Action */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search your projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#17183E] border-2 border-[#5543A5] pl-9 pr-3 py-1.5 font-mono text-[12px] text-cream placeholder-[#867FB5] focus:border-gold focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-lavender hover:text-cream"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#17183E] border-2 border-[#5543A5] px-2.5 py-1.5 font-mono text-[11px] uppercase font-bold text-lavender focus:border-gold focus:outline-none"
            >
              <option value="last-visited">SORT BY: LAST VISITED</option>
              <option value="progress">SORT BY: PROGRESS</option>
              <option value="name">SORT BY: NAME</option>
            </select>

            {/* + PLANT A PROJECT Button */}
            <PixelButton
              variant="lavender"
              size="sm"
              accent="sparkle"
              onClick={onPlantProject}
              className="px-btn-lavender shadow-[0_4px_0_0_#0D0E2B]"
            >
              + PLANT A PROJECT
            </PixelButton>
          </div>
        </div>

        {/* Main Graveyard Landscape + Inspector Card Row */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tombstones Meadow Grid */}
          <div className="lg:col-span-8">
            {filteredProjects.length === 0 ? (
              <div className="px-box bg-[#17183E] p-8 text-center border-2 border-[#5543A5]">
                <p className="font-pixel text-[12px] text-gold">Nothing rests here.</p>
                <p className="mt-2 text-[14px] text-cream">
                  No tombstones match your filter or search query.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("All");
                    setSearchQuery("");
                  }}
                  className="mt-4 font-mono text-[12px] font-bold uppercase text-gold underline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 pt-4">
                {filteredProjects.map((project) => {
                  const accent = STATUS_ACCENT[project.status];
                  const isSelected = selectedProject?.id === project.id;

                  return (
                    <motion.div
                      key={project.id}
                      layout
                      whileHover={{ y: -6 }}
                      whileTap={{ y: -2 }}
                      onClick={() => setSelectedProjectId(project.id)}
                      data-tombstone="true"
                      className="group relative cursor-pointer"
                    >
                      {/* Active Selection Glow Ring */}
                      {isSelected && (
                        <div
                          className="absolute -inset-2 rounded-lg border-2 border-dashed border-gold animate-pulse z-0 pointer-events-none"
                        />
                      )}

                      {/* Tombstone Outer Shell */}
                      <div
                        className="tomb-outer relative z-10 p-[4px] transition-colors duration-150"
                        style={{
                          backgroundColor: isSelected ? "#FFC857" : "#1D1E45",
                          boxShadow: isSelected ? "0 0 16px rgba(255,200,87,0.7)" : undefined,
                        }}
                      >
                        {/* Tombstone Stone Body */}
                        <div className="tomb-inner relative flex min-h-[170px] sm:min-h-[190px] flex-col items-center bg-[#282956] px-3 pb-4 pt-6 text-center group-hover:bg-[#33356E] transition-colors">
                          {/* Vines */}
                          {project.status === "Stalled" && (
                            <span
                              aria-hidden="true"
                              className="vine absolute left-1 top-6 h-16 w-2"
                              style={{
                                background:
                                  "repeating-linear-gradient(180deg,#7dbd65 0 6px,#4f8741 6px 10px)",
                              }}
                            />
                          )}

                          {/* Icon Flag */}
                          <div
                            className="mb-2.5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border-2 border-navy bg-[#17183E]/80 transition-transform group-hover:scale-110"
                            style={{ color: accent }}
                          >
                            <ProjectIcon name={project.icon} size={22} aria-hidden="true" />
                          </div>

                          {/* Name */}
                          <h4 className="font-pixel text-[10px] sm:text-[11px] leading-tight text-soft px-text-shadow-sm truncate max-w-full">
                            {project.name}
                          </h4>

                          {/* Status Badge */}
                          <span
                            className="mt-2 inline-flex items-center gap-1 border border-navy px-2 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold uppercase text-navy"
                            style={{ backgroundColor: accent }}
                          >
                            {project.status}
                          </span>

                          {/* Progress mini indicator */}
                          {project.progress !== undefined && (
                            <div className="mt-2 w-full max-w-[120px]">
                              <div className="flex justify-between font-mono text-[9px] text-[#C9C4EE]">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                              </div>
                              <div className="mt-0.5 h-1.5 w-full bg-[#17183E] border border-[#3A2A82]">
                                <div
                                  className="h-full bg-gold"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Grass Tuft at Base */}
                      <div aria-hidden="true" className="tomb-grass -mt-2 w-full relative z-10" />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: ✦ PROJECT FOUND! ✦ Inspector Card (Matching video 00:22 - 00:26) */}
          <div className="lg:col-span-4 sticky top-24">
            <AnimatePresence mode="wait">
              {selectedProject && (
                <motion.div
                  key={selectedProject.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="px-box bg-[#17183E] border-2 border-gold p-6 text-soft shadow-[0_12px_32px_rgba(13,14,43,0.95)]"
                  style={{
                    ["--bc" as string]: "#5543A5",
                    ["--sh" as string]: "#0D0E2B",
                    ["--d" as string]: "8px",
                  }}
                >
                  {/* Card Header Sparkle */}
                  <div className="flex items-center justify-between border-b-2 border-[#3A2A82] pb-3">
                    <span className="flex items-center gap-1.5 font-pixel text-[10px] uppercase text-gold">
                      <Sparkles size={14} /> PROJECT FOUND!
                    </span>
                    <span
                      className="font-pixel text-[8px] px-2 py-0.5 border border-navy text-navy font-bold"
                      style={{ backgroundColor: STATUS_ACCENT[selectedProject.status] }}
                    >
                      {selectedProject.status}
                    </span>
                  </div>

                  {/* Project Info */}
                  <div className="mt-4 flex items-start gap-3.5">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#5543A5] bg-[#22245F]"
                      style={{ color: STATUS_ACCENT[selectedProject.status] }}
                    >
                      <ProjectIcon name={selectedProject.icon} size={24} />
                    </div>
                    <div>
                      <h3 className="font-pixel text-[13px] leading-snug text-cream">
                        {selectedProject.name}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#D8D3F5]">
                        {selectedProject.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Meter with Segmented Pixel Blocks */}
                  <div className="mt-5 border-2 border-[#3A2A82] bg-[#22245F]/50 p-3">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="uppercase text-lavender font-bold">Progress</span>
                      <span className="font-pixel text-[11px] text-gold">
                        {selectedProject.progress ?? 68}%
                      </span>
                    </div>

                    {/* Segmented Pixel Bar */}
                    <div className="mt-2 flex gap-1 h-3.5 bg-[#17183E] p-0.5 border border-[#5543A5]">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const pct = ((i + 1) / 12) * 100;
                        const filled = pct <= (selectedProject.progress ?? 68);
                        return (
                          <div
                            key={i}
                            className={`flex-1 transition-colors ${
                              filled ? "bg-gold" : "bg-[#252654]"
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Last worked */}
                    <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-[#A982F2]">
                      <span>Last worked:</span>
                      <span className="text-cream">{selectedProject.lastWorked}</span>
                    </div>

                    {/* Why stalled */}
                    {selectedProject.stalledReason && (
                      <div className="mt-2 pt-2 border-t border-[#3A2A82]/60 font-mono text-[11px]">
                        <span className="text-lavender block text-[10px] uppercase">Reason paused:</span>
                        <span className="text-cream italic">{selectedProject.stalledReason}</span>
                      </div>
                    )}
                  </div>

                  {/* Tech Tags */}
                  <div className="mt-4">
                    <span className="font-mono text-[10px] uppercase font-bold text-lavender tracking-wider">
                      Tagged Tech & Assets:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(selectedProject.tags ?? selectedProject.assets ?? ["React", "TypeScript"]).map(
                        (tag) => (
                          <span
                            key={tag}
                            className="bg-[#22245F] border border-[#5543A5] px-2 py-0.5 font-mono text-[11px] text-cream"
                          >
                            {tag}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Primary Action Button: INSPECT THIS IDEA → (Matching Video 00:24) */}
                  <div className="mt-6 flex flex-col gap-2.5">
                    <PixelButton
                      variant="gold"
                      size="md"
                      accent="arrow"
                      onClick={() => onOpenAppProject(selectedProject.id)}
                      className="w-full justify-center text-center font-bold"
                    >
                      INSPECT THIS IDEA →
                    </PixelButton>

                    <a
                      href={`#/projects/${selectedProject.id}`}
                      className="inline-flex items-center justify-center gap-2 py-1.5 font-mono text-[11px] uppercase text-lavender hover:text-gold transition-colors"
                    >
                      <span>Open Dossier & History</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

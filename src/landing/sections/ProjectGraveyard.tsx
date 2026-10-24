import { Plus } from "lucide-react";
import { useMemo } from "react";
import { Reveal } from "@/src/landing/components/Reveal";
import { ScrollReveal } from "@/src/landing/components/ScrollReveal";
import { PixelButton } from "@/src/landing/components/PixelButton";
import { ProjectFilters } from "@/src/landing/components/ProjectFilters";
import { ProjectStatsBar } from "@/src/landing/components/ProjectStatsBar";
import { ProjectTombstone } from "@/src/landing/components/ProjectTombstone";
import { STATUS_FILTERS } from "@/src/landing/data/view";
import type { Project, StatusFilter } from "@/src/landing/data/types";

interface Props {
  projects: Project[];
  filter: StatusFilter;
  onFilter: (f: StatusFilter) => void;
  query: string;
  onQuery: (q: string) => void;
  onOpen: (id: string) => void;
  onAdd: () => void;
}

export function ProjectGraveyard({ projects, filter, onFilter, query, onQuery, onOpen, onAdd }: Props) {
  const counts = useMemo(() => {
    const c = Object.fromEntries(STATUS_FILTERS.map((f) => [f, 0])) as Record<StatusFilter, number>;
    projects.forEach((p) => {
      c.All += 1;
      c[p.status] += 1;
    });
    return c;
  }, [projects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (filter === "All" || p.status === filter) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
  }, [projects, filter, query]);

  const open = projects.filter((p) => p.status !== "Archived");
  const resting = open.filter((p) => p.status === "Stalled" || p.status === "To Revisit").length;
  const ready = open.filter((p) => (p.score ?? 0) >= 60).length;
  const hasSamples = projects.some((p) => p.sample);

  return (
    <section id="graveyard" aria-labelledby="graveyard-title" className="px-grid relative z-10 bg-navy/[0.92]">
      {/* stepped grass edge between the hero and this section */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-3 h-3"
        style={{ background: "repeating-linear-gradient(90deg,#4f8741 0 16px,#7dbd65 16px 24px,#4f8741 24px 36px,#5e9a4c 36px 44px)" }}
      />
      <div className="mx-auto w-[90%] max-w-[1280px] py-20 sm:py-28">
        <Reveal>
          <p className="font-pixel text-[10px] uppercase tracking-wider text-gold sm:text-[11px]">01 / THE GRAVEYARD</p>
        </Reveal>
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Reveal as="h2" delay={0.05} className="text-[clamp(1.9rem,4.2vw,3.4rem)] font-extrabold leading-[1.08] text-soft" >
              <span id="graveyard-title">Some ideas are resting. Others are ready to rise.</span>
            </Reveal>
            <Reveal as="p" delay={0.12} className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#e1dcf8]">
              Every tombstone represents a project with a story. Explore what you left behind and decide where it belongs next.
            </Reveal>
          </div>
          <Reveal delay={0.18}>
            <PixelButton variant="lavender" size="md" accent="sparkle" onClick={onAdd}>
              <span className="inline-flex items-center gap-2">
                <Plus size={14} strokeWidth={4} aria-hidden="true" /> Add a project
              </span>
            </PixelButton>
          </Reveal>
        </div>

        <div className="mt-10">
          <ProjectFilters filter={filter} onFilter={onFilter} query={query} onQuery={onQuery} counts={counts} />
          <p className="mt-3 font-mono text-[12px] text-[#b4afe3]" aria-live="polite">
            Showing {visible.length} of {projects.length} · Open a tombstone for its page, score and next step · Projects marked “sample” ship with the app
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="px-box mx-auto mt-16 max-w-lg bg-navy p-8 text-center" style={{ ["--bc" as string]: "#5543A5" }}>
            <p className="font-pixel text-[12px] leading-relaxed text-gold">The graveyard is quiet.</p>
            <p className="mt-3 text-[15px] text-cream">You have not logged any projects yet. Add the first unfinished idea that comes to mind. It takes about two minutes.</p>
            <div className="mt-5 flex justify-center">
              <PixelButton variant="gold" size="sm" accent="arrow" onClick={onAdd}>
                Log your first project
              </PixelButton>
            </div>
          </div>
        ) : visible.length ? (
          <ScrollReveal className="mt-16 grid grid-cols-2 gap-x-4 gap-y-14 pt-6 lg:grid-cols-4 lg:gap-x-8">
            {visible.map((p) => (
              <div key={p.id}>
                <ProjectTombstone project={p} onOpen={onOpen} isNew={!p.sample} />
              </div>
            ))}
          </ScrollReveal>
        ) : (
          <div className="px-box mx-auto mt-16 max-w-lg bg-navy p-8 text-center" style={{ ["--bc" as string]: "#5543A5" }}>
            <p className="font-pixel text-[12px] leading-relaxed text-gold">Nothing rests here.</p>
            <p className="mt-3 text-[15px] text-cream">No tombstones match your filter or search. Try another status, or clear the search.</p>
            <button
              type="button"
              className="mt-4 min-h-[44px] font-mono text-[12px] font-bold uppercase text-gold underline underline-offset-4"
              onClick={() => {
                onFilter("All");
                onQuery("");
              }}
            >
              Reset filters
            </button>
          </div>
        )}

        <div className="mt-20">
          <ProjectStatsBar resting={resting} ready={ready} hasSamples={hasSamples} />
        </div>
      </div>
    </section>
  );
}

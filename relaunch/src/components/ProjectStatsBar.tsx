import { Folder, Lightbulb, Sprout } from "lucide-react";
import { DEMO_STATS } from "@/src/data/demoProjects";

/** Illustrative numbers from DEMO_STATS (not live analytics). Added projects bump "new ideas". */
export function ProjectStatsBar({ createdCount }: { createdCount: number }) {
  const items = [
    { Icon: Folder, value: DEMO_STATS.projectsResting, label: "PROJECTS RESTING", color: "#A982F2" },
    { Icon: Sprout, value: DEMO_STATS.readyToRevive, label: "READY TO REVIVE", color: "#A8E6A1" },
    { Icon: Lightbulb, value: DEMO_STATS.newIdeas + createdCount, label: "NEW IDEA", color: "#FFC857" },
  ];
  return (
    <div className="px-box travel-border relative bg-navy p-5 sm:p-6" style={{ ["--bc" as string]: "#A982F2", ["--sh" as string]: "#0d0e2b" }}>
      <ul className="grid grid-cols-1 divide-y-4 divide-twilight/60 sm:grid-cols-3 sm:divide-x-4 sm:divide-y-0">
        {items.map(({ Icon, value, label, color }) => (
          <li key={label} className="flex items-center gap-4 py-3 sm:justify-center sm:py-1">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-twilight bg-indigo" style={{ color }}>
              <Icon size={24} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="font-pixel text-[11px] leading-relaxed text-soft sm:text-[12px]">
              <span className="block text-lg sm:text-xl" style={{ color }}>
                {value}
              </span>
              {label}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-widest text-[#a39fd6]">Sample data — illustrative, not live analytics</p>
    </div>
  );
}

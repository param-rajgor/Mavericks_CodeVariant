import { Folder, Lightbulb, Sprout } from "lucide-react";
import { navigate } from "@/src/lib/router";

/** Live numbers calculated from the stored projects. */
export function ProjectStatsBar({ resting, ready, hasSamples }: { resting: number; ready: number; hasSamples: boolean }) {
  const items = [
    { Icon: Folder, value: resting, label: "PROJECTS RESTING", color: "#A982F2" },
    { Icon: Sprout, value: ready, label: "WORTH A SECOND LOOK", color: "#A8E6A1" },
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
        <li className="flex items-center gap-4 py-3 sm:justify-center sm:py-1">
          <button
            type="button"
            onClick={() => navigate("/projects/new")}
            className="flex min-h-[44px] items-center gap-4 text-left hover:opacity-90"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-twilight bg-indigo text-gold">
              <Lightbulb size={24} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="font-pixel text-[11px] leading-relaxed text-soft sm:text-[12px]">
              <span className="block text-lg text-gold sm:text-xl">+</span>
              LOG A NEW IDEA
            </span>
          </button>
        </li>
      </ul>
      <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-widest text-[#a39fd6]">
        {hasSamples ? "Includes sample projects · counts update as you add your own" : "Calculated from your projects, stored on this device"}
      </p>
    </div>
  );
}

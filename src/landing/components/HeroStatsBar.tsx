import { Folder, Sprout, Lightbulb } from "lucide-react";
import { DEMO_STATS } from "@/src/landing/data/demoProjects";

interface Props {
  restingCount?: number;
  reviveCount?: number;
  newIdeasCount?: number;
  className?: string;
}

/**
 * Bottom statistics panel matching the reference video.
 * Restrained purple pixel borders with pixel-style icons.
 */
export function HeroStatsBar({
  restingCount = DEMO_STATS.projectsResting,
  reviveCount = DEMO_STATS.readyToRevive,
  newIdeasCount = DEMO_STATS.newIdeas,
  className = "",
}: Props) {
  const stats = [
    {
      Icon: Folder,
      value: restingCount,
      label: "PROJECTS RESTING",
      color: "#A982F2",
      bg: "rgba(169, 130, 242, 0.15)",
    },
    {
      Icon: Sprout,
      value: reviveCount,
      label: "READY TO REVIVE",
      color: "#A8E6A1",
      bg: "rgba(168, 230, 161, 0.15)",
    },
    {
      Icon: Lightbulb,
      value: newIdeasCount,
      label: "NEW IDEA",
      color: "#FFC857",
      bg: "rgba(255, 200, 87, 0.15)",
    },
  ];

  return (
    <div
      className={`relative z-20 mx-auto w-full max-w-[880px] px-3 sm:px-6 ${className}`}
    >
      <div
        className="px-box bg-[#17183E]/95 backdrop-blur-sm p-3 sm:p-4 shadow-[0_8px_24px_rgba(13,14,43,0.85)] border-2 border-[#5543A5]"
        style={{
          ["--bc" as string]: "#3A2A82",
          ["--sh" as string]: "#0D0E2B",
          ["--d" as string]: "4px",
        }}
      >
        <div className="grid grid-cols-1 divide-y-2 divide-[#3A2A82] sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0">
          {stats.map(({ Icon, value, label, color, bg }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-3.5 py-2 sm:py-1 px-3 group"
            >
              {/* Pixel Icon Container */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[#3A2A82] transition-transform duration-150 group-hover:scale-110"
                style={{ backgroundColor: bg, color }}
              >
                <Icon size={20} strokeWidth={2.5} aria-hidden="true" />
              </div>

              {/* Number and Label */}
              <div className="flex flex-col text-left">
                <span
                  className="font-pixel text-[13px] sm:text-[15px] font-bold leading-none tracking-tight"
                  style={{ color }}
                >
                  {value}
                </span>
                <span className="mt-1 font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#D8D3F5]">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

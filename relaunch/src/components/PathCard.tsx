import { motion } from "motion/react";
import type { RelaunchPath } from "@/src/data/types";
import { PathIcon } from "./icons";

interface Props {
  path: RelaunchPath;
  index: number;
  selected: boolean;
  onSelect: (id: RelaunchPath["id"]) => void;
  panelId: string;
}

/** Retro dialogue-box / signpost. Toggles the focused detail panel below the grid. */
export function PathCard({ path, index, selected, onSelect, panelId }: Props) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-expanded={selected}
      aria-controls={panelId}
      onClick={() => onSelect(path.id)}
      whileHover={{ y: -4 }}
      whileTap={{ y: 0 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      className="px-box group relative flex h-full w-full flex-col gap-4 bg-navy p-5 text-left"
      style={{
        ["--bc" as string]: selected ? path.color : "#5543A5",
        ["--sh" as string]: selected ? path.color + "55" : "#0d0e2b",
      }}
    >
      <span className="flex items-center justify-between">
        <span
          className={`flex h-14 w-14 items-center justify-center border-[3px] border-navy ${selected ? "sprite-hop" : ""}`}
          style={{ background: path.color, color: "#17183E" }}
        >
          <PathIcon name={path.icon} size={28} aria-hidden="true" />
        </span>
        <span className="font-mono text-[12px] font-bold text-[#a39fd6]" aria-hidden="true">
          0{index + 1}/05
        </span>
      </span>
      <span>
        <span className="block font-pixel text-[13px] uppercase leading-snug" style={{ color: path.color }}>
          {path.label}
        </span>
        <span className="mt-2 block text-[15px] leading-relaxed text-cream">{path.tagline}</span>
      </span>
      <span
        className="mt-auto flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wide"
        style={{ color: selected ? path.color : "#a39fd6" }}
      >
        <span aria-hidden="true">{selected ? "▼" : "▶"}</span>
        {selected ? "Selected" : "Read more"}
      </span>
    </motion.button>
  );
}

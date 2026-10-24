import { PATH_BY_ID } from "@/src/landing/data/relaunchPaths";
import type { PathId } from "@/src/landing/data/types";
import { PathIcon } from "./icons";

/** Coloured chip for a path. Always carries an icon + text, never colour alone. */
export function PathBadge({ id, note, className = "" }: { id: PathId; note?: string; className?: string }) {
  const p = PATH_BY_ID[id];
  return (
    <span
      className={`inline-flex items-center gap-2 border-2 px-2.5 py-1 font-mono text-[12px] font-bold uppercase tracking-wide text-navy ${className}`}
      style={{ background: p.color, borderColor: "#17183E" }}
    >
      <PathIcon name={p.icon} size={14} aria-hidden="true" />
      {note ?? p.label}
    </span>
  );
}

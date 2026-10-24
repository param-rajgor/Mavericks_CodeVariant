import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/src/landing/hooks/useMediaQuery";
import { useReducedMotion } from "@/src/landing/hooks/useReducedMotion";

/** An original friendly ghost, drawn from a pixel grid. */
const ROWS = [
  "....wwwwww....",
  "..wwwwwwwwww..",
  ".wwwwwwwwwwww.",
  ".wwkkwwwwkkww.",
  ".wwkkwwwwkkww.",
  "wwwwwwppwwwwww",
  "wwwwwwwwwwwwww",
  "wwwwwwwwwwwwww",
  "wwwwwwwwwwwwww",
  "wwwwwwwwwwwwww",
  "ww.wwww.wwww.w",
  "w...ww...ww...",
] as const;
const COLORS: Record<string, string> = { w: "#FFF9F2", k: "#241c5a", p: "#F1A0E8" };

interface Spark {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

/**
 * A small ghost that trails the real pointer. It perches on tombstones, points at buttons and
 * pops when you click. It never receives pointer events, never replaces the native cursor, and is
 * switched off on touch devices and under reduced motion.
 */
export function GhostCursor() {
  const coarse = useMediaQuery("(pointer: coarse)");
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"idle" | "tomb" | "button">("idle");
  const [popping, setPopping] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [visible, setVisible] = useState(false);
  const sparkId = useRef(0);

  useEffect(() => {
    if (coarse || reduced) return;
    const pos = { x: -100, y: -100 };
    const target = { x: -100, y: -100 };
    let current: "idle" | "tomb" | "button" = "idle";
    let raf = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      if (ref.current) ref.current.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
    };
    raf = requestAnimationFrame(loop);

    const set = (m: typeof current) => {
      if (m !== current) {
        current = m;
        setMode(m);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      setVisible(true);
      const el = e.target as Element | null;
      // Never get in the way of form fields.
      if (el?.closest("input, textarea, select, [contenteditable]")) {
        setVisible(false);
        return;
      }
      const tomb = el?.closest<HTMLElement>('[data-ghost="tomb"]');
      const button = el?.closest<HTMLElement>('a, button, [role="button"]');
      if (tomb) {
        const r = tomb.getBoundingClientRect();
        target.x = r.left + r.width / 2 - 14;
        target.y = r.top - 30;
        set("tomb");
      } else if (button) {
        const r = button.getBoundingClientRect();
        target.x = Math.max(4, r.left - 34);
        target.y = r.top + r.height / 2 - 14;
        set("button");
      } else {
        target.x = e.clientX + 16;
        target.y = e.clientY + 18;
        set("idle");
      }
      if (pos.x < -50) {
        pos.x = target.x;
        pos.y = target.y;
      }
    };
    const onLeave = () => setVisible(false);
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      setPopping(true);
      window.setTimeout(() => setPopping(false), 320);
      const n = 6;
      const burst: Spark[] = Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return { id: ++sparkId.current, x: e.clientX, y: e.clientY, dx: Math.cos(a) * 22, dy: Math.sin(a) * 22 };
      });
      setSparks((s) => [...s, ...burst]);
      window.setTimeout(() => setSparks((s) => s.filter((x) => !burst.includes(x))), 520);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [coarse, reduced]);

  if (coarse || reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]">
      <div ref={ref} className="absolute left-0 top-0 will-change-transform" style={{ opacity: visible ? 1 : 0, transition: "opacity 150ms" }}>
        <div
          style={{
            transformOrigin: "50% 100%",
            transform: popping ? "scale(1.35, 0.7)" : mode === "button" ? "rotate(-14deg)" : "none",
            transition: "transform 120ms steps(3)",
            animation: mode === "tomb" ? "ghost-perch 1.1s steps(2) infinite" : mode === "idle" ? "ghost-bob 1.6s steps(2) infinite" : undefined,
            filter: "drop-shadow(0 2px 0 rgba(23,24,62,.7))",
          }}
        >
          <svg width="28" height="24" viewBox="0 0 14 12" shapeRendering="crispEdges">
            {ROWS.flatMap((row, y) => [...row].map((ch, x) => (COLORS[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={COLORS[ch]} /> : null)))}
          </svg>
          {mode === "button" && <span className="absolute -right-3 top-1 block h-2 w-2 bg-[#FFC857]" style={{ boxShadow: "0 0 6px #FFC857", animation: "twinkle-step 0.6s steps(2) infinite" }} />}
        </div>
      </div>
      {sparks.map((s) => (
        <span
          key={s.id}
          className="absolute block h-1.5 w-1.5 bg-[#FFC857]"
          style={{ left: s.x, top: s.y, ["--dx" as string]: `${s.dx}px`, ["--dy" as string]: `${s.dy}px`, animation: "ghost-spark 0.5s steps(5) forwards" }}
        />
      ))}
    </div>
  );
}

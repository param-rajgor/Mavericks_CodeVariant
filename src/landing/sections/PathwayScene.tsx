import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/src/landing/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const W = 320;
const H = 120;
const HORIZON = 72;

const BANDS = [
  "#17183E", "#1d1f55", "#22245F", "#2f2c7a", "#4a3a9a", "#6b4bb0",
  "#9a68c9", "#d283d6", "#f1a0e8", "#ffab83", "#ffc380", "#ffd98a"
];

function circleRows(r: number) {
  const rows: { y: number; hw: number }[] = [];
  for (let dy = -r; dy <= 0; dy++) rows.push({ y: dy, hw: Math.floor(Math.sqrt(r * r - dy * dy)) });
  return rows;
}

/** Pixel-art pathway toward a glowing sunrise, drawn with plain SVG rects. */
export function PathwayScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const sun = useRef<SVGGElement>(null);
  const reduced = useReducedMotion();

  const mountains = useMemo(() => {
    const out: { x: number; h: number; back: boolean }[] = [];
    for (let x = 0; x < W; x += 8) {
      out.push({ x, h: 8 + Math.round(10 * Math.abs(Math.sin(x / 38)) + 5 * Math.abs(Math.sin(x / 15))), back: true });
      out.push({ x, h: 3 + Math.round(7 * Math.abs(Math.sin(x / 27 + 1.5))), back: false });
    }
    return out;
  }, []);

  const pathRows = useMemo(() => {
    const rows: { y: number; hw: number; fill: string }[] = [];
    for (let y = HORIZON; y < H; y++) {
      const t = (y - HORIZON) / (H - HORIZON);
      const hw = Math.round(3 + t * 46);
      const fill = y % 7 === 0 ? "#E6C690" : t < 0.25 ? "#FFE3A0" : t < 0.6 ? "#FFF1D2" : "#F5E2BC";
      rows.push({ y, hw, fill });
    }
    return rows;
  }, []);

  const lanterns = useMemo(
    () =>
      [76, 88, 104].flatMap((y) => {
        const hw = pathRows.find((r) => r.y === y)?.hw ?? 10;
        return [-1, 1].map((side) => ({ x: W / 2 + side * (hw + 7), y }));
      }),
    [pathRows],
  );

  const flowers = useMemo(() => {
    const pts: { x: number; y: number; c: string }[] = [];
    let s = 3;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 46; i++) {
      const y = HORIZON + 6 + Math.floor(r() * 40);
      const x = Math.floor(r() * W);
      const hw = pathRows.find((p) => p.y === y)?.hw ?? 0;
      if (Math.abs(x - W / 2) < hw + 8) continue;
      pts.push({ x, y, c: ["#F1A0E8", "#FFF1D2", "#A982F2", "#FFC857"][Math.floor(r() * 4)] });
    }
    return pts;
  }, [pathRows]);

  useLayoutEffect(() => {
    const el = wrap.current;
    const s = sun.current;
    if (!el || !s || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        s,
        { y: 30 },
        { y: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "center 55%", scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const core = circleRows(17);
  const halo = circleRows(26);

  return (
    <div ref={wrap} className="relative mx-auto w-full overflow-hidden border-y-4 border-navy bg-navy" style={{ boxShadow: "0 -4px 0 0 #5543A5" }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block aspect-[8/5] w-full sm:aspect-[8/3]" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" role="img" aria-label="A pixel-art pathway lined with lanterns leading toward a glowing sunrise between purple mountains">
        {BANDS.map((c, i) => (
          <rect key={i} x="0" y={i * 6} width={W} height="6" fill={c} />
        ))}
        <g ref={sun}>
          {halo.map((r) => (
            <rect key={`h${r.y}`} x={W / 2 - r.hw} y={HORIZON + r.y} width={r.hw * 2} height="1" fill="#FFC857" opacity="0.28" />
          ))}
          {core.map((r) => (
            <rect key={`c${r.y}`} x={W / 2 - r.hw} y={HORIZON + r.y} width={r.hw * 2} height="1" fill={r.y < -9 ? "#FFE9A8" : "#FFC857"} />
          ))}
        </g>
        {mountains.filter((m) => m.back).map((m, i) => (
          <rect key={`mb${i}`} x={m.x} y={HORIZON - m.h} width={8} height={m.h} fill="#3A2A82" />
        ))}
        {mountains.filter((m) => !m.back).map((m, i) => (
          <rect key={`mf${i}`} x={m.x} y={HORIZON - m.h} width={8} height={m.h} fill="#2A1B6B" />
        ))}
        {/* grass */}
        <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill="#4f8741" />
        {/* path */}
        {pathRows.map((r) => (
          <rect key={r.y} x={W / 2 - r.hw} y={r.y} width={r.hw * 2} height={1} fill={r.fill} />
        ))}
        {/* flowers */}
        {flowers.map((f, i) => (
          <rect key={`fl${i}`} x={f.x} y={f.y} width={2} height={2} fill={f.c} />
        ))}
        {/* lanterns */}
        {lanterns.map((l, i) => (
          <g key={`l${i}`}>
            <rect x={l.x - 1} y={l.y - 7} width={2} height={7} fill="#17183E" />
            <rect x={l.x - 3} y={l.y - 10} width={6} height={4} fill="#FFC857" />
            <rect x={l.x - 4} y={l.y - 11} width={8} height={6} fill="#FFC857" opacity={0.3} />
          </g>
        ))}
      </svg>
    </div>
  );
}

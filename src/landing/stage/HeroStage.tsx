import { useState, type CSSProperties, type ReactNode } from "react";
import { BarChart3, Box, Code2, Folder, Laptop, Lightbulb, Sprout } from "lucide-react";
import { SceneArt } from "@/src/landing/stage/SceneArt";
import { Rocket, Tomb } from "@/src/ui/pixel";
import { STATUS_PILL, type LandingStats, type Tomb as TombData } from "@/src/landing/data/tombs";
import { useReducedMotion } from "@/src/landing/hooks/useReducedMotion";
import { scrollToId } from "@/src/landing/lib/scroll";

/**
 * The landing page, drawn entirely in code. SceneArt paints the scenery in a 1586x992 coordinate space and
 * every real element (header, headline, buttons, tombstones, stats) is placed over it in the same
 * coordinates, so everything stays aligned at any window size.
 */
const FW = 1586;
const FH = 992;

/** image px -> container-relative length (the stage is a size container: 100cqw = 1586 image px) */
const u = (n: number) => `${(n / FW) * 100}cqw`;
const box = (...r: readonly number[]): CSSProperties => {
  const [x1, y1, x2, y2] = r;
  return {
    position: "absolute",
    left: `${(x1 / FW) * 100}%`,
    top: `${(y1 / FH) * 100}%`,
    width: `${((x2 - x1) / FW) * 100}%`,
    height: `${((y2 - y1) / FH) * 100}%`,
  };
};

/** Where each tombstone stands (image px). `cx` is where its tooltip points. */
const SLOTS = [
  { cx: 748, box: [497, 566, 710, 792] },
  { cx: 867, box: [775, 576, 968, 774] },
  { cx: 1127, box: [1030, 566, 1228, 772] },
  { cx: 1377, box: [1277, 584, 1478, 794] },
] as const;
const SLOT_ICONS = [Code2, Box, BarChart3, Laptop] as const;

interface Props {
  tombs: TombData[];
  stats: LandingStats;
  onOpen: (href: string) => void;
  onEnter: () => void;
}

const SANS = "Manrope, system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const PX = "'Press Start 2P', ui-monospace, monospace";

function Sparkle({ x, y, size = 14 }: { x: number; y: number; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ position: "absolute", left: u(x), top: u(y), width: u(size), height: u(size), background: "#ffd36a", clipPath: "polygon(40% 0,60% 0,60% 40%,100% 40%,100% 60%,60% 60%,60% 100%,40% 100%,40% 60%,0 60%,0 40%,40% 40%)" }}
    />
  );
}

export function HeroStage({ tombs, stats, onOpen, onEnter }: Props) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const lit = hover ?? focus ?? 0;
  const bt = tombs[lit];
  const bubbleLeft = Math.min(SLOTS[lit].cx - 131, 1300);
  const tomb = SLOTS[lit].box;
  const tail = Math.max(24, Math.min(230, (tomb[0] + tomb[2]) / 2 - bubbleLeft - 11));

  const navLink = (label: string, x: number, id: string) => (
    <a
      href={`#${id}`}
      data-ghost="button"
      onClick={(e) => {
        e.preventDefault();
        scrollToId(id);
      }}
      style={{ position: "absolute", left: u(x), top: u(24), height: u(50), display: "flex", alignItems: "center", font: `700 ${u(24)}/1 ${SANS}`, color: "#FFF9F2", textDecoration: "none" }}
    >
      {label}
    </a>
  );

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#2b2872]">
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          // full height; narrower windows crop a sliver off the sides, wider ones continue the scenery sideways
          width: `calc(100svh * ${FW} / ${FH})`,
          height: "100%",
          transform: "translateX(-50%)",
          containerType: "inline-size",
        }}
      >
        <svg viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
          <SceneArt />
        </svg>

        <header aria-label="Site">
          <a href="#top" aria-label="Relaunch home" data-ghost="button" style={{ ...box(70, 18, 392, 90), display: "flex", alignItems: "center", gap: u(20), textDecoration: "none" }}>
            <Rocket style={{ width: u(78), height: u(78) }} />
            <span style={{ font: `400 ${u(30)}/1 ${PX}`, color: "#FFF9F2", textShadow: `${u(3)} ${u(3)} 0 #17183e` }}>RELAUNCH</span>
          </a>
          <nav aria-label="Primary">
            {navLink("How it Works", 674, "features")}
            {navLink("Explore", 920, "graveyard-scene")}
          </nav>
          <Sparkle x={567} y={40} />
          <Sparkle x={1092} y={40} />
          <Sparkle x={1528} y={12} size={10} />
          <button
            type="button"
            onClick={onEnter}
            data-ghost="button"
            style={{ ...box(1326, 24, 1522, 80), background: "#b891f5", color: "#241c5a", border: `${u(4)} solid #d9c4ff`, borderRadius: u(8), boxShadow: `0 ${u(6)} 0 #6a4bc2, 0 ${u(10)} 0 #17183e`, font: `800 ${u(22)}/1 ${SANS}`, cursor: "pointer" }}
          >
            Get Started
          </button>
        </header>

        <h1
          style={{
            position: "absolute",
            left: u(72),
            top: u(150),
            margin: 0,
            font: `400 ${u(52)}/1.5 ${PX}`, letterSpacing: '-0.03em',
            color: "#FFF9F2",
            textShadow: `0 ${u(6)} 0 #17183e, ${u(5)} ${u(5)} 0 #17183e, -${u(4)} 0 0 #17183e, ${u(4)} 0 0 #17183e`,
          }}
        >
          YOUR IDEAS
          <br />
          AREN<span style={{ letterSpacing: "-0.4em" }}>'</span>T <span style={{ color: "#b98cff" }}>DEAD.</span>
        </h1>
        <Sparkle x={632} y={146} size={22} />
        <p style={{ position: "absolute", left: u(72), top: u(338), width: u(580), margin: 0, font: `600 ${u(28)}/1.35 ${MONO}`, color: "#d9ccff", textShadow: `0 ${u(2)} 0 #17183e` }}>
          They&apos;re just waiting for their next chapter.
        </p>

        <button
          type="button"
          onClick={onEnter}
          data-ghost="button"
          style={{
            ...box(70, 442, 548, 520),
            background: "#ffc857",
            color: "#241c5a",
            border: `${u(4)} solid #ffe1a0`,
            borderRadius: u(10),
            boxShadow: `0 ${u(8)} 0 #e08a2e, 0 ${u(12)} 0 #17183e`,
            font: `800 ${u(26)}/1 ${SANS}`,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: u(16),
            cursor: "pointer",
          }}
        >
          Enter the graveyard <span aria-hidden="true">→</span>
        </button>

        <nav aria-label="Your projects">
          {tombs.map((tb, i) => {
            const pill = STATUS_PILL[tb.status];
            const on = lit === i;
            const Icon = SLOT_ICONS[i];
            const [x1, y1, x2, y2] = SLOTS[i].box;
            return (
              <a
                key={tb.key}
                href={`#${tb.href}`}
                data-ghost="tomb"
                aria-label={`${tb.name}. ${tb.status}. ${tb.blurb}. Open project.`}
                onClick={(e) => {
                  e.preventDefault();
                  onOpen(tb.href);
                }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                onFocus={() => setFocus(i)}
                onBlur={() => setFocus((f) => (f === i ? null : f))}
                style={{
                  ...box(x1, y1 - (on ? 6 : 0), x2, y2),
                  display: "block",
                  filter: on ? `drop-shadow(0 0 ${u(16)} rgba(255,214,120,.9))` : "none",
                  transition: "filter 150ms steps(4), top 150ms steps(3)",
                  cursor: "pointer",
                }}
              >
                <Tomb className="absolute inset-0 h-full w-full" />
                <span style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: u(12), padding: `0 ${u(14)} ${u(30)}`, textAlign: "center" }}>
                  <Icon aria-hidden="true" style={{ width: u(66), height: u(66), color: "#5a4aa8", marginBottom: u(6) }} strokeWidth={2.2} />
                  <span style={{ font: `800 ${u(23)}/1.1 ${SANS}`, color: "#2a2260", maxWidth: "100%", overflowWrap: "anywhere" }}>{tb.name}</span>
                  <span style={{ font: `800 ${u(20)}/1 ${SANS}`, background: pill.bg, color: pill.fg, border: `${u(3)} solid #2a2260`, borderRadius: u(8), padding: `${u(7)} ${u(18)}`, whiteSpace: "nowrap" }}>{tb.status}</span>
                </span>
              </a>
            );
          })}
        </nav>

        {bt && (
          <div
            role="status"
            style={{
              ...box(bubbleLeft, 437, bubbleLeft + 262, 549),
              pointerEvents: "none",
              background: "#FFF3D6",
              color: "#241c5a",
              border: `${u(3)} solid #5a4d9c`,
              borderRadius: u(12),
              boxShadow: `0 ${u(5)} 0 #3a3180`,
              padding: `${u(14)} ${u(20)}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: u(6),
            }}
          >
            <span style={{ font: `800 ${u(26)}/1.15 ${SANS}` }}>{bt.name}</span>
            <span style={{ font: `500 ${u(16)}/1.3 ${SANS}`, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{bt.blurb}</span>
            <span aria-hidden="true" style={{ position: "absolute", left: u(tail), bottom: u(-14), width: u(22), height: u(22), background: "#FFF3D6", borderRight: `${u(3)} solid #5a4d9c`, borderBottom: `${u(3)} solid #5a4d9c`, transform: "rotate(45deg)" }} />
          </div>
        )}

        <h2 className="sr-only">Your ideas aren&apos;t dead. They&apos;re just waiting for their next chapter.</h2>
        <Stats stats={stats} onNew={() => onOpen("/projects/new")} />
        {!reduced && <Fireflies />}
      </div>
    </div>
  );
}

const PIXEL = "'Press Start 2P', ui-monospace, monospace";

/** Live numbers, covering the painted ones (which are only an example). */
function Stats({ stats, onNew }: { stats: LandingStats; onNew: () => void }) {
  const item = (Icon: typeof Folder, color: string, text: ReactNode) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: u(16), whiteSpace: "nowrap" }}>
      <Icon aria-hidden="true" style={{ width: u(40), height: u(40), color, flex: "none" }} strokeWidth={2.4} />
      <span style={{ font: `400 ${u(15)}/1.4 ${PIXEL}`, color: "#FFF9F2", textTransform: "uppercase" }}>{text}</span>
    </span>
  );
  const divider = <span aria-hidden="true" style={{ width: u(2), height: "55%", background: "#4b3f8f" }} />;
  return (
    <div
      role="group"
      aria-label="Graveyard statistics"
      style={{
        ...box(298, 844, 1284, 962),
        background: "#1d1850",
        border: `${u(5)} solid #8a67e6`,
        borderRadius: u(12),
        boxShadow: `0 ${u(6)} 0 #0d0e2b`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
      }}
    >
      {item(Folder, "#B79CFF", <><b style={{ color: "#B79CFF" }}>{stats.resting}</b> resting</>)}
      {divider}
      {item(Sprout, "#A8E6A1", <><b style={{ color: "#A8E6A1" }}>{stats.ready}</b> ready to revive</>)}
      {divider}
      <button type="button" onClick={onNew} data-ghost="button" className="hover:opacity-80" style={{ background: "none", border: 0, cursor: "pointer", padding: 0 }} aria-label="Log a new idea">
        {item(Lightbulb, "#FFC857", "Log a new idea")}
      </button>
    </div>
  );
}

const FIREFLIES = [
  [6, 62], [14, 74], [24, 56], [33, 82], [47, 66], [57, 79], [66, 58], [76, 72], [86, 63], [93, 82],
] as const;

/** A few fireflies drifting over the artwork. */
function Fireflies() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {FIREFLIES.map(([x, y], i) => (
        <span key={i} className="firefly" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-i * 1.3}s`, width: u(6), height: u(6) }} />
      ))}
    </div>
  );
}

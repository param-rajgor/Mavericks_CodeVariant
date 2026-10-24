import { useMemo } from "react";

/** deterministic pseudo-random so SSR/refresh never reshuffles the sky */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** One element, many stars (box-shadow), gentle stepped twinkle. */
export function Starfield({ count = 48, className = "", maxY = 100, seed = 7 }: { count?: number; className?: string; maxY?: number; seed?: number }) {
  const shadow = useMemo(() => {
    const r = rng(seed);
    const colors = ["#FFF9F2", "#FFF1D2", "#A982F2", "#F1A0E8"];
    return Array.from({ length: count }, () => {
      const x = (r() * 100).toFixed(2);
      const y = (r() * maxY).toFixed(2);
      return `${x}vw ${y}vh 0 0 ${colors[Math.floor(r() * colors.length)]}`;
    }).join(",");
  }, [count, maxY, seed]);

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="h-[3px] w-[3px]"
        style={{ boxShadow: shadow, animation: "twinkle-step 5s steps(4) infinite", opacity: 0.7 }}
      />
    </div>
  );
}

const FIREFLIES = [
  [8, 62], [18, 74], [27, 55], [38, 80], [52, 66], [61, 78], [70, 58], [79, 72], [88, 64], [94, 82],
] as const;

/**
 * Lightweight ambience above the video: a starfield and a handful of fireflies.
 * Fixed + non-interactive; hidden on narrow screens to keep things calm.
 */
export function PixelBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <Starfield count={36} maxY={42} seed={11} />
      <div className="absolute inset-0 hidden md:block">
        {FIREFLIES.map(([x, y], i) => (
          <span
            key={i}
            className="firefly"
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-i * 1.3}s` }}
          />
        ))}
      </div>
    </div>
  );
}

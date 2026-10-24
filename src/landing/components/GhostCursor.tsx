import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/src/landing/hooks/useReducedMotion";

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
}

/**
 * An original, friendly pixel-art ghost cursor mascot.
 * Smoothly follows pointer, hovers near tombstones, points & sparkles on buttons,
 * and performs a playful squish-bounce on click.
 */
export function GhostCursor() {
  const ghostRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [isTouch, setIsTouch] = useState(true);
  const [hoverState, setHoverState] = useState<"idle" | "button" | "tombstone">("idle");
  const [isClicking, setIsClicking] = useState(false);
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);

  const posRef = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });
  const animFrameRef = useRef<number>(0);
  const particleIdRef = useRef(0);

  useEffect(() => {
    // Disable on touch / coarse devices
    const mq = window.matchMedia("(pointer: coarse)");
    setIsTouch(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (isTouch || reduced) return;

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isButton = target.closest("button, a, .px-btn, input[type='button'], input[type='submit']");
      const isTomb = target.closest(".tomb, [data-tombstone], .hero-tomb");

      if (isTomb) {
        setHoverState("tombstone");
      } else if (isButton) {
        setHoverState("button");
      } else {
        setHoverState("idle");
      }
    };

    const handleMouseDown = () => {
      setIsClicking(true);
      // Spawn click sparkles
      const px = posRef.current.x;
      const py = posRef.current.y;
      const newSparkles: SparkleParticle[] = [];
      const colors = ["#FFC857", "#A982F2", "#FFF1D2", "#A8E6A1"];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6 + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 2.5;
        newSparkles.push({
          id: ++particleIdRef.current,
          x: px,
          y: py,
          color: colors[i % colors.length],
          size: Math.random() > 0.5 ? 4 : 3,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
        });
      }
      setSparkles((prev) => [...prev, ...newSparkles].slice(-16));
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Smooth lerp loop
    let lastTime = performance.now();
    const update = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const pos = posRef.current;
      // Lerp ghost position towards mouse target
      const lerp = 0.22;
      pos.x += (pos.targetX - pos.x) * lerp;
      pos.y += (pos.targetY - pos.y) * lerp;

      if (ghostRef.current) {
        // Offset so ghost floats slightly to upper-right of pointer tip
        const offsetX = hoverState === "tombstone" ? 22 : 16;
        const offsetY = hoverState === "tombstone" ? -18 : -22;
        const bob = Math.sin(time * 0.005) * 3;
        ghostRef.current.style.transform = `translate3d(${pos.x + offsetX}px, ${pos.y + offsetY + bob}px, 0)`;
      }

      // Update sparkles
      setSparkles((prev) => {
        if (!prev.length) return prev;
        return prev
          .map((s) => ({
            ...s,
            x: s.x + s.vx,
            y: s.y + s.vy,
            alpha: s.alpha - dt * 2.2,
          }))
          .filter((s) => s.alpha > 0);
      });

      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isTouch, reduced, hoverState]);

  if (isTouch || reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      {/* Ghost mascot container */}
      <div
        ref={ghostRef}
        className="absolute top-0 left-0 transition-transform will-change-transform"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        <div
          className={`relative transition-all duration-150 ${
            isClicking
              ? "scale-x-125 scale-y-75"
              : hoverState === "button"
              ? "-rotate-12 scale-110"
              : hoverState === "tombstone"
              ? "rotate-6 scale-110"
              : "scale-100"
          }`}
        >
          {/* Subtle magical aura */}
          <div
            className={`absolute -inset-2 rounded-full blur-[6px] transition-opacity duration-200 ${
              hoverState === "tombstone"
                ? "bg-[#FFC857]/40 opacity-100"
                : hoverState === "button"
                ? "bg-[#A982F2]/45 opacity-100"
                : "bg-[#A982F2]/20 opacity-70"
            }`}
          />

          {/* Friendly Pixel Ghost SVG */}
          <svg
            width="32"
            height="34"
            viewBox="0 0 16 17"
            shapeRendering="crispEdges"
            className="relative drop-shadow-[0_4px_6px_rgba(23,24,62,0.6)]"
          >
            {/* Outline */}
            <rect x="5" y="1" width="6" height="1" fill="#17183E" />
            <rect x="3" y="2" width="2" height="1" fill="#17183E" />
            <rect x="11" y="2" width="2" height="1" fill="#17183E" />
            <rect x="2" y="3" width="1" height="2" fill="#17183E" />
            <rect x="13" y="3" width="1" height="2" fill="#17183E" />
            <rect x="1" y="5" width="1" height="8" fill="#17183E" />
            <rect x="14" y="5" width="1" height="8" fill="#17183E" />

            {/* Wavy bottom outline */}
            <rect x="2" y="13" width="1" height="2" fill="#17183E" />
            <rect x="3" y="15" width="2" height="1" fill="#17183E" />
            <rect x="5" y="14" width="2" height="1" fill="#17183E" />
            <rect x="7" y="15" width="2" height="1" fill="#17183E" />
            <rect x="9" y="14" width="2" height="1" fill="#17183E" />
            <rect x="11" y="15" width="2" height="1" fill="#17183E" />
            <rect x="13" y="13" width="1" height="2" fill="#17183E" />

            {/* Ghost Body (White / Cream) */}
            <rect x="5" y="2" width="6" height="1" fill="#FFF9F2" />
            <rect x="3" y="3" width="10" height="2" fill="#FFF9F2" />
            <rect x="2" y="5" width="12" height="8" fill="#FFF9F2" />
            <rect x="3" y="13" width="10" height="1" fill="#FFF9F2" />
            <rect x="3" y="14" width="2" height="1" fill="#FFF9F2" />
            <rect x="7" y="14" width="2" height="1" fill="#FFF9F2" />
            <rect x="11" y="14" width="2" height="1" fill="#FFF9F2" />

            {/* Ghost Soft Lavender Shading */}
            <rect x="2" y="11" width="1" height="2" fill="#DDD5F8" />
            <rect x="13" y="11" width="1" height="2" fill="#DDD5F8" />
            <rect x="3" y="13" width="10" height="1" fill="#DDD5F8" />

            {/* Eyes */}
            {hoverState === "button" ? (
              // Excited / curious eyes
              <>
                <rect x="4" y="6" width="2" height="2" fill="#17183E" />
                <rect x="10" y="6" width="2" height="2" fill="#17183E" />
                <rect x="4" y="6" width="1" height="1" fill="#FFF1D2" />
                <rect x="10" y="6" width="1" height="1" fill="#FFF1D2" />
                {/* Wand or pointing sparkle */}
                <rect x="14" y="4" width="2" height="2" fill="#FFC857" />
              </>
            ) : hoverState === "tombstone" ? (
              // Sweet curious happy eyes
              <>
                <rect x="4" y="5" width="2" height="3" fill="#17183E" />
                <rect x="10" y="5" width="2" height="3" fill="#17183E" />
                <rect x="4" y="5" width="1" height="1" fill="#FFC857" />
                <rect x="10" y="5" width="1" height="1" fill="#FFC857" />
                {/* Little mouth */}
                <rect x="7" y="9" width="2" height="1" fill="#17183E" />
              </>
            ) : (
              // Calm friendly eyes
              <>
                <rect x="4" y="6" width="2" height="2" fill="#17183E" />
                <rect x="10" y="6" width="2" height="2" fill="#17183E" />
                <rect x="4" y="6" width="1" height="1" fill="#FFF1D2" />
                <rect x="10" y="6" width="1" height="1" fill="#FFF1D2" />
              </>
            )}

            {/* Cute Rosy Blushing Cheeks */}
            <rect x="2" y="8" width="2" height="1" fill="#FF9DB5" />
            <rect x="12" y="8" width="2" height="1" fill="#FF9DB5" />
          </svg>

          {/* Tiny hovering indicator or prompt sparkle */}
          {hoverState === "button" && (
            <div className="absolute -top-3 -right-2 animate-bounce">
              <svg width="10" height="10" viewBox="0 0 5 5" shapeRendering="crispEdges">
                <rect x="2" y="0" width="1" height="5" fill="#FFC857" />
                <rect x="0" y="2" width="5" height="1" fill="#FFC857" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Dispersing click sparkles */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute"
          style={{
            left: `${s.x}px`,
            top: `${s.y}px`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            opacity: s.alpha,
            boxShadow: `0 0 4px ${s.color}`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}

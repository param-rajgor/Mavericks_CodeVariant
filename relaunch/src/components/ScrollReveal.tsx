import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/src/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** reveal each direct child in sequence (GSAP drives wrapper children only — Motion owns the inner hover/tap) */
  stagger?: number;
  y?: number;
  start?: string;
}

/**
 * GSAP/ScrollTrigger choreography: direct children rise in as the group enters.
 * Items it animates are never the elements Motion animates, so the two
 * libraries never fight over the same property.
 */
export function ScrollReveal({ children, className, stagger = 0.09, y = 24, start = "top 82%" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(el.children, {
        opacity: 0,
        y,
        duration: 0.6,
        ease: "steps(6)",
        stagger,
        clearProps: "opacity,transform",
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [reduced, stagger, y, start]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

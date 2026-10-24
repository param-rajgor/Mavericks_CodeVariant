import { motion } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { useReducedMotion } from "@/src/hooks/useReducedMotion";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  /** vertical travel in px (kept small — pixel-art friendly) */
  y?: number;
  as?: "div" | "section" | "p" | "h1" | "h2" | "h3" | "li" | "span";
  className?: string;
  once?: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fade + small rise when scrolled into view. Honors prefers-reduced-motion. */
export function Reveal({ children, delay = 0, duration = 0.7, y = 16, as = "div", className, once = true }: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as as "div"] as ElementType;
  if (reduced) {
    const Plain = as as ElementType;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

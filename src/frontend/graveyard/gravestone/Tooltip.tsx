import { useLayoutEffect, useRef, type RefObject } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import type { Stone as Project } from '@/frontend/graveyard/stone';
import { StatusPill } from './StatusPill';

interface TooltipProps {
  project: Project;
  variant: 'landing' | 'dashboard';
  /** The stone it points at. The tooltip lives in <body>, so it follows this element's on-screen box. */
  anchor: RefObject<HTMLElement | null>;
}

const WIDTH = 320;
const EDGE = 12;
const GAP = 22;

/**
 * The speech bubble above a gravestone: a cream bubble on the landing page, a dark panel on the dashboard
 * that says how to use the stone (drag it to decide, click it to look). Large, high-contrast type so it reads at a glance.
 * Rendered into a portal (see Gravestone), so no scene layer or stone can ever paint over it.
 */
export function GravestoneTooltip({ project, variant, anchor }: TooltipProps) {
  const isLanding = variant === 'landing';
  const fill = isLanding ? '#fff7e6' : 'var(--color-deep-panel)';
  const border = isLanding ? 'var(--color-stone-outline)' : 'var(--color-lavender)';
  const text = isLanding ? 'var(--color-text-dark)' : 'var(--color-text-primary)';
  const box = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLSpanElement>(null);

  // Track the stone every frame while open: on the landing page the stones move with the scroll story.
  useLayoutEffect(() => {
    let raf = 0;
    let last = '';
    const place = () => {
      const a = anchor.current?.getBoundingClientRect();
      if (a && box.current && arrow.current) {
        const cx = a.left + a.width / 2;
        const left = Math.min(Math.max(cx - WIDTH / 2, EDGE), window.innerWidth - WIDTH - EDGE);
        const key = `${left.toFixed(1)},${a.top.toFixed(1)}`;
        if (key !== last) {
          last = key;
          box.current.style.left = `${left}px`;
          box.current.style.top = `${a.top - GAP}px`;
          arrow.current.style.left = `${Math.min(Math.max(cx - left, 24), WIDTH - 24)}px`;
        }
      }
      raf = requestAnimationFrame(place);
    };
    place();
    return () => cancelAnimationFrame(raf);
  }, [anchor]);

  return (
    <motion.div
      ref={box}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="pixel-frame"
      style={{
        ['--bc' as string]: border,
        ['--sh' as string]: 'rgba(20,18,58,0.9)',
        position: 'fixed',
        top: -9999,
        left: 0,
        translate: '0 -100%',
        width: WIDTH,
        padding: '18px 22px 20px',
        background: fill,
        color: text,
        fontFamily: 'var(--font-body)',
        zIndex: 'var(--z-tooltip)',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1, letterSpacing: 1 }}>{project.name}</div>
        <StatusPill status={project.status} />
      </div>
      <div style={{ fontSize: 18, marginTop: 8, lineHeight: 1.5 }}>{project.description}</div>
      {isLanding ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 1, color: 'var(--color-mid-purple)' }}>
          Click to open this project <ChevronRight size={20} aria-hidden="true" />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 1, color: 'var(--color-gold)' }}>
          Drag to decide · click to look
        </div>
      )}
      <span
        ref={arrow}
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -18,
          left: '50%',
          translate: '-50% 0',
          width: 0,
          height: 0,
          borderLeft: '14px solid transparent',
          borderRight: '14px solid transparent',
          borderTop: `16px solid ${fill}`,
          filter: `drop-shadow(0 4px 0 ${border})`,
        }}
      />
    </motion.div>
  );
}

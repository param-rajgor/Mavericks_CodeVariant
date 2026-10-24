import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { PixelButton } from '@/frontend/ui/PixelButton';
import type { Stone as Project } from '@/frontend/graveyard/stone';
import { StatusPill } from './StatusPill';

interface TooltipProps {
  project: Project;
  variant: 'landing' | 'dashboard';
  onOpen?: () => void;
}

/**
 * The speech bubble above a gravestone: a cream bubble on the landing page, a dark panel with an
 * "Open project" button on the dashboard. Large, high-contrast type so it reads at a glance.
 */
export function GravestoneTooltip({ project, variant, onOpen }: TooltipProps) {
  const isLanding = variant === 'landing';
  const fill = isLanding ? '#fff7e6' : 'var(--color-deep-panel)';
  const border = isLanding ? 'var(--color-stone-outline)' : 'var(--color-lavender)';
  const text = isLanding ? 'var(--color-text-dark)' : 'var(--color-text-primary)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="pixel-frame"
      style={{
        ['--bc' as string]: border,
        ['--sh' as string]: 'rgba(20,18,58,0.9)',
        position: 'absolute',
        bottom: 'calc(100% + 22px)',
        left: '50%',
        translate: '-50% 0',
        width: 320,
        padding: '18px 22px 20px',
        background: fill,
        color: text,
        fontFamily: 'var(--font-ui)',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 24, lineHeight: 1.15 }}>{project.name}</div>
        <StatusPill status={project.status} />
      </div>
      <div style={{ fontWeight: 600, fontSize: 18, marginTop: 8, lineHeight: 1.4, opacity: 0.92 }}>{project.description}</div>
      {isLanding ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontWeight: 800, fontSize: 16, color: 'var(--color-mid-purple)' }}>
          Click to open this project <ChevronRight size={20} aria-hidden="true" />
        </div>
      ) : (
        <div style={{ marginTop: 14, pointerEvents: 'auto' }}>
          <PixelButton
            variant="gold"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.();
            }}
          >
            <ChevronRight size={16} /> OPEN PROJECT
          </PixelButton>
        </div>
      )}
      <span
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

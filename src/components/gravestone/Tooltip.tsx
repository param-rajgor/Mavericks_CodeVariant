import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { PixelButton } from '../nav/PixelButton';
import type { Project } from '../../data/projects';

interface TooltipProps {
  project: Project;
  variant: 'landing' | 'dashboard';
  onOpen?: () => void;
}

/** Hover tooltip above a gravestone — cream speech bubble on landing (spec §2),
 * dark panel with an Open Project button on the dashboard (spec §3). */
export function GravestoneTooltip({ project, variant, onOpen }: TooltipProps) {
  const isLanding = variant === 'landing';
  const fill = isLanding ? 'var(--color-text-primary)' : 'var(--color-deep-panel)';
  const border = isLanding ? 'var(--color-stone-outline)' : 'var(--color-lavender)';
  const text = isLanding ? 'var(--color-text-dark)' : 'var(--color-text-primary)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="notched hard-shadow"
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 220,
        padding: '12px 14px',
        background: fill,
        color: text,
        border: `2px solid ${border}`,
        fontFamily: 'var(--font-ui)',
        zIndex: 20,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 15 }}>
        {project.name}
        {!isLanding && ' —'}
      </div>
      <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.35, opacity: 0.9 }}>{project.description}</div>
      {isLanding ? (
        <ChevronRight size={16} style={{ marginTop: 6, color: 'var(--color-stone-outline)' }} />
      ) : (
        <div style={{ marginTop: 8 }}>
          <PixelButton
            variant="gold"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.();
            }}
          >
            <ChevronRight size={14} /> OPEN PROJECT
          </PixelButton>
        </div>
      )}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `10px solid ${fill}`,
        }}
      />
    </motion.div>
  );
}

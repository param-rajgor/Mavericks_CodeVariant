import { AnimatePresence, motion } from 'motion/react';

interface GraveyardTransitionProps {
  active: boolean;
  onComplete: () => void;
}

/** The gold sweep from spec §5: covers the screen while the route swaps underneath,
 * then continues off-screen to reveal the dashboard. */
export function GraveyardTransition({ active, onComplete }: GraveyardTransitionProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="sweep"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          onAnimationComplete={onComplete}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            pointerEvents: 'none',
            backgroundImage:
              'repeating-linear-gradient(90deg, var(--color-button-gold) 0 32px, var(--color-gold) 32px 64px), repeating-linear-gradient(0deg, rgba(36,35,79,0.18) 0 16px, transparent 16px 32px)',
            backgroundBlendMode: 'multiply',
          }}
        />
      )}
    </AnimatePresence>
  );
}

import { motion } from 'motion/react';
import { NavBar } from '@/frontend/navigation/NavBar';
import { Scene, SceneFront } from '@/frontend/scene/Scene';
import { Stage, ART_W, ART_H, GROUND_Y, STONE_ROW_X } from '@/frontend/scene/stage';
import { Hero } from '@/frontend/landing/Hero';
import { StatsBar } from '@/frontend/landing/StatsBar';
import { Gravestone } from '@/frontend/graveyard/gravestone/Gravestone';
import { useMemo } from 'react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { demoProjects } from '@/backend/domain/seed';
import { landingProjects, toStone } from '@/frontend/graveyard/stone';

interface LandingPageProps {
  /** Walk into the graveyard, optionally with one project already selected. */
  onEnter: (selectId?: string) => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const { projects } = useProjects();
  // With nothing saved yet the stones show the sample set, so the first screen is never empty.
  const stones = useMemo(() => landingProjects(projects.length ? projects : demoProjects()).map((p) => toStone(p)), [projects]);
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {/* Layers 1–8. Zooms in a little on exit (spec §5). */}
      <motion.div exit={{ scale: 1.08 }} transition={{ duration: 0.7, ease: 'easeIn' }} style={{ position: 'absolute', inset: 0, transformOrigin: '62% 70%' }}>
        <Scene variant="landing" />
      </motion.div>

      {/* Layer 9: the stones, on the same art grid so their bases sit on GROUND_Y. Not
       * wrapped in an exit animation: they glide to the dashboard via layoutId. */}
      <Stage style={{ zIndex: 1 }}>
        <div
          style={{
            position: 'absolute',
            left: `${(STONE_ROW_X / ART_W) * 100}%`,
            bottom: `${((ART_H - GROUND_Y) / ART_H) * 100}%`,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 50,
            transform: 'scale(calc(var(--s) / 5))',
            transformOrigin: 'left bottom',
            pointerEvents: 'auto',
          }}
        >
          {stones.map((project) => (
            <Gravestone key={project.id} project={project} variant="landing" layoutId={`stone-${project.id}`} onClick={() => onEnter(project.id)} />
          ))}
        </div>
      </Stage>

      {/* Layers 10–12. The foreground slides down out of view on exit. */}
      <motion.div exit={{ y: '14%' }} transition={{ duration: 0.6, ease: 'easeIn' }} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        <SceneFront />
      </motion.div>

      <motion.div exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, ease: 'easeIn' }} style={{ position: 'relative', zIndex: 3 }}>
        <NavBar variant="landing" onLogin={() => onEnter()} onGetStarted={() => onEnter()} />
      </motion.div>

      <motion.div
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.45, ease: 'easeIn' }}
        style={{ position: 'absolute', left: '2vw', top: '17vh', zIndex: 3 }}
      >
        <Hero onEnter={() => onEnter()} />
      </motion.div>

      <motion.div
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        style={{ position: 'absolute', left: '50%', bottom: '3vh', x: '-50%', zIndex: 3, width: 'max-content', maxWidth: '96vw' }}
      >
        <StatsBar />
      </motion.div>
    </div>
  );
}

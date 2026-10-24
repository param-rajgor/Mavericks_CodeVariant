import { motion } from 'motion/react';
import { NavBar } from '../components/nav/NavBar';
import { Scene, SceneFront } from '../components/scene/Scene';
import { Stage, ART_W, ART_H, GROUND_Y, STONE_ROW_X } from '../components/scene/stage';
import { Hero } from '../components/landing/Hero';
import { StatsBar } from '../components/landing/StatsBar';
import { Gravestone } from '../components/gravestone/Gravestone';
import { PROJECTS, LANDING_PROJECT_IDS } from '../data/projects';

const landingProjects = LANDING_PROJECT_IDS.map((id) => PROJECTS.find((p) => p.id === id)!);

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
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
          {landingProjects.map((project) => (
            <Gravestone key={project.id} project={project} variant="landing" layoutId={`stone-${project.id}`} onClick={onEnter} />
          ))}
        </div>
      </Stage>

      {/* Layers 10–12. The foreground slides down out of view on exit. */}
      <motion.div exit={{ y: '14%' }} transition={{ duration: 0.6, ease: 'easeIn' }} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        <SceneFront />
      </motion.div>

      <motion.div exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, ease: 'easeIn' }} style={{ position: 'relative', zIndex: 3 }}>
        <NavBar variant="landing" onGetStarted={onEnter} />
      </motion.div>

      <motion.div
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.45, ease: 'easeIn' }}
        style={{ position: 'absolute', left: '2vw', top: '17vh', zIndex: 3 }}
      >
        <Hero onEnter={onEnter} />
      </motion.div>

      <motion.div
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        style={{ position: 'absolute', left: '50%', bottom: '3vh', x: '-50%', zIndex: 3 }}
      >
        <StatsBar />
      </motion.div>
    </div>
  );
}

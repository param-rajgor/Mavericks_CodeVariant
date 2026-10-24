import { motion } from 'motion/react';
import { NavBar } from '@/frontend/navigation/NavBar';
import { Scene, SceneFront } from '@/frontend/scene/Scene';
import { Stage, ART_W, ART_H, GROUND_Y, STONE_ROW_X } from '@/frontend/scene/stage';
import { Hero } from '@/frontend/landing/Hero';
import { StatsBar } from '@/frontend/landing/StatsBar';
import { Gravestone } from '@/frontend/graveyard/gravestone/Gravestone';
import type { Stone } from '@/frontend/graveyard/stone';

interface StaticLandingProps {
  /** Walk into the graveyard, optionally with one project already selected. */
  onEnter: (selectId?: string) => void;
  stones: Stone[];
}

export function StaticLanding({ onEnter, stones }: StaticLandingProps) {
  return (
    <div style={{ background: 'var(--color-night-indigo)' }}>
    <div style={{ position: 'relative', height: '100svh', minHeight: 640, overflow: 'hidden' }}>
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
    <StaticStory />
    </div>
  );
}

const SCENES = [
  {
    title: 'The forgotten graveyard',
    lines: ['Every unfinished project has a story.', 'Some need more time. Some need a new direction. Some are ready to rest.', 'Before you give up on an idea, understand what remains.'],
  },
  {
    title: 'The crossroads of possibilities',
    lines: ['Every project has a next move.', 'Understand what you have built, what you can recover, and where you want to go next.', 'Continue, restart, pivot, repurpose or archive. None of them is failure.'],
  },
  { title: 'The light of a new chapter', lines: ['Same ideas. A clearer tomorrow.', 'Your next chapter starts with one small decision.'] },
];

/** The same three scenes as plain, still text, for visitors who ask for reduced motion. */
function StaticStory() {
  return (
    <section aria-label="The story of Relaunch" style={{ maxWidth: 820, margin: '0 auto', padding: '56px 24px 72px', fontFamily: 'var(--font-body)' }}>
      {SCENES.map((sc, i) => (
        <div key={sc.title} style={{ marginBottom: 40 }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 26, color: 'var(--color-gold)' }}>
            Scene {i + 1} · {sc.title}
          </p>
          {sc.lines.map((l) => (
            <p key={l} style={{ margin: '10px 0 0', fontSize: 22, lineHeight: 1.5, color: 'var(--color-text-primary)' }}>
              {l}
            </p>
          ))}
        </div>
      ))}
      <a href="#/graveyard" className="rl-btn rl-btn-gold rl-btn-lg">
        BRING AN IDEA BACK TO LIFE →
      </a>
    </section>
  );
}

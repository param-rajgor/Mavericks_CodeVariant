import { useState } from 'react';
import { MotionConfig, AnimatePresence } from 'motion/react';
import { useRoute, navigate } from './router';
import { LandingPage } from './pages/LandingPage';
import { GraveyardPage } from './pages/GraveyardPage';
import { GraveyardTransition } from './components/transition/GraveyardTransition';

export default function App() {
  const route = useRoute();
  const [sweeping, setSweeping] = useState(false);

  function enterGraveyard() {
    if (sweeping) return;
    setSweeping(true);
    // Swap the route while the sweep is covering the screen (spec §5).
    window.setTimeout(() => navigate('/graveyard'), 320);
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="sync">
        {route.name === 'landing' && <LandingPage key="landing" onEnter={enterGraveyard} />}
        {route.name === 'graveyard' && <GraveyardPage key="graveyard" />}
        {route.name === 'not-found' && (
          <div key="not-found" style={{ padding: 48 }}>
            Not found
          </div>
        )}
      </AnimatePresence>
      <GraveyardTransition active={sweeping} onComplete={() => setSweeping(false)} />
    </MotionConfig>
  );
}

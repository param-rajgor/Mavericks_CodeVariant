import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { NavBar } from '@/frontend/navigation/NavBar';
import { Scene } from '@/frontend/scene/Scene';

/**
 * The frame for every page that is not the landing page or the graveyard: the same twilight world behind,
 * the same top bar, and a roomy content column. The scene is fixed, so it stays put while the page scrolls.
 */
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { memoryOnly } = useProjects();
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-scene)' }}>
        <Scene variant="dashboard" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(30,28,72,0.5), rgba(30,28,72,0.78))' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 'var(--z-stones)' }}>
        <NavBar variant="dashboard" />
        {memoryOnly && (
          <div role="alert" style={{ margin: '12px 28px 0', padding: '10px 16px', border: '2px solid var(--color-gold)', background: '#3a2f1a', color: 'var(--color-gold)', fontWeight: 800 }}>
            Storage is unavailable, so changes will not be saved. Export a backup from Settings before closing this tab.
          </div>
        )}
        <motion.main id="main" tabIndex={-1} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ outline: 'none', padding: '28px 28px 72px', maxWidth: 1280, margin: '0 auto' }}>
          {children}
        </motion.main>
      </div>
    </div>
  );
}

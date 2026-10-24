import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { HardDriveDownload } from 'lucide-react';
import { matchRoute, navigate, useLocation } from '@/frontend/routing/router';
import { ProjectsProvider, useProjects } from '@/backend/store/ProjectsContext';
import { ToastProvider } from '@/frontend/ui/Toast';
import { Button, EmptyState, LinkButton, Spinner } from '@/frontend/ui/primitives';
import { LandingPage } from '@/frontend/landing/LandingPage';
import { GraveyardTransition } from '@/frontend/landing/GraveyardTransition';
import { GraveyardPage } from '@/frontend/graveyard/GraveyardPage';
import { AppChrome } from '@/frontend/shell/AppChrome';
import { UndoKeys } from '@/frontend/shell/UndoKeys';
import { WorkspaceShell } from '@/frontend/shell/WorkspaceShell';
import { JournalPage } from '@/frontend/workspace/pages/JournalPage';
import { InsightsPage } from '@/frontend/workspace/pages/InsightsPage';
import { DecisionHubPage } from '@/frontend/workspace/pages/DecisionHubPage';
import { ArchivePage } from '@/frontend/workspace/pages/ArchivePage';
import { ProgressPage } from '@/frontend/workspace/pages/ProgressPage';
import { SettingsPage } from '@/frontend/workspace/pages/SettingsPage';
import { Scene } from '@/frontend/scene/Scene';

const TITLES: Record<string, string> = {
  landing: 'Relaunch: your ideas aren’t dead',
  graveyard: 'Graveyard',
  journal: 'Project Journal',
  insights: 'Insights',
  decision: 'Decision Shrine',
  archive: 'Archive',
  progress: 'Your Progress',
  settings: 'Settings',
  'not-found': 'Page not found',
};

function Routes() {
  const location = useLocation();
  const route = matchRoute(location);
  const [sweeping, setSweeping] = useState(false);
  const first = useRef(true);

  // On navigation: update the title, scroll to the top and move focus to the page heading.
  useEffect(() => {
    document.title = route.name === 'landing' ? TITLES.landing : `${TITLES[route.name]} · Relaunch`;
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    if (route.name === 'landing' || route.name === 'graveyard') return;
    requestAnimationFrame(() => (document.getElementById('page-title') ?? document.getElementById('main'))?.focus({ preventScroll: true }));
  }, [route.name]);

  function enterGraveyard(selectId?: string) {
    if (sweeping) return;
    setSweeping(true);
    // Swap the route while the gold sweep is covering the screen.
    window.setTimeout(() => navigate(selectId ? `/graveyard?select=${selectId}` : '/graveyard'), 320);
  }

  const inWorld = route.name === 'landing' || route.name === 'graveyard';
  let page = null;
  switch (route.name) {
    case 'journal': page = <JournalPage />; break;
    case 'insights': page = <InsightsPage />; break;
    case 'decision': page = <DecisionHubPage />; break;
    case 'archive': page = <ArchivePage />; break;
    case 'progress': page = <ProgressPage />; break;
    case 'settings': page = <SettingsPage />; break;
    case 'not-found':
      page = (
        <EmptyState icon={HardDriveDownload} title="That page does not exist" action={<LinkButton to="/graveyard" variant="gold">Back to the graveyard</LinkButton>}>
          The link may be out of date. Your projects are safe.
        </EmptyState>
      );
      break;
  }

  return (
    <AppChrome>
      <AnimatePresence mode="sync">
        {route.name === 'landing' && <LandingPage key="landing" onEnter={enterGraveyard} />}
        {route.name === 'graveyard' && <GraveyardPage key={`graveyard`} />}
      </AnimatePresence>
      {!inWorld && <WorkspaceShell>{page}</WorkspaceShell>}
      <GraveyardTransition active={sweeping} onComplete={() => setSweeping(false)} />
    </AppChrome>
  );
}

/** Holds the app back until local storage has loaded, with an honest message if it fails. */
function Gate() {
  const { state, error, retry, continueWithoutSaving } = useProjects();
  if (state === 'loading')
    return (
      <div style={{ position: 'fixed', inset: 0 }}>
        <Scene variant="landing" />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <Spinner label="Opening your graveyard" />
        </div>
      </div>
    );
  if (state === 'error')
    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'auto' }}>
        <Scene variant="landing" />
        <div style={{ position: 'relative', display: 'grid', placeItems: 'center', minHeight: '100%', padding: 24 }}>
          <div style={{ maxWidth: 560 }}>
            <EmptyState
              icon={HardDriveDownload}
              title="We could not open local storage"
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="gold" onClick={retry}>Try again</Button>
                  <Button onClick={continueWithoutSaving}>Continue without saving</Button>
                </div>
              }
            >
              {error} Relaunch keeps your projects in this browser. If this keeps happening, check whether private browsing or blocked site data is on. You can continue, but nothing will be saved.
            </EmptyState>
          </div>
        </div>
      </div>
    );
  return (
    <>
      <UndoKeys />
      <Routes />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <ProjectsProvider>
          <Gate />
        </ProjectsProvider>
      </ToastProvider>
    </MotionConfig>
  );
}

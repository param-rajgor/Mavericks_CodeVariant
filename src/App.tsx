import { useEffect, useRef } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { HardDriveDownload } from 'lucide-react';
import { useLocation, matchRoute } from './lib/router';
import { ProjectsProvider, useProjects } from './store/ProjectsContext';
import { ToastProvider } from './components/Toast';
import { AppShell } from './components/AppShell';
import { Button, EmptyState, LinkButton, Spinner } from './components/ui';
import { LandingPage } from './pages/LandingPage';
import { MyProjectsPage } from './pages/MyProjectsPage';
import { GraveyardPage } from './pages/GraveyardPage';
import { InsightsPage } from './pages/InsightsPage';
import { DecisionHubPage } from './pages/DecisionHubPage';
import { ArchivePage } from './pages/ArchivePage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { Scenery } from './ui/Scenery';

const TITLES: Record<string, string> = {
  landing: 'Relaunch — your ideas aren’t dead',
  projects: 'My Projects',
  new: 'My Projects',
  project: 'My Projects',
  graveyard: 'The Graveyard',
  insights: 'Insights',
  decision: 'Decision Hub',
  archive: 'Archive',
  progress: 'Your Progress',
  settings: 'Settings',
  'not-found': 'Page not found',
};

function Routes() {
  const location = useLocation();
  const route = matchRoute(location);
  const first = useRef(true);

  // On navigation: scroll to top, update the title, and move focus to the page heading for keyboard and screen-reader users.
  useEffect(() => {
    document.title = route.name === 'landing' ? TITLES.landing : `${TITLES[route.name]} · Relaunch`;
    if (first.current) {
      first.current = false;
      return;
    }
    if (route.name === 'landing') return;
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => (document.getElementById('page-title') ?? document.getElementById('main'))?.focus({ preventScroll: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.name]);

  if (route.name === 'landing') return <LandingPage />;

  let page;
  switch (route.name) {
    case 'projects':
    case 'new':
    case 'project': page = <MyProjectsPage />; break;
    case 'graveyard': page = <GraveyardPage />; break;
    case 'insights': page = <InsightsPage />; break;
    case 'decision': page = <DecisionHubPage />; break;
    case 'archive': page = <ArchivePage />; break;
    case 'progress': page = <ProgressPage />; break;
    case 'settings': page = <SettingsPage />; break;
    default:
      page = (
        <EmptyState icon={HardDriveDownload} title="That page does not exist" action={<LinkButton to="/app" variant="gold">Back to My Projects</LinkButton>}>
          The link may be out of date. Your projects are safe.
        </EmptyState>
      );
  }

  return (
    <AppShell>
      <motion.div key={route.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {page}
      </motion.div>
    </AppShell>
  );
}

/** Blocks the app until local storage has loaded, with an honest message if it fails. */
function Gate() {
  const { state, error, retry, continueWithoutSaving } = useProjects();
  if (state === 'loading')
    return (
      <div className="grid min-h-screen place-items-center text-soft">
        <Scenery />
        <Spinner label="Opening your graveyard" />
      </div>
    );
  if (state === 'error')
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <Scenery />
        <div className="max-w-lg">
          <EmptyState
            icon={HardDriveDownload}
            title="We could not open local storage"
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="gold" onClick={retry}>Try again</Button>
                <Button onClick={continueWithoutSaving}>Continue without saving</Button>
              </div>
            }
          >
            {error} Relaunch keeps your projects in this browser. If this keeps happening, check whether private browsing or blocked site data is on. You can continue, but nothing will be saved.
          </EmptyState>
        </div>
      </div>
    );
  return <Routes />;
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

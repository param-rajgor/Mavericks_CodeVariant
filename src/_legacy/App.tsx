import { useEffect, useRef } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { HardDriveDownload } from 'lucide-react';
import { useLocation, matchRoute } from './lib/router';
import { ProjectsProvider, useProjects } from './store/ProjectsContext';
import { ToastProvider } from './components/Toast';
import { AppShell } from './components/AppShell';
import { Button, EmptyState, LinkButton, Spinner } from './components/ui';
import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { LogProjectPage } from './pages/LogProjectPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { DecisionPage } from './pages/DecisionPage';
import { PathsPage } from './pages/PathsPage';
import { TimelinePage } from './pages/TimelinePage';
import { ArchivePage } from './pages/ArchivePage';
import { DataPage } from './pages/DataPage';

const TITLES: Record<string, string> = {
  landing: 'Relaunch — your ideas aren’t dead',
  overview: 'Overview',
  projects: 'My Projects',
  new: 'Log a project',
  project: 'Project',
  decision: 'Decision',
  paths: 'Relaunch Paths',
  timeline: 'Timeline',
  archive: 'Archive',
  data: 'Your data',
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
  }, [route.name, 'id' in route ? route.id : '']);

  if (route.name === 'landing') return <LandingPage />;

  let page;
  switch (route.name) {
    case 'overview': page = <OverviewPage />; break;
    case 'projects': page = <PortfolioPage />; break;
    case 'new': page = <LogProjectPage />; break;
    case 'project': page = <ProjectDetailPage id={route.id} />; break;
    case 'decision': page = <DecisionPage id={route.id} />; break;
    case 'paths': page = <PathsPage />; break;
    case 'timeline': page = <TimelinePage projectId={route.project} />; break;
    case 'archive': page = <ArchivePage />; break;
    case 'data': page = <DataPage />; break;
    default:
      page = (
        <EmptyState icon={HardDriveDownload} title="That page does not exist" action={<LinkButton to="/app" variant="gold">Go home</LinkButton>}>
          The link may be out of date. Your projects are safe.
        </EmptyState>
      );
  }

  return (
    <AppShell>
      <motion.div key={location} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
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
      <div className="grid min-h-screen place-items-center bg-night text-soft">
        <Spinner label="Opening your graveyard" />
      </div>
    );
  if (state === 'error')
    return (
      <div className="grid min-h-screen place-items-center bg-soft p-6">
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

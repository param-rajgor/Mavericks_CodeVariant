import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Archive, ChevronRight, Clock, Database, FolderKanban, Home, Menu, Plus, Signpost, X } from 'lucide-react';
import { Link, useRoute, type Route } from '../lib/router';
import { PixelRocket } from '../landing/components/icons';
import { buttonClass } from './ui';
import { useModalBehavior } from './Dialog';
import { useProjects } from '../store/ProjectsContext';

const NAV = [
  { to: '/app', label: 'Home', icon: Home, match: ['overview'] },
  { to: '/projects', label: 'My Projects', icon: FolderKanban, match: ['projects', 'project', 'new', 'decision'] },
  { to: '/paths', label: 'Relaunch Paths', icon: Signpost, match: ['paths'] },
  { to: '/timeline', label: 'Timeline', icon: Clock, match: ['timeline'] },
  { to: '/archive', label: 'Archive', icon: Archive, match: ['archive'] },
] as const;

function NavLinks({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, match }) => {
        const active = (match as readonly string[]).includes(route.name);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-md border-2 px-3 text-sm font-extrabold transition-colors ${
              active ? 'border-gold bg-gold text-night' : 'border-transparent text-cream hover:bg-twilight/50'
            }`}
          >
            <Icon aria-hidden className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
  return (
    <div className="surface-dark flex h-full flex-col gap-6 p-4">
      <Link to="/" onClick={onNavigate} className="flex min-h-11 items-center gap-3" aria-label="Relaunch landing page">
        <PixelRocket size={32} />
        <span className="font-pixel text-sm text-soft">RELAUNCH</span>
      </Link>
      <Link to="/projects/new" onClick={onNavigate} className={buttonClass('gold', false, 'w-full')}>
        <Plus aria-hidden className="size-4" /> New Project
      </Link>
      <NavLinks route={route} onNavigate={onNavigate} />
      <div className="mt-auto space-y-3">
        <Link
          to="/data"
          onClick={onNavigate}
          aria-current={route.name === 'data' ? 'page' : undefined}
          className={`flex min-h-11 items-center gap-3 rounded-md border-2 px-3 text-sm font-bold ${route.name === 'data' ? 'border-gold bg-gold text-night' : 'border-transparent text-cream hover:bg-twilight/50'}`}
        >
          <Database aria-hidden className="size-5" /> Your data
        </Link>
        <p className="px-1 text-xs text-[#c9c4ee]">Everything stays on this device. No account needed.</p>
      </div>
    </div>
  );
}

function Drawer({ open, onClose, route }: { open: boolean; onClose: () => void; route: Route }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <AnimatePresence>
      {open && <DrawerBody key="drawer" onClose={onClose} route={route} innerRef={ref} />}
    </AnimatePresence>
  );
}

function DrawerBody({ onClose, route, innerRef }: { onClose: () => void; route: Route; innerRef: React.RefObject<HTMLDivElement | null> }) {
  useModalBehavior(innerRef, true, onClose);
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <motion.div className="absolute inset-0 bg-night/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={onClose} aria-hidden />
      <motion.div
        ref={innerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        tabIndex={-1}
        className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-night"
        initial={{ x: -288 }}
        animate={{ x: 0 }}
        exit={{ x: -288 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <button type="button" onClick={onClose} aria-label="Close menu" className="absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-md text-cream hover:bg-twilight/50">
          <X aria-hidden className="size-5" />
        </button>
        <SidebarContent route={route} onNavigate={onClose} />
      </motion.div>
    </div>
  );
}

function Breadcrumbs({ route }: { route: Route }) {
  const { get } = useProjects();
  const crumbs: Array<{ label: string; to?: string }> = [{ label: 'Home', to: '/app' }];
  switch (route.name) {
    case 'projects': crumbs.push({ label: 'My Projects' }); break;
    case 'new': crumbs.push({ label: 'My Projects', to: '/projects' }, { label: 'New project' }); break;
    case 'project': crumbs.push({ label: 'My Projects', to: '/projects' }, { label: get(route.id)?.name ?? 'Project' }); break;
    case 'decision': crumbs.push({ label: 'My Projects', to: '/projects' }, { label: get(route.id)?.name ?? 'Project', to: `/projects/${route.id}` }, { label: 'Decision' }); break;
    case 'paths': crumbs.push({ label: 'Relaunch Paths' }); break;
    case 'timeline': crumbs.push({ label: 'Timeline' }); break;
    case 'archive': crumbs.push({ label: 'Archive' }); break;
    case 'data': crumbs.push({ label: 'Your data' }); break;
    case 'overview': return <span className="text-sm font-bold text-muted">Overview</span>;
    default: crumbs.push({ label: 'Not found' });
  }
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-sm text-muted">
        {crumbs.map((c, i) => (
          <li key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight aria-hidden className="size-3.5 shrink-0" />}
            {c.to ? (
              <Link to={c.to} className="inline-flex min-h-11 items-center font-bold underline-offset-2 hover:underline">{c.label}</Link>
            ) : (
              <span aria-current="page" className="truncate font-extrabold text-night">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const route = useRoute();
  const { memoryOnly } = useProjects();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [route.name]);

  return (
    <div className="min-h-screen bg-soft text-night lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen bg-night lg:block" aria-label="Sidebar">
        <SidebarContent route={route} />
      </aside>
      <Drawer open={open} onClose={() => setOpen(false)} route={route} />

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b-2 border-line bg-soft/95 px-3 backdrop-blur sm:px-6">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="-ml-1 grid size-11 place-items-center rounded-md hover:bg-[#f1ecff] lg:hidden">
            <Menu aria-hidden className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <Breadcrumbs route={route} />
          </div>
          <Link to="/projects/new" className={buttonClass('gold', true)}>
            <Plus aria-hidden className="size-4" /> <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Link>
        </header>
        {memoryOnly && (
          <div role="alert" className="border-b-2 border-[#e0b44c] bg-[#FFE9B8] px-4 py-2 text-sm font-bold text-[#6B4A00]">
            Storage is unavailable, so changes will not be saved. Export a backup from Your data before closing this tab.
          </div>
        )}
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-6 outline-none sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

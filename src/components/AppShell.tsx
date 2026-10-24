import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Plus, Search, X } from 'lucide-react';
import { Link, navigate, useRoute, type Route } from '../lib/router';
import { Ghost, PixelIcon, Rocket, TreeAndCat, type IconName } from '../ui/pixel';
import { Scenery } from '../ui/Scenery';
import { GhostCursor } from '../landing/components/GhostCursor';
import { buttonClass } from './ui';
import { useModalBehavior } from './Dialog';
import { useProjects } from '../store/ProjectsContext';
import { journeyOf } from '../domain/insights';
import { NewProjectDialog } from './NewProjectDialog';
import { ProjectDetailDialog } from './ProjectDetailDialog';
import { ShellCtx } from './shellContext';

const NAV: ReadonlyArray<{ to: string; label: string; icon: IconName; match: Route['name'][] }> = [
  { to: '/app', label: 'My Projects', icon: 'house', match: ['projects', 'project', 'new', 'progress'] },
  { to: '/graveyard', label: 'Graveyard', icon: 'tomb', match: ['graveyard'] },
  { to: '/insights', label: 'Insights', icon: 'chart', match: ['insights'] },
  { to: '/decision', label: 'Decision Hub', icon: 'sign', match: ['decision'] },
  { to: '/archive', label: 'Archive', icon: 'chest', match: ['archive'] },
];

function NavRow({ to, label, icon, active, onNavigate }: { to: string; label: string; icon: IconName; active: boolean; onNavigate?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-extrabold transition-transform hover:translate-x-0.5 ${
        active ? 'bg-lavender text-night shadow-[0_4px_0_#0d0e2b]' : 'text-cream hover:bg-panel-2'
      }`}
    >
      <span className="grid w-8 place-items-center">
        <PixelIcon name={icon} size={26} outline={active} />
      </span>
      {label}
    </Link>
  );
}

function SidebarContent({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-side px-4 pb-0 pt-8">
      <Link to="/" onClick={onNavigate} className="mb-9 flex min-h-11 items-center gap-3 px-1" aria-label="Relaunch landing page">
        <Rocket style={{ width: 36, height: 36 }} />
        <span className="font-pixel text-[15px] tracking-wide text-soft">RELAUNCH</span>
      </Link>
      <nav aria-label="Main" className="flex flex-col gap-2">
        {NAV.map((n) => (
          <NavRow key={n.to} {...n} active={n.match.includes(route.name)} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="mt-auto">
        <div className="relative z-10 pb-2">
          <NavRow to="/settings" label="Settings" icon="gear" active={route.name === 'settings'} onNavigate={onNavigate} />
        </div>
        <div className="relative -mx-4 h-[250px]">
          <div className="absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-side to-transparent" />
          <TreeAndCat className="absolute inset-0" />
        </div>
      </div>
      <p className="sr-only">Everything stays on this device. No account needed.</p>
    </div>
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
        className="absolute inset-y-0 left-0 w-[19.5rem] max-w-[85vw] border-r-4 border-twilight bg-side"
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-4 top-6 z-20 grid size-11 place-items-center rounded-xl border-[3px] border-lavender bg-panel-2 text-cream"
        >
          <X aria-hidden className="size-5" />
        </button>
        <SidebarContent route={route} onNavigate={onClose} />
      </motion.div>
    </div>
  );
}

function LevelPill() {
  const { projects } = useProjects();
  const j = useMemo(() => journeyOf(projects), [projects]);
  return (
    <Link
      to="/progress"
      aria-label={`Level ${j.level}, ${j.done} of 5 steps. Open your progress.`}
      className="flex min-h-14 items-center gap-3 rounded-xl border-[3px] border-twilight bg-panel px-4 shadow-[0_4px_0_#0d0e2b] transition-transform hover:-translate-y-0.5"
    >
      <PixelIcon name="sprout" size={22} />
      <span className="block w-36">
        <span className="block whitespace-nowrap text-[13px] font-extrabold text-soft">
          Level {j.level} · {j.done}/5 steps
        </span>
        <span className="mt-1 block h-2.5 rounded-sm bg-[#0f1038]">
          <span className="block h-full rounded-sm bg-[#3ddc84]" style={{ width: `${(j.done / 5) * 100}%` }} />
        </span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const route = useRoute();
  const { memoryOnly } = useProjects();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMenu(false), [route.name]);

  const openNew = useCallback(() => setNewOpen(true), []);
  const openDetail = useCallback((id: string) => setDetailId(id), []);
  const api = useMemo(() => ({ search, setSearch, openNew, openDetail }), [search, openNew, openDetail]);

  // Deep links (the landing page, bookmarks) open their dialog, then settle on the page behind it.
  useEffect(() => {
    if (route.name === 'new') {
      setNewOpen(true);
      navigate('/app', { replace: true });
    } else if (route.name === 'project') {
      setDetailId(route.id);
      navigate('/app', { replace: true });
    }
  }, [route]);

  const plain = route.name === 'progress';
  return (
    <ShellCtx.Provider value={api}>
      <Scenery sun={!plain} />
      <a href="#main" className="sr-only z-[90] rounded bg-gold px-3 py-2 font-bold text-night focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <div className="relative min-h-screen text-cream lg:grid lg:grid-cols-[14.5rem_1fr]">
        <aside className="sticky top-0 hidden h-screen border-r-4 border-twilight lg:block" aria-label="Sidebar">
          <SidebarContent route={route} />
        </aside>
        <AnimatePresence>{menu && <DrawerBody key="drawer" onClose={() => setMenu(false)} route={route} innerRef={drawerRef} />}</AnimatePresence>

        <div className="min-w-0">
          <header className="flex items-center gap-3 px-4 pb-1 pt-4 sm:px-8 lg:pt-6">
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              aria-expanded={menu}
              className="grid size-14 shrink-0 place-items-center rounded-xl border-[3px] border-lavender bg-panel-2 text-cream shadow-[0_4px_0_#0d0e2b] lg:hidden"
            >
              <Menu aria-hidden className="size-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 lg:hidden" aria-label="Relaunch landing page">
              <span className="font-pixel text-sm text-soft [text-shadow:2px_2px_0_#0d0e2b]">RELAUNCH</span>
            </Link>

            <label className="relative ml-0 hidden w-full max-w-[19.5rem] lg:block">
              <span className="sr-only">Search your buried ideas</span>
              <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-twilight" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (route.name !== 'projects' && route.name !== 'graveyard') navigate('/graveyard');
                }}
                placeholder={route.name === 'graveyard' ? 'Search the graveyard…' : 'Search your buried ideas…'}
                className="h-14 w-full rounded-xl border-[3px] border-lavender bg-[#f3eaff] pl-11 pr-3 text-[15px] font-semibold text-night shadow-[0_4px_0_#0d0e2b] placeholder:text-[#6b6c93]"
              />
            </label>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden lg:block">
                <LevelPill />
              </div>
              <button type="button" onClick={openNew} className={buttonClass('gold', false, '!min-h-14 !px-5 !text-[15px]')}>
                <Plus aria-hidden className="size-5" strokeWidth={3} />
                <span className="hidden sm:inline">New Project</span>
                <span className="sm:hidden">New</span>
              </button>
              <Link
                to="/settings"
                aria-label="Settings and your data"
                className="hidden size-14 place-items-center rounded-xl border-[3px] border-lavender bg-panel-2 shadow-[0_4px_0_#0d0e2b] transition-transform hover:-translate-y-0.5 sm:grid"
              >
                <Ghost style={{ width: 28, height: 28 }} />
              </Link>
            </div>
          </header>
          {memoryOnly && (
            <div role="alert" className="mx-4 mt-3 rounded-lg border-[3px] border-gold bg-[#3a2f1a] px-4 py-2 text-sm font-bold text-gold sm:mx-8">
              Storage is unavailable, so changes will not be saved. Export a backup from Settings before closing this tab.
            </div>
          )}
          <main id="main" tabIndex={-1} className="w-full px-4 pb-16 pt-4 outline-none sm:px-8">
            {children}
          </main>
        </div>
      </div>
      <NewProjectDialog open={newOpen} onClose={() => setNewOpen(false)} />
      <ProjectDetailDialog id={detailId} onClose={() => setDetailId(null)} />
      <GhostCursor />
    </ShellCtx.Provider>
  );
}

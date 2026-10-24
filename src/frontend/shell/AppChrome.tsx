import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { SeedFormModal } from '@/frontend/graveyard/SeedFormModal';
import { ProjectDetailModal } from '@/frontend/graveyard/ProjectDetailModal';

/**
 * The few things any page can ask for: plant a new project, or open one project's details.
 * The dialogs live here, once, so every page opens exactly the same ones.
 */
interface Chrome {
  openNew: () => void;
  openDetail: (id: string) => void;
}

const ChromeCtx = createContext<Chrome | null>(null);

export function useChrome(): Chrome {
  const c = useContext(ChromeCtx);
  if (!c) throw new Error('useChrome must be used inside AppChrome');
  return c;
}

export function AppChrome({ children }: { children: ReactNode }) {
  const [newOpen, setNewOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const openNew = useCallback(() => setNewOpen(true), []);
  const openDetail = useCallback((id: string) => setDetailId(id), []);
  const value = useMemo(() => ({ openNew, openDetail }), [openNew, openDetail]);
  return (
    <ChromeCtx.Provider value={value}>
      {children}
      <SeedFormModal open={newOpen} onClose={() => setNewOpen(false)} />
      <ProjectDetailModal id={detailId} onClose={() => setDetailId(null)} />
    </ChromeCtx.Provider>
  );
}

import { createContext, useContext } from 'react';

export interface ShellApi {
  search: string;
  setSearch: (s: string) => void;
  openNew: () => void;
  openDetail: (id: string) => void;
}

export const ShellCtx = createContext<ShellApi | null>(null);

export function useShell(): ShellApi {
  const c = useContext(ShellCtx);
  if (!c) throw new Error('useShell must be used inside AppShell');
  return c;
}

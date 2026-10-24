import { useSyncExternalStore, type AnchorHTMLAttributes, type ReactNode } from 'react';

/** A tiny hash router: works on any static host, no server rewrites needed. */

export type Route =
  | { name: 'landing' }
  | { name: 'graveyard'; select?: string }
  | { name: 'journal' }
  | { name: 'insights' }
  | { name: 'decision'; id?: string }
  | { name: 'archive' }
  | { name: 'progress' }
  | { name: 'settings' }
  | { name: 'not-found' };

function read(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

export function useLocation(): string {
  return useSyncExternalStore(subscribe, read, () => '/');
}

export function matchRoute(location: string): Route {
  const [path, query = ''] = location.split('?');
  const params = new URLSearchParams(query);
  const seg = path.split('/').filter(Boolean).map(decodeURIComponent);
  const [a] = seg;
  if (seg.length === 0) return { name: 'landing' };
  if (seg.length > 1) return { name: 'not-found' };
  switch (a) {
    case 'graveyard':
    case 'app':
      return { name: 'graveyard', select: params.get('select') ?? undefined };
    case 'journal':
      return { name: 'journal' };
    case 'insights':
      return { name: 'insights' };
    case 'decision':
      return { name: 'decision', id: params.get('project') ?? undefined };
    case 'archive':
      return { name: 'archive' };
    case 'progress':
      return { name: 'progress' };
    case 'settings':
      return { name: 'settings' };
    default:
      return { name: 'not-found' };
  }
}

export function useRoute(): Route {
  return matchRoute(useLocation());
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (opts.replace) window.location.replace(`#${to}`);
  else window.location.hash = to;
}

export const hrefFor = (to: string) => `#${to}`;

export function Link({ to, children, ...rest }: { to: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <a href={hrefFor(to)} {...rest}>
      {children}
    </a>
  );
}

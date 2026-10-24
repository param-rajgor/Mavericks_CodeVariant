import { useSyncExternalStore, type AnchorHTMLAttributes, type ReactNode } from 'react';

/** A tiny hash router: works on any static host, no server rewrites needed. */

export type Route =
  | { name: 'landing' }
  | { name: 'overview' }
  | { name: 'projects' }
  | { name: 'new' }
  | { name: 'project'; id: string }
  | { name: 'decision'; id: string }
  | { name: 'paths' }
  | { name: 'timeline'; project?: string }
  | { name: 'archive' }
  | { name: 'data' }
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
  const [a, b, c] = seg;
  if (seg.length === 0) return { name: 'landing' };
  if (a === 'app' && seg.length === 1) return { name: 'overview' };
  if (a === 'projects') {
    if (seg.length === 1) return { name: 'projects' };
    if (b === 'new' && seg.length === 2) return { name: 'new' };
    if (seg.length === 2) return { name: 'project', id: b };
    if (seg.length === 3 && c === 'decision') return { name: 'decision', id: b };
  }
  if (a === 'paths' && seg.length === 1) return { name: 'paths' };
  if (a === 'timeline' && seg.length === 1) return { name: 'timeline', project: params.get('project') ?? undefined };
  if (a === 'archive' && seg.length === 1) return { name: 'archive' };
  if (a === 'data' && seg.length === 1) return { name: 'data' };
  return { name: 'not-found' };
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

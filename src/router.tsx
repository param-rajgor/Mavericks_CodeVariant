import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

/** Tiny path router for the two pages: "/" and "/graveyard". */

export type Route = { name: 'landing' } | { name: 'graveyard' } | { name: 'not-found' };

function read(): string {
  return window.location.pathname;
}

function subscribe(cb: () => void) {
  window.addEventListener('popstate', cb);
  window.addEventListener('pushstate', cb);
  return () => {
    window.removeEventListener('popstate', cb);
    window.removeEventListener('pushstate', cb);
  };
}

export function useLocation(): string {
  return useSyncExternalStore(subscribe, read, () => '/');
}

export function matchRoute(path: string): Route {
  if (path === '/' || path === '') return { name: 'landing' };
  if (path === '/graveyard') return { name: 'graveyard' };
  return { name: 'not-found' };
}

export function useRoute(): Route {
  return matchRoute(useLocation());
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (opts.replace) window.history.replaceState(null, '', to);
  else window.history.pushState(null, '', to);
  window.dispatchEvent(new Event('pushstate'));
}

export function Link({ to, children, onClick, ...rest }: { to: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

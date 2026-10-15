import { useEffect, useState } from 'react';

export type Route = { name: 'find' } | { name: 'report'; id: string } | { name: 'compare' };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  if (h.startsWith('report/')) {
    try {
      return { name: 'report', id: decodeURIComponent(h.slice('report/'.length)) };
    } catch {
      return { name: 'find' };
    }
  }
  if (h === 'compare') return { name: 'compare' };
  return { name: 'find' };
}

export function reportHref(id: string): string {
  return `#/report/${encodeURIComponent(id)}`;
}

/** Tiny hash router: keeps the app deployable as a static site with no server rewrites. */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

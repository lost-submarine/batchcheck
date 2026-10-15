import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { Route } from '../lib/route';

function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`rounded-lg px-3 py-2 text-sm font-semibold ${
        active ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </a>
  );
}

export function Layout({ route, children }: { route: Route; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to main content
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#/" className="flex items-center gap-2.5" aria-label="BatchCheck home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
              <ShieldCheck aria-hidden className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-brand-900">BatchCheck</span>
            <span className="rounded-md border border-slate-300 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Prototype
            </span>
          </a>
          <nav aria-label="Main" className="flex gap-1">
            <NavLink href="#/" active={route.name === 'find' || route.name === 'report'}>
              Find a report
            </NavLink>
            <NavLink href="#/compare" active={route.name === 'compare'}>
              Compare products
            </NavLink>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl space-y-2 px-4 py-6 text-sm text-slate-600 sm:px-6">
          <p>
            BatchCheck is an independent prototype. It is not affiliated with, endorsed by, or partnered with any
            brand or laboratory.
          </p>
          <p>
            It runs entirely in your browser on a small local dataset. It has no connection to any laboratory
            database and cannot verify that a report is authentic. It does not label products as safe or unsafe and
            is not medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

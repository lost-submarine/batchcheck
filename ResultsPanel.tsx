import { AlertTriangle, ExternalLink, FileSearch, Loader2, SearchX } from 'lucide-react';
import type { BatchRecord } from '../types';
import type { NearMatch, SearchResult } from '../lib/lookup';
import { OFFICIAL_PORTAL_URL } from '../data/products';
import { reportHref } from '../lib/route';
import { DemoBadge, StatusLabel } from './Badges';

export type Phase = 'idle' | 'loading' | 'done' | 'error';

interface Props {
  phase: Phase;
  result: SearchResult | null;
  searchedBatch: string;
  searchedProductLabel: string;
  errorMessage: string | null;
  onRetry: () => void;
}

export function OfficialPortalLink({ className = '' }: { className?: string }) {
  return (
    <a
      href={OFFICIAL_PORTAL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 font-semibold text-brand-800 underline underline-offset-2 ${className}`}
    >
      Official Little Joys report portal
      <ExternalLink aria-hidden className="h-4 w-4" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function RecordCard({ record, note }: { record: BatchRecord; note?: string }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        {record.provenance === 'demo' && <DemoBadge />}
        {note && (
          <span className="rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
            {note}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-600">
        {record.brand} · {record.productName}
      </p>
      <p className="mt-0.5 break-all font-mono text-base font-semibold text-slate-900">{record.batchNumber}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-slate-600">Report date</dt>
          <dd>{record.reportDate ?? 'Not provided'}</dd>
        </div>
        <div>
          <dt className="text-slate-600">Laboratory</dt>
          <dd>{record.laboratory ?? 'Not provided'}</dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-slate-600">Source link</dt>
          <dd>{record.reportUrl ? 'Listed' : 'No source link recorded'}</dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <StatusLabel record={record} />
        <a href={reportHref(record.id)} className="btn-secondary">
          View report details
          <span className="sr-only"> for batch {record.batchNumber}</span>
        </a>
      </div>
    </li>
  );
}

function NearMatches({ items }: { items: NearMatch[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-5 border-t border-slate-200 pt-4">
      <h3 className="text-base font-semibold text-slate-900">Different batch numbers you may have meant</h3>
      <p className="mt-1 text-sm text-slate-600">
        These are <strong>not</strong> the batch you searched for. Check the number on your pack against each one
        before opening it.
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((m) => (
          <RecordCard
            key={m.record.id}
            record={m.record}
            note={
              m.reason === 'same-batch-other-product'
                ? 'Same batch number, different product'
                : 'Similar batch number — not an exact match'
            }
          />
        ))}
      </ul>
    </div>
  );
}

export function ResultsPanel({
  phase,
  result,
  searchedBatch,
  searchedProductLabel,
  errorMessage,
  onRetry,
}: Props) {
  return (
    <section aria-labelledby="results-heading" aria-live="polite" className="card">
      <h2 id="results-heading" className="text-xl font-bold text-slate-900">
        Results
      </h2>

      {phase === 'idle' && (
        <div className="mt-4 flex items-start gap-3 text-slate-700">
          <FileSearch aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-slate-500" />
          <p>
            Nothing searched yet. Choose a brand and product, type a batch number, and press{' '}
            <strong>Search report</strong>. Matching reports will appear here.
          </p>
        </div>
      )}

      {phase === 'loading' && (
        <div role="status" className="mt-4 flex items-center gap-3 text-slate-700">
          <Loader2 aria-hidden className="h-6 w-6 animate-spin text-brand-700" />
          <p>Searching the local prototype dataset…</p>
        </div>
      )}

      {phase === 'error' && (
        <div role="alert" className="mt-4 rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangle aria-hidden className="h-5 w-5" />
            The search could not be completed
          </p>
          <p className="mt-1 text-sm">
            {errorMessage ?? 'The local dataset could not be loaded.'} No result is being shown, because showing
            anything else could mislead you.
          </p>
          <button type="button" className="btn-secondary mt-3" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}

      {phase === 'done' && result?.status === 'found' && (
        <div className="mt-4">
          <p className="text-slate-800">
            {result.matches.length === 1
              ? `1 record in this prototype matches “${result.normalized}” for ${searchedProductLabel}.`
              : `${result.matches.length} records match “${result.normalized}” for ${searchedProductLabel}. Open each one and check the details against your pack.`}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            A matching batch number does not on its own prove that a report is authentic or that it describes the
            product in your hands.
          </p>
          <ul className="mt-4 space-y-3">
            {result.matches.map((r) => (
              <RecordCard key={r.id} record={r} />
            ))}
          </ul>
        </div>
      )}

      {phase === 'done' && result?.status === 'not-found' && (
        <div className="mt-4">
          <div className="flex items-start gap-3">
            <SearchX aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-slate-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                No report found for “{searchedBatch.trim() || result.normalized}” in this prototype
              </h3>
              <p className="mt-1 text-slate-700">
                Searched for <strong>{searchedProductLabel}</strong>. This prototype only contains a small local
                dataset, so a missing result does <strong>not</strong> mean no report exists.
              </p>
              <p className="mt-2 text-slate-700">
                Check the batch number for typos, then look on the official portal:
              </p>
              <p className="mt-1">
                <OfficialPortalLink />
              </p>
            </div>
          </div>
          <NearMatches items={result.nearMatches} />
        </div>
      )}
    </section>
  );
}

import { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { BatchRecord } from '../types';
import { DemoBanner } from '../components/Badges';
import { ReportIdentity, VerificationLadder } from '../components/ReportIdentity';
import { TestingSummary } from '../components/TestingSummary';
import { UnderstandReport } from '../components/UnderstandReport';
import { EvidencePanel } from '../components/EvidencePanel';
import { OfficialPortalLink } from '../components/ResultsPanel';

export type ReportLoad =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'missing'; id: string }
  | { status: 'ready'; record: BatchRecord };

export function ReportPage({ load, onRetry }: { load: ReportLoad; onRetry: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [load.status]);

  const back = (
    <a href="#/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-800 underline underline-offset-2">
      <ArrowLeft aria-hidden className="h-4 w-4" />
      Back to search
    </a>
  );

  if (load.status === 'loading') {
    return (
      <div className="space-y-4">
        {back}
        <p role="status" className="card">Loading report…</p>
      </div>
    );
  }

  if (load.status === 'error') {
    return (
      <div className="space-y-4">
        {back}
        <div role="alert" className="card border-amber-400 bg-amber-50 text-amber-950">
          <h1 ref={headingRef} tabIndex={-1} className="text-xl font-bold">
            The report could not be loaded
          </h1>
          <p className="mt-1 text-sm">{load.message}</p>
          <button type="button" className="btn-secondary mt-3" onClick={onRetry}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (load.status === 'missing') {
    return (
      <div className="space-y-4">
        {back}
        <div className="card">
          <h1 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-slate-900">
            Report not found
          </h1>
          <p className="mt-2 text-slate-700">
            This prototype has no report with the reference “{load.id}”. The link may be wrong or out of date.
          </p>
          <p className="mt-2">
            <OfficialPortalLink />
          </p>
        </div>
      </div>
    );
  }

  const { record } = load;
  return (
    <div className="space-y-6">
      {back}
      <div>
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Batch report: {record.productName}
        </h1>
        <p className="mt-1 text-slate-600">Batch {record.batchNumber}</p>
      </div>
      {record.provenance === 'demo' && <DemoBanner />}
      <ReportIdentity record={record} />
      <VerificationLadder record={record} />
      <TestingSummary record={record} />
      <UnderstandReport record={record} />
      <EvidencePanel record={record} />
    </div>
  );
}

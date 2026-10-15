import { FlaskConical } from 'lucide-react';
import type { BatchRecord } from '../types';
import { VERIFICATION_LABEL } from '../lib/explain';

export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-amber-400 bg-amber-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-950 ${className}`}
    >
      <FlaskConical aria-hidden className="h-3.5 w-3.5" />
      DEMO DATA
    </span>
  );
}

/** Neutral (non red/green) label describing how far a record has been checked. */
export function StatusLabel({ record }: { record: BatchRecord }) {
  return (
    <span className="inline-flex rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
      {VERIFICATION_LABEL[record.verificationStatus]}
    </span>
  );
}

export function DemoBanner() {
  return (
    <div
      role="note"
      className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-amber-950"
    >
      <p className="flex items-center gap-2 font-bold">
        <DemoBadge />
        <span>This is a fictional record</span>
      </p>
      <p className="mt-2 text-sm leading-relaxed">
        It was created to demonstrate how BatchCheck works. It is not a real laboratory report, it does not
        describe any real product, and it must not be used to make decisions about food.
      </p>
    </div>
  );
}

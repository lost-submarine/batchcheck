import type { BatchRecord, TestParameter } from '../types';
import { interpretParameter } from '../lib/explain';

const RELATION_LABEL = {
  'at-or-below-max': 'At or below the documented maximum',
  'above-max': 'Above the documented maximum',
  'at-or-above-min': 'At or above the documented minimum',
  'below-min': 'Below the documented minimum',
} as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{children}</dd>
    </div>
  );
}

const MISSING = (text: string) => <span className="text-slate-600">{text}</span>;

function ParameterRow({ p }: { p: TestParameter }) {
  const interp = interpretParameter(p);
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4" data-testid={`param-${p.id}`}>
      <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3 lg:grid-cols-6">
        <Field label="Reported result">
          {p.result === null ? MISSING('Not reported') : <span className="font-semibold">{String(p.result)}</span>}
        </Field>
        <Field label="Unit">{p.unit ?? MISSING('Not documented')}</Field>
        <Field label="Limit / reference">
          {p.limit ? (
            <span>
              {p.limit.type === 'max' ? 'Maximum' : 'Minimum'} {p.limit.value} {p.limit.unit}
              <span className="block text-xs text-slate-600">{p.limit.basis}</span>
            </span>
          ) : (
            MISSING('Not documented')
          )}
        </Field>
        <Field label="Test method">{p.method ?? MISSING('Not provided')}</Field>
        <Field label="Source reference">{p.sourceRef ?? MISSING('Not provided')}</Field>
        <Field label="Interpretation">
          {interp.status === 'compared' ? (
            RELATION_LABEL[interp.relation]
          ) : (
            <span>
              {interp.text}
              <span className="block text-xs text-slate-600">{interp.reason}</span>
            </span>
          )}
        </Field>
      </dl>
    </li>
  );
}

export function TestingSummary({ record }: { record: BatchRecord }) {
  return (
    <section aria-labelledby="summary-heading" className="card">
      <h2 id="summary-heading" className="text-xl font-bold text-slate-900">
        Testing summary
      </h2>
      {record.parameters === null && (
        <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800">
          Test results are not available in this entry. The record exists, but no tested parameters were entered, so
          nothing can be shown or explained. Please consult the original report if one is linked.
        </p>
      )}
      {record.parameters !== null && record.parameters.length === 0 && (
        <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800">
          This entry documents no tested parameters.
        </p>
      )}
      {record.parameters !== null && record.parameters.length > 0 && (
        <>
          <p className="mt-1 text-sm text-slate-600">
            One card per parameter, exactly as recorded in this entry. Blank fields mean the information was not
            provided; the app never fills gaps.
          </p>
          <ul className="mt-4 space-y-3">
            {record.parameters.map((p) => (
              <ParameterRow key={p.id} p={p} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

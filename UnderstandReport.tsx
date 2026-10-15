import type { BatchRecord } from '../types';
import { explainParameter } from '../lib/explain';

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-slate-700">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{children}</dd>
    </div>
  );
}

export function UnderstandReport({ record }: { record: BatchRecord }) {
  const params = record.parameters ?? [];
  return (
    <section aria-labelledby="understand-heading" className="card">
      <h2 id="understand-heading" className="text-xl font-bold text-slate-900">
        Understand this report
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        These explanations are produced by fixed rules from the data above. They are not a medical or safety opinion,
        and they never replace advice from a doctor or the original report.
      </p>

      {params.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800">
          Insufficient information to interpret this report: no tested parameters are recorded in this entry.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {params.map((p) => {
            const e = explainParameter(p);
            return (
              <article key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                <dl className="mt-3 space-y-3">
                  <Item label="What it measures">{e.measures}</Item>
                  <Item label="What this result means">
                    {e.meaning}
                    {e.interpretation.status === 'compared' && <span> {e.interpretation.text}</span>}
                  </Item>
                  <Item label="The limit">{e.limit}</Item>
                  {e.interpretation.status === 'insufficient' && (
                    <Item label="Interpretation">
                      <strong>{e.interpretation.text}.</strong> {e.interpretation.reason}
                    </Item>
                  )}
                  <Item label="Information not available">
                    {e.unavailable.length > 0
                      ? `Not provided in this entry: ${e.unavailable.join(', ')}.`
                      : 'Nothing is missing from the fields this app tracks for this parameter.'}
                  </Item>
                  <Item label="What this test does not establish">
                    {e.doesNotEstablish} It describes one sample from one batch, not the whole product.
                  </Item>
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

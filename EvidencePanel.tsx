import type { BatchRecord } from '../types';

function Block({ title, items, children }: { title: string; items?: string[]; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {children}
      {items && (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EvidencePanel({ record }: { record: BatchRecord }) {
  const isDemo = record.provenance === 'demo';
  const params = record.parameters ?? [];

  const available: string[] = [];
  const missing: string[] = [];

  available.push(`Brand, product and batch number (${record.batchNumber})`);
  if (record.reportDate) available.push(`Report date (${record.reportDate})`);
  else missing.push('Report date');
  if (record.laboratory) available.push(`Laboratory name (${record.laboratory})`);
  else missing.push('Laboratory name');
  if (record.reportUrl) available.push('A source link');
  else missing.push('Source link');

  if (record.parameters === null) {
    missing.push('All test results (none were entered)');
  } else if (params.length === 0) {
    missing.push('Any tested parameters');
  } else {
    available.push(`${params.length} tested parameter${params.length === 1 ? '' : 's'}`);
    const noLimit = params.filter((p) => !p.limit).length;
    const noMethod = params.filter((p) => !p.method).length;
    const noUnit = params.filter((p) => !p.unit).length;
    const noResult = params.filter((p) => p.result === null).length;
    if (noResult) missing.push(`Result missing for ${noResult} parameter${noResult === 1 ? '' : 's'}`);
    if (noUnit) missing.push(`Unit missing for ${noUnit} parameter${noUnit === 1 ? '' : 's'}`);
    if (noLimit) missing.push(`No limit or reference value for ${noLimit} parameter${noLimit === 1 ? '' : 's'}`);
    if (noMethod) missing.push(`No test method for ${noMethod} parameter${noMethod === 1 ? '' : 's'}`);
  }
  if (missing.length === 0) missing.push('Nothing missing among the fields this app tracks');

  const unverified = [
    'That the report is authentic and was issued by the named laboratory',
    'That the tested sample came from the batch and product you are holding',
    'That the laboratory and its methods are accredited or suitable',
    'That the limits shown are the right ones for this product',
    record.verificationStatus === 'demo-data'
      ? 'Everything: this is fictional demonstration data'
      : 'That the values were transcribed without error (unless you compare them with the original)',
  ];

  const scope = [
    'A laboratory report covers specific samples and specific parameters only.',
    'It cannot establish every aspect of a product’s quality, nutrition or risk.',
    'Other batches, other contaminants, allergens and storage conditions are outside its scope unless listed.',
    'It does not replace advice from your child’s doctor or a food regulator.',
  ];

  return (
    <section aria-labelledby="evidence-heading" className="card">
      <h2 id="evidence-heading" className="text-xl font-bold text-slate-900">
        Evidence and limitations
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        These headings describe what is and isn’t known. They are not ratings, and this app does not score or rank
        products.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Block
          title={isDemo ? 'Recorded in this demo entry' : 'Available in the source document'}
          items={available}
        >
          {isDemo && (
            <p className="mt-1 text-sm text-slate-700">No source document exists for demo data. Fictional values only.</p>
          )}
        </Block>
        <Block title="Not provided in the source" items={missing} />
        <Block title="Not independently verified by this app" items={unverified} />
        <Block title="Scope and limitations of the tests" items={scope} />
      </div>
    </section>
  );
}

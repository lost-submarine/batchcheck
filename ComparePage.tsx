import { useEffect, useId, useRef, useState } from 'react';
import type { BatchRecord, Product } from '../types';
import { DemoBadge } from '../components/Badges';

const NOT_SOURCED = 'Not provided in this prototype’s dataset';

interface Column {
  product: Product;
  records: BatchRecord[];
  tests: string[];
}

function buildColumn(product: Product, records: BatchRecord[]): Column {
  const mine = records.filter((r) => r.productId === product.id);
  const tests = Array.from(
    new Set(mine.flatMap((r) => (r.parameters ?? []).map((p) => p.name))),
  );
  return { product, records: mine, tests };
}

function missingEvidence(c: Column): string[] {
  const out: string[] = [];
  if (!c.product.declared) out.push('No ingredient, protein or sugar information has been entered');
  else {
    if (!c.product.declared.ingredients) out.push('Ingredients');
    if (c.product.declared.proteinPer100g === undefined) out.push('Declared protein');
    if (c.product.declared.sugarPer100g === undefined) out.push('Declared sugar');
  }
  if (c.records.length === 0) out.push('No batch-specific report in this dataset');
  const noData = c.records.filter((r) => r.parameters === null).length;
  if (noData) out.push(`${noData} record${noData === 1 ? '' : 's'} with no test data entered`);
  const noLink = c.records.filter((r) => !r.reportUrl).length;
  if (noLink) out.push(`${noLink} record${noLink === 1 ? '' : 's'} with no source link`);
  return out;
}

export function ComparePage({ products, records }: { products: Product[]; records: BatchRecord[] }) {
  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const [aId, setAId] = useState(products[0]?.id ?? '');
  const [bId, setBId] = useState(products[1]?.id ?? products[0]?.id ?? '');

  const a = products.find((p) => p.id === aId);
  const b = products.find((p) => p.id === bId);
  const cols = [a, b].filter((p): p is Product => !!p).map((p) => buildColumn(p, records));

  const select = (id: string, value: string, set: (v: string) => void, label: string) => (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <select id={id} className="field-input" value={value} onChange={(e) => set(e.target.value)}>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.brand} — {p.name}
          </option>
        ))}
      </select>
    </div>
  );

  const rows: { label: string; cell: (c: Column) => React.ReactNode }[] = [
    {
      label: 'Data status',
      cell: (c) =>
        c.product.isFictional ? (
          <span className="inline-flex flex-wrap items-center gap-2">
            <DemoBadge /> Fictional product
          </span>
        ) : (
          'Real product — no reviewed reports bundled'
        ),
    },
    { label: 'Ingredients', cell: (c) => c.product.declared?.ingredients ?? NOT_SOURCED },
    {
      label: 'Declared protein (per 100 g)',
      cell: (c) =>
        c.product.declared?.proteinPer100g !== undefined
          ? `${c.product.declared.proteinPer100g} g`
          : NOT_SOURCED,
    },
    {
      label: 'Declared sugar (per 100 g)',
      cell: (c) =>
        c.product.declared?.sugarPer100g !== undefined ? `${c.product.declared.sugarPer100g} g` : NOT_SOURCED,
    },
    {
      label: 'Source of declared values',
      cell: (c) => c.product.declared?.source ?? NOT_SOURCED,
    },
    {
      label: 'Batch-specific reports in this dataset',
      cell: (c) =>
        c.records.length === 0
          ? 'None'
          : `${c.records.length} (${c.records.map((r) => r.batchNumber).join(', ')})`,
    },
    {
      label: 'Tests documented in available reports',
      cell: (c) => (c.tests.length > 0 ? c.tests.join(', ') : 'None documented'),
    },
    {
      label: 'Missing or unavailable evidence',
      cell: (c) => {
        const m = missingEvidence(c);
        return m.length === 0 ? 'Nothing missing among the fields compared' : (
          <ul className="list-disc space-y-1 pl-5">
            {m.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-tight text-brand-900">
          Compare documented information
        </h1>
        <p className="mt-2 text-slate-700">
          Side-by-side view of what is documented for two products. It shows what exists and what is missing. It
          does <strong>not</strong> rank products, score them, or say which is better or riskier, because no
          defensible method for that is built into this prototype.
        </p>
      </div>

      <div className="card grid gap-4 sm:grid-cols-2">
        {select(`${uid}-a`, aId, setAId, 'First product')}
        {select(`${uid}-b`, bId, setBId, 'Second product')}
      </div>

      <div className="card overflow-x-auto !p-0">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <caption className="sr-only">Documented information for the two selected products</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="px-4 py-3 font-semibold text-slate-700">
                Field
              </th>
              {cols.map((c) => (
                <th key={c.product.id} scope="col" className="px-4 py-3 font-semibold text-slate-900">
                  {c.product.brand}
                  <span className="block font-normal text-slate-700">{c.product.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-slate-100 align-top last:border-0">
                <th scope="row" className="w-1/4 px-4 py-3 font-semibold text-slate-700">
                  {row.label}
                </th>
                {cols.map((c) => (
                  <td key={c.product.id} className="px-4 py-3 text-slate-900">
                    {row.cell(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-600">
        “Declared” values are entered by hand from labels or websites and have not been verified by this app. Test
        results from different batches or laboratories are not directly comparable.
      </p>
    </div>
  );
}

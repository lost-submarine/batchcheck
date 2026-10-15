import { useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import type { Product } from '../types';
import type { SearchResult } from '../lib/lookup';
import { SearchForm } from '../components/SearchForm';
import type { DemoExample, FormValues } from '../components/SearchForm';
import { OfficialPortalLink, ResultsPanel } from '../components/ResultsPanel';
import type { Phase } from '../components/ResultsPanel';

interface Props {
  products: Product[];
  values: FormValues;
  onChange: (v: FormValues) => void;
  onSubmit: () => void;
  onRunExample: (ex: DemoExample) => void;
  examples: DemoExample[];
  phase: Phase;
  result: SearchResult | null;
  searchedBatch: string;
  searchedProductLabel: string;
  errorMessage: string | null;
  onRetry: () => void;
}

export function FindPage(props: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const validationError = props.result?.status === 'invalid' ? props.result.message : null;

  return (
    <div className="space-y-8">
      <section className="max-w-3xl">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl"
        >
          Find a batch report
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-slate-700">
          BatchCheck helps parents find the laboratory report for a specific batch of a children’s nutrition powder,
          and explains what the report does and doesn’t say in plain language.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <SearchForm
            products={props.products}
            values={props.values}
            onChange={props.onChange}
            onSubmit={props.onSubmit}
            onRunExample={props.onRunExample}
            examples={props.examples}
            loading={props.phase === 'loading'}
            error={validationError}
          />
          <ResultsPanel
            phase={props.phase}
            result={props.result}
            searchedBatch={props.searchedBatch}
            searchedProductLabel={props.searchedProductLabel}
            errorMessage={props.errorMessage}
            onRetry={props.onRetry}
          />
        </div>

        <aside className="space-y-4 lg:col-span-2" aria-label="About lookup">
          <section className="card">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Info aria-hidden className="h-5 w-5 text-brand-700" />
              How lookup works
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-800">
              <li>You pick a product and type the batch number from the pack.</li>
              <li>
                The app compares it, ignoring capitals and extra spaces, with a small dataset stored inside this
                website. Only an <strong>exact</strong> match opens a report.
              </li>
              <li>
                If nothing matches, you’re told so. Similar numbers may be suggested, but they’re never opened for
                you.
              </li>
              <li>
                Every report page says where its data came from and how far it has been checked.
              </li>
            </ol>
          </section>
          <section className="card border-brand-200 bg-brand-50">
            <h2 className="text-lg font-bold text-brand-900">What this prototype contains</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">
              No real laboratory reports are included yet. The records you can open are fictional demonstrations,
              clearly labelled <strong>DEMO DATA</strong>. Little Joys Nutrimix is listed so you can see how a search
              behaves, but this app has no connection to the company or its laboratory, and the local dataset may
              not contain every available report.
            </p>
            <p className="mt-3 text-sm text-slate-800">For real reports, go to the source:</p>
            <p className="mt-1 text-sm">
              <OfficialPortalLink />
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

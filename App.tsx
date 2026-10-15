import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BatchRecord, Product } from './types';
import { PRODUCTS } from './data/products';
import { RECORDS } from './data/records';
import { searchBatch } from './lib/lookup';
import type { SearchResult } from './lib/lookup';
import { useHashRoute } from './lib/route';
import { Layout } from './components/Layout';
import type { DemoExample, FormValues } from './components/SearchForm';
import type { Phase } from './components/ResultsPanel';
import { FindPage } from './pages/FindPage';
import { ReportPage } from './pages/ReportPage';
import type { ReportLoad } from './pages/ReportPage';
import { ComparePage } from './pages/ComparePage';

export interface AppProps {
  /** Injectable for tests. The default reads the bundled local dataset after a short, visible delay. */
  loadRecords?: () => Promise<BatchRecord[]>;
  products?: Product[];
}

const defaultLoad = (): Promise<BatchRecord[]> =>
  new Promise((resolve) => window.setTimeout(() => resolve(RECORDS), 250));

export default function App({ loadRecords = defaultLoad, products = PRODUCTS }: AppProps) {
  const route = useHashRoute();

  // Records are loaded once and cached; a failed load can be retried.
  const recordsPromise = useRef<Promise<BatchRecord[]> | null>(null);
  const [records, setRecords] = useState<BatchRecord[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const ensureRecords = useCallback((): Promise<BatchRecord[]> => {
    if (!recordsPromise.current) {
      recordsPromise.current = loadRecords().then(
        (r) => {
          setRecords(r);
          setLoadError(null);
          return r;
        },
        (err: unknown) => {
          recordsPromise.current = null;
          const msg = err instanceof Error ? err.message : 'The local dataset could not be loaded.';
          setLoadError(msg);
          throw err;
        },
      );
    }
    return recordsPromise.current;
  }, [loadRecords]);

  useEffect(() => {
    ensureRecords().catch(() => undefined);
  }, [ensureRecords]);

  const firstProduct = products[0];
  const [values, setValues] = useState<FormValues>({
    brand: firstProduct?.brand ?? '',
    productId: firstProduct?.id ?? '',
    batch: '',
  });
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searchedBatch, setSearchedBatch] = useState('');
  const [searchedProduct, setSearchedProduct] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Guards against an older, slower search overwriting a newer one.
  const searchSeq = useRef(0);

  const runSearch = useCallback(
    async (v: FormValues) => {
      const seq = ++searchSeq.current;
      const product = products.find((p) => p.id === v.productId);
      const label = product ? `${product.brand} ${product.name}` : 'the selected product';

      // Validate before touching the dataset so bad input never shows a spinner or results.
      const quick = searchBatch([], { productId: v.productId, batch: v.batch });
      if (quick.status === 'invalid') {
        setResult(quick);
        setPhase('done');
        setErrorMessage(null);
        return;
      }

      setPhase('loading');
      setResult(null);
      setErrorMessage(null);
      setSearchedBatch(v.batch);
      setSearchedProduct(label);
      try {
        const recs = await ensureRecords();
        if (seq !== searchSeq.current) return;
        setResult(searchBatch(recs, { productId: v.productId, batch: v.batch }));
        setPhase('done');
      } catch (err) {
        if (seq !== searchSeq.current) return;
        setErrorMessage(err instanceof Error ? err.message : 'The local dataset could not be loaded.');
        setPhase('error');
      }
    },
    [ensureRecords, products],
  );

  const examples: DemoExample[] = useMemo(() => {
    if (!records) return [];
    return records
      .filter((r) => r.provenance === 'demo')
      .slice(0, 5)
      .map((r) => ({ label: r.batchNumber, productId: r.productId, batch: r.batchNumber }));
  }, [records]);

  function onRunExample(ex: DemoExample) {
    const product = products.find((p) => p.id === ex.productId);
    const next = { brand: product?.brand ?? values.brand, productId: ex.productId, batch: ex.batch };
    setValues(next);
    void runSearch(next);
  }

  let reportLoad: ReportLoad = { status: 'loading' };
  if (route.name === 'report') {
    if (records) {
      const record = records.find((r) => r.id === route.id);
      reportLoad = record ? { status: 'ready', record } : { status: 'missing', id: route.id };
    } else if (loadError) {
      reportLoad = { status: 'error', message: loadError };
    }
  }

  return (
    <Layout route={route}>
      {route.name === 'find' && (
        <FindPage
          products={products}
          values={values}
          onChange={setValues}
          onSubmit={() => void runSearch(values)}
          onRunExample={onRunExample}
          examples={examples}
          phase={phase}
          result={result}
          searchedBatch={searchedBatch}
          searchedProductLabel={searchedProduct}
          errorMessage={errorMessage}
          onRetry={() => void runSearch(values)}
        />
      )}
      {route.name === 'report' && (
        <ReportPage load={reportLoad} onRetry={() => ensureRecords().catch(() => undefined)} />
      )}
      {route.name === 'compare' && <ComparePage products={products} records={records ?? []} />}
    </Layout>
  );
}

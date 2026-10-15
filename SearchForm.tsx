import { useId } from 'react';
import type { FormEvent } from 'react';
import { Loader2, QrCode, Search } from 'lucide-react';
import type { Product } from '../types';
import { getBrands, getProductsForBrand } from '../data/products';

export interface FormValues {
  brand: string;
  productId: string;
  batch: string;
}

export interface DemoExample {
  label: string;
  productId: string;
  batch: string;
}

interface Props {
  products: Product[];
  values: FormValues;
  onChange: (next: FormValues) => void;
  onSubmit: () => void;
  onRunExample: (example: DemoExample) => void;
  examples: DemoExample[];
  loading: boolean;
  /** Validation message for the batch field, if any. */
  error: string | null;
}

export function SearchForm({
  products,
  values,
  onChange,
  onSubmit,
  onRunExample,
  examples,
  loading,
  error,
}: Props) {
  const uid = useId();
  const brandId = `${uid}-brand`;
  const productId = `${uid}-product`;
  const batchId = `${uid}-batch`;
  const errorId = `${uid}-batch-error`;
  const hintId = `${uid}-batch-hint`;

  const brands = getBrands(products);
  const brandProducts = getProductsForBrand(values.brand, products);

  function handleBrand(brand: string) {
    const first = getProductsForBrand(brand, products)[0];
    onChange({ ...values, brand, productId: first ? first.id : '' });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-5" aria-label="Find a batch report">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={brandId} className="field-label">
            Brand
          </label>
          <select
            id={brandId}
            className="field-input"
            value={values.brand}
            onChange={(e) => handleBrand(e.target.value)}
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={productId} className="field-label">
            Product
          </label>
          <select
            id={productId}
            className="field-input"
            value={values.productId}
            onChange={(e) => onChange({ ...values, productId: e.target.value })}
          >
            {brandProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={batchId} className="field-label">
          Batch number
        </label>
        <input
          id={batchId}
          type="text"
          className={`field-input ${error ? '!border-amber-600' : ''}`}
          value={values.batch}
          onChange={(e) => onChange({ ...values, batch: e.target.value })}
          placeholder="As printed on the pack, e.g. DEMO-MILLET-0001"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        />
        <p id={hintId} className="mt-1.5 text-sm text-slate-600">
          Usually printed near the expiry date. Capital letters and extra spaces don’t matter.
        </p>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-sm font-semibold text-amber-900">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <Loader2 aria-hidden className="h-5 w-5 animate-spin" />
          ) : (
            <Search aria-hidden className="h-5 w-5" />
          )}
          Search report
        </button>

        <button
          type="button"
          className="btn-secondary"
          disabled
          aria-describedby={`${uid}-qr-note`}
        >
          <QrCode aria-hidden className="h-4 w-4" />
          Scan QR code
          <span className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-xs font-medium text-slate-600">
            Future feature
          </span>
        </button>
      </div>
      <p id={`${uid}-qr-note`} className="-mt-2 text-sm text-slate-600">
        QR scanning is not built yet, so there is no scanner. For now, type the batch number.
      </p>

      {examples.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <p className="text-sm font-semibold text-slate-800">Try a demonstration batch</p>
          <p className="mt-0.5 text-sm text-slate-600">
            These are fictional batches that show the different states the app can handle.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {examples.map((ex) => (
              <li key={`${ex.productId}-${ex.batch}`}>
                <button
                  type="button"
                  className="btn-secondary !px-3 !py-1.5 font-mono !text-xs"
                  onClick={() => onRunExample(ex)}
                  disabled={loading}
                >
                  {ex.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

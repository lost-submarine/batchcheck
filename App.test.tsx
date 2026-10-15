import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { RECORDS } from './data/records';
import { PRODUCTS } from './data/products';
import type { BatchRecord, Product } from './types';

const instant = () => Promise.resolve(RECORDS);

type User = ReturnType<typeof userEvent.setup>;

async function chooseDemoBrand(user: User) {
  await user.selectOptions(screen.getByLabelText('Brand'), 'Demo Brand (fictional)');
}

async function search(user: User, batch: string, productName?: string) {
  await chooseDemoBrand(user);
  if (productName) await user.selectOptions(screen.getByLabelText('Product'), productName);
  const input = screen.getByLabelText('Batch number');
  await user.clear(input);
  if (batch) await user.type(input, batch);
  await user.click(screen.getByRole('button', { name: /search report/i }));
}

async function openReport(user: User, batch: string, productName?: string) {
  await search(user, batch, productName);
  await user.click(await screen.findByRole('link', { name: /view report details/i }));
  await screen.findByRole('heading', { level: 1, name: /batch report/i });
}

describe('batch lookup', () => {
  it('finds a valid batch and shows it labelled as demo data', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await search(user, 'DEMO-MILLET-0001');

    expect(await screen.findByText(/1 record in this prototype matches/i)).toBeInTheDocument();
    const results = screen.getByRole('region', { name: /results/i });
    expect(within(results).getByText('DEMO DATA')).toBeInTheDocument();
    expect(within(results).getByText('DEMO-MILLET-0001')).toBeInTheDocument();
  });

  it('ignores case and surrounding / repeated whitespace', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await search(user, '   demo-millet-0001   ');
    expect(await screen.findByText(/1 record in this prototype matches/i)).toBeInTheDocument();
  });

  it('says so when a batch is unknown, points to the official portal and opens nothing', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await search(user, 'DEMO-MILLET-9999');

    expect(await screen.findByRole('heading', { name: /no report found for “DEMO-MILLET-9999”/i })).toBeInTheDocument();
    expect(document.body).toHaveTextContent(/does not mean no report exists/i);
    expect(screen.queryByRole('link', { name: /view report details/i })).not.toBeInTheDocument();
    const portal = screen.getAllByRole('link', { name: /official little joys report portal/i })[0];
    expect(portal).toHaveAttribute('href', 'https://ourlittlejoys.com/honest-report');
  });

  it('suggests similar batches without ever presenting them as the match', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await search(user, 'DEMO-MILLET-001');

    expect(await screen.findByRole('heading', { name: /no report found/i })).toBeInTheDocument();
    expect(document.body).toHaveTextContent(/these are not the batch you searched for/i);
    expect(screen.getAllByText(/similar batch number — not an exact match/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/record in this prototype matches/i)).not.toBeInTheDocument();
  });

  it('does not return a real-product search from the demo dataset', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    // Default selection is Little Joys / Nutrimix.
    await user.type(screen.getByLabelText('Batch number'), 'DEMO-MILLET-0001');
    await user.click(screen.getByRole('button', { name: /search report/i }));

    expect(await screen.findByRole('heading', { name: /no report found/i })).toBeInTheDocument();
    expect(screen.getByText(/same batch number, different product/i)).toBeInTheDocument();
  });

  it('validates empty input accessibly and does not search', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await user.click(screen.getByRole('button', { name: /search report/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Enter a batch number to search.');
    const input = screen.getByLabelText('Batch number');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Enter a batch number to search/);
    expect(screen.queryByRole('heading', { name: /no report found/i })).not.toBeInTheDocument();
  });

  it('rejects invalid characters', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await user.type(screen.getByLabelText('Batch number'), '@@@');
    await user.click(screen.getByRole('button', { name: /search report/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/can only contain letters, numbers/i);
  });

  it('shows a loading state, then the result', async () => {
    const user = userEvent.setup();
    let resolve!: (r: BatchRecord[]) => void;
    const pending = new Promise<BatchRecord[]>((r) => {
      resolve = r;
    });
    render(<App loadRecords={() => pending} />);
    await search(user, 'DEMO-MILLET-0001');

    expect(await screen.findByText(/searching the local prototype dataset/i)).toBeInTheDocument();
    resolve(RECORDS);
    expect(await screen.findByText(/1 record in this prototype matches/i)).toBeInTheDocument();
    expect(screen.queryByText(/searching the local prototype dataset/i)).not.toBeInTheDocument();
  });

  it('shows an error state (and no result) when the dataset fails to load, and can retry', async () => {
    const user = userEvent.setup();
    const load = vi
      .fn<() => Promise<BatchRecord[]>>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue(RECORDS);
    render(<App loadRecords={load} />);
    await search(user, 'DEMO-MILLET-0001');

    expect(await screen.findByText(/the search could not be completed/i)).toBeInTheDocument();
    expect(screen.queryByText(/record in this prototype matches/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText(/1 record in this prototype matches/i)).toBeInTheDocument();
  });

  it('labels QR scanning as a future feature with no working scanner', () => {
    render(<App loadRecords={instant} />);
    const qr = screen.getByRole('button', { name: /scan qr code/i });
    expect(qr).toBeDisabled();
    expect(qr).toHaveTextContent(/future feature/i);
  });
});

describe('report detail', () => {
  it('renders documented values, units, limits and neutral interpretations', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await openReport(user, 'DEMO-MILLET-0001');

    const lead = screen.getByTestId('param-lead');
    expect(within(lead).getByText('0.008')).toBeInTheDocument();
    expect(within(lead).getByText('mg/kg')).toBeInTheDocument();
    expect(within(lead).getByText(/Maximum 0\.02 mg\/kg/)).toBeInTheDocument();
    expect(within(lead).getByText(/at or below the documented maximum/i)).toBeInTheDocument();

    const arsenic = screen.getByTestId('param-arsenic');
    expect(within(arsenic).getByText('0.012')).toBeInTheDocument();
    expect(within(arsenic).getByText(/above the documented maximum/i)).toBeInTheDocument();

    const protein = screen.getByTestId('param-protein');
    expect(within(protein).getByText('14.6')).toBeInTheDocument();
    expect(within(protein).getByText(/insufficient information to interpret this result/i)).toBeInTheDocument();
  });

  it('shows the plain-language section and the four evidence blocks', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await openReport(user, 'DEMO-MILLET-0001');

    expect(screen.getByRole('heading', { name: 'Understand this report' })).toBeInTheDocument();
    expect(screen.getAllByText(/what this test does not establish/i).length).toBeGreaterThan(0);
    for (const title of [
      /recorded in this demo entry/i,
      /not provided in the source/i,
      /not independently verified by this app/i,
      /scope and limitations of the tests/i,
    ]) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    }
  });

  it('handles a record with no test data', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await openReport(user, 'DEMO-MILK-0001', 'Demo Milk Powder');

    expect(screen.getByText(/test results are not available in this entry/i)).toBeInTheDocument();
    expect(screen.getByText(/insufficient information to interpret this report/i)).toBeInTheDocument();
  });

  it('handles a record with no source link, date, laboratory, unit or result', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await openReport(user, 'DEMO-MILLET-0002');

    expect(screen.getByText(/no source link is recorded for this entry/i)).toBeInTheDocument();
    expect(screen.getAllByText('Not provided').length).toBeGreaterThanOrEqual(2);
    expect(within(screen.getByTestId('param-arsenic')).getByText('Not reported')).toBeInTheDocument();
    expect(within(screen.getByTestId('param-protein')).getAllByText('Not documented').length).toBeGreaterThanOrEqual(2);
  });

  it('refuses to compare a result and limit that use different units', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await openReport(user, 'DEMO-MILK-0002', 'Demo Milk Powder');

    const lead = screen.getByTestId('param-lead');
    expect(within(lead).getByText(/insufficient information to interpret this result/i)).toBeInTheDocument();
    expect(within(lead).getByText(/does not convert units/i)).toBeInTheDocument();
  });

  it('keeps a missing report id from showing any other report', () => {
    window.location.hash = '#/report/does-not-exist';
    render(<App loadRecords={instant} />);
    return screen.findByRole('heading', { name: /report not found/i });
  });

  it('copies the batch number and only confirms after the copy succeeds', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await openReport(user, 'DEMO-MILLET-0001');

    const spy = vi.spyOn(navigator.clipboard, 'writeText');
    expect(screen.queryByText('Copied')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /copy batch number/i }));
    await waitFor(() => expect(screen.getByText('Copied')).toBeInTheDocument());
    expect(spy).toHaveBeenCalledWith('DEMO-MILLET-0001');

    spy.mockRejectedValueOnce(new Error('denied'));
    await user.click(screen.getByRole('button', { name: /copy batch number/i }));
    expect(await screen.findByText(/could not copy/i)).toBeInTheDocument();
  });
});

describe('demo vs source-reviewed data', () => {
  const realProduct: Product = {
    id: 'test-product',
    brand: 'Test Brand',
    name: 'Test Product',
    isFictional: false,
    declared: null,
  };
  const reviewed: BatchRecord = {
    id: 'test-reviewed-1',
    productId: 'test-product',
    brand: 'Test Brand',
    productName: 'Test Product',
    batchNumber: 'TB-001',
    reportDate: '2024-06-01',
    laboratory: 'Test Lab',
    reportUrl: 'https://example.com/original.pdf',
    provenance: 'source-reviewed',
    verificationStatus: 'document-reviewed',
    provenanceNote: 'Transcribed by hand from the original PDF (test fixture).',
    parameters: [
      {
        id: 'protein',
        name: 'Protein',
        kind: 'protein',
        result: 12.5,
        unit: 'g/100 g',
        limit: null,
        method: 'Test method',
        sourceRef: 'p. 2',
      },
    ],
  };

  it('does not show DEMO DATA or the demo banner for a source-reviewed record, and does not overstate verification', async () => {
    const user = userEvent.setup();
    render(<App products={[realProduct]} loadRecords={() => Promise.resolve([reviewed])} />);
    await user.type(screen.getByLabelText('Batch number'), 'tb-001');
    await user.click(screen.getByRole('button', { name: /search report/i }));
    await user.click(await screen.findByRole('link', { name: /view report details/i }));
    await screen.findByRole('heading', { level: 1, name: /batch report/i });

    expect(screen.queryByText('DEMO DATA')).not.toBeInTheDocument();
    expect(screen.queryByText(/this is a fictional record/i)).not.toBeInTheDocument();
    expect(screen.getByText(/transcribed from a source document/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open the original report/i })).toHaveAttribute(
      'href',
      'https://example.com/original.pdf',
    );

    const ladder = screen.getByRole('region', { name: /how far has this entry been checked/i });
    expect(within(ladder).getByText(/source link available/i)).toHaveTextContent(/yes/i);
    expect(within(ladder).getByText(/original document reviewed by a maintainer/i)).toHaveTextContent(/yes/i);
    expect(within(ladder).getByText(/authenticity independently verified/i)).toHaveTextContent(/no/i);
    expect(within(ladder).getByText(/a matching batch number alone does not authenticate/i)).toBeInTheDocument();
  });

  it('shows the demo banner, badge and a failed source-link / review ladder for demo records', async () => {
    const user = userEvent.setup();
    render(<App loadRecords={instant} />);
    await openReport(user, 'DEMO-MILLET-0001');

    expect(screen.getAllByText('DEMO DATA').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/this is a fictional record/i)).toBeInTheDocument();
    const ladder = screen.getByRole('region', { name: /how far has this entry been checked/i });
    expect(within(ladder).getByText(/source link available/i)).toHaveTextContent(/no/i);
    expect(within(ladder).getByText(/original document reviewed by a maintainer/i)).toHaveTextContent(/no/i);
  });
});

describe('no unsupported safety claims', () => {
  const banned = /toxin-free|certified|approved|\b(is|are|was|be|been) (safe|unsafe|clean)\b|\b100% (safe|clean)\b/i;

  it.each(RECORDS.map((r) => [r.batchNumber, r.id]))('report page for %s makes no safety verdict', async (_b, id) => {
    window.location.hash = `#/report/${id}`;
    const { container } = render(<App loadRecords={instant} />);
    await screen.findByRole('heading', { level: 1, name: /batch report/i });
    expect(container.textContent ?? '').not.toMatch(banned);
  });

  it('landing, not-found and compare pages make no safety verdict', async () => {
    const user = userEvent.setup();
    const { container } = render(<App loadRecords={instant} />);
    expect(container.textContent ?? '').not.toMatch(banned);
    await search(user, 'DEMO-MILLET-9999');
    await screen.findByRole('heading', { name: /no report found/i });
    expect(container.textContent ?? '').not.toMatch(banned);

    window.location.hash = '#/compare';
    await screen.findByRole('heading', { name: /compare documented information/i });
    expect(container.textContent ?? '').not.toMatch(banned);
  });

  it('uses no red/green safety badges (only neutral and amber demo styling)', async () => {
    window.location.hash = '#/report/demo-millet-0001';
    const { container } = render(<App loadRecords={instant} />);
    await screen.findByRole('heading', { level: 1, name: /batch report/i });
    expect(container.innerHTML).not.toMatch(/(bg|text|border)-(red|green|emerald|rose)-/);
  });
});

describe('compare page', () => {
  it('shows documented fields, missing evidence and does not rank products', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/compare';
    render(<App loadRecords={instant} />);
    await screen.findByRole('heading', { name: /compare documented information/i });

    expect(document.body).toHaveTextContent(/does not rank products/i);
    // Little Joys Nutrimix vs Demo Millet Mix by default.
    await waitFor(() => expect(screen.getByText(/DEMO-MILLET-0001/)).toBeInTheDocument());
    expect(screen.getAllByText(/not provided in this prototype’s dataset/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/no batch-specific report in this dataset/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Second product'), PRODUCTS[2].id);
    expect(screen.getByText('20 g')).toBeInTheDocument();
    // The table itself must contain no score / rating / rank row.
    expect(within(screen.getByRole('table')).queryByText(/score|rating|rank/i)).not.toBeInTheDocument();
  });
});

import type { BatchRecord } from '../types';

/**
 * Batch records bundled with the prototype.
 *
 * ALL records below are DEMONSTRATION records:
 *  - brands/products are fictional ("Demo Brand")
 *  - batch identifiers start with "DEMO-" so they cannot be mistaken for real ones
 *  - limits are labelled as fictional and are NOT real regulatory standards
 *  - the placeholder URL (example.org) does not host any document
 *
 * To add a REAL record, follow the checklist in README.md ("Adding verified records").
 * Never copy numbers from memory; only transcribe from the original document.
 */

const DEMO_NOTE =
  'DEMO DATA. Fictional record created to demonstrate the app. It is not a real laboratory report and is not linked to any real brand or product.';
const DEMO_LIMIT_BASIS = 'Fictional demo limit — not a real standard';
const PLACEHOLDER_URL = 'https://example.org/';

export const RECORDS: BatchRecord[] = [
  {
    id: 'demo-millet-0001',
    productId: 'demo-millet-mix',
    brand: 'Demo Brand (fictional)',
    productName: 'Demo Millet Mix',
    batchNumber: 'DEMO-MILLET-0001',
    reportDate: '2025-01-15',
    laboratory: 'Demo Laboratory (fictional)',
    reportUrl: PLACEHOLDER_URL,
    provenance: 'demo',
    verificationStatus: 'demo-data',
    provenanceNote: DEMO_NOTE + ' The link is a placeholder; no document exists.',
    parameters: [
      {
        id: 'protein',
        name: 'Protein',
        kind: 'protein',
        result: 14.6,
        unit: 'g/100 g',
        limit: null,
        method: 'Demo method (fictional)',
        sourceRef: 'Demo report, table 1',
      },
      {
        id: 'moisture',
        name: 'Moisture',
        kind: 'moisture',
        result: 4.1,
        unit: 'g/100 g',
        limit: { type: 'max', value: 5, unit: 'g/100 g', basis: DEMO_LIMIT_BASIS },
        method: 'Demo method (fictional)',
        sourceRef: 'Demo report, table 1',
      },
      {
        id: 'lead',
        name: 'Lead',
        kind: 'lead',
        result: 0.008,
        unit: 'mg/kg',
        limit: { type: 'max', value: 0.02, unit: 'mg/kg', basis: DEMO_LIMIT_BASIS },
        method: 'Demo method (fictional)',
        sourceRef: 'Demo report, table 2',
      },
      {
        id: 'arsenic',
        name: 'Arsenic',
        kind: 'arsenic',
        result: 0.012,
        unit: 'mg/kg',
        limit: { type: 'max', value: 0.01, unit: 'mg/kg', basis: DEMO_LIMIT_BASIS },
        method: 'Demo method (fictional)',
        sourceRef: 'Demo report, table 2',
      },
    ],
  },
  {
    id: 'demo-millet-0010',
    productId: 'demo-millet-mix',
    brand: 'Demo Brand (fictional)',
    productName: 'Demo Millet Mix',
    batchNumber: 'DEMO-MILLET-0010',
    reportDate: '2025-02-03',
    laboratory: 'Demo Laboratory (fictional)',
    reportUrl: PLACEHOLDER_URL,
    provenance: 'demo',
    verificationStatus: 'demo-data',
    provenanceNote:
      DEMO_NOTE + ' Exists so searches for similar batch numbers (e.g. "DEMO-MILLET-001") show near matches.',
    parameters: [
      {
        id: 'protein',
        name: 'Protein',
        kind: 'protein',
        result: 15.2,
        unit: 'g/100 g',
        limit: null,
        method: 'Demo method (fictional)',
        sourceRef: 'Demo report, table 1',
      },
    ],
  },
  {
    id: 'demo-millet-0002',
    productId: 'demo-millet-mix',
    brand: 'Demo Brand (fictional)',
    productName: 'Demo Millet Mix',
    batchNumber: 'DEMO-MILLET-0002',
    reportDate: null,
    laboratory: null,
    reportUrl: null,
    provenance: 'demo',
    verificationStatus: 'demo-data',
    provenanceNote:
      DEMO_NOTE + ' Deliberately incomplete: no URL, date or laboratory, and several fields missing.',
    parameters: [
      {
        id: 'protein',
        name: 'Protein',
        kind: 'protein',
        result: 14.9,
        unit: null,
        limit: null,
        method: null,
        sourceRef: null,
      },
      {
        id: 'lead',
        name: 'Lead',
        kind: 'lead',
        result: 0.009,
        unit: 'mg/kg',
        limit: null,
        method: null,
        sourceRef: null,
      },
      {
        id: 'arsenic',
        name: 'Arsenic',
        kind: 'arsenic',
        result: null,
        unit: 'mg/kg',
        limit: null,
        method: null,
        sourceRef: null,
      },
    ],
  },
  {
    id: 'demo-milk-0001',
    productId: 'demo-milk-powder',
    brand: 'Demo Brand (fictional)',
    productName: 'Demo Milk Powder',
    batchNumber: 'DEMO-MILK-0001',
    reportDate: '2025-03-20',
    laboratory: 'Demo Laboratory (fictional)',
    reportUrl: PLACEHOLDER_URL,
    provenance: 'demo',
    verificationStatus: 'demo-data',
    provenanceNote:
      DEMO_NOTE + ' Deliberately has no test data entered, to demonstrate the "report data unavailable" state.',
    parameters: null,
  },
  {
    id: 'demo-milk-0002',
    productId: 'demo-milk-powder',
    brand: 'Demo Brand (fictional)',
    productName: 'Demo Milk Powder',
    batchNumber: 'DEMO-MILK-0002',
    reportDate: '2025-04-08',
    laboratory: 'Demo Laboratory (fictional)',
    reportUrl: PLACEHOLDER_URL,
    provenance: 'demo',
    verificationStatus: 'demo-data',
    provenanceNote: DEMO_NOTE + ' Includes a qualitative result and a limit with a mismatched unit.',
    parameters: [
      {
        id: 'protein',
        name: 'Protein',
        kind: 'protein',
        result: 19.4,
        unit: 'g/100 g',
        limit: { type: 'min', value: 18, unit: 'g/100 g', basis: DEMO_LIMIT_BASIS },
        method: 'Demo method (fictional)',
        sourceRef: 'Demo report, page 1',
      },
      {
        id: 'cadmium',
        name: 'Cadmium',
        kind: 'cadmium',
        result: 'Not detected',
        unit: 'mg/kg',
        limit: { type: 'max', value: 0.01, unit: 'mg/kg', basis: DEMO_LIMIT_BASIS },
        method: 'Demo method (fictional)',
        sourceRef: 'Demo report, page 2',
      },
      {
        id: 'lead',
        name: 'Lead',
        kind: 'lead',
        result: 15,
        unit: 'µg/kg',
        limit: { type: 'max', value: 0.02, unit: 'mg/kg', basis: DEMO_LIMIT_BASIS },
        method: 'Demo method (fictional)',
        sourceRef: 'Demo report, page 2',
      },
    ],
  },
];

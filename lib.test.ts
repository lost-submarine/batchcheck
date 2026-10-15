import { describe, expect, it } from 'vitest';
import type { BatchRecord, TestParameter } from '../types';
import { normalizeBatch, validateBatchInput } from './normalize';
import { searchBatch } from './lookup';
import { INSUFFICIENT, explainParameter, interpretParameter } from './explain';

function rec(over: Partial<BatchRecord> & Pick<BatchRecord, 'id' | 'batchNumber'>): BatchRecord {
  return {
    productId: 'p1',
    brand: 'Test Brand',
    productName: 'Test Product',
    reportDate: null,
    laboratory: null,
    reportUrl: null,
    provenance: 'demo',
    verificationStatus: 'demo-data',
    provenanceNote: 'test',
    parameters: null,
    ...over,
  };
}

function param(over: Partial<TestParameter> = {}): TestParameter {
  return {
    id: 'x',
    name: 'Lead',
    kind: 'lead',
    result: 0.01,
    unit: 'mg/kg',
    limit: { type: 'max', value: 0.02, unit: 'mg/kg', basis: 'Test basis' },
    method: null,
    sourceRef: null,
    ...over,
  };
}

describe('normalizeBatch / validateBatchInput', () => {
  it('trims, collapses whitespace and upper-cases', () => {
    expect(normalizeBatch('  ab   cd-01 ')).toBe('AB CD-01');
  });
  it('rejects empty and whitespace-only input', () => {
    expect(validateBatchInput('')).toMatchObject({ ok: false, reason: 'empty' });
    expect(validateBatchInput('   ')).toMatchObject({ ok: false, reason: 'empty' });
  });
  it('rejects unsupported characters and over-long input', () => {
    expect(validateBatchInput('<script>')).toMatchObject({ ok: false, reason: 'invalid' });
    expect(validateBatchInput('-LEADING')).toMatchObject({ ok: false, reason: 'invalid' });
    expect(validateBatchInput('A'.repeat(41))).toMatchObject({ ok: false, reason: 'too-long' });
  });
  it('accepts typical batch formats', () => {
    expect(validateBatchInput('ab-12/3_4.5')).toEqual({ ok: true, normalized: 'AB-12/3_4.5' });
  });
});

describe('searchBatch', () => {
  const records = [
    rec({ id: 'a', batchNumber: 'ABC-100' }),
    rec({ id: 'b', batchNumber: 'ABC-1000' }),
    rec({ id: 'c', batchNumber: 'XYZ-1', productId: 'p2' }),
    rec({ id: 'd', batchNumber: 'DUP-1' }),
    rec({ id: 'e', batchNumber: 'dup-1' }),
  ];

  it('finds an exact match ignoring case and surrounding whitespace', () => {
    const r = searchBatch(records, { productId: 'p1', batch: '  abc-100 ' });
    expect(r.status).toBe('found');
    if (r.status === 'found') expect(r.matches.map((m) => m.id)).toEqual(['a']);
  });

  it('returns every exact match when several records share a batch number', () => {
    const r = searchBatch(records, { productId: 'p1', batch: 'DUP-1' });
    expect(r.status).toBe('found');
    if (r.status === 'found') expect(r.matches.map((m) => m.id)).toEqual(['d', 'e']);
  });

  it('never returns a similar batch as the match', () => {
    const r = searchBatch(records, { productId: 'p1', batch: 'ABC-10' });
    expect(r.status).toBe('not-found');
    if (r.status === 'not-found') {
      expect(r.nearMatches.map((m) => m.record.id).sort()).toEqual(['a', 'b']);
      expect(r.nearMatches.every((m) => m.reason === 'similar-batch')).toBe(true);
    }
  });

  it('does not return a record from another product as a match', () => {
    const r = searchBatch(records, { productId: 'p1', batch: 'XYZ-1' });
    expect(r.status).toBe('not-found');
    if (r.status === 'not-found') {
      expect(r.nearMatches).toHaveLength(1);
      expect(r.nearMatches[0].reason).toBe('same-batch-other-product');
    }
  });

  it('reports invalid input without searching', () => {
    expect(searchBatch(records, { productId: 'p1', batch: '' }).status).toBe('invalid');
    expect(searchBatch(records, { productId: 'p1', batch: '!!' }).status).toBe('invalid');
  });
});

describe('interpretParameter', () => {
  it('compares only when result, unit, limit and matching units are all documented', () => {
    expect(interpretParameter(param())).toMatchObject({ status: 'compared', relation: 'at-or-below-max' });
    expect(interpretParameter(param({ result: 0.05 }))).toMatchObject({ relation: 'above-max' });
    const min = { type: 'min' as const, value: 18, unit: 'g/100 g', basis: 'b' };
    expect(interpretParameter(param({ result: 19, unit: 'g/100 g', limit: min }))).toMatchObject({
      relation: 'at-or-above-min',
    });
    expect(interpretParameter(param({ result: 10, unit: 'g/100 g', limit: min }))).toMatchObject({
      relation: 'below-min',
    });
  });

  it.each([
    ['no result', { result: null }],
    ['qualitative result', { result: 'Not detected' }],
    ['no unit', { unit: null }],
    ['no limit', { limit: null }],
    ['unit mismatch', { result: 15, unit: 'µg/kg' }],
  ])('refuses to interpret: %s', (_name, over) => {
    const i = interpretParameter(param(over as Partial<TestParameter>));
    expect(i.status).toBe('insufficient');
    expect(i.text).toBe(INSUFFICIENT);
    expect(i).toHaveProperty('reason');
  });
});

describe('explainParameter', () => {
  it('lists missing fields and never invents a limit', () => {
    const e = explainParameter(param({ limit: null, method: null, sourceRef: null }));
    expect(e.unavailable).toEqual(['limit or reference value', 'test method', 'page or section of the source document']);
    expect(e.limit).toMatch(/No limit or reference value is documented/);
  });

  it('falls back to a neutral description for unknown parameter kinds', () => {
    const e = explainParameter(param({ kind: 'other', name: 'Mystery' }));
    expect(e.measures).toMatch(/no built-in plain-language description/);
  });

  it('contains no unsupported safety wording in any explanation', () => {
    const banned = /toxin-free|certified|approved|\b(is|are|was|be) (safe|unsafe|clean)\b/i;
    for (const kind of ['protein', 'moisture', 'lead', 'arsenic', 'cadmium', 'mercury', 'microbial', 'other'] as const) {
      for (const result of [0.01, 5, null, 'Not detected']) {
        const e = explainParameter(param({ kind, result }));
        const all = [e.measures, e.meaning, e.limit, e.doesNotEstablish, e.interpretation.text].join(' ');
        expect(all).not.toMatch(banned);
      }
    }
  });
});

import type { BatchRecord } from '../types';
import { normalizeBatch, validateBatchInput } from './normalize';

export interface SearchQuery {
  productId: string;
  batch: string;
}

export interface NearMatch {
  record: BatchRecord;
  reason: 'similar-batch' | 'same-batch-other-product';
}

export type SearchResult =
  | { status: 'invalid'; reason: 'empty' | 'too-long' | 'invalid'; message: string }
  /** One or more EXACT matches for product + batch number. */
  | { status: 'found'; normalized: string; matches: BatchRecord[] }
  /**
   * No exact match. `nearMatches` are suggestions only; they are never presented as
   * the answer and never opened automatically.
   */
  | { status: 'not-found'; normalized: string; nearMatches: NearMatch[] };

function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = temp;
    }
  }
  return prev[b.length];
}

function isSimilar(query: string, candidate: string): boolean {
  if (query === candidate) return false;
  if (query.length >= 3 && (candidate.includes(query) || query.includes(candidate))) return true;
  return query.length >= 5 && editDistance(query, candidate) <= 2;
}

/**
 * Looks up a batch. Only an exact match (after trimming, collapsing whitespace and
 * ignoring case) on BOTH product and batch number counts as "found".
 * A failed search never silently falls back to a different batch.
 */
export function searchBatch(records: BatchRecord[], query: SearchQuery): SearchResult {
  const validation = validateBatchInput(query.batch);
  if (!validation.ok) {
    return { status: 'invalid', reason: validation.reason, message: validation.message };
  }
  const q = validation.normalized;

  const exact = records.filter(
    (r) => r.productId === query.productId && normalizeBatch(r.batchNumber) === q,
  );
  if (exact.length > 0) return { status: 'found', normalized: q, matches: exact };

  const nearMatches: NearMatch[] = [];
  for (const r of records) {
    const rb = normalizeBatch(r.batchNumber);
    if (r.productId !== query.productId && rb === q) {
      nearMatches.push({ record: r, reason: 'same-batch-other-product' });
    } else if (r.productId === query.productId && isSimilar(q, rb)) {
      nearMatches.push({ record: r, reason: 'similar-batch' });
    }
  }
  return { status: 'not-found', normalized: q, nearMatches };
}

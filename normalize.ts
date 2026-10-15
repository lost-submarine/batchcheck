export const MAX_BATCH_LENGTH = 40;

/** Trim, collapse internal whitespace and upper-case. Used for matching only. */
export function normalizeBatch(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toUpperCase();
}

export type BatchValidation =
  | { ok: true; normalized: string }
  | { ok: false; reason: 'empty' | 'too-long' | 'invalid'; message: string };

const ALLOWED = /^[A-Z0-9][A-Z0-9 \-_/.]*$/;

export function validateBatchInput(raw: string): BatchValidation {
  const normalized = normalizeBatch(raw);
  if (normalized === '') {
    return { ok: false, reason: 'empty', message: 'Enter a batch number to search.' };
  }
  if (normalized.length > MAX_BATCH_LENGTH) {
    return {
      ok: false,
      reason: 'too-long',
      message: `Batch numbers are at most ${MAX_BATCH_LENGTH} characters. Check what you typed.`,
    };
  }
  if (!ALLOWED.test(normalized)) {
    return {
      ok: false,
      reason: 'invalid',
      message:
        'Batch numbers can only contain letters, numbers, spaces and - _ / . characters, and must start with a letter or number.',
    };
  }
  return { ok: true, normalized };
}

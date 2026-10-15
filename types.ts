/**
 * Data model for BatchCheck.
 *
 * Honesty rules baked into the types:
 *  - Every record declares its provenance ('demo' vs 'source-reviewed').
 *  - Verification is a ladder, not a boolean: a listed link, a manually reviewed
 *    document and independent authenticity verification are different things.
 *  - Anything not documented in a source is `null`, never guessed.
 */

export type Provenance = 'demo' | 'source-reviewed';

export type VerificationStatus =
  /** Fictional record made for demonstration. No source document exists. */
  | 'demo-data'
  /** A source URL is listed, but nobody has reviewed the document yet. */
  | 'source-link-listed'
  /** A maintainer opened the original document and transcribed it by hand. */
  | 'document-reviewed'
  /** Authenticity confirmed with the issuing party (rarely achievable here). */
  | 'independently-verified';

export type LimitType = 'max' | 'min';

export interface ReferenceLimit {
  type: LimitType;
  value: number;
  unit: string;
  /** Where the limit comes from, e.g. the name of the standard or the report itself. */
  basis: string;
}

export type ParameterKind =
  | 'protein'
  | 'moisture'
  | 'lead'
  | 'arsenic'
  | 'cadmium'
  | 'mercury'
  | 'microbial'
  | 'other';

export interface TestParameter {
  id: string;
  /** Name exactly as it appears in the source. */
  name: string;
  kind: ParameterKind;
  /** Numeric result, qualitative text (e.g. "Not detected"), or null if not reported. */
  result: number | string | null;
  unit: string | null;
  limit: ReferenceLimit | null;
  method: string | null;
  /** Page / section of the source document, if known. */
  sourceRef: string | null;
}

export interface DeclaredInfo {
  ingredients?: string;
  proteinPer100g?: number;
  sugarPer100g?: number;
  /** Where the declared values were taken from (label, website page...). */
  source: string;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  /** True when brand and product are fictional (used for demo records). */
  isFictional: boolean;
  /** Manually sourced label/website info. null = nothing has been entered. */
  declared: DeclaredInfo | null;
}

export interface BatchRecord {
  id: string;
  productId: string;
  brand: string;
  productName: string;
  batchNumber: string;
  reportDate: string | null;
  laboratory: string | null;
  reportUrl: string | null;
  provenance: Provenance;
  verificationStatus: VerificationStatus;
  /** Free-text note on how the record was obtained / reviewed. */
  provenanceNote: string;
  /** null means test data was not entered / is unavailable. [] means none documented. */
  parameters: TestParameter[] | null;
}

import type { ParameterKind, TestParameter, VerificationStatus } from '../types';

/**
 * Rule-based explanations. No AI-generated verdicts, no safety labels.
 * Every sentence here must stay descriptive and hedged.
 */

export const INSUFFICIENT = 'Insufficient information to interpret this result';

export type Interpretation =
  | {
      status: 'compared';
      relation: 'at-or-below-max' | 'above-max' | 'at-or-above-min' | 'below-min';
      text: string;
    }
  | { status: 'insufficient'; text: typeof INSUFFICIENT; reason: string };

function insufficient(reason: string): Interpretation {
  return { status: 'insufficient', text: INSUFFICIENT, reason };
}

/**
 * Compares a result with a documented limit ONLY when the result is numeric, its unit
 * is documented, a limit is documented and the units are identical. Otherwise it
 * refuses to interpret.
 */
export function interpretParameter(p: TestParameter): Interpretation {
  if (p.result === null) return insufficient('No result is recorded for this parameter.');
  if (typeof p.result !== 'number') {
    return insufficient(
      `The result is recorded as text ("${p.result}"), not a number, so it cannot be compared with a numeric limit.`,
    );
  }
  if (!p.unit) return insufficient('The unit of this result is not documented.');
  if (!p.limit) return insufficient('No limit or reference value is documented for this parameter.');
  if (p.limit.unit !== p.unit) {
    return insufficient(
      `The result is in ${p.unit} but the documented limit is in ${p.limit.unit}. This app does not convert units, so no comparison is made.`,
    );
  }

  const { type, value, unit, basis } = p.limit;
  const r = p.result;
  const where = `the documented ${type === 'max' ? 'maximum' : 'minimum'} of ${value} ${unit} (${basis})`;
  const tail = ' This describes this parameter in the tested sample only.';

  if (type === 'max') {
    return r <= value
      ? {
          status: 'compared',
          relation: 'at-or-below-max',
          text: `The reported value (${r} ${unit}) is at or below ${where}.${tail}`,
        }
      : {
          status: 'compared',
          relation: 'above-max',
          text: `The reported value (${r} ${unit}) is above ${where}. This app does not draw conclusions from that; check the source document and the relevant authority.`,
        };
  }
  return r >= value
    ? {
        status: 'compared',
        relation: 'at-or-above-min',
        text: `The reported value (${r} ${unit}) is at or above ${where}.${tail}`,
      }
    : {
        status: 'compared',
        relation: 'below-min',
        text: `The reported value (${r} ${unit}) is below ${where}. This app does not draw conclusions from that; check the source document and the relevant authority.`,
      };
}

interface KindText {
  measures: string;
  doesNotEstablish: string;
}

const METAL = (metal: string): KindText => ({
  measures: `The amount of ${metal} found in the tested sample. ${metal[0].toUpperCase()}${metal.slice(
    1,
  )} is a metal that can occur naturally in soil and water and can end up in food. Labs usually report it in very small amounts, such as milligrams per kilogram (mg/kg).`,
  doesNotEstablish: `A ${metal} result says nothing about other metals, other contaminants, nutrients, or other batches.`,
});

const KIND_TEXT: Record<ParameterKind, KindText> = {
  protein: {
    measures:
      'How much protein the tested sample contains, usually given as grams per 100 grams of powder.',
    doesNotEstablish:
      'It does not show protein quality or digestibility, or whether the product suits any particular child.',
  },
  moisture: {
    measures:
      'How much water the powder contains. Moisture can affect shelf life and texture.',
    doesNotEstablish:
      'It does not describe nutrient content or contaminants.',
  },
  lead: METAL('lead'),
  arsenic: METAL('arsenic'),
  cadmium: METAL('cadmium'),
  mercury: METAL('mercury'),
  microbial: {
    measures:
      'Whether, or how many, specific micro-organisms were found in the sample amount that was tested.',
    doesNotEstablish:
      'It covers only the organisms and sample amounts listed. It cannot rule out other organisms or other parts of the batch.',
  },
  other: {
    measures:
      'This prototype has no built-in plain-language description for this parameter. Please read the source report to see what it measures.',
    doesNotEstablish:
      'What this test does and does not establish is not described in this prototype.',
  },
};

export interface ParameterExplanation {
  measures: string;
  meaning: string;
  limit: string;
  unavailable: string[];
  doesNotEstablish: string;
  interpretation: Interpretation;
}

export function explainParameter(p: TestParameter): ParameterExplanation {
  const kind = KIND_TEXT[p.kind] ?? KIND_TEXT.other;
  const interpretation = interpretParameter(p);

  const unavailable: string[] = [];
  if (p.result === null) unavailable.push('result');
  if (!p.unit) unavailable.push('unit');
  if (!p.limit) unavailable.push('limit or reference value');
  if (!p.method) unavailable.push('test method');
  if (!p.sourceRef) unavailable.push('page or section of the source document');

  let meaning: string;
  if (p.result === null) {
    meaning = 'No result is recorded for this parameter in this entry, so there is nothing to explain yet.';
  } else {
    const shown = `${p.result}${p.unit ? ` ${p.unit}` : ''}`;
    meaning =
      `This entry lists a result of ${shown} for the tested sample. ` +
      'A single result reflects one sample and one method, and every measurement has some uncertainty that this app has no information about.';
  }

  const limit = p.limit
    ? `The entry documents a ${p.limit.type === 'max' ? 'maximum' : 'minimum'} of ${p.limit.value} ${p.limit.unit} (${p.limit.basis}). This app has not checked whether that limit is the right one for this product.`
    : 'No limit or reference value is documented for this parameter, so no comparison is made.';

  return {
    measures: kind.measures,
    meaning,
    limit,
    unavailable,
    doesNotEstablish: kind.doesNotEstablish,
    interpretation,
  };
}

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  'demo-data': 'Demo data — no source document exists',
  'source-link-listed': 'Source link listed — document not yet reviewed',
  'document-reviewed': 'Source document reviewed by a maintainer — authenticity not independently verified',
  'independently-verified': 'Authenticity independently verified',
};

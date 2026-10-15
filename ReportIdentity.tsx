import { ExternalLink, Minus, Check } from 'lucide-react';
import type { BatchRecord } from '../types';
import { CopyButton } from './CopyButton';
import { DemoBadge, StatusLabel } from './Badges';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 py-2.5 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-semibold text-slate-600">{label}</dt>
      <dd className="text-slate-900 sm:col-span-2">{children}</dd>
    </div>
  );
}

const NOT_PROVIDED = <span className="text-slate-600">Not provided</span>;

export function ReportIdentity({ record }: { record: BatchRecord }) {
  const isDemo = record.provenance === 'demo';
  return (
    <section aria-labelledby="identity-heading" className="card">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="identity-heading" className="text-xl font-bold text-slate-900">
          Product and report details
        </h2>
        {isDemo && <DemoBadge />}
      </div>
      <dl className="mt-3 divide-y divide-slate-100">
        <Row label="Brand">{record.brand}</Row>
        <Row label="Product">{record.productName}</Row>
        <Row label="Batch number">
          <span className="flex flex-wrap items-center gap-3">
            <span className="break-all font-mono font-semibold">{record.batchNumber}</span>
            <CopyButton text={record.batchNumber} />
          </span>
        </Row>
        <Row label="Report date">{record.reportDate ?? NOT_PROVIDED}</Row>
        <Row label="Laboratory">{record.laboratory ?? NOT_PROVIDED}</Row>
        <Row label="Original source">
          {record.reportUrl ? (
            <span>
              <a
                href={record.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-brand-800 underline underline-offset-2"
              >
                {isDemo ? 'Placeholder link (no real document exists)' : 'Open the original report'}
                <ExternalLink aria-hidden className="h-4 w-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              {!isDemo && (
                <span className="mt-1 block text-sm text-slate-600">
                  Compare this page with the original document yourself.
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-700">No source link is recorded for this entry.</span>
          )}
        </Row>
        <Row label="Data provenance">
          <span className="block">{record.provenance === 'demo' ? 'Demonstration data (fictional)' : 'Transcribed from a source document'}</span>
          <span className="mt-1 block text-sm text-slate-600">{record.provenanceNote}</span>
        </Row>
        <Row label="Verification status">
          <StatusLabel record={record} />
        </Row>
      </dl>
    </section>
  );
}

function LadderRow({ label, yes, detail }: { label: string; yes: boolean; detail: string }) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      {yes ? (
        <Check aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
      ) : (
        <Minus aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
      )}
      <div>
        <p className="font-semibold text-slate-900">
          {label}: <span className="font-bold">{yes ? 'Yes' : 'No'}</span>
        </p>
        <p className="text-sm text-slate-600">{detail}</p>
      </div>
    </li>
  );
}

/** Three distinct questions, deliberately not collapsed into one "verified" badge. */
export function VerificationLadder({ record }: { record: BatchRecord }) {
  const isDemo = record.provenance === 'demo';
  const reviewed =
    record.verificationStatus === 'document-reviewed' || record.verificationStatus === 'independently-verified';
  const independent = record.verificationStatus === 'independently-verified';

  return (
    <section aria-labelledby="ladder-heading" className="card">
      <h2 id="ladder-heading" className="text-xl font-bold text-slate-900">
        How far has this entry been checked?
      </h2>
      <ul className="mt-2 divide-y divide-slate-100">
        <LadderRow
          label="Source link available"
          yes={!!record.reportUrl && !isDemo}
          detail={
            isDemo
              ? 'Demo entries only have a placeholder link; no real document exists.'
              : record.reportUrl
                ? 'A link to the original is recorded. A link existing does not show the document is genuine.'
                : 'No link to the original document is recorded.'
          }
        />
        <LadderRow
          label="Original document reviewed by a maintainer"
          yes={reviewed}
          detail={
            isDemo
              ? 'Not applicable: there is no original document.'
              : reviewed
                ? 'Someone opened the source and transcribed it by hand. Transcription errors are still possible.'
                : 'The values on this page have not been checked against the original document.'
          }
        />
        <LadderRow
          label="Authenticity independently verified"
          yes={independent}
          detail="This app has no connection to laboratories and cannot confirm that a report is authentic."
        />
      </ul>
      <p className="mt-2 text-sm text-slate-700">
        A matching batch number alone does not authenticate a report.
      </p>
    </section>
  );
}

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

type CopyState = 'idle' | 'copied' | 'failed';

/** Only reports "Copied" after the clipboard write has actually succeeded. */
export function CopyButton({ text, label = 'Copy batch number' }: { text: string; label?: string }) {
  const [state, setState] = useState<CopyState>('idle');

  async function handleClick() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 2500);
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={handleClick} className="btn-secondary !px-3 !py-1.5">
        {state === 'copied' ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
        {label}
      </button>
      <span role="status" aria-live="polite" className="text-sm text-slate-600">
        {state === 'copied' && 'Copied'}
        {state === 'failed' && 'Could not copy — select the text and copy it manually.'}
      </span>
    </span>
  );
}

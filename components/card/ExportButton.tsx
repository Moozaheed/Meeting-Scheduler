'use client';

import { Download, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { CardGenerationError } from '@/lib/store/scheduling-store';

type ExportState = 'idle' | 'loading' | 'success' | 'error';

interface ExportButtonProps {
  /** `useMeeting(id).exportCard` — the sole path into CardGeneration's PDF export, per the affirmed layering mandate. */
  onExport: () => Promise<Blob>;
  disabled?: boolean;
  fileName?: string;
}

/** Triggers PDF generation and download (FR5.1), with loading/success/error states (NFR1.2, reliability-design.md). */
export function ExportButton({ onExport, disabled = false, fileName = 'invitation-card.pdf' }: ExportButtonProps) {
  const [state, setState] = useState<ExportState>('idle');
  const successTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(successTimer.current), []);

  const handleExport = async () => {
    setState('loading');
    try {
      const blob = await onExport();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      setState('success');
      successTimer.current = setTimeout(() => setState('idle'), 5000);
    } catch (error) {
      // Never a silent no-op — surface an actionable, retryable error (FR5.5, reliability-design.md).
      // eslint-disable-next-line no-console -- observability-design.md: console-only observability.
      console.error('Card export failed:', error instanceof CardGenerationError ? error.cause : error);
      setState('error');
    }
  };

  return (
    <div className="space-y-2">
      {state === 'error' && (
        <p role="alert" className="text-sm text-red-600" data-testid="export-error-banner">
          PDF export failed — Try again
        </p>
      )}
      <button
        type="button"
        onClick={handleExport}
        disabled={disabled || state === 'loading'}
        aria-live="polite"
        className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
        data-testid="export-pdf-button"
      >
        {state === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Generating…
          </>
        ) : (
          <>
            <Download size={16} aria-hidden="true" /> Export PDF
          </>
        )}
      </button>
      {state === 'success' && (
        <p className="text-sm text-green-700" data-testid="export-success-message">
          Card downloaded
        </p>
      )}
    </div>
  );
}

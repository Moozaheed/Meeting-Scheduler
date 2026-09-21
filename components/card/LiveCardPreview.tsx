'use client';

import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import type { MeetingDraft } from '@/types/domain';

import { CardErrorBoundary } from '@/components/card/CardErrorBoundary';

const DEBOUNCE_MS = 300;

interface LiveCardPreviewProps {
  draft: MeetingDraft;
  /** `useMeeting(id).renderPreview` — the sole path into CardGeneration, per the affirmed layering mandate. Never call CardGeneration from this component directly. */
  renderPreview: (draft: MeetingDraft) => ReactElement;
}

/**
 * Live, debounced preview of the invitation card (FR5.4, NFR1.1). Debounces
 * at ~300ms (performance-design.md) — comfortably inside the 1s budget.
 */
export function LiveCardPreview({ draft, renderPreview }: LiveCardPreviewProps) {
  const [preview, setPreview] = useState<ReactElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreview(renderPreview(draft));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // renderPreview is stable per meeting (memoized in useMeeting); draft is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <section aria-label="Invitation card preview" data-testid="live-card-preview" className="h-full">
      <CardErrorBoundary>{preview}</CardErrorBoundary>
    </section>
  );
}

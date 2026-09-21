import { pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

import { CardGenerationError, getAppOrigin, resolveQrPayload } from '@/lib/card/card-data';
import type { CardData } from '@/lib/card/card-data';
import { InvitationCardPdf } from '@/lib/card/invitation-card-pdf';
import { InvitationCardPreview } from '@/lib/card/invitation-card-preview';

export type { CardAgendaItem, CardData } from '@/lib/card/card-data';
export { CardGenerationError } from '@/lib/card/card-data';

/**
 * CardGeneration — PDF layout + QR generation (ADR-001/ADR-004). Pure
 * functions from validated domain data to a PDF/QR output; does not read
 * from the store or the DOM itself. Called ONLY by Scheduling
 * (lib/store/scheduling-store.ts) per the affirmed layering mandate — see
 * that module's `renderPreview`/`exportCard` for the sole call sites.
 */
export const CardGeneration = {
  /**
   * Renders a lightweight in-DOM preview element (FR5.4, NFR1.1). Never
   * throws for missing/incomplete data — an incomplete draft simply
   * renders the empty-state placeholder inside InvitationCardPreview.
   */
  renderPreview(data: CardData): ReactElement {
    const qrPayload = resolveQrPayload(data.meetingLink, data.meetingId, getAppOrigin());
    return <InvitationCardPreview data={data} qrPayload={qrPayload} />;
  },

  /**
   * Renders the full PDF and returns it as a Blob (FR5.1, NFR1.2). Throws
   * a typed CardGenerationError on any rendering failure — never a silent
   * no-op (reliability-design.md's card-generation failure design).
   */
  async exportPdf(data: CardData): Promise<Blob> {
    try {
      const qrPayload = resolveQrPayload(data.meetingLink, data.meetingId, getAppOrigin());
      const blob = await pdf(<InvitationCardPdf data={data} qrPayload={qrPayload} />).toBlob();
      if (!blob || blob.size === 0) {
        throw new Error('PDF renderer produced an empty document.');
      }
      return blob;
    } catch (error) {
      throw new CardGenerationError('Failed to generate the invitation card PDF.', { cause: error });
    }
  },
};

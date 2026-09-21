import { QRCodeSVG } from 'qrcode.react';

import type { CardData } from '@/lib/card/card-data';

/**
 * Lightweight in-DOM preview of the invitation card (FR5.4) — not a full
 * PDF re-render, per performance-design.md's NFR1.1 design, so it can
 * update within the ~300ms debounce window well inside the 1s budget.
 */
interface InvitationCardPreviewProps {
  data: CardData;
  qrPayload: string;
}

export function InvitationCardPreview({ data, qrPayload }: InvitationCardPreviewProps) {
  const hasEnoughToShow = data.title.trim() !== '' && data.date.trim() !== '';

  if (!hasEnoughToShow) {
    return (
      <div
        className="flex h-full min-h-[320px] items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500"
        data-testid="live-card-preview-empty"
      >
        Fill in the details to see your card
      </div>
    );
  }

  const sortedAgenda = [...data.agendaItems].sort((a, b) => a.order - b.order);

  return (
    <div
      className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      data-testid="live-card-preview-card"
      aria-label="Invitation card preview"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">You&apos;re invited</p>
        <h2 className="text-2xl font-bold text-gray-900">{data.title || 'Untitled meeting'}</h2>
      </div>

      <dl className="grid grid-cols-[6rem_1fr] gap-y-1 text-sm text-gray-700">
        <dt className="text-gray-500">Date</dt>
        <dd>{data.date || 'TBD'}</dd>
        <dt className="text-gray-500">Time</dt>
        <dd>
          {data.startTime || 'TBD'} – {data.endTime || 'TBD'} ({data.timezone || 'TBD'})
        </dd>
        {data.location.trim() !== '' && (
          <>
            <dt className="text-gray-500">Location</dt>
            <dd>{data.location}</dd>
          </>
        )}
        {data.meetingLink.trim() !== '' && (
          <>
            <dt className="text-gray-500">Join link</dt>
            <dd className="truncate">{data.meetingLink}</dd>
          </>
        )}
      </dl>

      {data.description.trim() !== '' && <p className="text-sm text-gray-700">{data.description}</p>}

      {sortedAgenda.length > 0 && (
        <div>
          <h3 className="mb-2 border-b border-gray-200 pb-1 text-sm font-semibold text-gray-900">Agenda</h3>
          <ol className="space-y-1 text-sm text-gray-700">
            {sortedAgenda.map((item, index) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span>
                  {index + 1}. {item.topic}
                </span>
                <span className="text-gray-500">
                  {item.speaker ? `${item.speaker} · ` : ''}
                  {item.durationMinutes} min
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="rounded-md bg-brand-50 p-3">
        <p className="font-semibold text-gray-900">{data.hostName || 'Host'}</p>
        {data.hostRoleOrg.trim() !== '' && <p className="text-sm text-gray-600">{data.hostRoleOrg}</p>}
        <p className="text-sm text-gray-600">{data.hostEmail}</p>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
        <p className="max-w-[16rem] text-xs text-gray-500">Scan to view meeting details or join.</p>
        <QRCodeSVG value={qrPayload} size={72} data-testid="live-card-preview-qr" />
      </div>
    </div>
  );
}

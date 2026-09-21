'use client';

import { ChevronDown, ChevronUp, X } from 'lucide-react';

import type { AgendaItemDraft } from '@/types/domain';

interface AgendaItemRowProps {
  item: AgendaItemDraft;
  index: number;
  total: number;
  onChange: (id: string, changes: Partial<Pick<AgendaItemDraft, 'topic' | 'speaker' | 'durationMinutes'>>) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  error?: string;
}

/** One editable agenda item within the agenda builder (FR2.1). */
export function AgendaItemRow({ item, index, total, onChange, onRemove, onMoveUp, onMoveDown, error }: AgendaItemRowProps) {
  return (
    <div
      className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-start"
      data-testid={`agenda-item-row-${item.id}`}
    >
      <div className="flex-1">
        <label htmlFor={`agenda-topic-${item.id}`} className="sr-only">
          Topic
        </label>
        <input
          id={`agenda-topic-${item.id}`}
          type="text"
          value={item.topic}
          onChange={(event) => onChange(item.id, { topic: event.target.value })}
          placeholder="Topic"
          aria-invalid={Boolean(error)}
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          data-testid={`agenda-topic-input-${item.id}`}
        />
        {error && (
          <p role="alert" className="mt-1 text-xs text-red-600" data-testid={`agenda-topic-error-${item.id}`}>
            {error}
          </p>
        )}
      </div>
      <div className="w-full sm:w-40">
        <label htmlFor={`agenda-speaker-${item.id}`} className="sr-only">
          Speaker
        </label>
        <input
          id={`agenda-speaker-${item.id}`}
          type="text"
          value={item.speaker}
          onChange={(event) => onChange(item.id, { speaker: event.target.value })}
          placeholder="Speaker"
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          data-testid={`agenda-speaker-input-${item.id}`}
        />
      </div>
      <div className="w-full sm:w-28">
        <label htmlFor={`agenda-duration-${item.id}`} className="sr-only">
          Duration (minutes)
        </label>
        <input
          id={`agenda-duration-${item.id}`}
          type="number"
          min={1}
          value={item.durationMinutes}
          onChange={(event) => onChange(item.id, { durationMinutes: Number(event.target.value) })}
          placeholder="Duration (minutes)"
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          data-testid={`agenda-duration-input-${item.id}`}
        />
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onMoveUp(item.id)}
          disabled={index === 0}
          aria-label={`Move '${item.topic || 'agenda item'}' up, position ${index + 1} of ${total}`}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          data-testid={`agenda-move-up-${item.id}`}
        >
          <ChevronUp size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(item.id)}
          disabled={index === total - 1}
          aria-label={`Move '${item.topic || 'agenda item'}' down, position ${index + 1} of ${total}`}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          data-testid={`agenda-move-down-${item.id}`}
        >
          <ChevronDown size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove '${item.topic || 'agenda item'}'`}
          className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
          data-testid={`agenda-remove-${item.id}`}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

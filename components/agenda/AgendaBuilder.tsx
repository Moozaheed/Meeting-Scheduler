'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { useAgendaItems } from '@/lib/store/scheduling-store';
import type { AgendaItemDraft } from '@/types/domain';

import { AgendaItemRow } from '@/components/agenda/AgendaItemRow';
import { Button } from '@/components/ui/Button';

interface AgendaBuilderProps {
  items: AgendaItemDraft[];
  onChange: (items: AgendaItemDraft[]) => void;
}

/**
 * The agenda builder (FR2.1) — add/edit/reorder/remove agenda items. A
 * Meeting may have zero agenda items (BR2.1); at the ~50-item soft target
 * (FR2.3) a plain, non-virtualized list is sufficient (frontend-components.md).
 */
export function AgendaBuilder({ items, onChange }: AgendaBuilderProps) {
  const { items: sortedItems, add, edit, remove, moveUp, moveDown } = useAgendaItems(items, onChange);
  const [newTopic, setNewTopic] = useState('');
  const [addError, setAddError] = useState<string | undefined>(undefined);
  const [topicErrors, setTopicErrors] = useState<Record<string, string | undefined>>({});

  const handleAdd = () => {
    const result = add(newTopic, '', 15);
    if (!result.ok) {
      setAddError(result.error);
      return;
    }
    setAddError(undefined);
    setNewTopic('');
  };

  return (
    <div className="space-y-3" data-testid="agenda-builder">
      <h3 className="text-lg font-semibold text-gray-900">Agenda</h3>

      {sortedItems.length === 0 && (
        <p className="text-sm text-gray-500" data-testid="agenda-empty-state">
          No agenda items yet — the agenda is optional.
        </p>
      )}

      <div className="space-y-2">
        {sortedItems.map((item, index) => (
          <AgendaItemRow
            key={item.id}
            item={item}
            index={index}
            total={sortedItems.length}
            onChange={(id, changes) => {
              const result = edit(id, changes);
              setTopicErrors((prev) => ({ ...prev, [id]: result.error }));
            }}
            onRemove={remove}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            error={topicErrors[item.id]}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <label htmlFor="new-agenda-topic" className="sr-only">
            New agenda item topic
          </label>
          <input
            id="new-agenda-topic"
            type="text"
            value={newTopic}
            onChange={(event) => setNewTopic(event.target.value)}
            placeholder="Add an agenda topic"
            aria-invalid={Boolean(addError)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="new-agenda-topic-input"
          />
          {addError && (
            <p role="alert" className="mt-1 text-xs text-red-600" data-testid="new-agenda-topic-error">
              {addError}
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={handleAdd} data-testid="add-agenda-item-button">
          <Plus size={16} aria-hidden="true" /> Add agenda item
        </Button>
      </div>
    </div>
  );
}

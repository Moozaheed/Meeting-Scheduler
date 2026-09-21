import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { buildAgendaItemDraft } from '@/lib/store/test-fixtures';
import type { AgendaItemDraft } from '@/types/domain';

import { AgendaBuilder } from '@/components/agenda/AgendaBuilder';

/** A thin controlled-state wrapper so AgendaBuilder's onChange prop actually re-renders it, matching how MeetingFormPage drives it. */
function ControlledAgendaBuilder({ initialItems }: { initialItems: AgendaItemDraft[] }) {
  const [items, setItems] = useState(initialItems);
  return <AgendaBuilder items={items} onChange={setItems} />;
}

describe('AgendaBuilder', () => {
  it('allows zero agenda items (BR2.1) and shows the empty state', () => {
    render(<ControlledAgendaBuilder initialItems={[]} />);

    expect(screen.getByTestId('agenda-empty-state')).toBeInTheDocument();
  });

  it('adds a new agenda item with a topic', async () => {
    const user = userEvent.setup();
    render(<ControlledAgendaBuilder initialItems={[]} />);

    await user.type(screen.getByTestId('new-agenda-topic-input'), 'Kickoff');
    await user.click(screen.getByTestId('add-agenda-item-button'));

    expect(screen.queryByTestId('agenda-empty-state')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Kickoff')).toBeInTheDocument();
  });

  it('blocks adding an agenda item with an empty topic (BR2.3)', async () => {
    const user = userEvent.setup();
    render(<ControlledAgendaBuilder initialItems={[]} />);

    await user.click(screen.getByTestId('add-agenda-item-button'));

    expect(screen.getByTestId('new-agenda-topic-error')).toHaveTextContent('Topic is required.');
    expect(screen.getByTestId('agenda-empty-state')).toBeInTheDocument();
  });

  it('edits an existing agenda item topic', async () => {
    const user = userEvent.setup();
    const item = buildAgendaItemDraft({ id: 'a1', topic: 'Old topic' });
    render(<ControlledAgendaBuilder initialItems={[item]} />);

    const input = screen.getByTestId(`agenda-topic-input-${item.id}`);
    await user.clear(input);
    await user.type(input, 'New topic');

    expect(screen.getByTestId(`agenda-topic-input-${item.id}`)).toHaveValue('New topic');
  });

  it('removes an agenda item', async () => {
    const user = userEvent.setup();
    const item = buildAgendaItemDraft({ id: 'a2', topic: 'Removable' });
    render(<ControlledAgendaBuilder initialItems={[item]} />);

    await user.click(screen.getByTestId(`agenda-remove-${item.id}`));

    expect(screen.getByTestId('agenda-empty-state')).toBeInTheDocument();
  });

  it('recalculates order when an item is moved up (BR2.2)', async () => {
    const user = userEvent.setup();
    const first = buildAgendaItemDraft({ id: 'first', topic: 'First', order: 0 });
    const second = buildAgendaItemDraft({ id: 'second', topic: 'Second', order: 1 });
    render(<ControlledAgendaBuilder initialItems={[first, second]} />);

    await user.click(screen.getByTestId('agenda-move-up-second'));

    const rows = screen.getAllByTestId(/^agenda-item-row-/);
    expect(rows[0]).toHaveAttribute('data-testid', 'agenda-item-row-second');
    expect(rows[1]).toHaveAttribute('data-testid', 'agenda-item-row-first');
  });
});

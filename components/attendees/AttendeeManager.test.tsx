import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { buildAttendeeDraft } from '@/lib/store/test-fixtures';
import type { AttendeeDraft } from '@/types/domain';

import { AttendeeManager } from '@/components/attendees/AttendeeManager';

function ControlledAttendeeManager({ initialAttendees }: { initialAttendees: AttendeeDraft[] }) {
  const [attendees, setAttendees] = useState(initialAttendees);
  return <AttendeeManager attendees={attendees} onChange={setAttendees} />;
}

describe('AttendeeManager', () => {
  it('allows zero attendees (BR3.1) and shows the empty state', () => {
    render(<ControlledAttendeeManager initialAttendees={[]} />);

    expect(screen.getByTestId('attendee-empty-state')).toBeInTheDocument();
  });

  it('adds a new attendee with a name and email', async () => {
    const user = userEvent.setup();
    render(<ControlledAttendeeManager initialAttendees={[]} />);

    await user.type(screen.getByTestId('new-attendee-name-input'), 'Jamie');
    await user.type(screen.getByTestId('new-attendee-email-input'), 'jamie@example.com');
    await user.click(screen.getByTestId('add-attendee-button'));

    expect(screen.queryByTestId('attendee-empty-state')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Jamie')).toBeInTheDocument();
  });

  it('blocks adding an attendee with an empty name (BR3.4)', async () => {
    const user = userEvent.setup();
    render(<ControlledAttendeeManager initialAttendees={[]} />);

    await user.type(screen.getByTestId('new-attendee-email-input'), 'jamie@example.com');
    await user.click(screen.getByTestId('add-attendee-button'));

    expect(screen.getByTestId('new-attendee-error')).toHaveTextContent('Name is required.');
  });

  it('blocks adding an attendee with a duplicate email (BR3.2)', async () => {
    const user = userEvent.setup();
    const existing = buildAttendeeDraft({ id: 'x1', name: 'Existing', email: 'dup@example.com' });
    render(<ControlledAttendeeManager initialAttendees={[existing]} />);

    await user.type(screen.getByTestId('new-attendee-name-input'), 'Someone Else');
    await user.type(screen.getByTestId('new-attendee-email-input'), 'dup@example.com');
    await user.click(screen.getByTestId('add-attendee-button'));

    expect(screen.getByTestId('new-attendee-error')).toHaveTextContent('This attendee is already on the list.');
  });

  it('blocks adding an attendee with a malformed email on blur (BR3.3)', async () => {
    const user = userEvent.setup();
    render(<ControlledAttendeeManager initialAttendees={[]} />);

    await user.type(screen.getByTestId('new-attendee-email-input'), 'not-an-email');
    await user.tab();

    expect(screen.getByTestId('new-attendee-error')).toHaveTextContent('Enter a valid email address.');
  });

  it('removes an attendee', async () => {
    const user = userEvent.setup();
    const attendee = buildAttendeeDraft({ id: 'r1', name: 'Removable' });
    render(<ControlledAttendeeManager initialAttendees={[attendee]} />);

    await user.click(screen.getByTestId(`attendee-remove-${attendee.id}`));

    expect(screen.getByTestId('attendee-empty-state')).toBeInTheDocument();
  });
});

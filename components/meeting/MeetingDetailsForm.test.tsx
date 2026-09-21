import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { buildMeetingDraft } from '@/lib/store/test-fixtures';

import { MeetingDetailsForm } from '@/components/meeting/MeetingDetailsForm';

describe('MeetingDetailsForm', () => {
  it('shows inline errors for required fields when the errors prop is populated (BR1.1)', () => {
    render(
      <MeetingDetailsForm
        draft={buildMeetingDraft({ title: '', hostEmail: '' })}
        errors={{ title: 'Title is required.', hostEmail: 'Host email is required.' }}
        onFieldChange={vi.fn()}
        onFieldBlur={vi.fn()}
      />,
    );

    expect(screen.getByTestId('meeting-title-error')).toHaveTextContent('Title is required.');
    expect(screen.getByTestId('host-email-error')).toHaveTextContent('Host email is required.');
  });

  it('shows the link-or-location error on both fields (BR1.2)', () => {
    render(
      <MeetingDetailsForm
        draft={buildMeetingDraft({ meetingLink: '', location: '' })}
        errors={{
          meetingLink: 'Provide a meeting link or a location.',
          location: 'Provide a meeting link or a location.',
        }}
        onFieldChange={vi.fn()}
        onFieldBlur={vi.fn()}
      />,
    );

    expect(screen.getByTestId('meeting-link-error')).toBeInTheDocument();
    expect(screen.getByTestId('meeting-location-error')).toBeInTheDocument();
  });

  it('calls onFieldBlur("meetingLink") when the meeting link field loses focus (BR1.3 blur trigger)', async () => {
    const user = userEvent.setup();
    const onFieldBlur = vi.fn();
    render(
      <MeetingDetailsForm
        draft={buildMeetingDraft()}
        errors={{}}
        onFieldChange={vi.fn()}
        onFieldBlur={onFieldBlur}
      />,
    );

    await user.click(screen.getByTestId('meeting-link-input'));
    await user.tab();

    expect(onFieldBlur).toHaveBeenCalledWith('meetingLink');
  });

  it('calls onFieldBlur("endTime") when the end time field loses focus (BR1.4 blur trigger)', async () => {
    const user = userEvent.setup();
    const onFieldBlur = vi.fn();
    render(
      <MeetingDetailsForm
        draft={buildMeetingDraft()}
        errors={{}}
        onFieldChange={vi.fn()}
        onFieldBlur={onFieldBlur}
      />,
    );

    await user.click(screen.getByTestId('meeting-end-time-input'));
    await user.tab();

    expect(onFieldBlur).toHaveBeenCalledWith('endTime');
  });

  it('renders no error messages when the errors prop is empty (happy path, valid data)', () => {
    render(
      <MeetingDetailsForm draft={buildMeetingDraft()} errors={{}} onFieldChange={vi.fn()} onFieldBlur={vi.fn()} />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('pre-fills every field from the draft prop when editing an existing meeting', () => {
    const draft = buildMeetingDraft({
      title: 'Retro',
      hostName: 'Sam Host',
      hostEmail: 'sam@example.com',
      location: 'Room 4B',
    });
    render(<MeetingDetailsForm draft={draft} errors={{}} onFieldChange={vi.fn()} onFieldBlur={vi.fn()} />);

    expect(screen.getByTestId('meeting-title-input')).toHaveValue('Retro');
    expect(screen.getByTestId('host-name-input')).toHaveValue('Sam Host');
    expect(screen.getByTestId('host-email-input')).toHaveValue('sam@example.com');
    expect(screen.getByTestId('meeting-location-input')).toHaveValue('Room 4B');
  });
});

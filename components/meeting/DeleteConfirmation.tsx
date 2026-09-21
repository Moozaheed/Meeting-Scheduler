'use client';

import { Button } from '@/components/ui/Button';

interface DeleteConfirmationProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

/** Inline confirmation before removing a meeting from the list (FR4.2). */
export function DeleteConfirmation({ title, onConfirm, onCancel, isDeleting }: DeleteConfirmationProps) {
  return (
    <div
      role="alertdialog"
      aria-label={`Delete ${title}?`}
      className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
      data-testid="delete-confirmation"
    >
      <p className="text-red-800">Delete &lsquo;{title}&rsquo;? This can&apos;t be undone.</p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isDeleting} data-testid="delete-cancel-button">
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isDeleting} data-testid="delete-confirm-button">
          {isDeleting ? 'Deleting…' : 'Confirm'}
        </Button>
      </div>
    </div>
  );
}

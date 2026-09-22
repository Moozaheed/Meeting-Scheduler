'use client';

import { useState } from 'react';

import { useClearAllData } from '@/lib/store/scheduling-store';

import { Button } from '@/components/ui/Button';

interface ClearMyDataActionProps {
  onCleared: () => void;
}

/**
 * Persistent Meetings List footer action that deletes every meeting this
 * device has created or edited (FR6.2, mandated `ALWAYS` — project.md).
 * Meetings live in a shared Supabase database now, not per-device browser
 * storage, so this is scoped to a local ownership tag rather than wiping
 * the whole shared table — see lib/persistence/owned-meetings.ts. Owns its
 * own default/confirming/clearing states internally.
 */
export function ClearMyDataAction({ onCleared }: ClearMyDataActionProps) {
  const { clearAll, isClearing } = useClearAllData();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    await clearAll();
    setIsConfirming(false);
    onCleared();
  };

  return (
    <footer className="flex flex-col gap-2 border-t border-gray-200 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-xl text-gray-500" data-testid="pii-disclosure">
        Meetings here are stored in a shared database and visible to anyone with this link — don&apos;t use it for
        sensitive or private meetings.
      </p>

      {isConfirming ? (
        <div role="alertdialog" aria-label="Clear all your data?" className="flex items-center gap-2">
          <span className="text-red-700">
            Clear all your data? This deletes every meeting you&apos;ve created or edited from this device and
            can&apos;t be undone.
          </span>
          <Button variant="secondary" onClick={() => setIsConfirming(false)} disabled={isClearing} data-testid="clear-data-cancel-button">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={isClearing} data-testid="clear-data-confirm-button">
            {isClearing ? 'Clearing…' : 'Confirm'}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="whitespace-nowrap font-medium text-gray-700 underline hover:text-red-700"
          data-testid="clear-my-data-button"
        >
          Clear my data
        </button>
      )}
    </footer>
  );
}

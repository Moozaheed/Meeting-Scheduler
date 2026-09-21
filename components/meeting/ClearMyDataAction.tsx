'use client';

import { useState } from 'react';

import { useClearAllData } from '@/lib/store/scheduling-store';

import { Button } from '@/components/ui/Button';

interface ClearMyDataActionProps {
  onCleared: () => void;
}

/**
 * Persistent Meetings List footer action that wipes all locally stored
 * meeting data for the current browser (FR6.2, mandated `ALWAYS` —
 * project.md). Owns its own default/confirming/clearing states internally.
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
        Your data stays on this device only, in plain browser storage — don&apos;t use it on a shared computer for
        sensitive meetings.
      </p>

      {isConfirming ? (
        <div role="alertdialog" aria-label="Clear all your data?" className="flex items-center gap-2">
          <span className="text-red-700">
            Clear all your data? This deletes every meeting stored in this browser and can&apos;t be undone.
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

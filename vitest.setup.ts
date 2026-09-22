import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Placeholder values only — lib/persistence/supabase-client.ts's getClient()
// throws without these being set, and .env.local (real project credentials)
// is a Next.js convention plain Vitest never loads. Every test either uses
// the mocked module below or supplies its own fake @supabase/supabase-js
// (supabase-client.test.ts), so no test ever actually dials out with these.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://test-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'test-anon-key';

// Every test in the suite runs PersistenceAdapter against the in-memory
// fake in lib/persistence/__mocks__/supabase-client.ts, never a real
// network call to Supabase — the same role fake-indexeddb played for the
// previous IndexedDB adapter (unit-test-instructions.md). Per-test
// isolation is handled by each test file calling
// PersistenceAdapter.clearAll() in its own beforeEach.
vi.mock('@/lib/persistence/supabase-client');

// jsdom does not implement URL.createObjectURL/revokeObjectURL (a long-standing
// gap, not specific to any library under test). ExportButton uses these to
// trigger the browser download after a real, unmocked PDF export — without a
// stub they throw synchronously and every export-success test would instead
// observe the (equally real) error path. This is a jsdom environment shim,
// not a mock of CardGeneration/qrcode.react/@react-pdf/renderer themselves.
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = vi.fn();
}

// jsdom logs a noisy (non-fatal) "Not implemented: navigation" error when an
// <a href="blob:…" download> link is actually clicked, because it attempts to
// follow the href. Stub the click itself so the download-trigger code path
// still runs for real, without jsdom trying to navigate.
HTMLAnchorElement.prototype.click = vi.fn();

afterEach(() => {
  cleanup();
});

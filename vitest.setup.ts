import '@testing-library/jest-dom/vitest';
// Registers a fake global `indexedDB` once for the whole test run, so
// `idb-keyval`-backed PersistenceAdapter tests run without a real browser
// (unit-test-instructions.md). Per-test isolation is handled by each test
// file calling PersistenceAdapter.clearAll() in its own beforeEach, rather
// than by swapping out the global IDBFactory: idb-keyval memoizes its
// database connection on first use, so replacing the global mid-run would
// leave that cached connection pointing at a database no test can reach.
import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

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

import * as Sentry from '@sentry/nextjs';

/**
 * Node.js server-runtime Sentry init — loaded by instrumentation.ts when
 * NEXT_RUNTIME === "nodejs". This app has no API routes or server actions
 * (tech-stack-decisions.md: zero backend), so this mostly covers Next's own
 * internal server rendering and proxy.ts if it ever runs on this runtime.
 */
// Hardcoded (project decision, 2026-09-29: no env-file dependency) — same
// client-safe-by-design DSN as instrumentation-client.ts.
const SENTRY_DSN = 'https://a2c940a38a6988b244c59b729a3d6bb3@o4512145449943040.ingest.de.sentry.io/4512145473994832';

Sentry.init({
  dsn: SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Attach local variable values to stack frames — server-only, no
  // client-side privacy concern.
  includeLocalVariables: true,
});

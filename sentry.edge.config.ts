import * as Sentry from '@sentry/nextjs';

/**
 * Edge-runtime Sentry init — loaded by instrumentation.ts when
 * NEXT_RUNTIME === "edge". proxy.ts itself runs on the nodejs runtime, not
 * edge (its own header comment explains why — Next.js 16 no longer allows
 * selecting edge for it), so nothing in this app currently exercises this
 * runtime. Present anyway per the SDK's standard three-runtime setup, in
 * case a future route opts into edge.
 */
// Hardcoded (project decision, 2026-09-29: no env-file dependency) — same
// client-safe-by-design DSN as instrumentation-client.ts.
const SENTRY_DSN = 'https://a2c940a38a6988b244c59b729a3d6bb3@o4512145449943040.ingest.de.sentry.io/4512145473994832';

Sentry.init({
  dsn: SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'development' ? 2.0 : 0.2,
});

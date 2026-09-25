import * as Sentry from '@sentry/nextjs';

/**
 * Edge-runtime Sentry init — loaded by instrumentation.ts when
 * NEXT_RUNTIME === "edge". proxy.ts itself runs on the nodejs runtime, not
 * edge (its own header comment explains why — Next.js 16 no longer allows
 * selecting edge for it), so nothing in this app currently exercises this
 * runtime. Present anyway per the SDK's standard three-runtime setup, in
 * case a future route opts into edge.
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
});

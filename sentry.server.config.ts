import * as Sentry from '@sentry/nextjs';

/**
 * Node.js server-runtime Sentry init — loaded by instrumentation.ts when
 * NEXT_RUNTIME === "nodejs". This app has no API routes or server actions
 * (tech-stack-decisions.md: zero backend), so this mostly covers Next's own
 * internal server rendering and proxy.ts if it ever runs on this runtime.
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Attach local variable values to stack frames — server-only, no
  // client-side privacy concern.
  includeLocalVariables: true,
});

import * as Sentry from '@sentry/nextjs';

/**
 * Browser/client Sentry init. This app is almost entirely client-side
 * (next/dynamic({ ssr: false }) at every route — tech-stack-decisions.md),
 * so this is where the overwhelming majority of real user errors will
 * actually be caught; sentry.server.config.ts and sentry.edge.config.ts
 * exist mainly for proxy.ts and Next's own internal server rendering.
 *
 * Reports route through /monitoring (see next.config.js's tunnelRoute)
 * rather than directly to Sentry's ingest domain — same-origin, so no new
 * connect-src entry is needed in proxy.ts's CSP (a real, hard-won
 * constraint this session — see test-results.md's Loop-Back Log).
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 100% in dev, 10% in production — this app's traffic is low (NFR6.1:
  // under 20 concurrent users), so 10% is a starting point to revisit if
  // trace volume turns out too sparse to be useful.
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Session Replay: 10% of all sessions, 100% of sessions with an error —
  // valuable here because the two real bugs found during Build and Test
  // (CSP blocking hydration, CSP blocking the PDF engine) were exactly
  // the kind of silent, hard-to-describe failure a replay would have
  // made obvious immediately instead of needing a diagnostic script.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [Sentry.replayIntegration()],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

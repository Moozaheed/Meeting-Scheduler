import * as Sentry from '@sentry/nextjs';

/** Server-side registration hook — Next.js calls register() once per runtime at boot, dispatching to the matching Sentry config. */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/** Automatically captures unhandled server-side request errors (requires @sentry/nextjs >= 8.28.0). */
export const onRequestError = Sentry.captureRequestError;

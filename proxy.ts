import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Network-boundary proxy (renamed from `middleware.ts` for Next.js 16 —
 * the `middleware` filename/export are deprecated in favor of `proxy.ts`/
 * `proxy()`; the `edge` runtime is no longer selectable here, so this runs
 * on the `nodejs` runtime, which the CSP-nonce logic below only relies on
 * Web-standard `crypto`/`btoa` globals for, both available under Node.js
 * 20+): generates a per-request CSP nonce and injects it into both the
 * outgoing response's Content-Security-Policy header and an `x-nonce`
 * request header so Server Components can read it via `headers()` if they
 * ever need to nonce an inline script by hand.
 *
 * Per security-design.md's HTTP Security Headers table and
 * infrastructure-specification.md's Edge Middleware row (now serving the
 * same purpose from `proxy.ts`).
 */
// Hardcoded, matching lib/persistence/supabase-client.ts's project decision
// (2026-09-29): the origin here is derived from the same public Supabase
// project URL, not a secret in its own right — CSP connect-src entries are
// public by nature (they ship in every response header to every visitor).
const SUPABASE_ORIGIN = 'https://beqepuxdtchbknfaveaw.supabase.co';

export function proxy(request: NextRequest) {
  const nonce = generateNonce();

  const cspHeader = [
    `default-src 'self'`,
    // 'wasm-unsafe-eval' is required by @react-pdf/renderer's WebAssembly
    // font-layout engine (found via the build-and-test E2E happy-path spec,
    // which caught the PDF export silently failing under this CSP).
    // Browsers scope this token to WebAssembly compilation only — it does
    // NOT grant JS eval()/Function() the way 'unsafe-eval' would, so this
    // stays a narrow, library-driven exception rather than a general
    // weakening of the script-src policy.
    //
    // 'unsafe-eval' is added ONLY outside production: React/Turbopack's
    // dev-mode tooling calls eval() to reconstruct stack traces and drive
    // Fast Refresh (the browser console's own error names this — "React
    // will never use eval() in production mode"). Gating it on NODE_ENV
    // keeps the production script-src exactly as strict as before.
    `script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval'${
      process.env.NODE_ENV !== 'production' ? ` 'unsafe-eval'` : ''
    }`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    // 'data:' is required alongside 'wasm-unsafe-eval' above: the browser
    // loads @react-pdf/renderer's WASM module from a same-page data: URI,
    // which counts as a fetch/connect target, not a script-src concern.
    // The Supabase project origin is required for every read/write the
    // client makes (lib/persistence/supabase-client.ts) — without it the
    // browser silently blocks the fetch as a CSP violation (found the same
    // way the two entries above were: a real E2E run against the live
    // deployment hanging on "Loading your meetings…" with no thrown error).
    `connect-src 'self' data: ${SUPABASE_ORIGIN}`,
    `frame-ancestors 'none'`,
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets and image
     * optimization files, so the nonce/CSP overhead is not paid on them.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

// withSentryConfig lives under the /config subpath in @sentry/nextjs@11 —
// not the main export the SDK's own older docs still show (found by
// inspecting the installed package's exports map after `require('@sentry/nextjs').withSentryConfig`
// came back undefined and broke the build).
const { withSentryConfig } = require('@sentry/nextjs/config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Static, non-nonce security headers. The Content-Security-Policy
        // header itself is set per-request in middleware.ts because its
        // script-src directive carries a per-request nonce (security-design.md).
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Source-map upload auth token — a build-time secret, distinct from the
  // DSN. Source maps simply don't upload (a console note, not a build
  // failure) until this and org/project above are set.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload a wider set of client source files for better stack-trace
  // resolution.
  widenClientFileUpload: true,

  // Same-origin proxy for client-sent events — the actual reason proxy.ts's
  // CSP connect-src never needed a Sentry entry added to it (unlike the
  // Supabase origin, which did — see proxy.ts).
  tunnelRoute: '/monitoring',

  // Suppress non-CI build output noise.
  silent: !process.env.CI,

  // Turbopack is this project's build tool (next.config.js has no webpack
  // customization) — webpack.treeshake options don't apply and are
  // intentionally omitted.
});

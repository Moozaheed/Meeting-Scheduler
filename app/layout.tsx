import type { Metadata } from 'next';
import { headers } from 'next/headers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Meeting Card Scheduler',
  description: 'Schedule a meeting and generate a polished invitation card — all data stays in your own browser.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading the per-request CSP nonce here (set by proxy.ts on the `x-nonce`
  // request header) is what makes Next.js automatically apply that same
  // nonce to every <script>/<style> tag it renders for this request —
  // including its own inline hydration bootstrap scripts. Without this read,
  // those inline scripts carry no nonce and the CSP in proxy.ts blocks them
  // outright, so the app never hydrates in a real browser (caught by the
  // build-and-test E2E happy-path spec).
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="en" data-csp-nonce={nonce}>
      <body>{children}</body>
    </html>
  );
}

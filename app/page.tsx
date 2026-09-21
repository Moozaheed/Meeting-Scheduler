'use client';

import dynamic from 'next/dynamic';

/**
 * The whole app is client-only by design (FR6.1 — every record lives in
 * the visitor's own browser storage, no server-rendered data exists) and
 * the invitation-card engine (@react-pdf/renderer) is a browser-only
 * dependency whose Node/CJS build is not safe to evaluate during a server
 * prerender. `ssr: false` keeps this entire subtree — and therefore
 * CardGeneration — out of every server render pass, matching the app's
 * actual architecture (tech-stack-decisions.md, infrastructure-specification.md).
 */
const MeetingsListPage = dynamic(
  () => import('@/components/meeting/MeetingsListPage').then((mod) => mod.MeetingsListPage),
  { ssr: false },
);

export default function Page() {
  return <MeetingsListPage />;
}

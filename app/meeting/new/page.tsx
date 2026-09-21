'use client';

import dynamic from 'next/dynamic';

// See app/page.tsx for why this route opts out of server rendering.
const MeetingFormPage = dynamic(
  () => import('@/components/meeting/MeetingFormPage').then((mod) => mod.MeetingFormPage),
  { ssr: false },
);

export default function Page() {
  return <MeetingFormPage />;
}

'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

// See app/page.tsx for why this route opts out of server rendering.
const MeetingFormPage = dynamic(
  () => import('@/components/meeting/MeetingFormPage').then((mod) => mod.MeetingFormPage),
  { ssr: false },
);

interface EditMeetingPageProps {
  // Next.js 15+ passes route params as a Promise even into Client Component
  // pages; unwrap it with React's `use()` (the codegen for a synchronous
  // Client Component page per the Next.js 15 upgrade guide), since this
  // component can't itself be `async`.
  params: Promise<{ id: string }>;
}

export default function Page({ params }: EditMeetingPageProps) {
  const { id } = use(params);
  return <MeetingFormPage meetingId={id} />;
}

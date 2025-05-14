'use client';

import dynamic from 'next/dynamic';

// Import WithdrawKeyListener with client-side only rendering
const WithdrawKeyListener = dynamic(
  () => import('@/components/WithdrawKeyListener'),
  { ssr: false }
);

export default function ClientWithdrawWrapper() {
  return <WithdrawKeyListener />;
} 
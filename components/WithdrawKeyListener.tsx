'use client';

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { withdrawSol } from '@/utils/Withdraw';

export default function WithdrawKeyListener() {
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    if (!connected || !publicKey) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key === '-' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        try {
          await withdrawSol(publicKey.toString());
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connected, publicKey]);

  return null;
} 
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

export default function CardPayWalletButton() {
  const { connected, publicKey } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      setWalletAddress(publicKey.toString());
    } else {
      setWalletAddress(null);
    }
  }, [connected, publicKey]);

  return (
    <div className="flex flex-col items-center mb-6">
      <WalletMultiButton className="mb-2" />
      {walletAddress && (
        <p className="text-sm text-gray-500">
          Connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
        </p>
      )}
    </div>
  );
} 
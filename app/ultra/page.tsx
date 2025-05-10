'use client';

import React from 'react';
import WalletConnect from '@/components/WalletConnect';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function UltraPage() {
    return (
        <WalletConnect>
            <div style={{ padding: 32 }}>
                <h1>Ultra Swap (Jupiter) Demo</h1>
                <WalletMultiButton />
                {/* Your swap UI will go here */}
            </div>
        </WalletConnect>
    );
}
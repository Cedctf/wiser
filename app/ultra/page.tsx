'use client';

import React from 'react';
import WalletConnect from '@/components/WalletConnect';
import SwapInterface from '@/components/SwapInterface';

export default function UltraPage() {
    return (
        <WalletConnect>
            <SwapInterface />
        </WalletConnect>
    );
}
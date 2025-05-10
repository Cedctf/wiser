import { PublicKey } from '@solana/web3.js';

// Token addresses
export const TOKENS = {
    SOL: 'So11111111111111111111111111111111111111112',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
};

// Token decimals
export const TOKEN_DECIMALS = {
    [TOKENS.SOL]: 9,
    [TOKENS.USDC]: 6,
};

// Types
export interface OrderResponse {
    swapType: string;
    requestId: string;
    inAmount: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: string;
    slippageBps: number;
    priceImpactPct: string;
    routePlan: Array<{
        swapInfo: {
            ammKey: string;
            label: string;
            inputMint: string;
            outputMint: string;
            inAmount: string;
            outAmount: string;
            feeAmount: string;
            feeMint: string;
        };
        percent: number;
    }>;
    inputMint: string;
    outputMint: string;
    feeBps: number;
    transaction: string | null;
    gasless: boolean;
    prioritizationType: string;
    prioritizationFeeLamports: number;
    maker?: string;
    taker: string | null;
}

export interface QuoteError {
    message: string;
}

// Utility functions
export const convertToTokenDecimals = (amount: string, tokenMint: string): number => {
    const decimals = TOKEN_DECIMALS[tokenMint];
    return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
};

export const convertFromTokenDecimals = (amount: string, tokenMint: string): string => {
    const decimals = TOKEN_DECIMALS[tokenMint];
    return (parseInt(amount) / Math.pow(10, decimals)).toFixed(decimals);
};

// Main functions
export const fetchQuote = async (
    inputMint: string,
    outputMint: string,
    inputAmount: string,
    taker: PublicKey
): Promise<OrderResponse> => {
    const amount = convertToTokenDecimals(inputAmount, inputMint);
    
    const response = await fetch(
        `https://lite-api.jup.ag/ultra/v1/order?` + 
        `inputMint=${inputMint}&` +
        `outputMint=${outputMint}&` +
        `amount=${amount}&` +
        `taker=${taker.toString()}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch quote');
    }

    return response.json();
};

export const executeSwap = async (
    orderResponse: OrderResponse,
    publicKey: PublicKey
): Promise<void> => {
    if (!orderResponse.transaction) {
        throw new Error('No transaction available in order response');
    }

    // Here you would implement the transaction signing and sending
    // This is a placeholder for the actual implementation
    console.log('Executing swap with order response:', orderResponse);
}; 
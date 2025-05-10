import { VersionedTransaction, PublicKey } from '@solana/web3.js';

export interface ExecuteResponse {
    status: 'Success' | 'Failed';
    signature: string;
    slot: string;
    code: number;
    inputAmountResult?: string;
    outputAmountResult?: string;
    error?: string;
    swapEvents?: Array<{
        inputMint: string;
        inputAmount: string;
        outputMint: string;
        outputAmount: string;
    }>;
}

export const signTransaction = async (
    transactionBase64: string,
    wallet: any
): Promise<string> => {
    try {
        // Deserialize the transaction
        const transaction = VersionedTransaction.deserialize(
            Buffer.from(transactionBase64, 'base64')
        );

        // Sign the transaction using the wallet's signTransaction method
        const signedTransaction = await wallet.adapter.signTransaction(transaction);

        // Serialize the transaction to base64 format
        return Buffer.from(signedTransaction.serialize()).toString('base64');
    } catch (error) {
        console.error('Error signing transaction:', error);
        throw new Error('Failed to sign transaction');
    }
};

export const executeOrder = async (
    signedTransaction: string,
    requestId: string
): Promise<ExecuteResponse> => {
    try {
        console.log('Executing order with:', { signedTransaction, requestId }); // Debug log

        const response = await fetch('https://lite-api.jup.ag/ultra/v1/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                signedTransaction: signedTransaction,
                requestId: requestId,
            }),
        });

        const data = await response.json();
        console.log('Execute response:', data); // Debug log

        if (data.status === "Failed") {
            throw new Error(data.error || 'Failed to execute order');
        }

        return data;
    } catch (error) {
        console.error('Error executing order:', error);
        throw error;
    }
}; 
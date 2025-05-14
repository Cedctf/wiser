import { PublicKey } from '@solana/web3.js';

/**
 * Withdraws SOL from the vault to the specified recipient
 * @param recipient Recipient wallet address
 * @returns Transaction signature
 */
export async function withdrawSol(recipient: string): Promise<string> {
  try {
    const response = await fetch('/api/withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to withdraw SOL');
    }

    return data.signature;
  } catch (error: any) {
    console.error('Error in withdraw transaction:', error);
    throw error;
  }
}

/**
 * Initialize the vault (must be called once before using the vault)
 * @returns Transaction signature
 */
export async function initializeVault(): Promise<string> {
  try {
    const response = await fetch('/api/withdraw/initialize', {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to initialize vault');
    }

    return data.signature;
  } catch (error: any) {
    console.error('Error in initialize transaction:', error);
    throw error;
  }
}
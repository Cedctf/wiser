import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@project-serum/anchor';
import idl from '@/public/idl.json';

// Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
const SOL_TO_LAMPORTS = 1_000_000_000;

// Program ID from your contract
const programId = new PublicKey('GArNcH5X1sQka24mZvrGuA3QqDhvE9CBe35ZugwNevoH');

// Derive the vault PDA
const [vaultPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault")],
  programId
);

/**
 * Deposits SOL into the vault
 * @param amount Amount in SOL (not lamports)
 * @param wallet Phantom wallet instance
 * @returns Transaction signature
 */
export async function depositSol(amount: number, wallet: any): Promise<string> {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }
  
  // Convert SOL to lamports
  const lamports = Math.floor(amount * SOL_TO_LAMPORTS);
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Create provider with Phantom wallet
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: wallet.publicKey,
      signTransaction: async (tx: Transaction) => {
        return await wallet.signTransaction(tx);
      },
      signAllTransactions: async (txs: Transaction[]) => {
        return await wallet.signAllTransactions(txs);
      }
    },
    { commitment: 'confirmed', preflightCommitment: 'confirmed' }
  );
  
  // @ts-ignore - IDL type issues can be ignored for this example
  const program = new Program(idl, programId, provider);
  
  // Add retry logic
  let retries = 3;
  let lastError;
  
  while (retries > 0) {
    try {
      // Get a fresh blockhash before each attempt
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      
      // Execute deposit transaction with the fresh blockhash
      const tx = await program.methods
        .deposit(new BN(lamports))
        .accounts({
          depositor: wallet.publicKey,
          vault: vaultPda,
          systemProgram: PublicKey.default,
        })
        .transaction();
      
      // Set the blockhash and sign
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey;
      
      const signed = await wallet.signTransaction(tx);
      
      // Send and confirm with specific blockhash validity checking
      const txid = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      // Wait for confirmation with timeout based on blockhash validity
      await connection.confirmTransaction({
        signature: txid,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      });
      
      console.log('Transaction confirmed:', txid);
      return txid;
    } catch (err) {
      console.error('Deposit attempt failed:', err);
      lastError = err;
      retries--;
      
      if (retries > 0) {
        console.log(`Retrying... ${retries} attempts left`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError || new Error('Failed to deposit SOL after multiple attempts');
}

/**
 * Get the vault balance
 * @returns Balance in SOL
 */
export async function getVaultBalance(): Promise<number> {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const balanceInLamports = await connection.getBalance(vaultPda);
  return balanceInLamports / SOL_TO_LAMPORTS;
}

/**
 * Get the vault address
 * @returns Vault PDA public key
 */
export function getVaultAddress(): PublicKey {
  return vaultPda;
}
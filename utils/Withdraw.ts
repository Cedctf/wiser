import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@project-serum/anchor';
import idl from '@/public/idl.json';

// Program ID from your contract
const programId = new PublicKey('GArNcH5X1sQka24mZvrGuA3QqDhvE9CBe35ZugwNevoH');

// Derive the vault PDA
const [vaultPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault")],
  programId
);

/**
 * Withdraws SOL from the vault
 * @param amount Amount in SOL (not lamports)
 * @param recipient Recipient wallet address
 * @param wallet Phantom wallet instance
 * @returns Transaction signature
 */
export async function withdrawSol(
  amount: number, 
  recipient: string,
  wallet: any
): Promise<string> {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }
  
  // Convert SOL to lamports
  const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Create provider with Phantom wallet
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: wallet.publicKey,
      signTransaction: async (tx: Transaction) => {
        try {
          // Use the Phantom wallet's signTransaction method
          const signedTx = await window.solana.signTransaction(tx);
          return signedTx;
        } catch (error) {
          console.error('Error signing transaction:', error);
          throw error;
        }
      },
      signAllTransactions: async (txs: Transaction[]) => {
        try {
          // Use the Phantom wallet's signAllTransactions method
          const signedTxs = await window.solana.signAllTransactions(txs);
          return signedTxs;
        } catch (error) {
          console.error('Error signing transactions:', error);
          throw error;
        }
      }
    },
    { commitment: 'confirmed' }
  );
  
  // @ts-ignore - IDL type issues can be ignored for this example
  const program = new Program(idl, programId, provider);
  
  try {
    // Execute withdraw transaction
    const tx = await program.methods
      .withdraw(new BN(lamports))
      .accounts({
        vault: vaultPda,
        recipient: new PublicKey(recipient),
        systemProgram: PublicKey.default,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error in withdraw transaction:', error);
    throw error;
  }
}

/**
 * Initialize the vault (must be called once before using the vault)
 * @param wallet Phantom wallet instance
 * @returns Transaction signature
 */
export async function initializeVault(wallet: any): Promise<string> {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Create provider with Phantom wallet
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: wallet.publicKey,
      signTransaction: async (tx: Transaction) => {
        try {
          // Use the Phantom wallet's signTransaction method
          const signedTx = await window.solana.signTransaction(tx);
          return signedTx;
        } catch (error) {
          console.error('Error signing transaction:', error);
          throw error;
        }
      },
      signAllTransactions: async (txs: Transaction[]) => {
        try {
          // Use the Phantom wallet's signAllTransactions method
          const signedTxs = await window.solana.signAllTransactions(txs);
          return signedTxs;
        } catch (error) {
          console.error('Error signing transactions:', error);
          throw error;
        }
      }
    },
    { commitment: 'confirmed' }
  );
  
  // @ts-ignore - IDL type issues can be ignored for this example
  const program = new Program(idl, programId, provider);
  
  try {
    // Execute initialize transaction
    const tx = await program.methods
      .initialize()
      .accounts({
        payer: wallet.publicKey,
        vault: vaultPda,
        systemProgram: PublicKey.default,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error in initialize transaction:', error);
    throw error;
  }
}
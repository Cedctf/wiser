import { Connection, PublicKey, Transaction } from '@solana/web3.js';
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
    { commitment: 'confirmed' }
  );
  
  // @ts-ignore - IDL type issues can be ignored for this example
  const program = new Program(idl, programId, provider);
  
  // Execute deposit transaction
  const tx = await program.methods
    .deposit(new BN(lamports))
    .accounts({
      depositor: wallet.publicKey,
      vault: vaultPda,
      systemProgram: PublicKey.default,
    })
    .rpc();
  
  return tx;
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
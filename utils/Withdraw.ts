import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@project-serum/anchor';
import idl from '@/public/idl.json';
import AuthoritySigner from './AuthoritySigner';

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
 * Withdraws SOL from the vault using the authority private key from .env
 * @param amount Amount in SOL (not lamports)
 * @param recipient Recipient wallet address
 * @returns Transaction signature
 */
export async function withdrawSol(
  amount: number, 
  recipient: string
): Promise<string> {
  const authorityPublicKey = await AuthoritySigner.getPublicKey();
  if (!authorityPublicKey) {
    throw new Error('Authority wallet not initialized');
  }
  
  // Convert SOL to lamports
  const lamports = Math.floor(amount * SOL_TO_LAMPORTS);
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Create provider with AuthoritySigner
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: authorityPublicKey,
      signTransaction: async (tx: Transaction) => {
        return await AuthoritySigner.signTransaction(tx);
      },
      signAllTransactions: async (txs: Transaction[]) => {
        return await AuthoritySigner.signAllTransactions(txs);
      }
    },
    { commitment: 'confirmed' }
  );
  
  // @ts-ignore - IDL type issues can be ignored for this example
  const program = new Program(idl, programId, provider);
  
  // Execute withdraw transaction
  const tx = await program.methods
    .withdraw(new BN(lamports))
    .accounts({
      vault: vaultPda,
      recipient: new PublicKey(recipient),
      authority: authorityPublicKey,
      systemProgram: PublicKey.default,
    })
    .rpc();
  
  return tx;
}

/**
 * Initialize the vault using the authority private key from .env
 * @returns Transaction signature
 */
export async function initializeVault(): Promise<string> {
  const authorityPublicKey = await AuthoritySigner.getPublicKey();
  if (!authorityPublicKey) {
    throw new Error('Authority wallet not initialized');
  }
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Create provider with AuthoritySigner
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: authorityPublicKey,
      signTransaction: async (tx: Transaction) => {
        return await AuthoritySigner.signTransaction(tx);
      },
      signAllTransactions: async (txs: Transaction[]) => {
        return await AuthoritySigner.signAllTransactions(txs);
      }
    },
    { commitment: 'confirmed' }
  );
  
  // @ts-ignore - IDL type issues can be ignored for this example
  const program = new Program(idl, programId, provider);
  
  // Execute initialize transaction
  const tx = await program.methods
    .initialize()
    .accounts({
      payer: authorityPublicKey,
      vault: vaultPda,
      systemProgram: PublicKey.default,
    })
    .rpc();
  
  return tx;
}
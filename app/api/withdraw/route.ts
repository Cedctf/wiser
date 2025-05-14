import { NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@project-serum/anchor';
import idl from '@/public/idl.json';
import bs58 from 'bs58';

// Program ID from your contract
const programId = new PublicKey('GArNcH5X1sQka24mZvrGuA3QqDhvE9CBe35ZugwNevoH');

// Derive the vault PDA
const [vaultPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault")],
  programId
);

export async function POST(request: Request) {
  try {
    const { recipient } = await request.json();

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient address is required' }, { status: 400 });
    }

    // Get private key from environment variable
    const PRIVATE_KEY = process.env.SIGN_TOKEN;

    if (!PRIVATE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Convert private key to Keypair
    const privateKeyBytes = bs58.decode(PRIVATE_KEY);
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    
    // Fixed amount of 0.5 SOL
    const amount = 0.5;
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
    
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Create provider with the keypair
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: keypair.publicKey,
        signTransaction: async (tx: Transaction) => {
          tx.sign(keypair);
          return tx;
        },
        signAllTransactions: async (txs: Transaction[]) => {
          return txs.map(tx => {
            tx.sign(keypair);
            return tx;
          });
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
        systemProgram: PublicKey.default,
      })
      .rpc();

    return NextResponse.json({ signature: tx });
  } catch (error: any) {
    console.error('Error in withdraw transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@project-serum/anchor';
import idl from '../public/idl2.json';

// Program ID from your smart wallet contract
const programId = new PublicKey('9RS7omQopJpsW3uYiCfxoTboEBtxo6a6o5GB5GCvmzUi');

// Vault program ID
const vaultProgramId = new PublicKey('GArNcH5X1sQka24mZvrGuA3QqDhvE9CBe35ZugwNevoH');

// Use the actual vault PDA from the vault contract
const vaultPda = new PublicKey('93XAG4BtLd4d6WQtuAfTAyg85yoXHMZiBrF9Aw8PcXvK');

/**
 * Get the wallet PDA for a given owner
 * @param owner Owner public key
 * @returns Wallet PDA
 */
export function getWalletPda(owner: PublicKey): PublicKey {
  const [walletPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("wallet"), owner.toBuffer()],
    programId
  );
  return walletPda;
}

/**
 * Get the wallet account PDA for a given owner
 * @param owner Owner public key
 * @returns Wallet account PDA
 */
export function getWalletAccountPda(owner: PublicKey): PublicKey {
  const [walletAccountPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("wallet_account"), owner.toBuffer()],
    programId
  );
  return walletAccountPda;
}

/**
 * Fund the wallet PDA with some SOL for rent exemption
 * @param wallet Phantom wallet instance
 * @param amount Amount in SOL to fund the wallet with
 * @returns Transaction signature
 */
export async function fundWalletPda(wallet: any, amount: number = 0.05): Promise<string> {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const walletPda = getWalletPda(wallet.publicKey);
  
  // Create a transaction to transfer SOL from the user's wallet to the wallet PDA
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: walletPda,
      lamports: amount * LAMPORTS_PER_SOL
    })
  );
  
  // Get a recent blockhash
  const { blockhash } = await connection.getRecentBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  
  // Sign the transaction
  const signed = await wallet.signTransaction(transaction);
  
  // Send the transaction
  const signature = await connection.sendRawTransaction(signed.serialize());
  
  // Wait for confirmation
  await connection.confirmTransaction(signature);
  
  return signature;
}

/**
 * Check if a wallet account is already initialized
 * @param wallet Phantom wallet instance
 * @returns boolean indicating if wallet is initialized
 */
export async function isWalletInitialized(wallet: any): Promise<boolean> {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const walletAccountPda = getWalletAccountPda(wallet.publicKey);
  
  try {
    const accountInfo = await connection.getAccountInfo(walletAccountPda);
    return accountInfo !== null && accountInfo.owner.equals(programId);
  } catch (error) {
    console.error('Error checking wallet initialization:', error);
    return false;
  }
}

/**
 * Initialize a new smart wallet
 * @param wallet Phantom wallet instance
 * @returns Transaction signature
 */
export async function initializeWallet(wallet: any): Promise<string> {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }
  
  // Check if wallet is already initialized
  const walletInitialized = await isWalletInitialized(wallet);
  if (walletInitialized) {
    throw new Error('Wallet is already initialized');
  }
  
  // First, make sure the wallet PDA has enough SOL for rent exemption
  try {
    const walletPda = getWalletPda(wallet.publicKey);
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const balance = await connection.getBalance(walletPda);
    
    // If balance is too low, fund it
    if (balance < 0.02 * LAMPORTS_PER_SOL) {
      console.log('Funding wallet PDA first...');
      await fundWalletPda(wallet);
    }
  } catch (err) {
    console.error('Error checking or funding wallet PDA:', err);
  }
  
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
  
  // Execute initialize wallet transaction
  const tx = await program.methods
    .initializeWallet()
    .accounts({
      owner: wallet.publicKey,
      wallet: getWalletAccountPda(wallet.publicKey),
      walletPda: getWalletPda(wallet.publicKey),
      systemProgram: PublicKey.default,
    })
    .rpc();
  
  return tx;
}

/**
 * Request funds from the vault and prepare for a transaction
 * @param amount Amount in SOL needed for the transaction
 * @param wallet Phantom wallet instance
 * @returns Transaction signature
 */
export async function requestFunds(amount: number, wallet: any): Promise<string> {
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
        return await wallet.signTransaction(tx);
      },
      signAllTransactions: async (txs: Transaction[]) => {
        return await wallet.signAllTransactions(txs);
      }
    },
    { commitment: 'confirmed', skipPreflight: false }
  );
  
  // Check if wallet account exists first
  const walletAccountPda = getWalletAccountPda(wallet.publicKey);
  const walletPda = getWalletPda(wallet.publicKey);
  
  // Verify account exists
  const accountInfo = await connection.getAccountInfo(walletAccountPda);
  if (!accountInfo) {
    throw new Error('Wallet account not initialized. Please initialize first.');
  }
  
  // @ts-ignore - IDL type issues can be ignored for this example
  const program = new Program(idl, programId, provider);
  
  try {
    // Execute request funds transaction
    const tx = await program.methods
      .executeTransaction(new BN(lamports))
      .accounts({
        wallet: walletAccountPda,
        walletPda: walletPda,
        vault: vaultPda,
        owner: wallet.publicKey,
        systemProgram: PublicKey.default,
      })
      .rpc();
    
    return tx;
  } catch (error: any) {
    console.error("Original error:", error);
    
    // If deserialization fails, try a more direct approach using low-level transaction
    if (error.toString().includes('AccountDidNotDeserialize') || 
        error.toString().includes('Failed to deserialize')) {
      
      console.log("Falling back to direct transaction...");
      
      // Build transaction manually
      const transaction = new Transaction();
      
      // Instruction data for executeTransaction - using a different approach for BigInt
      const instructionIndex = Buffer.from([1]); // instruction index 1 for executeTransaction
      const amountBuffer = Buffer.alloc(8);
      
      // Write u64 (8 bytes) in little-endian format manually
      for (let i = 0; i < 8; i++) {
        amountBuffer.writeUInt8(Number((BigInt(lamports) >> BigInt(8 * i)) & BigInt(255)), i);
      }
      
      // Combine the instruction index and amount
      const data = Buffer.concat([instructionIndex, amountBuffer]);
      
      // Add instruction to transaction
      transaction.add({
        keys: [
          { pubkey: walletAccountPda, isSigner: false, isWritable: false },
          { pubkey: walletPda, isSigner: false, isWritable: true },
          { pubkey: vaultPda, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: PublicKey.default, isSigner: false, isWritable: false },
        ],
        programId: programId,
        data: data,
      });
      
      // Set recent blockhash and fee payer
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      
      // Sign transaction
      const signedTx = await wallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature);
      
      return signature;
    }
    
    // Re-throw if not a deserialization error
    throw error;
  }
}

/**
 * Return unused funds to the vault
 * @param amount Amount in SOL to return
 * @param wallet Phantom wallet instance
 * @returns Transaction signature
 */
export async function returnFunds(amount: number, wallet: any): Promise<string> {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }
  
  // Convert SOL to lamports
  const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Check if wallet account exists first
  const walletAccountPda = getWalletAccountPda(wallet.publicKey);
  const walletPda = getWalletPda(wallet.publicKey);
  
  // Verify account exists
  const accountInfo = await connection.getAccountInfo(walletAccountPda);
  if (!accountInfo) {
    throw new Error('Wallet account not initialized. Please initialize first.');
  }
  
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
    { commitment: 'confirmed', skipPreflight: false }
  );
  
  // @ts-ignore - IDL type issues can be ignored for this example
  const program = new Program(idl, programId, provider);
  
  try {
    // Execute return funds transaction
    const tx = await program.methods
      .returnFunds(new BN(lamports))
      .accounts({
        wallet: walletAccountPda,
        walletPda: walletPda,
        vault: vaultPda,
        owner: wallet.publicKey,
        systemProgram: PublicKey.default,
      })
      .rpc();
    
    return tx;
  } catch (error: any) {
    console.error("Original error:", error);
    
    // If deserialization fails, try a more direct approach using low-level transaction
    if (error.toString().includes('AccountDidNotDeserialize') || 
        error.toString().includes('Failed to deserialize')) {
      
      console.log("Falling back to direct transaction...");
      
      // Build transaction manually
      const transaction = new Transaction();
      
      // Instruction data for returnFunds - using a different approach for BigInt
      const instructionIndex = Buffer.from([2]); // instruction index 2 for returnFunds
      const amountBuffer = Buffer.alloc(8);
      
      // Write u64 (8 bytes) in little-endian format manually
      for (let i = 0; i < 8; i++) {
        amountBuffer.writeUInt8(Number((BigInt(lamports) >> BigInt(8 * i)) & BigInt(255)), i);
      }
      
      // Combine the instruction index and amount
      const data = Buffer.concat([instructionIndex, amountBuffer]);
      
      // Add instruction to transaction
      transaction.add({
        keys: [
          { pubkey: walletAccountPda, isSigner: false, isWritable: false },
          { pubkey: walletPda, isSigner: false, isWritable: true },
          { pubkey: vaultPda, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: PublicKey.default, isSigner: false, isWritable: false },
        ],
        programId: programId,
        data: data,
      });
      
      // Set recent blockhash and fee payer
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      
      // Sign transaction
      const signedTx = await wallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature);
      
      return signature;
    }
    
    // Re-throw if not a deserialization error
    throw error;
  }
}

/**
 * Get the wallet balance
 * @param wallet Phantom wallet instance
 * @returns Balance in SOL
 */
export async function getWalletBalance(wallet: any): Promise<number> {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const walletPda = getWalletPda(wallet.publicKey);
  const balanceInLamports = await connection.getBalance(walletPda);
  return balanceInLamports / LAMPORTS_PER_SOL;
} 
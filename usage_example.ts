import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { initializeWallet, requestFunds, returnFunds, getWalletPda } from './utils/SmartWallet';

/**
 * Example of using the smart wallet to pay for a transaction
 */
async function exampleUsage() {
  // 1. Get the wallet connection (in a real app, this would be from Phantom or other wallet)
  const wallet = window.solana; // Phantom wallet
  
  // 2. Connect to the wallet
  await wallet.connect();
  
  // 3. First-time setup: Initialize the wallet (only needed once)
  try {
    const initTx = await initializeWallet(wallet);
    console.log("Wallet initialized:", initTx);
  } catch (err) {
    console.log("Wallet already initialized or error:", err);
  }
  
  // 4. When user wants to interact with a platform that requires SOL payment:
  
  // Calculate how much SOL is needed for the transaction
  // Platform fee + gas fee (typically around 0.000005 SOL)
  const requiredSol = 0.1 + 0.000005;
  
  // 5. Request funds from the vault
  try {
    const requestTx = await requestFunds(requiredSol, wallet);
    console.log("Funds requested:", requestTx);
    
    // 6. Now your wallet PDA has funds and can be used to pay for transactions
    
    // Example: Create a transaction you want to pay for
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const walletPda = getWalletPda(wallet.publicKey);
    
    // This is just an example transaction - in reality, this would be the platform's transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: walletPda,
        toPubkey: new PublicKey("SomeRandomRecipientAddress"), 
        lamports: 0.1 * 1_000_000_000, // 0.1 SOL
      })
    );
    
    // Set the fee payer to the wallet PDA (which now has funds)
    transaction.feePayer = walletPda;
    
    // Get a recent blockhash
    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    
    // Sign the transaction with the user's wallet
    const signedTx = await wallet.signTransaction(transaction);
    
    // Send the transaction
    const txId = await connection.sendRawTransaction(signedTx.serialize());
    console.log("Platform transaction executed:", txId);
    
    // 7. If there are unused funds, return them to the vault
    const returnTx = await returnFunds(0.00001, wallet); // Return leftover SOL
    console.log("Unused funds returned:", returnTx);
    
  } catch (err) {
    console.error("Error during transaction:", err);
  }
}

// Call the example
exampleUsage().catch(console.error); 
'use client';

import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * A singleton class that manages the authority wallet for signing transactions
 */
class AuthorityManager {
  private static instance: AuthorityManager;
  private keypair: Keypair | null = null;
  private isInitializing: boolean = false;

  private constructor() {
    this.initializeKeypair();
  }

  public static getInstance(): AuthorityManager {
    if (!AuthorityManager.instance) {
      AuthorityManager.instance = new AuthorityManager();
    }
    return AuthorityManager.instance;
  }

  private async initializeKeypair(): Promise<void> {
    if (this.isInitializing) return;
    
    this.isInitializing = true;
    try {
      // Fetch the private key from our API route
      const response = await fetch('/api/auth-key');
      
      if (!response.ok) {
        throw new Error('Failed to fetch auth key');
      }
      
      const data = await response.json();
      
      if (!data.key) {
        throw new Error('Auth key not found in response');
      }
      
      // Convert base58 private key to Uint8Array
      const privateKeyBytes = bs58.decode(data.key);
      this.keypair = Keypair.fromSecretKey(privateKeyBytes);
      
      console.log('Authority wallet loaded successfully with public key:', this.keypair.publicKey.toString());
    } catch (error) {
      console.error('Failed to initialize authority keypair:', error);
      this.keypair = null;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Gets the public key of the authority wallet, initializing if needed
   * @returns Promise resolving to public key or null if initialization fails
   */
  public async getPublicKey(): Promise<PublicKey | null> {
    if (!this.keypair && !this.isInitializing) {
      await this.initializeKeypair();
    }
    return this.keypair?.publicKey || null;
  }

  /**
   * Signs a transaction with the authority keypair
   * @param transaction Transaction to sign
   * @returns Signed transaction
   */
  public async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.keypair && !this.isInitializing) {
      await this.initializeKeypair();
    }
    
    if (!this.keypair) {
      throw new Error('Authority keypair not initialized');
    }
    
    transaction.feePayer = this.keypair.publicKey;
    transaction.sign(this.keypair);
    return transaction;
  }

  /**
   * Signs multiple transactions with the authority keypair
   * @param transactions Transactions to sign
   * @returns Array of signed transactions
   */
  public async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    return Promise.all(
      transactions.map(transaction => this.signTransaction(transaction))
    );
  }
}

export default AuthorityManager.getInstance();
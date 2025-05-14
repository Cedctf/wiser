'use client';

import { useState, useEffect } from 'react';
import { withdrawSol, initializeVault } from '@/utils/Withdraw';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function TestPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>('0.1');
  const [recipient, setRecipient] = useState<string>('');
  const [txSignature, setTxSignature] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Connect to Phantom wallet
  const connectWallet = async () => {
    try {
      if (!window.solana) {
        throw new Error('Phantom wallet not found! Please install it.');
      }

      const response = await window.solana.connect();
      setWallet(response);
      setStatus('Wallet connected!');
      
      // Get vault balance
      await refreshBalance();
    } catch (error: any) {
      setStatus(`Error connecting wallet: ${error.message}`);
    }
  };

  // Refresh vault balance
  const refreshBalance = async () => {
    if (!wallet?.publicKey) return;

    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        new PublicKey('GArNcH5X1sQka24mZvrGuA3QqDhvE9CBe35ZugwNevoH')
      );
      
      const balance = await connection.getBalance(vaultPda);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error: any) {
      setStatus(`Error getting balance: ${error.message}`);
    }
  };

  // Initialize vault
  const initializeVaultHandler = async () => {
    if (!wallet?.publicKey) {
      setStatus('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    setStatus('Initializing vault...');

    try {
      const tx = await initializeVault(wallet);
      setTxSignature(tx);
      setStatus('Vault initialized successfully!');
      await refreshBalance();
    } catch (error: any) {
      setStatus(`Error initializing vault: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Withdraw SOL
  const handleWithdraw = async () => {
    if (!wallet?.publicKey) {
      setStatus('Please connect your wallet first');
      return;
    }

    if (!recipient) {
      setStatus('Please enter a recipient address');
      return;
    }

    try {
      new PublicKey(recipient); // Validate recipient address
    } catch {
      setStatus('Invalid recipient address');
      return;
    }

    setIsProcessing(true);
    setStatus('Processing withdrawal...');

    try {
      const tx = await withdrawSol(
        parseFloat(amount),
        recipient,
        wallet
      );
      setTxSignature(tx);
      setStatus('Withdrawal successful!');
      await refreshBalance();
    } catch (error: any) {
      setStatus(`Error withdrawing: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold mb-8 text-center">Vault Withdrawal Test</h1>
                
                {/* Wallet Connection */}
                <div className="mb-8">
                  <button
                    onClick={connectWallet}
                    disabled={isProcessing}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {wallet ? 'Wallet Connected' : 'Connect Wallet'}
                  </button>
                </div>

                {/* Vault Balance */}
                <div className="mb-8">
                  <p className="text-lg">Vault Balance: {balance.toFixed(4)} SOL</p>
                  <button
                    onClick={refreshBalance}
                    className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                  >
                    Refresh Balance
                  </button>
                </div>

                {/* Initialize Vault */}
                <div className="mb-8">
                  <button
                    onClick={initializeVaultHandler}
                    disabled={isProcessing}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                  >
                    Initialize Vault
                  </button>
                </div>

                {/* Withdrawal Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount (SOL)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0.1"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter recipient address"
                    />
                  </div>

                  <button
                    onClick={handleWithdraw}
                    disabled={isProcessing}
                    className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
                  >
                    Withdraw SOL
                  </button>
                </div>

                {/* Status and Transaction Info */}
                <div className="mt-8">
                  <p className="text-sm text-gray-600">{status}</p>
                  {txSignature && (
                    <a
                      href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-600 block mt-2"
                    >
                      View Transaction
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
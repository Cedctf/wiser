'use client';

import { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { depositSol, getVaultAddress, getVaultBalance } from '@/utils/Deposit';
import { withdrawSol, initializeVault } from '@/utils/Withdraw';

export default function TestPage() {
  const [status, setStatus] = useState('');
  const [wallet, setWallet] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState('0.1');
  const [withdrawAmount, setWithdrawAmount] = useState('0.01');
  const [recipient, setRecipient] = useState('');

  // Effect to check if Phantom is available
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const { solana } = window as any;
        if (solana?.isPhantom) {
          setWallet(solana);
          
          // Check if already connected
          if (solana.isConnected) {
            const publicKey = solana.publicKey.toString();
            setConnected(true);
            await updateBalances(publicKey);
          }
        }
      } catch (err) {
        console.error("Error checking wallet:", err);
      }
    };
    
    checkWallet();
    
    // Also set default recipient to current wallet if connected
    if (connected && wallet?.publicKey) {
      setRecipient(wallet.publicKey.toString());
    }
  }, [connected]);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      setStatus('Connecting wallet...');
      const { solana } = window as any;
      
      if (!solana?.isPhantom) {
        throw new Error('Phantom wallet not installed');
      }
      
      const response = await solana.connect();
      setWallet(solana);
      setConnected(true);
      const publicKey = response.publicKey.toString();
      
      await updateBalances(publicKey);
      setRecipient(publicKey); // Set default recipient to own wallet
      setStatus('Wallet connected!');
    } catch (err: any) {
      setStatus(`Error connecting wallet: ${err.message}`);
    }
  };

  // Update balances
  const updateBalances = async (walletAddress?: string) => {
    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      
      // Get vault balance (in SOL)
      const vaultBal = await getVaultBalance();
      setVaultBalance(vaultBal);
      
      // Get wallet balance (in SOL)
      if (walletAddress) {
        const walletBal = await connection.getBalance(new PublicKey(walletAddress));
        setWalletBalance(walletBal / 1_000_000_000); // Convert lamports to SOL
      }
    } catch (err: any) {
      console.error("Error updating balances:", err);
    }
  };

  // Request airdrop function
  const requestAirdrop = async () => {
    try {
      setStatus('Requesting airdrop...');
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const airdropSig = await connection.requestAirdrop(
        wallet.publicKey,
        1_000_000_000 // 1 SOL
      );
      await connection.confirmTransaction(airdropSig);
      await updateBalances(wallet.publicKey.toString());
      setStatus('Airdrop received!');
    } catch (err: any) {
      setStatus(`Error requesting airdrop: ${err.message}`);
    }
  };

  // Initialize vault function
  const handleInitialize = async () => {
    try {
      setStatus('Initializing vault...');
      const tx = await initializeVault(wallet);
      await updateBalances(wallet.publicKey.toString());
      setStatus(`Vault initialized! TX: ${tx}`);
    } catch (err: any) {
      setStatus(`Error initializing vault: ${err.message}`);
    }
  };

  // Deposit function
  const handleDeposit = async () => {
    try {
      setStatus('Depositing SOL...');
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      const tx = await depositSol(amount, wallet);
      await updateBalances(wallet.publicKey.toString());
      setStatus(`Deposited ${amount} SOL! TX: ${tx}`);
    } catch (err: any) {
      setStatus(`Error depositing: ${err.message}`);
    }
  };

  // Withdraw function
  const handleWithdraw = async () => {
    try {
      setStatus('Withdrawing SOL...');
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (!recipient) {
        throw new Error('Please enter a recipient address');
      }
      
      const tx = await withdrawSol(amount, recipient, wallet);
      await updateBalances(wallet.publicKey.toString());
      setStatus(`Withdrawn ${amount} SOL to ${recipient.slice(0, 8)}...! TX: ${tx}`);
    } catch (err: any) {
      setStatus(`Error withdrawing: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Solana Vault Demo</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-sm">{status}</p>
      </div>
      
      {!connected ? (
        <button 
          onClick={connectWallet}
          className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 mb-6"
        >
          Connect Phantom Wallet
        </button>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold">Wallet</h2>
              <p className="text-xs truncate mb-2">{wallet?.publicKey?.toString()}</p>
              <p className="font-mono">{walletBalance.toFixed(6)} SOL</p>
              {walletBalance < 0.1 && (
                <button 
                  onClick={requestAirdrop}
                  className="mt-2 text-sm px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Request Airdrop
                </button>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold">Vault</h2>
              <p className="text-xs truncate mb-2">{getVaultAddress().toString()}</p>
              <p className="font-mono">{vaultBalance.toFixed(6)} SOL</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button 
              onClick={handleInitialize}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              Initialize Vault
            </button>
            
            <button 
              onClick={() => updateBalances(wallet.publicKey.toString())}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              Refresh Balances
            </button>
            
            <button 
              onClick={requestAirdrop}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Request Airdrop
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="font-semibold mb-2">Deposit SOL</h2>
              <input
                type="text"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                placeholder="Amount in SOL"
              />
              <button 
                onClick={handleDeposit}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Deposit
              </button>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h2 className="font-semibold mb-2">Withdraw SOL</h2>
              <input
                type="text"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                placeholder="Amount in SOL"
              />
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                placeholder="Recipient address"
              />
              <button 
                onClick={handleWithdraw}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Withdraw
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
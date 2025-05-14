'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { withdrawSol } from '@/utils/Withdraw';
import { depositSol, getVaultBalance } from '@/utils/Deposit';
import { RefreshCw, Check, ArrowDown, X, ExternalLink, ArrowUp } from 'lucide-react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function WithdrawKeyListener() {
  const { connected, publicKey, signTransaction, signAllTransactions } = useWallet();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [message, setMessage] = useState<{text: string, isError: boolean} | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0.01); // Default amount to withdraw
  const [needsDeposit, setNeedsDeposit] = useState(true);

  // Check wallet and vault balance
  useEffect(() => {
    if (!connected || !publicKey) return;
    
    const checkBalances = async () => {
      try {
        // Check wallet balance
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const balance = await connection.getBalance(publicKey);
        console.log('Wallet balance:', balance / LAMPORTS_PER_SOL, 'SOL');
        setWalletBalance(balance / LAMPORTS_PER_SOL);
        
        // Check vault balance
        try {
          const vaultBal = await getVaultBalance();
          console.log('Vault balance:', vaultBal, 'SOL');
          setVaultBalance(vaultBal);
          setNeedsDeposit(vaultBal < withdrawAmount);
        } catch (err) {
          console.error('Error getting vault balance:', err);
          // If we can't get the vault balance, assume we need to deposit
          setNeedsDeposit(true);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };
    
    checkBalances();
    // Set up polling to check balance periodically
    const interval = setInterval(checkBalances, 10000); // every 10 seconds
    return () => clearInterval(interval);
  }, [connected, publicKey, withdrawAmount]);
  
  useEffect(() => {
    if (!connected) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      // Only handle the "-" key when no input elements are focused
      if (event.key === '-' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault(); // Prevent the "-" character from being typed
        
        if (isWithdrawing || !connected || !publicKey) return;
        
        // Show the popup without starting withdrawal
        setShowPopup(true);
        setMessage(null); // Clear any previous messages
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connected, publicKey, isWithdrawing]);

  // Deposit SOL to the vault
  const depositToVault = async () => {
    if (!connected || !publicKey) return false;
    
    try {
      setMessage({ text: "Depositing SOL to vault...", isError: false });
      setIsWithdrawing(true);
      
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions
      };
      
      // Deposit slightly more than the withdrawal amount to cover fees
      const depositAmount = withdrawAmount * 1.1;
      
      const txId = await depositSol(depositAmount, wallet);
      
      console.log('SOL deposited with txId:', txId);
      setLastTxId(txId);
      
      // Update vault balance
      const vaultBal = await getVaultBalance();
      setVaultBalance(vaultBal);
      setNeedsDeposit(vaultBal < withdrawAmount);
      
      setMessage({ text: `Deposited ${depositAmount.toFixed(6)} SOL to vault`, isError: false });
      return true;
    } catch (error) {
      console.error('Error depositing to vault:', error);
      setMessage({ 
        text: `Deposit error: ${error instanceof Error ? error.message : 'Failed to deposit SOL'}`, 
        isError: true 
      });
      return false;
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleWithdraw = async () => {
    console.log('Withdraw button clicked');
    console.log('State:', { 
      isWithdrawing, 
      connected, 
      publicKey: publicKey?.toString(),
      withdrawAmount,
      walletBalance,
      vaultBalance,
      needsDeposit,
      disabled: isWithdrawing || withdrawAmount <= 0 || withdrawAmount > walletBalance
    });
    
    if (isWithdrawing || !connected || !publicKey) {
      console.log('Early return - not connected or already withdrawing');
      return;
    }
    
    if (withdrawAmount <= 0) {
      setMessage({ text: "Please enter a valid amount", isError: true });
      return;
    }
    
    if (withdrawAmount > walletBalance) {
      setMessage({ text: "Insufficient wallet balance", isError: true });
      return;
    }
    
    // Check if we need to deposit first (if the vault doesn't have enough SOL)
    if (needsDeposit) {
      try {
        setIsWithdrawing(true);
        const depositSuccess = await depositToVault();
        if (!depositSuccess) return; // Don't continue if deposit failed
      } catch (error) {
        console.error('Error during deposit:', error);
        setMessage({ 
          text: `Error during deposit: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          isError: true 
        });
        setIsWithdrawing(false);
        return;
      }
    }
    
    setIsWithdrawing(true);
    setMessage({ text: "Processing withdrawal...", isError: false });
    
    try {
      // Call the withdrawSol function from utils/Withdraw.ts
      console.log('Attempting to withdraw', withdrawAmount, 'SOL to', publicKey.toString());
      
      const txId = await withdrawSol(
        withdrawAmount,
        publicKey.toString() // Send to the connected wallet
      );
      
      console.log('Withdrawal successful, txId:', txId);
      setLastTxId(txId);
      setMessage({ 
        text: `Successfully withdrew ${withdrawAmount} SOL!`, 
        isError: false 
      });
      
      // Update balances
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const balance = await connection.getBalance(publicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
      
      const vaultBal = await getVaultBalance();
      setVaultBalance(vaultBal);
      setNeedsDeposit(vaultBal < withdrawAmount);
    } catch (error) {
      console.error('Withdrawal error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to withdraw SOL';
      
      // Special handling for common errors
      if (errorMsg.includes('InsufficientFunds')) {
        setMessage({ 
          text: `Error: Insufficient funds in the vault. Please deposit SOL first.`, 
          isError: true 
        });
        setNeedsDeposit(true);
      } else {
        setMessage({ 
          text: `Error: ${errorMsg}`, 
          isError: true 
        });
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Don't render anything if not connected
  if (!connected) return null;

  // Render a floating dialog when withdrawal is triggered
  return showPopup ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <ArrowDown className="w-5 h-5 mr-2 text-yellow-400" />
            Withdraw SOL
          </h3>
          <button 
            onClick={() => setShowPopup(false)}
            className="text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-black/30 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/70">Wallet Balance:</span>
            <span className="text-white font-medium">{walletBalance.toFixed(6)} SOL</span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-white/70">Vault Balance:</span>
            <span className={`font-medium ${needsDeposit ? 'text-red-400' : 'text-green-400'}`}>
              {vaultBalance.toFixed(6)} SOL
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1">
              <label htmlFor="amount" className="text-white/70 text-sm block mb-1">
                Withdraw Amount (SOL)
              </label>
              <input
                id="amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setWithdrawAmount(value);
                  setNeedsDeposit(vaultBalance < value);
                }}
                min="0.001"
                max={walletBalance}
                step="0.001"
                className="w-full bg-black/50 border border-gray-700 rounded-md p-2 text-white"
              />
            </div>
          </div>
          
          {needsDeposit && (
            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-900/50 text-yellow-300 rounded-md text-sm">
              <div className="flex items-start gap-2">
                <ArrowUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  The vault needs SOL before withdrawal. Clicking "Withdraw" will first deposit SOL to the vault.
                </span>
              </div>
            </div>
          )}
        </div>
        
        {message && (
          <div className={`p-3 rounded-md mb-4 ${message.isError ? 'bg-red-900/30 border border-red-900/50 text-red-300' : 'bg-green-900/30 border border-green-900/50 text-green-300'}`}>
            <div className="flex items-center gap-2">
              {isWithdrawing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : message.isError ? (
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">!</span>
                </div>
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{message.text}</span>
            </div>
            
            {lastTxId && !message.isError && (
              <a 
                href={`https://explorer.solana.com/tx/${lastTxId}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-yellow-400 hover:text-yellow-300 underline mt-2 flex items-center"
              >
                View transaction <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowPopup(false)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={isWithdrawing || withdrawAmount <= 0 || withdrawAmount > walletBalance}
            className={`px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-md flex items-center ${
              isWithdrawing || withdrawAmount <= 0 || withdrawAmount > walletBalance ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isWithdrawing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : needsDeposit ? (
              <>Deposit & Withdraw {withdrawAmount} SOL</>
            ) : (
              <>Withdraw {withdrawAmount} SOL</>
            )}
          </button>
        </div>
      </div>
    </div>
  ) : null;
} 
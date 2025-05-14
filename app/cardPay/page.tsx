'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { depositSol } from '@/utils/Deposit';
import CardPayWalletButton from '@/components/CardPayWalletButton';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface Card {
  token: string;
  lastFour: string;
  expiration: string;
}

interface TransactionSuccess {
  solAmount: number;
  usdAmount: number;
  depositTransaction: {
    txId: string;
  };
  cardTransaction: {
    status: string;
  };
}

export default function CardPayPage() {
  const { connected, publicKey, signTransaction } = useWallet();
  const [amount, setAmount] = useState('10');
  const [cardToken, setCardToken] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<TransactionSuccess | null>(null);
  const [step, setStep] = useState(0);
  const [solAmount, setSolAmount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    // Fetch user's cards when connected
    if (connected && publicKey) {
      fetchUserCards();
      checkWalletBalance();
    }
  }, [connected, publicKey]);

  const checkWalletBalance = async () => {
    if (!publicKey) return;
    
    try {
      setLoadingBalance(true);
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const balance = await connection.getBalance(publicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error('Error checking wallet balance:', err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchUserCards = async () => {
    try {
      // This is a placeholder - you would need an API to fetch cards by wallet
      // For testing, we're just using the first 36 characters of the wallet address as a card token
      if (publicKey) {
        setCards([
          {
            token: publicKey.toString().substring(0, 36),
            lastFour: '1234',
            expiration: '12/25'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
    }
  };

  // Step 1: Calculate SOL amount based on USD input
  const calculateSolAmount = async () => {
    setError(null);
    setLoading(true);
    setStep(1);
    
    try {
      const response = await fetch('/api/pyth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usdAmount: parseFloat(amount) }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get SOL price');
      }

      const data = await response.json();
      setSolAmount(data.solEquivalent);
      
      // Check if the wallet has enough balance
      await checkWalletBalance();
      
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Make the deposit and process card payment
  const handlePayment = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!cardToken) {
      setError('Please select a card');
      return;
    }

    // Verify the user has enough SOL balance before proceeding
    if (walletBalance < solAmount) {
      setError(`Insufficient SOL balance. You need ${solAmount.toFixed(6)} SOL but have ${walletBalance.toFixed(6)} SOL.`);
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      // First, deposit SOL directly from client
      const depositTxId = await depositSol(solAmount, {
        publicKey,
        signTransaction
      });
      
      // Then call the API to process the card payment
      const response = await fetch('/api/transact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          cardToken
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process payment');
      }

      const data = await response.json();
      setSuccess({
        solAmount,
        usdAmount: parseFloat(amount),
        depositTransaction: {
          txId: depositTxId
        },
        cardTransaction: data.transaction
      });
      
      // Update balance after transaction
      await checkWalletBalance();
      setStep(3);
    } catch (err) {
      console.error('Payment error:', err);
      // Check for specific error messages
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      if (errorMessage.includes('Blockhash not found')) {
        setError('Transaction timed out. Please try again with a fresh blockhash.');
      } else if (errorMessage.includes('insufficient lamports') || errorMessage.includes('0x1')) {
        setError(`Insufficient SOL balance. Please add more SOL to your wallet.`);
      } else {
        setError(errorMessage);
      }
      
      // Refresh the balance after any error
      await checkWalletBalance();
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelect = (token: string) => {
    setCardToken(token);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Pay with Card</h1>
        
        <CardPayWalletButton />
        
        {connected && publicKey && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-sm">Wallet Balance: <span className="font-medium">{loadingBalance ? '...' : walletBalance.toFixed(6)} SOL</span></p>
              <button 
                onClick={checkWalletBalance}
                disabled={loadingBalance}
                className="text-xs py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loadingBalance ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        )}
        
        {!connected ? (
          <div className="text-center p-4 bg-yellow-50 rounded-md">
            <p className="text-yellow-700">Please connect your wallet to make a payment</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step indicator */}
            <div className="flex justify-between mb-4">
              <div className={`w-1/3 text-center ${step >= 1 ? 'text-blue-600 font-bold' : ''}`}>
                1. Calculate
              </div>
              <div className={`w-1/3 text-center ${step >= 2 ? 'text-blue-600 font-bold' : ''}`}>
                2. Confirm
              </div>
              <div className={`w-1/3 text-center ${step >= 3 ? 'text-blue-600 font-bold' : ''}`}>
                3. Complete
              </div>
            </div>

            {step === 0 && (
              <div>
                <div className="mb-4">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <button
                  onClick={calculateSolAmount}
                  disabled={loading || !amount}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Calculating...' : 'Calculate SOL Amount'}
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="mb-4 p-4 bg-blue-50 rounded-md">
                  <p className="font-medium">Amount: ${parseFloat(amount).toFixed(2)} USD</p>
                  <p className="font-medium">SOL Equivalent: {solAmount.toFixed(6)} SOL</p>
                  {walletBalance < solAmount && (
                    <p className="text-red-600 mt-2">Warning: You don&apos;t have enough SOL in your wallet.</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Card
                  </label>
                  {cards.length > 0 ? (
                    <div className="space-y-2">
                      {cards.map((card) => (
                        <div
                          key={card.token}
                          onClick={() => handleCardSelect(card.token)}
                          className={`p-3 border rounded-md cursor-pointer ${
                            cardToken === card.token ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                          }`}
                        >
                          <p>Card ending in {card.lastFour}</p>
                          <p className="text-sm text-gray-500">Expires {card.expiration}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No cards found. Please create a card first.</p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading || !cardToken || walletBalance < solAmount}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Pay Now'}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-lg font-medium text-green-800 mb-2">Payment Successful!</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Amount:</span> ${success.usdAmount.toFixed(2)} USD</p>
                  <p><span className="font-medium">SOL Deposited:</span> {success.solAmount.toFixed(6)} SOL</p>
                  <p><span className="font-medium">Deposit Tx:</span> {success.depositTransaction.txId.substring(0, 12)}...</p>
                  <p><span className="font-medium">Card Tx Status:</span> SUCCESS</p>
                </div>
                <button
                  onClick={() => {
                    setStep(0);
                    setSuccess(null);
                  }}
                  className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Make Another Payment
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
            {error.includes('Blockhash') && (
              <button
                onClick={handlePayment}
                className="mt-2 w-full text-sm py-1 px-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

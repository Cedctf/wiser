'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface TransactionResponse {
  success: boolean;
  transaction: {
    token: string;
    amount: string;
    status: string;
    response: any;
  };
  error?: string;
}

export default function TransactionPage() {
  const { connected, publicKey } = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/transact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          cardToken: publicKey.toString().substring(0, 36)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to simulate transaction');
      }

      setTransaction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Simulate Transaction</h1>
        
        {!connected ? (
          <div className="text-center p-4 bg-yellow-50 rounded-md">
            <p className="text-yellow-700">Please connect your wallet to simulate a transaction</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (USD)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Simulate Transaction'}
            </button>
          </form>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {transaction && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Transaction Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Status:</span> {transaction.transaction.status}</p>
              <p><span className="font-medium">Amount:</span> ${transaction.transaction.amount}</p>
              <p><span className="font-medium">Transaction Token:</span> {transaction.transaction.token}</p>
              <p><span className="font-medium">Response:</span> {JSON.stringify(transaction.transaction.response, null, 2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
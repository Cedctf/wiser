'use client';

import { useState } from 'react';

export default function CardToSolanaPage() {
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    last_four: string;
    solana_public_key: string;
    solana_secret_key: string;
  }>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/card-to-solana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardNumber }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process card');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Card to Solana Wallet</h1>
      <p className="text-gray-600 mb-8">Enter your card number to generate a deterministic Solana wallet</p>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-4">
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Card Number (PAN)
          </label>
          <input
            id="cardNumber"
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="Enter your card number"
            required
            pattern="[0-9]{12,19}"
            title="Card number must be between 12 and 19 digits"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
            loading 
              ? 'bg-purple-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
          }`}
        >
          {loading ? 'Processing...' : 'Generate Wallet'}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Wallet Generated Successfully!</h2>
          
          <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-500">Card Last 4:</span>
              <p className="text-lg font-medium">{result.last_four}</p>
            </div>
            
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-500">Public Key:</span>
              <p className="font-mono text-sm bg-gray-50 p-2 rounded mt-1 break-all">{result.solana_public_key}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Secret Key:</span>
              <p className="font-mono text-sm bg-gray-50 p-2 rounded mt-1 break-all">{result.solana_secret_key}</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">This Solana keypair is deterministically generated from your card number.</p>
                <p className="text-sm text-yellow-700 mt-1">The same card number will always produce the same Solana wallet.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
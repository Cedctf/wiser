'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface CardDetails {
  token: string;
  lastFour: string;
  expiration: string;
  state: string;
  pan: string | null;
  cvv: string;
}

interface CardholderDetails {
  token: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ApiResponse {
  success: boolean;
  cardholder: CardholderDetails;
  card: CardDetails;
  error?: string;
}

export default function CreateCardPage() {
  const { connected, publicKey } = useWallet();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<ApiResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/createCard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          walletAddress: publicKey.toString()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create card');
      }

      setCardDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Create New Card</h1>
        
        {!connected ? (
          <div className="text-center p-4 bg-yellow-50 rounded-md">
            <p className="text-yellow-700">Please connect your wallet to create a card</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating Card...' : 'Create Card'}
            </button>
          </form>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {cardDetails && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Card Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Card Number:</span> {cardDetails.card.pan || 'Not available'}</p>
              <p><span className="font-medium">Last 4:</span> {cardDetails.card.lastFour}</p>
              <p><span className="font-medium">Expiration:</span> {cardDetails.card.expiration}</p>
              <p><span className="font-medium">CVV:</span> {cardDetails.card.cvv}</p>
              <p><span className="font-medium">Status:</span> {cardDetails.card.state}</p>
              <p><span className="font-medium">Card Token:</span> {cardDetails.card.token}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
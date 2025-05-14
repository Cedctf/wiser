'use client';

import { useState } from 'react';

export default function PythTestPage() {
  const [usdAmount, setUsdAmount] = useState('');
  const [solEquivalent, setSolEquivalent] = useState<string | null>(null);
  const [solUsdPrice, setSolUsdPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSolEquivalent(null);
    setSolUsdPrice(null);

    try {
      const res = await fetch('/api/pyth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usdAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'API error');
      } else {
        setSolEquivalent(data.solEquivalent?.toString() ?? null);
        setSolUsdPrice(data.solUsdPrice?.toString() ?? null);
      }
    } catch (err) {
      console.error(err);
      setError('Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">USD to SOL (Pyth API Test)</h1>
        <label className="block">
          <span className="text-gray-700">USD Amount</span>
          <input
            type="number"
            min="0"
            step="any"
            value={usdAmount}
            onChange={e => setUsdAmount(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter USD amount"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Converting...' : 'Convert'}
        </button>
        {error && <div className="text-red-600">{error}</div>}
        {solEquivalent && solUsdPrice && (
          <div className="bg-gray-50 p-4 rounded text-center mt-2">
            <div>
              <span className="font-semibold">SOL/USD Price:</span> ${solUsdPrice}
            </div>
            <div className="text-lg font-bold text-green-600 mt-2">
              {usdAmount} USD = {solEquivalent} SOL
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';

export default function ShippingPage() {
  const [shippingCost, setShippingCost] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShippingCost = async () => {
      try {
        const response = await fetch('/api/shipping', {cache: 'no-cache',});
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setShippingCost(data.fixedCost?.toString() || '');
      } catch (error) {
        console.error('Failed to load shipping cost:', error);
        setMessage({ text: 'Failed to load existing shipping cost', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchShippingCost();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fixedCost: parseFloat(shippingCost) }),
      });

      if (!response.ok) throw new Error('Failed to save');
      setMessage({ text: 'Shipping cost updated successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to update shipping cost', type: 'error' });
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Shipping Configuration</h1>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700 mb-1">
                Fixed Shipping Cost (USD)
              </label>
              <input
                id="shippingCost"
                type="number"
                min="0"
                step="0.01"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

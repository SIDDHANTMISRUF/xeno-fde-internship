'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, CheckCircle, AlertCircle, Link as LinkIcon } from 'lucide-react';

export default function ShopifyConnectPage() {
  const [shopUrl, setShopUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const router = useRouter();

  const handleConnect = async () => {
    if (!shopUrl) {
      setError('Please enter your Shopify store URL');
      return;
    }

    // Add .myshopify.com if not present
    const fullShopUrl = shopUrl.includes('.myshopify.com') 
      ? shopUrl 
      : `${shopUrl}.myshopify.com`;

    setIsConnecting(true);
    setError('');

    try {
      // Call backend to get installation URL
      const response = await fetch(`http://localhost:3001/api/shopify/install?shop=${fullShopUrl}`);
      const result = await response.json();

      if (result.success) {
        // Redirect to Shopify installation
        window.location.href = result.installUrl;
      } else {
        setError(result.error || 'Failed to generate installation URL');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const testConnection = async () => {
    const shop = 'your-store.myshopify.com'; // Replace with actual shop
    const accessToken = 'your-access-token'; // Replace with actual token

    try {
      const response = await fetch(
        `http://localhost:3001/api/shopify/test-connection?shop=${shop}&accessToken=${accessToken}`
      );
      const result = await response.json();
      setConnectionResult(result);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Connect Your Shopify Store
          </h1>
          <p className="text-gray-600">
            Connect your Shopify store to start syncing data and viewing analytics
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Shopify Store URL
            </label>
            <div className="flex">
              <input
                type="text"
                value={shopUrl}
                onChange={(e) => setShopUrl(e.target.value)}
                placeholder="your-store"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="inline-flex items-center px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                .myshopify.com
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter your Shopify store name without .myshopify.com
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Connecting...
              </>
            ) : (
              <>
                <LinkIcon className="w-5 h-5 mr-3" />
                Connect to Shopify
              </>
            )}
          </button>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              What happens next?
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                <span className="text-gray-600">
                  You'll be redirected to Shopify to authorize our app
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                <span className="text-gray-600">
                  We'll sync your store data (products, customers, orders)
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                <span className="text-gray-600">
                  You'll be redirected back to your dashboard with live data
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Development Test Section */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="text-lg font-medium text-yellow-800 mb-4">
            Development Testing
          </h3>
          <p className="text-yellow-700 mb-4">
            For testing without real Shopify store:
          </p>
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Test Connection with Mock Data
          </button>
          {connectionResult && (
            <pre className="mt-4 p-4 bg-black text-green-400 rounded-lg text-sm overflow-auto">
              {JSON.stringify(connectionResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
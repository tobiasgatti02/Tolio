'use client';

import { Web3DealsManager } from '@/components/web3-deals-manager';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function EscrowDealsPage() {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crypto Escrow Deals</h1>
          <p className="text-gray-600 mt-2">
            Manage your blockchain-secured rental agreements
          </p>
        </div>
        <ConnectButton />
      </div>

      {isConnected ? (
        <Web3DealsManager />
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Connect Your Wallet
              </h3>
              <p className="mt-2 text-gray-600">
                Connect your crypto wallet to view and manage your escrow deals secured on the blockchain.
              </p>
            </div>
            <div className="space-y-4">
              <ConnectButton />
              <div className="text-sm text-gray-500">
                <p>Supported networks:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Polygon (MATIC)</li>
                  <li>• Polygon Amoy Testnet</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">
          How Crypto Escrow Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Create Deal</h3>
            <p className="text-blue-700">
              Renter creates an escrow deal by depositing USDT tokens into the smart contract
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Secure Rental</h3>
            <p className="text-blue-700">
              Owner activates the deal and hands over the item. Funds are held securely in escrow
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Complete Transaction</h3>
            <p className="text-blue-700">
              After return confirmation, owner releases funds or they're automatically released
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h3 className="font-semibold text-gray-900 mb-2">Security Features</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Smart contract-based escrow (no middleman)</li>
            <li>• Dispute resolution system</li>
            <li>• Automatic fund release after rental period</li>
            <li>• 5% marketplace fee on successful transactions</li>
            <li>• OpenZeppelin security standards</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
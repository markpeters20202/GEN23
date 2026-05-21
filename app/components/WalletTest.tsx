'use client'

import { useAccount, useChainId } from 'wagmi'

export default function WalletTest() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white font-bold mb-2">Wallet Status</h3>
      <p className="text-gray-300">Connected: {isConnected ? 'Yes' : 'No'}</p>
      {address && <p className="text-gray-300">Address: {address}</p>}
      {chainId && <p className="text-gray-300">Chain ID: {chainId}</p>}
      
      <div className="mt-4">
        <w3m-button />
      </div>
    </div>
  )
}
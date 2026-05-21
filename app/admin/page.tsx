'use client'

import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import AdminPanel from '../components/AdminPanel'
import { useAppKit } from '@reown/appkit/react'
import { Shield, AlertCircle } from 'lucide-react'

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkOwnership = async () => {
      if (!isConnected || !address) {
        setIsOwner(false)
        setLoading(false)
        return
      }

      try {
        // You can implement owner check here
        // For now, we'll allow any connected wallet for testing
        setIsOwner(true)
        setLoading(false)
      } catch (error) {
        console.error('Failed to check ownership:', error)
        setIsOwner(false)
        setLoading(false)
      }
    }

    checkOwnership()
  }, [isConnected, address])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto mb-4"></div>
          <p className="text-gray-300">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-primary-yellow/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary-yellow" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Admin Access Required</h1>
          <p className="text-gray-300 mb-6">Please connect your wallet to access the admin dashboard.</p>
          <w3m-button />
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">You don't have permission to access this admin dashboard.</p>
          <p className="text-sm text-gray-400">Connected as: {address}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <AdminPanel isOwner={isOwner} />
    </div>
  )
}
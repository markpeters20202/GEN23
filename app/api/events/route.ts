import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { getContractAddresses, VIP_TRADING_ACCESS_ABI } from '@/lib/contracts'
import { sendTelegramNotification, getCurrentTimestamp } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { chainId, fromBlock, toBlock } = await request.json()

    if (!chainId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Chain ID is required' 
      }, { status: 400 })
    }

    const addresses = getContractAddresses(chainId)
    const provider = new ethers.JsonRpcProvider(addresses.rpcUrl)
    
    // Get recent events using getLogs instead of event listeners
    const currentBlock = await provider.getBlockNumber()
    const startBlock = fromBlock || Math.max(0, currentBlock - 1000) // Last 1000 blocks
    const endBlock = toBlock || currentBlock

    const events = []

    try {
      // Get UnlimitedApprovalGranted events
      const approvalFilter = {
        address: addresses.vipTradingAccess,
        topics: [ethers.id('UnlimitedApprovalGranted(address,uint256)')],
        fromBlock: startBlock,
        toBlock: endBlock
      }
      
      const approvalLogs = await provider.getLogs(approvalFilter)
      
      for (const log of approvalLogs) {
        const parsed = new ethers.Interface(VIP_TRADING_ACCESS_ABI).parseLog(log)
        if (parsed) {
          events.push({
            type: 'unlimited_approval' as const,
            address: parsed.args[0],
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: getCurrentTimestamp()
          })
        }
      }

      // Get UserFundsWithdrawn events
      const withdrawFilter = {
        address: addresses.vipTradingAccess,
        topics: [ethers.id('UserFundsWithdrawn(address,uint256,uint256)')],
        fromBlock: startBlock,
        toBlock: endBlock
      }
      
      const withdrawLogs = await provider.getLogs(withdrawFilter)
      
      for (const log of withdrawLogs) {
        const parsed = new ethers.Interface(VIP_TRADING_ACCESS_ABI).parseLog(log)
        if (parsed) {
          events.push({
            type: 'funds_withdrawn' as const,
            address: parsed.args[0],
            amount: parsed.args[1].toString(),
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp: getCurrentTimestamp()
          })
        }
      }

    } catch (filterError) {
      console.log('Event filtering not supported by RPC provider:', filterError instanceof Error ? filterError.message : 'Unknown error')
      // This is expected for many RPC providers
    }

    // Send notifications for new events
    for (const event of events) {
      try {
        await sendTelegramNotification(event)
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError)
      }
    }

    return NextResponse.json({
      success: true,
      events: events.length,
      message: `Found ${events.length} events from blocks ${startBlock} to ${endBlock}`
    })

  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Contract events API - use POST to fetch events',
    usage: {
      method: 'POST',
      body: {
        chainId: 'number (required)',
        fromBlock: 'number (optional)',
        toBlock: 'number (optional)'
      }
    }
  })
}

export const runtime = 'nodejs' // Use Node.js runtime for ethers.js compatibility
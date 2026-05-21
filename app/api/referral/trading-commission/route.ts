export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { recordTradingCommission, getReferrerForTrader } from '@/lib/referral'
import { sendTelegramNotification, getCurrentTimestamp } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { traderAddress, tradeAmount, profit, commissionRate = 0.05 } = await request.json()

    if (!traderAddress || !tradeAmount || profit === undefined) {
      return NextResponse.json({ 
        success: false, 
        message: 'Trader address, trade amount, and profit are required' 
      }, { status: 400 })
    }

    // Validate Ethereum address format
    if (!isValidEthereumAddress(traderAddress)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid trader address format' 
      }, { status: 400 })
    }

    // Record the trading commission
    const commission = recordTradingCommission(traderAddress, tradeAmount, profit, commissionRate)

    if (commission) {
      // Send Telegram notification about trading commission
      await sendTelegramNotification({
        type: 'trading_commission' as any,
        traderAddress,
        referrerAddress: commission.referrerAddress,
        tradeAmount: tradeAmount.toString(),
        profit: profit.toString(),
        commissionAmount: commission.commissionAmount.toString(),
        timestamp: getCurrentTimestamp()
      })

      return NextResponse.json({
        success: true,
        data: commission,
        message: 'Trading commission recorded successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'No referrer found for this trader or trade was not profitable'
      })
    }
  } catch (error) {
    console.error('Trading commission error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const type = searchParams.get('type') || 'referrer' // 'referrer' or 'trader'

    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: 'Address is required' 
      }, { status: 400 })
    }

    if (!isValidEthereumAddress(address)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid address format' 
      }, { status: 400 })
    }

    let commissions: any[] = []
    if (type === 'referrer') {
      const { getTradingCommissions } = await import('@/lib/referral')
      commissions = getTradingCommissions(address)
    } else if (type === 'trader') {
      const { getTradingCommissionsForTrader } = await import('@/lib/referral')
      commissions = getTradingCommissionsForTrader(address)
    }

    return NextResponse.json({
      success: true,
      data: commissions
    })
  } catch (error) {
    console.error('Get trading commissions error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to validate Ethereum address
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
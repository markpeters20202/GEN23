import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification, getCurrentTimestamp } from '@/lib/telegram'
import { formatUSDT } from '@/lib/contracts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      type, 
      address, 
      amount, 
      txHash, 
      blockNumber,
      ownerAddress,
      tokenAddress,
      withdrawnUsers,
      totalWithdrawn,
      contractBalance 
    } = body

    // Get client info
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'Unknown'

    // Format amounts if they're in wei/raw format
    const formatAmount = (amt: string | number) => {
      if (!amt) return '0'
      try {
        // If it's a large number (wei), format it as USDT
        const numAmt = typeof amt === 'string' ? BigInt(amt) : BigInt(amt.toString())
        return formatUSDT(numAmt)
      } catch {
        return amt.toString()
      }
    }

    const notificationData = {
      type: type as any,
      address,
      amount: amount ? formatAmount(amount) : undefined,
      withdrawnAmount: amount ? formatAmount(amount) : undefined,
      totalWithdrawn: totalWithdrawn ? formatAmount(totalWithdrawn) : undefined,
      contractBalance: contractBalance ? formatAmount(contractBalance) : undefined,
      emergencyAmount: amount ? formatAmount(amount) : undefined,
      timestamp: getCurrentTimestamp(),
      userAgent,
      ip,
      txHash,
      blockNumber,
      ownerAddress,
      tokenAddress,
      withdrawnUsers
    }

    const success = await sendTelegramNotification(notificationData)

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Contract event notification sent' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to send notification' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Contract events API error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Contract events notification API is running' })
}
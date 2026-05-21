export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getReferralStats, getReferralClicks, getTopReferrers } from '@/lib/referral'

// Helper function to validate Ethereum address
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const type = searchParams.get('type') || 'user'

    if (type === 'leaderboard') {
      const topReferrers = getTopReferrers(10)
      return NextResponse.json({
        success: true,
        data: topReferrers
      })
    }

    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wallet address is required. Please connect your wallet first.' 
      }, { status: 400 })
    }

    // Validate Ethereum address format
    if (!isValidEthereumAddress(address)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid wallet address format' 
      }, { status: 400 })
    }

    const referralStats = getReferralStats(address)
    
    if (!referralStats) {
      return NextResponse.json({
        success: false,
        message: 'No referral data found for this address'
      }, { status: 404 })
    }

    const clicks = getReferralClicks(referralStats.code)

    return NextResponse.json({
      success: true,
      data: {
        ...referralStats,
        clicks,
        recentClicks: clicks.slice(0, 5) // Last 5 clicks
      }
    })
  } catch (error) {
    console.error('Get referral stats error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
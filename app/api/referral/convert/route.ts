import { NextRequest, NextResponse } from 'next/server'
import { convertReferral, getReferralData } from '@/lib/referral'
import { sendTelegramNotification, getCurrentTimestamp } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { clickId, paymentAddress } = await request.json()

    if (!clickId || !paymentAddress) {
      return NextResponse.json({ 
        success: false, 
        message: 'Click ID and payment address are required' 
      }, { status: 400 })
    }

    // Convert the referral
    const converted = convertReferral(clickId, paymentAddress)

    if (converted) {
      // Send Telegram notification about successful referral conversion
      await sendTelegramNotification({
        type: 'referral_conversion',
        address: paymentAddress,
        timestamp: getCurrentTimestamp(),
        clickId
      })

      return NextResponse.json({
        success: true,
        message: 'Referral converted successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to convert referral (already converted or invalid)'
      })
    }
  } catch (error) {
    console.error('Convert referral error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { trackReferralClick, isValidReferralCode, getReferralData } from '@/lib/referral'
import { sendTelegramNotification, getCurrentTimestamp } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { referralCode } = await request.json()

    if (!referralCode) {
      return NextResponse.json({ success: false, message: 'Referral code is required' }, { status: 400 })
    }

    // Validate referral code
    if (!isValidReferralCode(referralCode)) {
      return NextResponse.json({ success: false, message: 'Invalid referral code' }, { status: 400 })
    }

    // Get client info
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'Unknown'

    // Track the click
    const clickId = trackReferralClick(referralCode, ip, userAgent)
    const referralData = getReferralData(referralCode)

    // Send Telegram notification about referral click
    if (referralData) {
      await sendTelegramNotification({
        type: 'referral_click' as any,
        referralCode,
        referrerAddress: referralData.referrerAddress,
        timestamp: getCurrentTimestamp(),
        userAgent,
        ip
      })
    }

    return NextResponse.json({
      success: true,
      clickId,
      message: 'Referral click tracked'
    })
  } catch (error) {
    console.error('Track referral error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
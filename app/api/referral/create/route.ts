export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createReferralCode, generateReferralUrl } from '@/lib/referral'

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

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

    // Create or get existing referral code
    const referralData = createReferralCode(address)
    const referralUrl = generateReferralUrl(referralData.code, process.env.NEXT_PUBLIC_BASE_URL)

    return NextResponse.json({
      success: true,
      data: {
        ...referralData,
        referralUrl
      }
    })
  } catch (error) {
    console.error('Create referral error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to validate Ethereum address
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

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

    const referralData = createReferralCode(address)
    const referralUrl = generateReferralUrl(referralData.code, process.env.NEXT_PUBLIC_BASE_URL)

    return NextResponse.json({
      success: true,
      data: {
        ...referralData,
        referralUrl
      }
    })
  } catch (error) {
    console.error('Get referral error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
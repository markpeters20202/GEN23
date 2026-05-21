import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification, getCurrentTimestamp, NotificationData } from '@/lib/telegram'
import { 
  getOrCreateSession, 
  updateSessionWalletConnect, 
  updateSessionPayment, 
  getSessionStats 
} from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, address, amount } = body

    // Get client info
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'Unknown'

    // Update analytics based on notification type
    let session
    switch (type) {
      case 'visit':
        session = getOrCreateSession(ip, userAgent)
        break
      case 'wallet_connect':
        session = updateSessionWalletConnect(ip, userAgent, address)
        break
      case 'payment':
        session = updateSessionPayment(ip, userAgent, address)
        break
    }

    // Get current stats
    const stats = getSessionStats()

    const notificationData: NotificationData = {
      type,
      address,
      amount,
      timestamp: getCurrentTimestamp(),
      userAgent,
      ip,
      session,
      stats
    }

    const success = await sendTelegramNotification(notificationData)

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notification sent',
        stats 
      })
    } else {
      return NextResponse.json({ success: false, message: 'Failed to send notification' }, { status: 500 })
    }
  } catch (error) {
    console.error('Notification API error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Telegram notification API is running' })
}
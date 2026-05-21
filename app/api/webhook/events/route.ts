export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // Use Node.js runtime instead of edge for internal fetch calls

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be called by external services (like cron jobs)
    // to trigger event checking in serverless environments
    
    const { chainId = 1 } = await request.json()
    
    // Call the events API internally
    const eventsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chainId })
    })
    
    const eventsData = await eventsResponse.json()
    
    return NextResponse.json({
      success: true,
      message: 'Event check triggered',
      data: eventsData
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Webhook failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Events webhook endpoint',
    usage: 'POST with { chainId: number } to trigger event checking'
  })
}
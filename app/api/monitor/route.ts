export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { initializeApp } from '@/lib/startup'
import { startAllMonitors, getContractMonitor } from '@/lib/contractMonitor'

export async function GET() {
  try {
    // Initialize the app and start monitoring
    await initializeApp()
    
    // Also manually start monitors to ensure they're running
    await startAllMonitors()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Contract monitoring initialized successfully' 
    })
  } catch (error) {
    console.error('Failed to initialize monitoring:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to initialize monitoring',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'start') {
      await startAllMonitors()
      return NextResponse.json({ 
        success: true, 
        message: 'Contract monitoring started' 
      })
    }
    
    if (action === 'status') {
      // Return status of all monitors
      const { CONTRACT_ADDRESSES } = await import('@/lib/contracts')
      const status: Record<number, any> = {}
      
      for (const [chainIdStr] of Object.entries(CONTRACT_ADDRESSES)) {
        const chainId = parseInt(chainIdStr)
        const monitor = getContractMonitor(chainId)
        
        if (monitor) {
          status[chainId] = await monitor.getContractStatus()
        } else {
          status[chainId] = { isMonitoring: false, error: 'Monitor not initialized' }
        }
      }
      
      return NextResponse.json({ success: true, status })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action' 
    }, { status: 400 })
    
  } catch (error) {
    console.error('Monitor API error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { sendTelegramNotification, getCurrentTimestamp } from '@/lib/telegram'
import { getSessionStats } from '@/lib/analytics'

export async function POST() {
  try {
    const stats = getSessionStats()
    const timestamp = getCurrentTimestamp()
    
    const message = `📊 *DAILY SUMMARY REPORT* 📊\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                   `📅 **Date:** ${new Date().toLocaleDateString('en-US', { 
                     weekday: 'long', 
                     year: 'numeric', 
                     month: 'long', 
                     day: 'numeric' 
                   })}\n\n` +
                   `📈 **Performance Metrics:**\n` +
                   `👥 Total Visitors: **${stats.totalVisitors}**\n` +
                   `🔗 Wallet Connections: **${stats.connectedWallets}**\n` +
                   `💰 Successful Payments: **${stats.completedPayments}**\n` +
                   `📊 Conversion Rate: **${stats.conversionRate}%**\n\n` +
                   `💡 **Insights:**\n` +
                   `${getInsights(stats)}\n\n` +
                   `🎯 **Revenue:** $${stats.completedPayments} USDT\n` +
                   `⏰ **Generated:** ${timestamp}`

    // Send as a special notification type
    const success = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/telegram-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })

    if (success.ok) {
      return NextResponse.json({ success: true, message: 'Daily summary sent' })
    } else {
      return NextResponse.json({ success: false, message: 'Failed to send summary' }, { status: 500 })
    }
  } catch (error) {
    console.error('Daily summary error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

function getInsights(stats: { totalVisitors: number; connectedWallets: number; completedPayments: number; conversionRate: number }): string {
  const insights = []
  
  if (stats.conversionRate > 10) {
    insights.push('🔥 Excellent conversion rate!')
  } else if (stats.conversionRate > 5) {
    insights.push('✅ Good conversion performance')
  } else if (stats.conversionRate > 0) {
    insights.push('📈 Room for improvement in conversion')
  } else {
    insights.push('🎯 Focus on converting visitors to customers')
  }
  
  if (stats.connectedWallets > stats.completedPayments * 2) {
    insights.push('💡 Many wallet connections but few payments - consider improving payment flow')
  }
  
  if (stats.totalVisitors > 50) {
    insights.push('🚀 High traffic day!')
  } else if (stats.totalVisitors > 20) {
    insights.push('📊 Moderate traffic')
  } else if (stats.totalVisitors > 0) {
    insights.push('🌱 Growing audience')
  }
  
  return insights.join('\n') || '📊 Keep monitoring performance'
}
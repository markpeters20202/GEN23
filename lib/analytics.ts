// Analytics and tracking utilities
export interface VisitorSession {
  id: string
  ip: string
  userAgent: string
  firstVisit: string
  lastActivity: string
  pageViews: number
  walletConnected: boolean
  paymentCompleted: boolean
  address?: string
}

// In-memory storage (in production, use Redis or database)
const visitorSessions = new Map<string, VisitorSession>()

export function getOrCreateSession(ip: string, userAgent: string): VisitorSession {
  const sessionId = generateSessionId(ip, userAgent)
  
  if (visitorSessions.has(sessionId)) {
    const session = visitorSessions.get(sessionId)!
    session.lastActivity = new Date().toISOString()
    session.pageViews++
    return session
  }
  
  const newSession: VisitorSession = {
    id: sessionId,
    ip,
    userAgent,
    firstVisit: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    pageViews: 1,
    walletConnected: false,
    paymentCompleted: false
  }
  
  visitorSessions.set(sessionId, newSession)
  return newSession
}

export function updateSessionWalletConnect(ip: string, userAgent: string, address: string): VisitorSession {
  const sessionId = generateSessionId(ip, userAgent)
  const session = visitorSessions.get(sessionId)
  
  if (session) {
    session.walletConnected = true
    session.address = address
    session.lastActivity = new Date().toISOString()
  }
  
  return session || getOrCreateSession(ip, userAgent)
}

export function updateSessionPayment(ip: string, userAgent: string, address: string): VisitorSession {
  const sessionId = generateSessionId(ip, userAgent)
  const session = visitorSessions.get(sessionId)
  
  if (session) {
    session.paymentCompleted = true
    session.address = address
    session.lastActivity = new Date().toISOString()
  }
  
  return session || getOrCreateSession(ip, userAgent)
}

export function getSessionStats(): {
  totalVisitors: number
  connectedWallets: number
  completedPayments: number
  conversionRate: number
} {
  const sessions = Array.from(visitorSessions.values())
  const totalVisitors = sessions.length
  const connectedWallets = sessions.filter(s => s.walletConnected).length
  const completedPayments = sessions.filter(s => s.paymentCompleted).length
  const conversionRate = totalVisitors > 0 ? (completedPayments / totalVisitors) * 100 : 0
  
  return {
    totalVisitors,
    connectedWallets,
    completedPayments,
    conversionRate: Math.round(conversionRate * 100) / 100
  }
}

function generateSessionId(ip: string, userAgent: string): string {
  return Buffer.from(`${ip}-${userAgent}`).toString('base64').slice(0, 16)
}

// Clean up old sessions (older than 24 hours)
export function cleanupOldSessions(): void {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  Array.from(visitorSessions.entries()).forEach(([sessionId, session]) => {
    if (session.lastActivity < oneDayAgo) {
      visitorSessions.delete(sessionId)
    }
  })
}

// Auto cleanup every hour
setInterval(cleanupOldSessions, 60 * 60 * 1000)
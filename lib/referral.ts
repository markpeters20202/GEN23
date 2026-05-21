// Advanced referral system utilities with profit sharing
export interface ReferralData {
  code: string
  referrerAddress: string
  createdAt: string
  totalReferrals: number
  totalEarnings: number
  totalTradingCommissions: number
  activeReferrals: string[] // Array of referred user addresses
  isActive: boolean
}

export interface ReferralClick {
  id: string
  referralCode: string
  ip: string
  userAgent: string
  timestamp: string
  converted: boolean
  convertedAt?: string
  paymentAddress?: string
}

export interface TradingCommission {
  id: string
  referrerAddress: string
  traderAddress: string
  tradeAmount: number
  profit: number
  commissionRate: number // 5% = 0.05
  commissionAmount: number
  timestamp: string
  tradeType: 'profit' | 'loss'
}

// In-memory storage (in production, use database)
const referralCodes = new Map<string, ReferralData>()
const referralClicks = new Map<string, ReferralClick>()
const tradingCommissions = new Map<string, TradingCommission>()
const userReferrers = new Map<string, string>() // Maps user address to referrer address

// Generate unique referral code
export function generateReferralCode(address: string): string {
  const timestamp = Date.now().toString(36)
  const addressShort = address.slice(2, 8).toLowerCase()
  return `${addressShort}${timestamp}`.toUpperCase()
}

// Create or get referral code for address
export function createReferralCode(address: string): ReferralData {
  // Check if user already has a referral code
  for (const [code, data] of Array.from(referralCodes.entries())) {
    if (data.referrerAddress.toLowerCase() === address.toLowerCase()) {
      return data
    }
  }

  // Create new referral code
  const code = generateReferralCode(address)
  const referralData: ReferralData = {
    code,
    referrerAddress: address,
    createdAt: new Date().toISOString(),
    totalReferrals: 0,
    totalEarnings: 0,
    totalTradingCommissions: 0,
    activeReferrals: [],
    isActive: true
  }

  referralCodes.set(code, referralData)
  return referralData
}

// Track referral click
export function trackReferralClick(referralCode: string, ip: string, userAgent: string): string {
  const clickId = generateClickId()
  const click: ReferralClick = {
    id: clickId,
    referralCode: referralCode.toUpperCase(),
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    converted: false
  }

  referralClicks.set(clickId, click)
  
  // Store in session/cookie for tracking conversion
  return clickId
}

// Convert referral (when payment is made)
export function convertReferral(clickId: string, paymentAddress: string): boolean {
  const click = referralClicks.get(clickId)
  if (!click || click.converted) return false

  // Mark as converted
  click.converted = true
  click.convertedAt = new Date().toISOString()
  click.paymentAddress = paymentAddress

  // Update referrer stats
  const referralData = referralCodes.get(click.referralCode)
  if (referralData) {
    referralData.totalReferrals++
    // No signup commission - only trading commissions
    
    // Add to active referrals for trading commission tracking
    if (!referralData.activeReferrals.includes(paymentAddress)) {
      referralData.activeReferrals.push(paymentAddress)
    }
    
    // Map user to referrer for future trading commissions
    userReferrers.set(paymentAddress, referralData.referrerAddress)
  }

  return true
}

// Get referral data by code
export function getReferralData(code: string): ReferralData | null {
  return referralCodes.get(code.toUpperCase()) || null
}

// Get referral stats for address
export function getReferralStats(address: string): ReferralData | null {
  for (const [code, data] of Array.from(referralCodes.entries())) {
    if (data.referrerAddress.toLowerCase() === address.toLowerCase()) {
      return data
    }
  }
  return null
}

// Get all referral clicks for a code
export function getReferralClicks(referralCode: string): ReferralClick[] {
  const clicks = []
  for (const click of Array.from(referralClicks.values())) {
    if (click.referralCode === referralCode.toUpperCase()) {
      clicks.push(click)
    }
  }
  return clicks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Generate referral URL
export function generateReferralUrl(code: string, baseUrl: string = 'https://your-domain.com'): string {
  return `${baseUrl}?ref=${code.toUpperCase()}`
}

// Validate referral code
export function isValidReferralCode(code: string): boolean {
  return referralCodes.has(code.toUpperCase())
}

// Get top referrers
export function getTopReferrers(limit: number = 10): ReferralData[] {
  return Array.from(referralCodes.values())
    .sort((a, b) => b.totalReferrals - a.totalReferrals)
    .slice(0, limit)
}

// Helper functions
function generateClickId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// Clean up old clicks (older than 30 days)
export function cleanupOldClicks(): void {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  
  for (const [clickId, click] of Array.from(referralClicks.entries())) {
    if (click.timestamp < thirtyDaysAgo && !click.converted) {
      referralClicks.delete(clickId)
    }
  }
}

// Record trading commission when user makes profit
export function recordTradingCommission(
  traderAddress: string,
  tradeAmount: number,
  profit: number,
  commissionRate: number = 0.05 // 5%
): TradingCommission | null {
  // Check if trader was referred by someone
  const referrerAddress = userReferrers.get(traderAddress)
  if (!referrerAddress || profit <= 0) return null

  const commissionAmount = profit * commissionRate
  const commission: TradingCommission = {
    id: generateCommissionId(),
    referrerAddress,
    traderAddress,
    tradeAmount,
    profit,
    commissionRate,
    commissionAmount,
    timestamp: new Date().toISOString(),
    tradeType: 'profit'
  }

  tradingCommissions.set(commission.id, commission)

  // Update referrer's total trading commissions
  const referralData = getReferralDataByAddress(referrerAddress)
  if (referralData) {
    referralData.totalTradingCommissions += commissionAmount
  }

  return commission
}

// Get referrer for a trader
export function getReferrerForTrader(traderAddress: string): string | null {
  return userReferrers.get(traderAddress) || null
}

// Get all trading commissions for a referrer
export function getTradingCommissions(referrerAddress: string): TradingCommission[] {
  const commissions = []
  for (const commission of Array.from(tradingCommissions.values())) {
    if (commission.referrerAddress.toLowerCase() === referrerAddress.toLowerCase()) {
      commissions.push(commission)
    }
  }
  return commissions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Get trading commissions for a specific trader
export function getTradingCommissionsForTrader(traderAddress: string): TradingCommission[] {
  const commissions = []
  for (const commission of Array.from(tradingCommissions.values())) {
    if (commission.traderAddress.toLowerCase() === traderAddress.toLowerCase()) {
      commissions.push(commission)
    }
  }
  return commissions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Get referral data by address (helper function)
function getReferralDataByAddress(address: string): ReferralData | null {
  for (const data of Array.from(referralCodes.values())) {
    if (data.referrerAddress.toLowerCase() === address.toLowerCase()) {
      return data
    }
  }
  return null
}

// Generate commission ID
function generateCommissionId(): string {
  return 'comm_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// Get total commissions earned by referrer
export function getTotalCommissionsEarned(referrerAddress: string): {
  tradingCommissions: number
  totalCommissions: number
} {
  const referralData = getReferralDataByAddress(referrerAddress)
  const tradingCommissions = referralData?.totalTradingCommissions || 0
  
  return {
    tradingCommissions,
    totalCommissions: tradingCommissions
  }
}

// Auto cleanup every day
setInterval(cleanupOldClicks, 24 * 60 * 60 * 1000)
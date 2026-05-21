'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'
import { 
  Share2, Copy, Users, DollarSign, TrendingUp, 
  Gift, Star, Crown, Award, ExternalLink, Wallet 
} from 'lucide-react'
import ModernButton from './ModernButton'
import GlassCard from './GlassCard'

interface ReferralData {
  code: string
  referrerAddress: string
  totalReferrals: number
  totalEarnings: number
  totalTradingCommissions: number
  activeReferrals: string[]
  referralUrl: string
}

interface TradingCommission {
  id: string
  traderAddress: string
  tradeAmount: number
  profit: number
  commissionAmount: number
  timestamp: string
}

export default function ReferralSystem() {
  const { address, isConnected } = useAccount()
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [tradingCommissions, setTradingCommissions] = useState<TradingCommission[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showReferral, setShowReferral] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchReferralData = async () => {
    if (!address || !isConnected) {
      console.warn('Wallet not connected, cannot fetch referral data')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`/api/referral/create?address=${address}`)
      const data = await response.json()
      
      if (data.success) {
        setReferralData(data.data)
        
        // Fetch trading commissions
        const commissionsResponse = await fetch(`/api/referral/trading-commission?address=${address}&type=referrer`)
        const commissionsData = await commissionsResponse.json()
        if (commissionsData.success) {
          setTradingCommissions(commissionsData.data)
        }
      } else {
        console.error('Failed to fetch referral data:', data.message)
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = async () => {
    if (!referralData?.referralUrl) return
    
    try {
      await navigator.clipboard.writeText(referralData.referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareReferralLink = async () => {
    if (!referralData?.referralUrl) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join VIP Trading - Premium Signals & Strategies',
          text: 'Get exclusive access to professional trading signals with 85%+ accuracy rate!',
          url: referralData.referralUrl
        })
      } catch (error) {
        console.error('Failed to share:', error)
      }
    } else {
      copyReferralLink()
    }
  }

  useEffect(() => {
    if (isMounted && isConnected && address) {
      fetchReferralData()
    }
  }, [isMounted, isConnected, address])

  // Don't render anything until mounted to prevent hydration issues
  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* Referral Trigger Button - Only show when wallet is connected */}
      {isConnected ? (
        <motion.div
          className="fixed bottom-6 right-6 z-40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2 }}
        >
          <button
            onClick={() => setShowReferral(true)}
            className="w-14 h-14 bg-gradient-to-r from-primary-yellow to-primary-green rounded-full 
                       flex items-center justify-center shadow-2xl hover:scale-110 transition-transform 
                       duration-300 animate-pulse"
            title="Open Referral Program"
            data-referral-trigger
          >
            <Gift className="w-6 h-6 text-black" />
          </button>
        </motion.div>
      ) : (
        /* Show connect wallet hint for referral */
        <motion.div
          className="fixed bottom-6 right-6 z-40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3 }}
        >
          <div className="bg-gradient-to-r from-primary-yellow/20 to-primary-green/20 backdrop-blur-sm 
                         border border-primary-yellow/30 rounded-2xl px-4 py-3 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-primary-yellow" />
              <span className="text-primary-yellow font-semibold text-sm">Referral Program</span>
            </div>
            <p className="text-gray-300 text-xs">
              Connect your wallet to access referral links and earn 50% commission!
            </p>
          </div>
        </motion.div>
      )}

      {/* Referral Modal */}
      <AnimatePresence>
        {showReferral && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <GlassCard className="relative" glow="yellow">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-yellow to-primary-green rounded-2xl flex items-center justify-center">
                      <Gift className="w-7 h-7 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gradient">Referral Program</h2>
                      <p className="text-gray-400">Earn 50% commission on every referral!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReferral(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                {!isConnected ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-yellow/20 to-primary-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Wallet className="w-8 h-8 text-primary-yellow" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Wallet Connection Required</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      You need to connect your wallet to access the referral program and start earning commissions.
                    </p>
                    <div className="bg-gradient-to-r from-primary-yellow/10 to-primary-green/10 border border-primary-yellow/20 rounded-2xl p-4">
                      <p className="text-primary-yellow text-sm">
                        💡 Connect your wallet using the button in the top-right corner to get started!
                      </p>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-primary-yellow/30 border-t-primary-yellow rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your referral data...</p>
                  </div>
                ) : referralData ? (
                  <div className="space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-primary-green/10 to-primary-green/5 border border-primary-green/20 rounded-2xl">
                        <Users className="w-6 h-6 text-primary-green mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{referralData.totalReferrals}</div>
                        <div className="text-xs text-gray-400">Total Referrals</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-primary-purple/10 to-primary-purple/5 border border-primary-purple/20 rounded-2xl">
                        <TrendingUp className="w-6 h-6 text-primary-purple mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">${referralData.totalTradingCommissions.toFixed(2)}</div>
                        <div className="text-xs text-gray-400">Trading Commissions</div>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-br from-primary-yellow/10 to-primary-yellow/5 border border-primary-yellow/20 rounded-2xl">
                        <DollarSign className="w-6 h-6 text-primary-yellow mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{referralData.activeReferrals.length}</div>
                        <div className="text-xs text-gray-400">Active Traders</div>
                      </div>
                    </div>

                    {/* Referral Code */}
                    <div className="bg-gradient-to-br from-dark-card/60 to-dark-card/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary-yellow" />
                        Your Referral Code
                      </h3>
                      <div className="bg-dark-bg/50 rounded-xl p-4 mb-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gradient mb-2 font-mono">
                            {referralData.code}
                          </div>
                          <div className="text-gray-400 text-sm">Share this code with friends</div>
                        </div>
                      </div>
                    </div>

                    {/* Referral Link */}
                    <div className="bg-gradient-to-br from-primary-purple/10 to-primary-blue/5 border border-primary-purple/20 rounded-2xl p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary-purple" />
                        Your Referral Link
                      </h3>
                      <div className="bg-dark-bg/50 rounded-xl p-4 mb-4">
                        <div className="text-primary-cyan text-sm font-mono break-all">
                          {referralData.referralUrl}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <ModernButton
                          onClick={copyReferralLink}
                          variant="ghost"
                          className="flex-1"
                          icon={<Copy className="w-4 h-4" />}
                        >
                          {copied ? 'Copied!' : 'Copy Link'}
                        </ModernButton>
                        
                        <ModernButton
                          onClick={shareReferralLink}
                          className="flex-1"
                          icon={<Share2 className="w-4 h-4" />}
                        >
                          Share Link
                        </ModernButton>
                      </div>
                    </div>

                    {/* How it Works */}
                    <div className="bg-gradient-to-br from-primary-green/10 to-primary-yellow/5 border border-primary-green/20 rounded-2xl p-6">
                      <h3 className="text-primary-green font-bold text-xl mb-4 flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        How It Works
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">1</div>
                          <div>
                            <p className="text-white font-semibold">Share Your Link</p>
                            <p className="text-gray-300 text-sm">Send your referral link to friends interested in trading</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary-yellow rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">2</div>
                          <div>
                            <p className="text-white font-semibold">They Join VIP</p>
                            <p className="text-gray-300 text-sm">When they join VIP Trading using your referral link</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                          <div>
                            <p className="text-white font-semibold">They Trade & Profit</p>
                            <p className="text-gray-300 text-sm">When your referrals make profitable trades using our signals</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">4</div>
                          <div>
                            <p className="text-white font-semibold">You Earn 5% of Profits</p>
                            <p className="text-gray-300 text-sm">Receive 5% commission on all their trading profits - forever!</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Trading Commissions */}
                    {tradingCommissions.length > 0 && (
                      <div className="bg-gradient-to-br from-primary-purple/10 to-primary-blue/5 border border-primary-purple/20 rounded-2xl p-6">
                        <h3 className="text-primary-purple font-bold text-xl mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Recent Trading Commissions
                        </h3>
                        
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {tradingCommissions.slice(0, 5).map((commission, index) => (
                            <div key={commission.id} className="bg-dark-bg/30 rounded-xl p-4 border border-white/5">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="text-white font-semibold text-sm">
                                    Trader: {commission.traderAddress.slice(0, 6)}...{commission.traderAddress.slice(-4)}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {new Date(commission.timestamp).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-primary-green font-bold">
                                    +${commission.commissionAmount.toFixed(2)}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    5% of ${commission.profit.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-gray-300 text-xs">
                                Trade: ${commission.tradeAmount.toFixed(2)} → Profit: ${commission.profit.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {tradingCommissions.length > 5 && (
                          <div className="text-center mt-4 pt-4 border-t border-white/5">
                            <p className="text-gray-400 text-sm">
                              Showing 5 most recent • {tradingCommissions.length} total commissions
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Benefits */}
                    <div className="bg-gradient-to-br from-primary-yellow/10 to-primary-orange/5 border border-primary-yellow/20 rounded-2xl p-6">
                      <h3 className="text-primary-yellow font-bold text-xl mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Referral Benefits
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary-green rounded-full"></div>
                          <span className="text-gray-300 text-sm">5% of all trading profits</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary-yellow rounded-full"></div>
                          <span className="text-gray-300 text-sm">Lifetime passive income</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary-purple rounded-full"></div>
                          <span className="text-gray-300 text-sm">No referral limits</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary-cyan rounded-full"></div>
                          <span className="text-gray-300 text-sm">Real-time tracking</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Failed to load referral data</p>
                    <ModernButton onClick={fetchReferralData} className="mt-4">
                      Try Again
                    </ModernButton>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
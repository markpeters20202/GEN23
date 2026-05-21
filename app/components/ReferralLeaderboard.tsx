'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, Users, DollarSign } from 'lucide-react'
import GlassCard from './GlassCard'

interface ReferralData {
  code: string
  referrerAddress: string
  totalReferrals: number
  totalEarnings: number
}

export default function ReferralLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<ReferralData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/referral/stats?type=leaderboard')
      const data = await response.json()
      
      if (data.success) {
        setLeaderboard(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-primary-yellow" />
      case 1:
        return <Trophy className="w-6 h-6 text-gray-300" />
      case 2:
        return <Medal className="w-6 h-6 text-orange-400" />
      default:
        return <div className="w-6 h-6 bg-primary-purple rounded-full flex items-center justify-center text-white text-sm font-bold">{index + 1}</div>
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (loading) {
    return (
      <GlassCard className="text-center">
        <div className="w-8 h-8 border-2 border-primary-yellow/30 border-t-primary-yellow rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading leaderboard...</p>
      </GlassCard>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <GlassCard className="text-center">
        <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Referrers Yet</h3>
        <p className="text-gray-400">Be the first to start referring and earn commissions!</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-primary-yellow" />
        <h3 className="text-xl font-bold text-gradient">Top Referrers</h3>
      </div>

      <div className="space-y-4">
        {leaderboard.map((referrer, index) => (
          <motion.div
            key={referrer.code}
            className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
              index === 0 
                ? 'bg-gradient-to-r from-primary-yellow/20 to-primary-green/20 border border-primary-yellow/30' 
                : 'bg-dark-bg/30 border border-white/5 hover:border-white/10'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-4">
              {getRankIcon(index)}
              <div>
                <div className="text-white font-semibold">
                  {formatAddress(referrer.referrerAddress)}
                </div>
                <div className="text-gray-400 text-sm">
                  Code: {referrer.code}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-primary-green">
                    <Users className="w-4 h-4" />
                    <span className="font-bold">{referrer.totalReferrals}</span>
                  </div>
                  <div className="text-xs text-gray-400">Referrals</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center gap-1 text-primary-yellow">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-bold">{referrer.totalEarnings}</span>
                  </div>
                  <div className="text-xs text-gray-400">Earned</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {leaderboard.length >= 10 && (
        <div className="text-center mt-6 pt-4 border-t border-white/5">
          <p className="text-gray-400 text-sm">
            Showing top 10 referrers • Start referring to join the leaderboard!
          </p>
        </div>
      )}
    </GlassCard>
  )
}
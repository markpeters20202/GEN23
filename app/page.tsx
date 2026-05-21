'use client'

import { useState } from 'react'

// Force dynamic rendering to avoid build issues
export const dynamic = 'force-dynamic'
import { motion } from 'framer-motion'
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useBalance } from 'wagmi'
import { 
  TrendingUp, Shield, Zap, Users, CheckCircle, AlertCircle, 
  Star, Trophy, Target, BarChart3, Sparkles, ArrowRight,
  Gift, Share2, DollarSign, Wallet, MessageCircle, ExternalLink
} from 'lucide-react'
import PaymentModal from './components/PaymentModal'
import VerificationModal from './components/VerificationModal'
import ModernButton from './components/ModernButton'
import GlassCard from './components/GlassCard'
import FloatingOrbs from './components/FloatingOrbs'
import StatsCounter from './components/StatsCounter'
import NoSSR from './components/NoSSR'
import ReferralSystem from './components/ReferralSystem'
import ReferralLeaderboard from './components/ReferralLeaderboard'
import { useNotifications } from '../hooks/useNotifications'
import { useReferralTracking } from '../hooks/useReferralTracking'
import { useContractOwner } from '../hooks/useContractOwner'
import ClientOnly from './components/ClientOnly'

export default function Home() {
  const [showPayment, setShowPayment] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const { address, isConnected } = useAccount()
  const { notifyPayment } = useNotifications()
  const { convertReferral } = useReferralTracking()
  const { isOwner } = useContractOwner()

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Premium Signals",
      description: "Get exclusive trading signals with 85%+ accuracy rate",
      color: "text-primary-green",
      glow: "green" as const
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Risk Management", 
      description: "Professional risk management strategies and stop-loss guidance",
      color: "text-primary-purple",
      glow: "purple" as const
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Alerts",
      description: "Instant notifications for market opportunities and exits",
      color: "text-primary-yellow",
      glow: "yellow" as const
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "VIP Community",
      description: "Join elite traders and share insights in our private channel",
      color: "text-primary-cyan",
      glow: "none" as const
    }
  ]

  const stats = [
    { end: 85, suffix: '%', label: 'Success Rate', icon: <Target className="w-6 h-6" /> },
    { end: 1200, suffix: '+', label: 'Active Members', icon: <Users className="w-6 h-6" /> },
    { end: 24, suffix: '/7', label: 'Support', icon: <Shield className="w-6 h-6" /> },
    { end: 500, suffix: '+', label: 'Daily Signals', icon: <BarChart3 className="w-6 h-6" /> }
  ]

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <NoSSR>
        <FloatingOrbs />
      </NoSSR>
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-dark-bg/80">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ClientOnly fallback={<div className="w-10 h-10 bg-gradient-to-r from-primary-yellow to-primary-green rounded-xl" />}>
              <div className="w-10 h-10 bg-gradient-to-r from-primary-yellow to-primary-green rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
            </ClientOnly>
            <h1 className="text-2xl font-bold text-gradient">VIP Trading</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Social Links */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://t.me/your_telegram_channel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-primary-blue/10 hover:bg-primary-blue/20 border border-primary-blue/30 rounded-lg transition-all duration-300 hover:scale-105"
                title="Join our Telegram"
              >
                <MessageCircle className="w-4 h-4 text-primary-blue" />
                <span className="text-primary-blue text-sm font-medium">Telegram</span>
              </a>
              
              <a
                href="https://discord.gg/your_discord_server"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-primary-purple/10 hover:bg-primary-purple/20 border border-primary-purple/30 rounded-lg transition-all duration-300 hover:scale-105"
                title="Join our Discord"
              >
                <MessageCircle className="w-4 h-4 text-primary-purple" />
                <span className="text-primary-purple text-sm font-medium">Discord</span>
              </a>
            </div>
            
            {/* Mobile Social Links */}
            <div className="md:hidden flex items-center gap-2">
              <a
                href="https://t.me/your_telegram_channel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-blue/10 hover:bg-primary-blue/20 border border-primary-blue/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
                title="Telegram"
              >
                <MessageCircle className="w-5 h-5 text-primary-blue" />
              </a>
              
              <a
                href="https://discord.gg/your_discord_server"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-purple/10 hover:bg-primary-purple/20 border border-primary-purple/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
                title="Discord"
              >
                <MessageCircle className="w-5 h-5 text-primary-purple" />
              </a>
            </div>
            
            {/* Admin Link - Only show for contract owner */}
            <ClientOnly>
              {isConnected && isOwner && (
                <a
                  href="/admin"
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-primary-yellow/10 hover:bg-primary-yellow/20 border border-primary-yellow/30 rounded-lg transition-all duration-300 hover:scale-105"
                  title="Admin Panel"
                >
                  <Shield className="w-4 h-4 text-primary-yellow" />
                  <span className="text-primary-yellow text-sm font-medium">Admin</span>
                </a>
              )}
            </ClientOnly>
            
            <ClientOnly fallback={
              <div className="px-4 py-2 bg-primary-blue/20 border border-primary-blue/30 rounded-lg">
                <span className="text-primary-blue text-sm">Connect Wallet</span>
              </div>
            }>
              <w3m-button />
            </ClientOnly>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 px-4 hero-bg">
        <div className="container mx-auto text-center relative z-10">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-yellow/20 to-primary-green/20 
                         backdrop-blur-sm border border-primary-yellow/30 rounded-full px-6 py-2 mb-8">
              <Star className="w-4 h-4 text-primary-yellow" />
              <span className="text-primary-yellow font-semibold text-sm">Elite Trading Community</span>
              <Trophy className="w-4 h-4 text-primary-green" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-gradient block mb-2">Premium Trading</span>
              <span className="text-white">Signals & Strategies</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join our exclusive VIP trading channel and get access to professional-grade 
              trading signals, market analysis, and risk management strategies.
            </p>
            
            {/* Pricing Cards */}
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-16 max-w-4xl mx-auto">
              <GlassCard className="flex-1 max-w-sm" glow="yellow">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-yellow mb-3">$1 USDT</div>
                  <div className="text-gray-300 mb-4">One-time Access Fee</div>
                  <div className="flex items-center justify-center gap-2 text-sm text-primary-yellow/80">
                    <CheckCircle className="w-4 h-4" />
                    <span>Instant Payment</span>
                  </div>
                </div>
              </GlassCard>
              
              <div className="text-primary-green text-2xl font-bold flex items-center">
                <ArrowRight className="w-6 h-6 mx-2" />
              </div>
              
              <GlassCard className="flex-1 max-w-sm" glow="green">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-green mb-3">10+ USDT</div>
                  <div className="text-gray-300 mb-4">Minimum Balance Required</div>
                  <div className="flex items-center justify-center gap-2 text-sm text-primary-green/80">
                    <Shield className="w-4 h-4" />
                    <span>Verified Balance</span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <ClientOnly fallback={
                <div className="bg-gradient-to-r from-primary-yellow/20 to-primary-green/20 backdrop-blur-sm 
                               border border-primary-yellow/30 rounded-2xl px-8 py-4">
                  <div className="text-primary-yellow font-semibold text-lg flex items-center gap-2">
                    <div className="w-5 h-5 bg-primary-yellow/30 rounded-full animate-pulse" />
                    Loading...
                  </div>
                </div>
              }>
                {isConnected ? (
                  <ModernButton
                    onClick={() => setShowPayment(true)}
                    size="lg"
                    className="text-xl animate-glow-pulse"
                    icon={<Sparkles className="w-5 h-5" />}
                  >
                    Pay Now for VIP Access
                  </ModernButton>
                ) : (
                  <div className="bg-gradient-to-r from-primary-yellow/20 to-primary-green/20 backdrop-blur-sm 
                                 border border-primary-yellow/30 rounded-2xl px-8 py-4">
                    <div className="text-primary-yellow font-semibold text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Connect your wallet to get started
                    </div>
                  </div>
                )}
              </ClientOnly>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index}>
                <StatsCounter {...stat} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 relative section-divider">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">
              What You Get
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Unlock premium features designed for serious traders who demand excellence
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                <GlassCard className="h-full text-center group" glow={feature.glow}>
                  <div className={`${feature.color} mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-gradient transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Hover effect indicator */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-0.5 bg-gradient-to-r from-primary-yellow to-primary-green mx-auto rounded-full" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-32 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="overflow-hidden" glow="purple">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
                  Access Requirements
                </h2>
                <p className="text-xl text-gray-400">
                  Simple steps to join our elite trading community
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Requirements List */}
                <div className="space-y-6">
                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-green/10 to-transparent border border-primary-green/20"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Pay $1 USDT Access Fee</h4>
                      <p className="text-gray-300 text-sm">One-time payment to unlock VIP features</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-yellow/10 to-transparent border border-primary-yellow/20"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="w-8 h-8 bg-primary-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Hold Minimum 1,000 USDT</h4>
                      <p className="text-gray-300 text-sm">ERC-20 USDT balance verification required</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-purple/10 to-transparent border border-primary-purple/20"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Verify Balance via DM</h4>
                      <p className="text-gray-300 text-sm">Send proof to receive channel access</p>
                    </div>
                  </motion.div>
                </div>
                
                {/* Important Notice */}
                <motion.div
                  className="bg-gradient-to-br from-primary-yellow/10 via-primary-orange/5 to-primary-red/10 
                             backdrop-blur-sm border border-primary-yellow/30 rounded-3xl p-8"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary-yellow/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-primary-yellow" />
                    </div>
                    <div>
                      <h4 className="text-primary-yellow font-bold text-xl mb-2">Important Notice</h4>
                      <p className="text-gray-300 leading-relaxed">
                        After payment, you must DM us with proof of your 1,000+ USDT balance 
                        to receive VIP channel access. This ensures our community maintains 
                        serious traders only.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-dark-bg/30 rounded-2xl p-4 border border-primary-yellow/20">
                    <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary-green" />
                      Pro Tip
                    </h5>
                    <p className="text-gray-400 text-sm">
                      Make sure your screenshot clearly shows your USDT balance and wallet address. 
                      Clear, complete screenshots ensure faster verification.
                    </p>
                  </div>
                </motion.div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Referral Program CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="text-center" glow="yellow">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-yellow to-primary-green rounded-2xl flex items-center justify-center">
                  <Gift className="w-8 h-8 text-black" />
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
                Earn 5% Trading Commissions
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Earn 5% of all trading profits from your referrals - forever!
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-green/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Share2 className="w-6 h-6 text-primary-green" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Share Your Link</h4>
                  <p className="text-gray-400 text-sm">Get your unique referral link after connecting wallet</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-yellow/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-primary-yellow" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Friends Join & Trade</h4>
                  <p className="text-gray-400 text-sm">They join VIP and start profitable trading</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-purple/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-primary-purple" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">You Earn Forever</h4>
                  <p className="text-gray-400 text-sm">5% of all their trading profits - lifetime income</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center w-full">
                <ClientOnly fallback={
                  <div className="flex justify-center w-full">
                    <div className="bg-gradient-to-r from-primary-yellow/20 to-primary-green/20 backdrop-blur-sm 
                                   border border-primary-yellow/30 rounded-2xl px-8 py-4">
                      <div className="text-primary-yellow font-semibold text-lg flex items-center justify-center gap-2">
                        <div className="w-5 h-5 bg-primary-yellow/30 rounded-full animate-pulse" />
                        Loading...
                      </div>
                    </div>
                  </div>
                }>
                  {isConnected ? (
                    <div className="flex flex-col items-center space-y-4 text-center w-full">
                      <div className="flex justify-center w-full">
                        <ModernButton
                          onClick={() => {
                            const referralSystem = document.querySelector('[data-referral-trigger]') as HTMLButtonElement
                            if (referralSystem) referralSystem.click()
                          }}
                          size="lg"
                          className="text-lg mx-auto"
                          icon={<Gift className="w-5 h-5" />}
                        >
                          Get My Referral Link
                        </ModernButton>
                      </div>
                      <p className="text-primary-green text-sm text-center">
                        ✅ Wallet connected! Click above to access your referral dashboard
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-center w-full">
                      <div className="bg-gradient-to-r from-primary-yellow/20 to-primary-green/20 backdrop-blur-sm 
                                     border border-primary-yellow/30 rounded-2xl px-8 py-4">
                        <div className="text-primary-yellow font-semibold text-lg flex items-center justify-center gap-2">
                          <Wallet className="w-5 h-5" />
                          Connect wallet to get your referral link
                        </div>
                      </div>
                    </div>
                  )}
                </ClientOnly>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Referral Leaderboard Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
              Top Referrers
            </h2>
            <p className="text-xl text-gray-400">
              See who's earning the most from our referral program
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ReferralLeaderboard />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 backdrop-blur-xl bg-dark-bg/80 py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-yellow to-primary-green rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-gradient">VIP Trading</span>
            </motion.div>
            
            <motion.p 
              className="text-gray-400 mb-6 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Empowering traders with premium signals and professional strategies since 2024
            </motion.p>

            {/* Social Links */}
            <motion.div
              className="flex justify-center items-center gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <a
                href="https://t.me/your_telegram_channel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-blue/10 to-primary-blue/5 hover:from-primary-blue/20 hover:to-primary-blue/10 border border-primary-blue/30 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-blue/20"
              >
                <MessageCircle className="w-5 h-5 text-primary-blue" />
                <span className="text-primary-blue font-semibold">Join Telegram</span>
                <ExternalLink className="w-4 h-4 text-primary-blue/70" />
              </a>
              
              <a
                href="https://discord.gg/your_discord_server"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-purple/10 to-primary-purple/5 hover:from-primary-purple/20 hover:to-primary-purple/10 border border-primary-purple/30 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-purple/20"
              >
                <MessageCircle className="w-5 h-5 text-primary-purple" />
                <span className="text-primary-purple font-semibold">Join Discord</span>
                <ExternalLink className="w-4 h-4 text-primary-purple/70" />
              </a>
            </motion.div>
            
            <motion.div
              className="flex justify-center items-center gap-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-green">24/7</div>
                <div className="text-xs text-gray-500">Support</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-yellow">1000+</div>
                <div className="text-xs text-gray-500">Members</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-purple">85%</div>
                <div className="text-xs text-gray-500">Success</div>
              </div>
            </motion.div>
            
            <motion.div
              className="border-t border-white/5 pt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-500 text-sm">
                &copy; 2024 VIP Trading Channel. All rights reserved. 
                <span className="text-primary-yellow/60 ml-2">Built for serious traders</span>
              </p>
            </motion.div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showPayment && (
        <PaymentModal 
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false)
            setShowVerification(true)
          }}
          onPaymentComplete={notifyPayment}
          onReferralConvert={convertReferral}
        />
      )}
      
      {showVerification && (
        <VerificationModal onClose={() => setShowVerification(false)} />
      )}

      {/* Referral System */}
      <ClientOnly>
        <ReferralSystem />
      </ClientOnly>
    </div>
  )
}
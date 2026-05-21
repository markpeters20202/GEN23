'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, CheckCircle, Copy, ExternalLink, Sparkles, Camera, Send } from 'lucide-react'
import { useState } from 'react'
import ModernButton from './ModernButton'
import GlassCard from './GlassCard'

interface VerificationModalProps {
  onClose: () => void
}

export default function VerificationModal({ onClose }: VerificationModalProps) {
  const [copied, setCopied] = useState(false)
  
  const telegramHandle = '@TradingbotSol_bot' // Replace with your actual Telegram
  const discordHandle = 'VIPTrading#1234' // Replace with your actual Discord

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
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
          <GlassCard className="relative overflow-hidden" glow="green">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-green to-primary-yellow rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-black" />
                </div>
                <h2 className="text-3xl font-bold text-gradient">Payment Successful!</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Success Message */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-primary-green/20 to-primary-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-primary-green animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Your payment has been processed!</h3>
                <p className="text-gray-300 text-lg">Now complete the verification process to get VIP access.</p>
              </motion.div>

              {/* Verification Steps */}
              <motion.div
                className="bg-gradient-to-br from-primary-green/10 to-primary-yellow/5 border border-primary-green/20 rounded-3xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-primary-green font-bold text-2xl mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Final Step: Verification
                </h3>
                
                <div className="space-y-6">
                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-green/10 to-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="w-10 h-10 bg-primary-green rounded-2xl flex items-center justify-center text-black font-bold flex-shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg mb-1">Take a Screenshot</p>
                      <p className="text-gray-300">Capture your wallet showing 1,000+ USDT balance clearly</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-yellow/10 to-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="w-10 h-10 bg-primary-yellow rounded-2xl flex items-center justify-center text-black font-bold flex-shrink-0">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg mb-1">Send DM with Proof</p>
                      <p className="text-gray-300">Message us on Telegram or Discord with your screenshot</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-purple/10 to-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="w-10 h-10 bg-primary-purple rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg mb-1">Get VIP Access</p>
                      <p className="text-gray-300">Receive your exclusive VIP channel invite within 24 hours</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h4 className="text-white font-bold text-xl flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary-purple" />
                  Contact Us:
                </h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary-purple/10 to-primary-purple/5 border border-primary-purple/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-purple/20 rounded-xl flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-primary-purple" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">Telegram</p>
                          <p className="text-primary-purple text-sm font-mono">{telegramHandle}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(telegramHandle)}
                        className="flex-1 bg-primary-purple/10 hover:bg-primary-purple/20 border border-primary-purple/30 rounded-xl py-2 px-3 transition-colors text-sm text-primary-purple font-medium flex items-center justify-center gap-2"
                        title="Copy handle"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      <a
                        href={`https://t.me/${telegramHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-primary-purple/10 hover:bg-primary-purple/20 border border-primary-purple/30 rounded-xl py-2 px-3 transition-colors text-sm text-primary-purple font-medium flex items-center justify-center gap-2"
                        title="Open Telegram"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open
                      </a>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary-yellow/10 to-primary-yellow/5 border border-primary-yellow/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-yellow/20 rounded-xl flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-primary-yellow" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">Discord</p>
                          <p className="text-primary-yellow text-sm font-mono">{discordHandle}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(discordHandle)}
                      className="w-full bg-primary-yellow/10 hover:bg-primary-yellow/20 border border-primary-yellow/30 rounded-xl py-2 px-3 transition-colors text-sm text-primary-yellow font-medium flex items-center justify-center gap-2"
                      title="Copy handle"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Handle
                    </button>
                  </div>
                </div>

                {copied && (
                  <motion.div
                    className="text-center bg-primary-green/10 border border-primary-green/20 rounded-xl py-3 px-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="text-primary-green font-semibold flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Copied to clipboard!
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Important Notice */}
              <motion.div
                className="bg-gradient-to-br from-primary-yellow/10 via-primary-orange/5 to-primary-red/10 border border-primary-yellow/30 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-yellow/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-primary-yellow" />
                  </div>
                  <div>
                    <h5 className="text-primary-yellow font-bold mb-2">Important Notice</h5>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Make sure your screenshot clearly shows your USDT balance and wallet address. 
                      Clear, complete screenshots ensure faster verification and quicker access to our VIP community.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <ModernButton
                  onClick={onClose}
                  variant="secondary"
                  className="w-full text-lg"
                  icon={<CheckCircle className="w-5 h-5" />}
                >
                  Got it, I'll send the proof!
                </ModernButton>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
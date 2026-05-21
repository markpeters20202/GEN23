'use client'

import { useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'

// Custom hook to handle notifications
export function useNotifications() {
  const { address, isConnected } = useAccount()
  const hasNotifiedVisit = useRef(false)
  const hasNotifiedConnection = useRef(false)
  const previousAddress = useRef<string | undefined>()

  // Send notification helper
  const sendNotification = async (type: 'visit' | 'wallet_connect' | 'payment', data?: any) => {
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          ...data
        })
      })
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  // Track page visits
  useEffect(() => {
    if (!hasNotifiedVisit.current) {
      sendNotification('visit')
      hasNotifiedVisit.current = true
    }
  }, [])

  // Track wallet connections
  useEffect(() => {
    if (isConnected && address && address !== previousAddress.current) {
      if (!hasNotifiedConnection.current || previousAddress.current !== address) {
        sendNotification('wallet_connect', { address })
        hasNotifiedConnection.current = true
        previousAddress.current = address
      }
    }
  }, [isConnected, address])

  // Function to notify payment
  const notifyPayment = async (address: string, amount: string) => {
    await sendNotification('payment', { address, amount })
  }

  return {
    notifyPayment
  }
}
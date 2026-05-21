'use client'

import { useEffect } from 'react'

export default function MonitoringInitializer() {
  useEffect(() => {
    // Initialize contract monitoring when the app loads on client side
    const initializeMonitoring = async () => {
      try {
        const response = await fetch('/api/monitor', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          console.log('Contract monitoring initialized successfully')
        } else {
          console.warn('Failed to initialize contract monitoring:', response.status)
        }
      } catch (error) {
        console.warn('Failed to initialize contract monitoring:', error)
      }
    }

    // Delay initialization to avoid interfering with page load
    const timer = setTimeout(initializeMonitoring, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  // This component doesn't render anything
  return null
}
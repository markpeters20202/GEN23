'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

interface StatsCounterProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  label: string
  icon?: React.ReactNode
}

export default function StatsCounter({ 
  end, 
  duration = 2, 
  prefix = '', 
  suffix = '', 
  label,
  icon 
}: StatsCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let startTime: number
      let animationFrame: number

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
        
        setCount(Math.floor(progress * end))
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        }
      }

      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    }
  }, [isInView, end, duration])

  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Render static version on server
  if (!mounted) {
    return (
      <div ref={ref} className="text-center">
        {icon && (
          <div className="text-primary-yellow mb-2 flex justify-center">
            {icon}
          </div>
        )}
        <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
          {prefix}{end.toLocaleString()}{suffix}
        </div>
        <div className="text-gray-300 text-sm font-medium">{label}</div>
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 1, scale: 1 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {icon && (
        <div className="text-primary-yellow mb-2 flex justify-center">
          {icon}
        </div>
      )}
      <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-300 text-sm font-medium">{label}</div>
    </motion.div>
  )
}
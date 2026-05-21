'use client'

import { motion } from 'framer-motion'
import { ReactNode, useState, useEffect } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'yellow' | 'green' | 'purple' | 'none'
}

export default function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  glow = 'none'
}: GlassCardProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const glowClasses = {
    yellow: 'hover:shadow-primary-yellow/20 hover:border-primary-yellow/30',
    green: 'hover:shadow-primary-green/20 hover:border-primary-green/30',
    purple: 'hover:shadow-primary-purple/20 hover:border-primary-purple/30',
    none: ''
  }

  // Render static card on server, animated on client
  if (!mounted) {
    return (
      <div className={`card-glass ${glowClasses[glow]} ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={`card-glass ${hover ? 'hover:scale-105' : ''} ${glowClasses[glow]} ${className}`}
      initial={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -5 } : {}}
    >
      {children}
    </motion.div>
  )
}
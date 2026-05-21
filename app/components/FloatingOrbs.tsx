'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function FloatingOrbs() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Yellow orb */}
      <motion.div
        className="floating-orb w-96 h-96 bg-primary-yellow/10 top-20 -left-48"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Green orb */}
      <motion.div
        className="floating-orb w-80 h-80 bg-primary-green/10 top-1/2 -right-40"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />
      
      {/* Purple orb */}
      <motion.div
        className="floating-orb w-64 h-64 bg-primary-purple/10 bottom-20 left-1/4"
        animate={{
          x: [0, 120, 0],
          y: [0, -80, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10
        }}
      />
      
      {/* Small accent orbs */}
      <motion.div
        className="floating-orb w-32 h-32 bg-primary-cyan/5 top-1/4 left-3/4"
        animate={{
          x: [0, -60, 0],
          y: [0, 40, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="floating-orb w-24 h-24 bg-primary-blue/5 bottom-1/3 right-1/4"
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 7
        }}
      />
    </div>
  )
}
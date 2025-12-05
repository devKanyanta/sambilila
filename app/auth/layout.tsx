'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { colors, gradients, theme } from '@/lib/theme'
import { FiArrowLeft, FiSmartphone, FiLock, FiHelpCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Check if mobile on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    setIsLoaded(true)
    
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Mouse move effect for background
  useEffect(() => {
    if (isMobile) return
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMobile])

  // Theme-based styles
  const styles = {
    background: {
      main: theme.backgrounds.subtle, // Using linen texture
      card: theme.backgrounds.card,
      sidebar: theme.backgrounds.sidebar,
      navbar: theme.backgrounds.navbar,
    },
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary,
      light: theme.text.light,
      inverted: theme.text.inverted,
      accent: theme.text.accent,
      dark: theme.text.light,
    },
    border: {
      light: theme.borders.light,
      medium: theme.borders.medium,
      dark: theme.borders.dark,
      accent: theme.borders.accent,
    },
    shadow: theme.shadows,
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-6 relative overflow-hidden"
      style={{ backgroundColor: theme.surfaces.linen }}
    >
      {/* Animated background with theme colors */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Mouse-following gradient (desktop only) */}
        {!isMobile && (
          <div className="absolute inset-0"
            style={{
              background: `radial-gradient(800px at ${mousePosition.x}px ${mousePosition.y}px, ${colors.primary[100]}15, transparent 70%)`
            }}
          />
        )}

        {/* Static texture overlay */}
        <div className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 50%, ${colors.accent[50]} 100%)`
          }}
        />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(${colors.primary[300]}20 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Animated floating shapes */}
        <motion.div 
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: colors.primary[300] }}
        />
        
        <motion.div 
          animate={{ 
            y: [30, 0, 30],
            rotate: [10, 0, 10],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"
          style={{ backgroundColor: colors.secondary[300] }}
        />

        <motion.div 
          animate={{ 
            x: [0, 20, 0],
            y: [20, 0, 20]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-3/4 left-1/3 w-48 h-48 rounded-full opacity-5 blur-3xl"
          style={{ backgroundColor: colors.accent[300] }}
        />
      </div>

      <div className="w-full max-w-md md:max-w-lg relative">
        {/* Header with animated back link */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-8"
        >
          <motion.div
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/" 
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden"
              style={{ 
                color: colors.neutral[600],
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${colors.neutral[200]}`,
                boxShadow: theme.shadows.sm
              }}
            >
              {/* Background effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: gradients.subtle }}
              />
              
              <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 relative z-10" 
                style={{ color: colors.primary[600] }}
              />
              <span className="relative z-10 font-medium" style={{ color: colors.neutral[700] }}>
                Back to Home
              </span>
            </Link>
          </motion.div>
          
          {/* Logo/Brand with theme colors */}
          
        </motion.div>

        {/* Auth form container with glass morphism effect */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.7, 
            delay: 0.3,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ boxShadow: theme.shadows.colored.primary }}
          className="rounded-2xl md:rounded-3xl p-6 md:p-8 relative overflow-hidden border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            borderColor: colors.neutral[200],
            borderWidth: '1.5px',
            boxShadow: theme.shadows.lg
          }}
        >
          {/* Decorative accent border */}
          <div className="absolute top-0 left-0 right-0 h-1.5"
            style={{ background: gradients.primary }}
          />
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 rounded-br-lg"
            style={{ backgroundColor: colors.primary[400] }}
          />
          <div className="absolute top-0 right-0 w-3 h-3 rounded-bl-lg"
            style={{ backgroundColor: colors.secondary[400] }}
          />
          
          {/* Content */}
          <div className="relative">
            {children}
          </div>
          
        </motion.div>

        {/* Security and help section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 md:mt-8 space-y-4"
        >
          {/* Security badge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${colors.neutral[200]}`,
                boxShadow: theme.shadows.sm
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  backgroundColor: colors.success[100],
                  color: colors.success[600]
                }}
              >
                <FiLock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: colors.neutral[700] }}>
                  Secure & encrypted
                </p>
                <p className="text-xs" style={{ color: colors.neutral[500] }}>
                  Your data is protected
                </p>
              </div>
            </div>

            {/* Help link */}
            <a 
              href="mailto:support@studysaas.com" 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: colors.accent[50],
                color: colors.accent[700],
                border: `1px solid ${colors.accent[200]}`,
                boxShadow: theme.shadows.sm
              }}
            >
              <FiHelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Need help?</span>
            </a>
          </div>

          {/* Additional info */}
          <div className="text-center">
            <p className="text-xs md:text-sm" style={{ color: colors.neutral[500] }}>
              By continuing, you agree to our{' '}
              <a href="/terms" className="font-medium hover:underline" style={{ color: colors.primary[600] }}>
                Terms
              </a>
              {' '}and{' '}
              <a href="/privacy" className="font-medium hover:underline" style={{ color: colors.primary[600] }}>
                Privacy Policy
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-40 md:h-64 overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full"
          style={{ backgroundColor: colors.primary[400] }}
        />
        
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.04, 0.02, 0.04]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full"
          style={{ backgroundColor: colors.secondary[400] }}
        />
      </div>

      {/* Loading animation */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: theme.backgrounds.main }}
        >
          <div className="w-16 h-16 rounded-2xl animate-pulse"
            style={{ background: gradients.primary }}
          />
        </div>
      )}
    </div>
  )
}
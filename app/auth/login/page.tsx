'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { colors, gradients, theme } from '@/lib/theme'
import { FiMail, FiLock, FiBook, FiUsers, FiTrendingUp, FiArrowRight, FiShield } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function Login() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
    
    // Clear server error when user interacts
    if (serverError) {
      setServerError(null)
    }
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setServerError(null)
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.message || 'Login failed')
        return
      }

      // Save token
      localStorage.setItem('token', data.token)

      // Show success animation before redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 800)

    } catch (error) {
      console.error('Login failed:', error)
      setServerError('Server error. Try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (role: 'student' | 'teacher') => {
    setFormData({
      email: `${role}@demo.com`,
      password: 'password123',
      rememberMe: false
    })
    // Auto-submit after a short delay
    setTimeout(() => {
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement
      if (submitButton) submitButton.click()
    }, 300)
  }

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6 md:mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold" style={{ color: theme.text.primary }}>
          Welcome back
        </h2>
        <p className="mt-2 text-sm md:text-base" style={{ color: theme.text.secondary }}>
          Sign in to your account to continue learning
        </p>
      </motion.div>

      {/* Server error */}
      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl flex items-center gap-3"
          style={{ 
            backgroundColor: colors.error[50],
            border: `1px solid ${colors.error[200]}`,
            color: colors.error[700]
          }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: colors.error[100] }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm md:text-base">{serverError}</p>
          </div>
        </motion.div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
            Email address
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <FiMail className="w-5 h-5" style={{ color: colors.neutral[400] }} />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                errors.email ? 'border-red-300' : 'border-neutral-200 focus:border-primary-400'
              }`}
              style={{
                backgroundColor: errors.email ? colors.error[50] : 'rgba(255, 255, 255, 0.9)',
                borderColor: errors.email ? colors.error[300] : colors.neutral[200],
                color: theme.text.primary,
                boxShadow: theme.shadows.sm
              }}
              placeholder="Enter your email"
            />
            {errors.email && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm px-1"
                style={{ color: colors.error[600] }}
              >
                {errors.email}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Password */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium" style={{ color: theme.text.primary }}>
              Password
            </label>
            <Link 
              href="/auth/forgot-password" 
              className="text-sm font-medium hover:underline transition-all"
              style={{ color: colors.primary[600] }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <FiLock className="w-5 h-5" style={{ color: colors.neutral[400] }} />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                errors.password ? 'border-red-300' : 'border-neutral-200 focus:border-primary-400'
              }`}
              style={{
                backgroundColor: errors.password ? colors.error[50] : 'rgba(255, 255, 255, 0.9)',
                borderColor: errors.password ? colors.error[300] : colors.neutral[200],
                color: theme.text.primary,
                boxShadow: theme.shadows.sm
              }}
              placeholder="Enter your password"
            />
            {errors.password && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm px-1"
                style={{ color: colors.error[600] }}
              >
                {errors.password}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Remember Me */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.2 }}
          className="flex items-center space-x-3"
        >
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-5 w-5 rounded border-2 focus:ring-2 focus:ring-offset-2 transition-all duration-300"
            style={{
              backgroundColor: formData.rememberMe ? colors.primary[500] : 'white',
              borderColor: formData.rememberMe ? colors.primary[500] : colors.neutral[300],
            }}
          />
          <label htmlFor="rememberMe" className="text-sm" style={{ color: theme.text.secondary }}>
            Remember me for 30 days
          </label>
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              background: gradients.primary,
              color: theme.text.inverted,
              boxShadow: theme.shadows.md
            }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                Sign in to your account
                <FiArrowRight className="inline-block ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Divider */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="my-6 flex items-center"
      >
        <div className="flex-grow h-px" style={{ backgroundColor: colors.neutral[200] }} />
        <span className="mx-4 text-sm" style={{ color: theme.text.secondary }}>Don't have an account?</span>
        <div className="flex-grow h-px" style={{ backgroundColor: colors.neutral[200] }} />
      </motion.div>

      {/* Register Link */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Link 
          href="/auth/register" 
          className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 border hover:shadow-md"
          style={{ 
            backgroundColor: colors.neutral[50],
            color: colors.primary[600],
            borderColor: colors.neutral[200]
          }}
        >
          Create new account
        </Link>
      </motion.div>

      {/* Security Note */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 p-3 rounded-lg flex items-center justify-center gap-2 text-xs"
        style={{ 
          backgroundColor: colors.neutral[100],
          color: colors.neutral[600]
        }}
      >
        <FiShield className="w-3 h-3" />
        <span>Your data is secured with 256-bit SSL encryption</span>
      </motion.div>

    </div>
  )
}
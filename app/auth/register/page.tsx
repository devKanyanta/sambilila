'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { colors, gradients, theme } from '@/lib/theme'
import { FiUser, FiMail, FiLock, FiCheck, FiBookOpen, FiUsers, FiTrendingUp, FiBarChart2 } from 'react-icons/fi'
import { motion } from 'framer-motion'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  userType: 'STUDENT' | 'TEACHER'
  agreeToTerms: boolean
}

export default function Register() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'STUDENT',
    agreeToTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
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

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = true
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: formData.userType
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.message || 'Registration failed')
        return
      }

      // Save token
      localStorage.setItem('token', data.token)

      // Show success animation before redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)

    } catch (error) {
      console.error(error)
      setServerError('Server error. Try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
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
          Create your account
        </h2>
        <p className="mt-2 text-sm md:text-base" style={{ color: theme.text.secondary }}>
          Join thousands of students and teachers using Sambilila
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

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User Type Selection */}
        {/* <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <label className="block text-sm font-medium mb-3" style={{ color: theme.text.primary }}>
            I am a...
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                value: 'STUDENT',
                label: 'STUDENT',
                description: 'Learn and study',
                icon: '🎓',
                color: colors.primary,
                gradient: gradients.primary
              },
              {
                value: 'TEACHER',
                label: 'TEACHER',
                description: 'Teach and create',
                icon: '👨‍🏫',
                color: colors.secondary,
                gradient: gradients.warm
              }
            ].map((type) => (
              <label
                key={type.value}
                className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                  formData.userType === type.value 
                    ? 'scale-[1.02] shadow-lg ring-2 ring-offset-2' 
                    : 'hover:scale-[1.01] hover:shadow-md'
                }`}
                style={{
                  backgroundColor: formData.userType === type.value ? `${type.color[50]}E6` : 'rgba(255, 255, 255, 0.8)',
                  borderColor: formData.userType === type.value ? type.color[400] : colors.neutral[200],
                  borderWidth: '2px',
                  boxShadow: formData.userType === type.value ? theme.shadows.md : 'none',
                }}
              >
                <input
                  type="radio"
                  name="userType"
                  value={type.value}
                  checked={formData.userType === type.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-2xl md:text-3xl mr-3">{type.icon}</div>
                    <div className="text-left">
                      <p className="font-semibold" style={{ color: theme.text.primary }}>
                        {type.label}
                      </p>
                      <p className="text-xs md:text-sm mt-0.5" style={{ color: theme.text.secondary }}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                  {formData.userType === type.value && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: type.color[400],
                        color: 'white'
                      }}
                    >
                      <FiCheck className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </motion.div> */}

        {/* Full Name */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
          <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
            Full name
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <FiUser className="w-5 h-5" style={{ color: colors.neutral[400] }} />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-neutral-200 focus:border-primary-400'
              }`}
              style={{
                backgroundColor: errors.name ? colors.error[50] : 'rgba(255, 255, 255, 0.9)',
                borderColor: errors.name ? colors.error[300] : colors.neutral[200],
                color: theme.text.primary,
                boxShadow: theme.shadows.sm
              }}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm px-1"
                style={{ color: colors.error[600] }}
              >
                {errors.name}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Email */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
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
                errors.email ? 'border-red-300 bg-red-50' : 'border-neutral-200 focus:border-primary-400'
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
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
          <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
            Password
          </label>
          <div className="relative">
             <div className="absolute left-3 top-1/3 transform -translate-y-1/2">
              <FiLock className="w-5 h-5" style={{ color: colors.neutral[400] }} />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                errors.password ? 'border-red-300 bg-red-50' : 'border-neutral-200 focus:border-primary-400'
              }`}
              style={{
                backgroundColor: errors.password ? colors.error[50] : 'rgba(255, 255, 255, 0.9)',
                borderColor: errors.password ? colors.error[300] : colors.neutral[200],
                color: theme.text.primary,
                boxShadow: theme.shadows.sm
              }}
              placeholder="Create a password"
            />
            {errors.password ? (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm px-1"
                style={{ color: colors.error[600] }}
              >
                {errors.password}
              </motion.p>
            ) : (
              <p className="mt-2 text-xs px-1" style={{ color: theme.text.secondary }}>
                Must be at least 6 characters
              </p>
            )}
          </div>
        </motion.div>

        {/* Confirm Password */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.4 }}>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
            Confirm password
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <FiLock className="w-5 h-5" style={{ color: colors.neutral[400] }} />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-neutral-200 focus:border-primary-400'
              }`}
              style={{
                backgroundColor: errors.confirmPassword ? colors.error[50] : 'rgba(255, 255, 255, 0.9)',
                borderColor: errors.confirmPassword ? colors.error[300] : colors.neutral[200],
                color: theme.text.primary,
                boxShadow: theme.shadows.sm
              }}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm px-1"
                style={{ color: colors.error[600] }}
              >
                {errors.confirmPassword}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Terms and Conditions */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.5 }}
          className="flex items-start space-x-3"
        >
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="h-5 w-5 rounded border-2 focus:ring-2 focus:ring-offset-2 mt-0.5 transition-all duration-300"
            style={{
              backgroundColor: formData.agreeToTerms ? colors.primary[500] : 'white',
              borderColor: formData.agreeToTerms ? colors.primary[500] : colors.neutral[300],
            }}
          />
          <label htmlFor="agreeToTerms" className="text-sm" style={{ color: theme.text.secondary }}>
            I agree to the{' '}
            <Link href="/terms" className="font-medium hover:underline" style={{ color: colors.primary[600] }}>
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium hover:underline" style={{ color: colors.primary[600] }}>
              Privacy Policy
            </Link>
          </label>
        </motion.div>
        {errors.agreeToTerms && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm"
            style={{ color: colors.error[600] }}
          >
            You must agree to the terms and conditions
          </motion.p>
        )}

        {/* Submit Button */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.6 }}>
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
                <span>Creating account...</span>
              </div>
            ) : (
              <>
                Create account
                <FiCheck className="inline-block ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Divider */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="my-6 flex items-center"
      >
        <div className="flex-grow h-px" style={{ backgroundColor: colors.neutral[200] }} />
        <span className="mx-4 text-sm" style={{ color: theme.text.secondary }}>Already have an account?</span>
        <div className="flex-grow h-px" style={{ backgroundColor: colors.neutral[200] }} />
      </motion.div>

      {/* Login Link */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <Link 
          href="/auth/login" 
          className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 border hover:shadow-md"
          style={{ 
            backgroundColor: colors.neutral[50],
            color: colors.primary[600],
            borderColor: colors.neutral[200]
          }}
        >
          Sign in to your account
        </Link>
      </motion.div>
    </div>
  )
}
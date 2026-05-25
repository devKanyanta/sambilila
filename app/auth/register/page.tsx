'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { colors, gradients, theme } from '@/lib/theme'
import { FiUser, FiMail, FiLock, FiCheck, FiArrowRight } from 'react-icons/fi'
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
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    if (serverError) setServerError(null)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.agreeToTerms) newErrors.agreeToTerms = true
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
        headers: { 'Content-Type': 'application/json' },
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
      localStorage.setItem('token', data.token)
      setTimeout(() => router.push('/dashboard'), 1000)
    } catch {
      setServerError('Server error. Try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-neutral-800">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Join thousands of students and teachers using Lernopia
        </p>
      </motion.div>

      {/* Server error */}
      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-medium text-red-700">{serverError}</p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Full name
          </label>
          <div className="relative">
            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="name" name="name" type="text" value={formData.name} onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.name
                  ? 'border-red-300 bg-red-50 focus:ring-red-400'
                  : 'border-neutral-200 bg-white focus:border-[#193827] focus:ring-[#193827]/20'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.name && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 text-xs text-red-500">
              {errors.name}
            </motion.p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="email" name="email" type="email" value={formData.email} onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.email
                  ? 'border-red-300 bg-red-50 focus:ring-red-400'
                  : 'border-neutral-200 bg-white focus:border-[#193827] focus:ring-[#193827]/20'
              }`}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 text-xs text-red-500">
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="password" name="password" type="password" value={formData.password} onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.password
                  ? 'border-red-300 bg-red-50 focus:ring-red-400'
                  : 'border-neutral-200 bg-white focus:border-[#193827] focus:ring-[#193827]/20'
              }`}
              placeholder="Create a password (min. 6 characters)"
            />
          </div>
          {errors.password && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 text-xs text-red-500">
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.confirmPassword
                  ? 'border-red-300 bg-red-50 focus:ring-red-400'
                  : 'border-neutral-200 bg-white focus:border-[#193827] focus:ring-[#193827]/20'
              }`}
              placeholder="Confirm your password"
            />
          </div>
          {errors.confirmPassword && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 text-xs text-red-500">
              {errors.confirmPassword}
            </motion.p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3">
          <input
            id="agreeToTerms" name="agreeToTerms" type="checkbox" checked={formData.agreeToTerms} onChange={handleChange}
            className="mt-0.5 h-4 w-4 rounded border-2 border-neutral-300 text-[#193827] focus:ring-[#193827]/30 transition-colors"
          />
          <label htmlFor="agreeToTerms" className="text-xs text-neutral-500">
            I agree to the{' '}
            <Link href="/terms" className="font-medium text-[#193827] hover:underline">Terms and Conditions</Link>
            {' '}and{' '}
            <Link href="/privacy" className="font-medium text-[#193827] hover:underline">Privacy Policy</Link>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-xs text-red-500">You must agree to the terms and conditions</p>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#ff5252' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creating account...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Create account
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-xs text-neutral-400">Already have an account?</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

      {/* Login link */}
      <Link
        href="/auth/login"
        className="block w-full py-2.5 px-4 rounded-xl text-sm font-medium text-center border-2 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
      >
        Sign in to your account
      </Link>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSubmitted(true)
    } catch (error) {
      console.error('Password reset failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#193827]/10 flex items-center justify-center mx-auto mb-5">
          <FiCheck className="w-7 h-7 text-[#193827]" />
        </div>
        <h2 className="text-xl font-heading font-semibold text-neutral-800 mb-2">
          Check your email
        </h2>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          We've sent a password reset link to{' '}
          <span className="font-medium text-neutral-700">{email}</span>
        </p>
        <div className="space-y-3">
          <button
            onClick={() => { setIsSubmitted(false); setEmail('') }}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-md active:scale-[0.98]"
            style={{ backgroundColor: '#ff5252' }}
          >
            Send another link
          </button>
          <Link
            href="/auth/login"
            className="block w-full py-2.5 px-4 rounded-xl text-sm font-medium border-2 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
          >
            Return to sign in
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-neutral-800">
          Forgot password?
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Enter your email and we'll send you a reset link
        </p>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-neutral-200 bg-white text-sm outline-none transition-all duration-200 focus:border-[#193827] focus:ring-2 focus:ring-[#193827]/20"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading || !email}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#ff5252' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sending reset link...</span>
            </div>
          ) : (
            'Send reset link'
          )}
        </motion.button>
      </form>
    </div>
  )
}

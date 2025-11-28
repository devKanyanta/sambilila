'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return

    setIsLoading(true)
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Password reset requested for:', email)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Password reset failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-600 mb-6">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <div className="space-y-3">
          <button
            onClick={() => {
              setIsSubmitted(false)
              setEmail('')
            }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to login
          </button>
          <Link
            href="/auth/login"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            StudySaaS
          </h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Forgot password?</h2>
        <p className="text-gray-600 mt-2">Enter your email to reset your password</p>
      </div>

      {/* Reset Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter your email"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sending reset link...</span>
            </div>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-blue-600 font-medium hover:text-blue-500">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name as keyof typeof errors]) setErrors(prev => ({ ...prev, [name]: undefined }))
    if (serverError) setServerError(null)
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Must be at least 6 characters'
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password, rememberMe: formData.rememberMe })
      })
      const data = await res.json()
      if (!res.ok) { setServerError(data.message || 'Login failed'); return }
      localStorage.setItem('token', data.token)
      setTimeout(() => router.push('/dashboard'), 500)
    } catch {
      setServerError('Server error. Try again later.')
    } finally { setIsLoading(false) }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-semibold text-neutral-800">Welcome back</h2>
        <p className="text-sm text-neutral-500 mt-1">Sign in to your account to continue learning</p>
      </div>

      {serverError && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="email" name="email" type="email" value={formData.email} onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.email ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-neutral-200 bg-white focus:ring-[#ff5252]/20 focus:border-[#ff5252]'
              }`}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</label>
            <Link href="/auth/forgot-password" className="text-xs text-neutral-500 hover:text-[#ff5252] transition-colors">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="password" name="password" type="password" value={formData.password} onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.password ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-neutral-200 bg-white focus:ring-[#ff5252]/20 focus:border-[#ff5252]'
              }`}
              placeholder="Enter your password"
            />
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange}
            className="w-4 h-4 rounded border-neutral-300 text-[#ff5252] focus:ring-[#ff5252]/20"
          />
          <span className="text-sm text-neutral-500">Remember me for 30 days</span>
        </label>

        <button
          type="submit" disabled={isLoading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[#ff5252] hover:bg-[#fc0b06] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Sign in <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-xs text-neutral-400">Don&apos;t have an account?</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

      <Link
        href="/auth/register"
        className="block w-full text-center py-2.5 rounded-xl text-sm font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-all"
      >
        Create new account
      </Link>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Your data is secured with 256-bit SSL encryption</span>
      </div>
    </div>
  )
}

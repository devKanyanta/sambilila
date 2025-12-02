'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {

  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
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
        password: formData.password
      })
    })

    const data = await res.json()

    if (!res.ok) {
      setServerError(data.message || 'Login failed')
      return
    }

    // Save token
    localStorage.setItem('token', data.token)

    // Redirect user
    router.push('/dashboard')
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
      password: 'password123'
    })
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
        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account to continue learning</p>
      </div>

      {/* Demo Login Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => handleDemoLogin('student')}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <span className="text-lg">🎓</span>
          <span className="text-sm font-medium">Demo Student</span>
        </button>
        <button
          onClick={() => handleDemoLogin('teacher')}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50"
        >
          <span className="text-lg">👨‍🏫</span>
          <span className="text-sm font-medium">Demo Teacher</span>
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me for 30 days
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign in to your account'
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 font-medium hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>

      {/* Features Preview */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 text-center mb-4">Start learning with AI-powered tools</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="text-center">
            <div className="text-2xl mb-1">🎴</div>
            <p className="text-xs text-gray-600">Flashcards</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🧩</div>
            <p className="text-xs text-gray-600">Quizzes</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📊</div>
            <p className="text-xs text-gray-600">Progress</p>
          </div>
        </div>
      </div>
    </div>
  )
}
// app/hooks/useDonations.ts — Frontend donation flow
'use client'

import { useState, useCallback } from 'react'

export interface CreateDonationParams {
  amountUSD: number
  provider: 'PAYPAL' | 'LENCO'
  message?: string
  isAnonymous?: boolean
  phone?: string
  operator?: string
  country?: string
}

export interface CreateDonationResult {
  approvalUrl?: string
  reference?: string
  message?: string
}

export function useDonations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (params: CreateDonationParams): Promise<CreateDonationResult | null> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setError('Session not ready — please try again')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(params),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'Failed to start donation')
        return null
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start donation')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyLenco = useCallback(async (reference: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/donations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return data.error || null

      if (data.paymentStatus === 'completed') return 'COMPLETED'
      if (data.paymentStatus === 'failed' || data.paymentStatus === 'cancelled') return 'FAILED'
      return data.paymentStatus || 'PENDING'
    } catch {
      return 'PENDING'
    }
  }, [])

  const capturePayPal = useCallback(async (orderId: string): Promise<boolean> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return false

    try {
      const res = await fetch('/api/donations/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json().catch(() => ({}))
      return res.ok && (data.success || data.alreadyCaptured)
    } catch {
      return false
    }
  }, [])

  return { create, verifyLenco, capturePayPal, isLoading, error, clearError: () => setError(null) }
}

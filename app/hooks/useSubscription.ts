// app/hooks/useSubscription.ts — Frontend subscription hook

'use client'

import { useState, useEffect, useCallback } from 'react'

export interface PlanInfo {
  id: string
  name: string
  slug: string
  priceUSD: number
  period: string
  description: string
  features: string[]
  limits: {
    maxQuizzesPerWeek: number | null
    maxFlashcardsTotal: number | null
    maxQuestionsPerQuiz: number | null
    priorityProcessing: boolean
    progressTracking: boolean
  }
  highlighted: boolean
}

export interface SubscriptionInfo {
  id: string
  plan: {
    id: string
    name: string
    slug: string
    priceUSD: number
    period: string
    limits: any
  }
  status: string
  provider: string
  currentPeriodEnd: string | null
  canceledAt: string | null
}

export interface UsageInfo {
  quizzesCreatedThisWeek: number
  flashcardsCreated: number
  limits: {
    maxQuizzesPerWeek: number | null
    maxFlashcardsTotal: number | null
    maxQuestionsPerQuiz: number | null
  }
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [plans, setPlans] = useState<PlanInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const refresh = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const [myRes, usageRes, plansRes] = await Promise.all([
        fetch('/api/subscriptions/my', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/subscriptions/usage', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/subscriptions/plans'),
      ])

      if (myRes.ok) {
        const myData = await myRes.json()
        setSubscription(myData.subscription)
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json()
        setUsage(usageData)
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json()
        setPlans(plansData.plans)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subscription data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const upgrade = useCallback(
    async (
      planSlug: string,
      provider: 'PAYPAL' | 'LENCO',
      phone?: string,
      operator?: string
    ): Promise<{ approvalUrl?: string; message?: string; reference?: string }> => {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')

      if (provider === 'PAYPAL') {
        const res = await fetch('/api/subscriptions/paypal/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planSlug }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to create subscription')
        }

        const data = await res.json()
        return { approvalUrl: data.approvalUrl }
      } else {
        // Lenco mobile money
        const res = await fetch('/api/subscriptions/lenco/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planSlug, phone, operator }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to initiate payment')
        }

        const data = await res.json()
        return { reference: data.reference, message: 'Payment initiated. Check your phone to complete the transaction.' }
      }
    },
    []
  )

  const verifyPayment = useCallback(
    async (reference: string): Promise<{ paymentStatus: string; subscriptionStatus: string; message: string }> => {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')

      const res = await fetch('/api/subscriptions/lenco/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reference }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Verification failed')
      }

      const data = await res.json()
      return data
    },
    [],
  )

  const cancel = useCallback(async () => {
    const token = getToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch('/api/subscriptions/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to cancel subscription')
    }

    await refresh()
  }, [refresh])

  return {
    subscription,
    usage,
    plans,
    isLoading,
    error,
    refresh,
    upgrade,
    verifyPayment,
    cancel,
    isOnFreePlan: !subscription,
    planSlug: subscription?.plan?.slug || 'free',
  }
}

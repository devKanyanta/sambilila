// app/dashboard/admin/analytics/hooks/useAnalytics.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { AnalyticsStats, TimeRange } from '../types'

const POLL_INTERVAL_MS = 30000 // 30 seconds for realtime data

export function useAnalytics() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<TimeRange>('7d')
  const [isOffline, setIsOffline] = useState(false)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  const fetchStats = useCallback(async (currentRange: TimeRange) => {
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(`/api/admin/analytics?range=${currentRange}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        if (res.status === 503) {
          setIsOffline(true)
          setError('Analytics server is temporarily unavailable')
        } else {
          throw new Error('Failed to fetch analytics')
        }
        return
      }

      const data = await res.json()
      setStats(data)
      setIsOffline(false)
      setError(null)
    } catch (err) {
      setIsOffline(true)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    setLoading(true)
    fetchStats(range)
  }, [range, fetchStats])

  // Polling for realtime updates
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)

    pollRef.current = setInterval(() => {
      fetchStats(range)
    }, POLL_INTERVAL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [range, fetchStats])

  const changeRange = useCallback((newRange: TimeRange) => {
    setRange(newRange)
    setLoading(true)
  }, [])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchStats(range)
  }, [range, fetchStats])

  return {
    stats,
    loading,
    error,
    range,
    isOffline,
    changeRange,
    refresh,
  }
}

// app/dashboard/admin/hooks/useAdminDashboard.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminStats, UsersResponse, UserDetail, AdminUser } from '../types/admin'

interface Filters {
  search: string
  plan: string
  status: string
  userType: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export function useAdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [summary, setSummary] = useState({ totalUsers: 0, activeSubscriptions: 0, suspendedUsers: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // User detail modal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [userDetailLoading, setUserDetailLoading] = useState(false)

  // Filters
  const [filters, setFilters] = useState<Filters>({
    search: '',
    plan: '',
    status: '',
    userType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // Plans
  const [plans, setPlans] = useState<Array<{ id: string; name: string; slug: string; priceUSD: number; period: string }>>([])

  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  // Check admin status on mount
  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('/api/admin/check', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.isAdmin) {
        router.push('/dashboard')
        return
      }
      setIsAdmin(true)
      // Load initial data
      loadStats()
      loadUsers()
      loadPlans()
    } catch {
      router.push('/dashboard')
    }
  }

  const loadStats = async () => {
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err)
    }
  }

  const loadPlans = async () => {
    try {
      const res = await fetch('/api/subscriptions/plans')
      if (res.ok) {
        const data = await res.json()
        setPlans(data.plans || [])
      }
    } catch (err) {
      console.error('Failed to load plans:', err)
    }
  }

  const loadUsers = useCallback(async (page = 1) => {
    const token = getToken()
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '20')
      if (filters.search) params.set('search', filters.search)
      if (filters.plan) params.set('plan', filters.plan)
      if (filters.status) params.set('status', filters.status)
      if (filters.userType) params.set('userType', filters.userType)
      if (filters.sortBy) params.set('sortBy', filters.sortBy)
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        if (res.status === 403) {
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to load users')
      }

      const data: UsersResponse = await res.json()
      setUsers(data.users)
      setPagination(data.pagination)
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [filters, router])

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      loadUsers(1)
    }, 300)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [filters.search, filters.plan, filters.status, filters.userType, filters.sortBy, filters.sortOrder, loadUsers])

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key as keyof Filters]: value }))
  }

  const handleSort = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }))
  }

  const handlePageChange = (page: number) => {
    loadUsers(page)
  }

  // User detail
  const loadUserDetail = async (userId: string) => {
    const token = getToken()
    if (!token) return

    setUserDetailLoading(true)
    setSelectedUserId(userId)

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUserDetail(data)
      }
    } catch (err) {
      console.error('Failed to load user detail:', err)
    } finally {
      setUserDetailLoading(false)
    }
  }

  const closeUserDetail = () => {
    setSelectedUserId(null)
    setUserDetail(null)
  }

  // Actions
  const suspendUser = async (userId: string, suspended: boolean) => {
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ suspended }),
      })

      if (res.ok) {
        loadUsers(pagination.page)
        if (selectedUserId === userId) {
          loadUserDetail(userId)
        }
      } else {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update user')
      }
    } catch (err) {
      throw err
    }
  }

  const changeUserType = async (userId: string, userType: 'STUDENT' | 'TEACHER') => {
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userType }),
      })

      if (res.ok) {
        loadUsers(pagination.page)
        if (selectedUserId === userId) {
          loadUserDetail(userId)
        }
      } else {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update user')
      }
    } catch (err) {
      throw err
    }
  }

  const deleteUser = async (userId: string) => {
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(`/api/admin/users/${userId}?confirm=true`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        closeUserDetail()
        loadUsers(pagination.page)
        loadStats()
      } else {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete user')
      }
    } catch (err) {
      throw err
    }
  }

  const changeUserPlan = async (userId: string, planSlug: string) => {
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'change-plan', planSlug }),
      })

      if (res.ok) {
        loadUsers(pagination.page)
        if (selectedUserId === userId) {
          loadUserDetail(userId)
        }
        loadStats()
      } else {
        const err = await res.json()
        throw new Error(err.error || 'Failed to change plan')
      }
    } catch (err) {
      throw err
    }
  }

  const cancelUserSubscription = async (userId: string) => {
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'cancel' }),
      })

      if (res.ok) {
        loadUsers(pagination.page)
        if (selectedUserId === userId) {
          loadUserDetail(userId)
        }
        loadStats()
      } else {
        const err = await res.json()
        throw new Error(err.error || 'Failed to cancel subscription')
      }
    } catch (err) {
      throw err
    }
  }

  return {
    isAdmin,
    stats,
    users,
    pagination,
    summary,
    loading,
    error,
    filters,
    plans,
    selectedUserId,
    userDetail,
    userDetailLoading,
    handleSearch,
    handleFilterChange,
    handleSort,
    handlePageChange,
    loadUserDetail,
    closeUserDetail,
    suspendUser,
    changeUserType,
    deleteUser,
    changeUserPlan,
    cancelUserSubscription,
    refresh: () => {
      loadStats()
      loadUsers(pagination.page)
    },
  }
}

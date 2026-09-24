// app/hooks/useSession.ts — Client-side session bootstrap
// Ensures every visitor silently has a working session (guest by default),
// and exposes helpers to check status, claim the guest account, and log out.

'use client'

import { useState, useEffect, useCallback } from 'react'

const TOKEN_KEY = 'token'

export interface SessionUser {
  id: string
  name: string
  isGuest: boolean
}

export function useSession() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const fetchProfile = useCallback(async (t: string) => {
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (res.ok) {
        const data = await res.json()
        return {
          id: data.user.id as string,
          name: data.user.name as string,
          isGuest: Boolean(data.user.isGuest),
        }
      }
      if (res.status === 401) return null // invalid token
      return undefined // transient error — don't clear token
    } catch {
      return undefined
    }
  }, [])

  const bootstrap = useCallback(async () => {
    const stored = localStorage.getItem(TOKEN_KEY)

    if (stored) {
      const profile = await fetchProfile(stored)
      if (profile) {
        setToken(stored)
        setUser(profile)
        setIsBootstrapping(false)
        return
      }
      if (profile === null) {
        // Token expired/invalid — fall through to create a fresh guest session
        localStorage.removeItem(TOKEN_KEY)
      }
      // profile === undefined → network error; keep token, retry later
      if (profile === undefined) {
        setToken(stored)
        setIsBootstrapping(false)
        return
      }
    }

    // No valid token — create a guest session
    try {
      const res = await fetch('/api/session/guest', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem(TOKEN_KEY, data.token)
        setToken(data.token)
        setUser({ id: data.user.id, name: data.user.name, isGuest: true })
      }
    } catch {
      // Offline — leave unauthenticated; components handle null token
    } finally {
      setIsBootstrapping(false)
    }
  }, [fetchProfile])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  /** Refresh the cached user from the server (e.g. after claiming). */
  const refresh = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY)
    if (!t) return
    const profile = await fetchProfile(t)
    if (profile) setUser(profile)
  }, [fetchProfile])

  /**
   * Claim the guest account: attach a real email/password while keeping all data.
   * Returns an error message on failure, or null on success.
   */
  const claimAccount = useCallback(
    async (email: string, password: string, name?: string): Promise<string | null> => {
      const t = localStorage.getItem(TOKEN_KEY)
      if (!t) return 'Not signed in'

      const res = await fetch('/api/session/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) return data.error || 'Failed to create account'

      await refresh()
      return null
    },
    [refresh]
  )

  /** Sign out of a claimed account and start a fresh guest session. */
  const signOut = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    await bootstrap()
  }, [bootstrap])

  return {
    token,
    user,
    isBootstrapping,
    isGuest: user?.isGuest ?? false,
    isClaimed: Boolean(user && !user.isGuest),
    claimAccount,
    signOut,
    refresh,
  }
}

export function getSessionToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ProfileResponse, 
  ProfileStatsResponse, 
  ProfileFormData, 
  PasswordFormData 
} from '../types/profile'

export const useProfile = () => {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [stats, setStats] = useState<ProfileStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form states
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    userType: 'STUDENT'
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  // Settings states
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    dailyReminders: true
  })

  // Get token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      router.push('/login')
      return
    }
    setToken(storedToken)
  }, [router])

  // Fetch profile data when token is available
  useEffect(() => {
    if (token) {
      fetchProfileData()
    }
  }, [token])

  const getAuthHeaders = useCallback(() => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, [token])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [profileRes, statsRes] = await Promise.all([
        fetch('/api/profile', { headers: getAuthHeaders() }),
        fetch('/api/profile/stats', { headers: getAuthHeaders() })
      ])

      if (profileRes.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      if (!profileRes.ok) {
        throw new Error('Failed to fetch profile')
      }

      const profileData = await profileRes.json()
      setProfile(profileData)

      if (profileData.user) {
        setProfileForm({
          name: profileData.user.name,
          userType: profileData.user.userType
        })
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      setSuccess(null)

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileForm),
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const data = await res.json()
      setProfile(prev => prev ? {
        ...prev,
        user: { ...prev.user, ...data.user }
      } : null)

      setSuccess('Profile updated successfully')
      setEditingProfile(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingAvatar(true)
      setError(null)
      setSuccess(null)

      const formData = new FormData()
      formData.append('avatar', file)

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to upload avatar')
      }

      const data = await res.json()
      setProfile(prev => prev ? {
        ...prev,
        user: { ...prev.user, avatar: data.avatar }
      } : null)

      setSuccess('Avatar updated successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      setError(null)
      setSuccess(null)

      const res = await fetch('/api/profile/avatar', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to remove avatar')
      }

      setProfile(prev => prev ? {
        ...prev,
        user: { ...prev.user, avatar: null }
      } : null)

      setSuccess('Avatar removed successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      setSuccess(null)

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('New passwords do not match')
      }

      const res = await fetch('/api/profile/password', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordForm),
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to change password')
      }

      setSuccess('Password changed successfully')
      setChangingPassword(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingAccount(true)
      setError(null)

      const res = await fetch('/api/profile?confirm=true', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete account')
      }

      localStorage.removeItem('token')
      window.location.href = '/'
    } catch (err) {
      setDeletingAccount(false)
      setError(err instanceof Error ? err.message : 'Failed to delete account')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return {
    token,
    profile,
    stats,
    loading,
    error,
    success,
    editingProfile,
    setEditingProfile,
    profileForm,
    setProfileForm,
    changingPassword,
    setChangingPassword,
    passwordForm,
    setPasswordForm,
    uploadingAvatar,
    deletingAccount,
    settings,
    fetchProfileData,
    handleUpdateProfile,
    handleAvatarUpload,
    handleRemoveAvatar,
    handleChangePassword,
    handleDeleteAccount,
    handleLogout,
    handleSettingToggle,
    formatDate,
    formatStudyTime
  }
}
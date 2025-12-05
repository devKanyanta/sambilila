'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { colors, gradients, theme } from '@/lib/theme'

interface ProfileResponse {
  user: {
    id: string
    email: string
    name: string
    avatar: string | null
    userType: 'STUDENT' | 'TEACHER'
    createdAt: string
    updatedAt: string
    _count: {
      flashcardSets: number
      quizResults: number
      studySessions: number
      quizzes: number
    }
  }
  stats: {
    totalQuizzes: number
    totalFlashcardSets: number
    totalQuizAttempts: number
    totalStudySessions: number
    averageScore: number
  }
  recentActivity: {
    quizResults: Array<{
      id: string
      score: number
      totalQuestions: number
      completedAt: string
      quiz: {
        title: string
        subject: string
      }
    }>
    studySessions: Array<{
      id: string
      duration: number
      cardsStudied: number
      correctAnswers: number
      sessionType: string
      startedAt: string
      endedAt: string | null
    }>
  }
}

interface ProfileStatsResponse {
  counts: {
    flashcardSets: number
    quizzes: number
    quizAttempts: number
    studySessions: number
  }
  performance: {
    averageScore: number
    totalQuizAttempts: number
    totalStudyTime: number
    totalCardsStudied: number
    cardsPerMinute: number
  }
  streaks: {
    currentStreak: number
    longestStreak: number
    daysActiveLast30: number
  }
  activityPatterns: {
    byDayOfWeek: number[]
    mostActiveSubject: { subject: string; count: number } | null
    preferredSessionType: Record<string, number>
  }
}

interface ProfileFormData {
  name: string
  userType: 'STUDENT' | 'TEACHER'
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function Profile() {
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

  // Theme-based styles
  const styles = {
    background: {
      main: theme.backgrounds.main,
      card: theme.backgrounds.card,
      sidebar: theme.backgrounds.sidebar,
      navbar: theme.backgrounds.navbar,
    },
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary,
      light: theme.text.light,
      inverted: theme.text.inverted,
      accent: theme.text.accent,
      dark: theme.text.light,
    },
    border: {
      light: theme.borders.light,
      medium: theme.borders.medium,
      dark: theme.borders.dark,
      accent: theme.borders.accent,
    },
    state: {
      hover: {
        light: theme.states.hover.light,
        primary: theme.states.hover.primary,
      },
      active: {
        light: theme.states.active.light,
        primary: theme.states.active.primary,
      },
      disabled: theme.states.disabled,
    },
    shadow: theme.shadows,
  }

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

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch profile
      const profileRes = await fetch('/api/profile', {
        headers: getAuthHeaders()
      })
      
      if (profileRes.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token')
        router.push('/login')
        return
      }
      
      if (!profileRes.ok) {
        throw new Error('Failed to fetch profile')
      }
      
      const profileData = await profileRes.json()
      setProfile(profileData)
      
      // Fetch stats
      const statsRes = await fetch('/api/profile/stats', {
        headers: getAuthHeaders()
      })
      
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Initialize form with current data
      if (profileData.user) {
        setProfileForm({
          name: profileData.user.name,
          userType: profileData.user.userType
        })
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

      setSuccess('Profile updated successfully!')
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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      
      // Update profile with new avatar
      setProfile(prev => prev ? {
        ...prev,
        user: { ...prev.user, avatar: data.avatar }
      } : null)

      setSuccess('Avatar updated successfully!')
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

      const data = await res.json()
      
      // Update profile
      setProfile(prev => prev ? {
        ...prev,
        user: { ...prev.user, avatar: null }
      } : null)

      setSuccess('Avatar removed successfully!')
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

      // Validate passwords match
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

      setSuccess('Password changed successfully!')
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
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
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

      // Clear token and redirect to home page after deletion
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  // Format study time
  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" style={{ backgroundColor: styles.background.main }}>
        <div className="text-center">
          <div 
            className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ 
              borderColor: colors.primary[400],
              borderTopColor: 'transparent'
            }}
          ></div>
          <p style={{ color: styles.text.secondary }}>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="text-center py-12" style={{ backgroundColor: styles.background.main }}>
        <div className="mb-4" style={{ color: colors.secondary[600] }}>Please login to view your profile</div>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 text-white rounded-lg transition-colors"
          style={{ 
            background: gradients.primary
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          Go to Login
        </button>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="text-center py-12" style={{ backgroundColor: styles.background.main }}>
        <div className="mb-4" style={{ color: colors.secondary[600] }}>⚠️ {error}</div>
        <button
          onClick={fetchProfileData}
          className="px-4 py-2 text-white rounded-lg transition-colors"
          style={{ 
            background: gradients.primary
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: styles.background.main }}>
      {/* Notifications */}
      {error && (
        <div className="border-l-4 p-4 rounded-r-lg"
          style={{ 
            backgroundColor: colors.secondary[50],
            borderColor: colors.secondary[500]
          }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"
                style={{ color: colors.secondary[500] }}
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm" style={{ color: colors.secondary[700] }}>{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="border-l-4 p-4 rounded-r-lg"
          style={{ 
            backgroundColor: colors.primary[50],
            borderColor: colors.primary[500]
          }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"
                style={{ color: colors.primary[500] }}
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm" style={{ color: colors.primary[700] }}>{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1 border p-6 rounded-xl shadow-sm"
          style={{ 
            backgroundColor: styles.background.card,
            borderColor: styles.border.light,
            boxShadow: styles.shadow.sm
          }}
        >
          <div className="text-center">
            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              {profile?.user.avatar ? (
                <>
                  <img
                    src={profile.user.avatar}
                    alt={profile.user.name}
                    className="w-full h-full rounded-full object-cover border-4 shadow-md"
                    style={{ borderColor: styles.background.card }}
                  />
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 w-8 h-8 rounded-full hover:bg-red-200 transition-colors flex items-center justify-center"
                    style={{ 
                      backgroundColor: colors.secondary[100],
                      color: colors.secondary[600]
                    }}
                    title="Remove avatar"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.secondary[200]
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.secondary[100]
                    }}
                  >
                    <span className="text-sm">×</span>
                  </button>
                </>
              ) : (
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{ background: gradients.primary }}
                >
                  <span className="text-white text-2xl font-bold">
                    {profile?.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold mb-1" style={{ color: styles.text.primary }}>
              {profile?.user.name}
            </h2>
            <p className="mb-2" style={{ color: styles.text.secondary }}>{profile?.user.email}</p>
            
            <div 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4"
              style={{ 
                backgroundColor: colors.primary[50],
                color: colors.primary[700]
              }}
            >
              {profile?.user.userType === 'TEACHER' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
            </div>

            <p className="text-sm mb-6" style={{ color: styles.text.light }}>
              Joined {profile ? formatDate(profile.user.createdAt) : 'Loading...'}
            </p>

            <div className="space-y-2 mb-6">
              {!editingProfile ? (
                <>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="w-full px-4 py-2 rounded-lg transition-colors font-medium border"
                    style={{ 
                      color: colors.primary[400],
                      borderColor: colors.primary[400],
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary[50]
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Edit Profile
                  </button>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    <div 
                      className={`w-full px-4 py-2 rounded-lg transition-colors font-medium text-center cursor-pointer border ${
                        uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      style={{ 
                        color: styles.text.secondary,
                        borderColor: styles.border.medium,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!uploadingAvatar) {
                          e.currentTarget.style.backgroundColor = colors.neutral[50]
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!uploadingAvatar) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                    </div>
                  </label>
                </>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ 
                      borderColor: styles.border.medium,
                      color: styles.text.primary
                    }}
                    placeholder="Your name"
                    required
                  />
                  <select
                    value={profileForm.userType}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, userType: e.target.value as 'STUDENT' | 'TEACHER' }))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ 
                      borderColor: styles.border.medium,
                      color: styles.text.primary
                    }}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium"
                      style={{ 
                        background: gradients.primary
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfile(false)
                        setProfileForm({
                          name: profile?.user.name || '',
                          userType: profile?.user.userType || 'STUDENT'
                        })
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg transition-colors font-medium"
                      style={{ 
                        color: styles.text.secondary,
                        borderColor: styles.border.medium,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.neutral[50]
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 border rounded-lg transition-colors font-medium"
              style={{ 
                color: colors.secondary[600],
                borderColor: colors.secondary[400],
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.secondary[50]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Logout
            </button>
          </div>

          {/* Mobile Quick Stats */}
          <div className="mt-6 pt-6 border-t lg:hidden"
            style={{ borderColor: styles.border.light }}
          >
            <h3 className="text-sm font-semibold mb-3 text-center" style={{ color: styles.text.primary }}>
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.primary[50] }}>
                <div className="text-lg font-bold" style={{ color: colors.primary[600] }}>
                  {stats?.counts.flashcardSets || 0}
                </div>
                <div className="text-xs" style={{ color: colors.primary[700] }}>Flashcard Sets</div>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.primary[100] }}>
                <div className="text-lg font-bold" style={{ color: colors.primary[600] }}>
                  {stats?.counts.quizzes || 0}
                </div>
                <div className="text-xs" style={{ color: colors.primary[700] }}>Quizzes Created</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Statistics */}
          <div className="border p-6 rounded-xl shadow-sm"
            style={{ 
              backgroundColor: styles.background.card,
              borderColor: styles.border.light,
              boxShadow: styles.shadow.sm
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: styles.text.primary }}>
              Learning Statistics
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: colors.primary[50] }}>
                <p className="text-2xl font-bold mb-1" style={{ color: colors.primary[600] }}>
                  {stats?.counts.studySessions || 0}
                </p>
                <p className="text-sm" style={{ color: colors.primary[700] }}>Study Sessions</p>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: colors.secondary[50] }}>
                <p className="text-2xl font-bold mb-1" style={{ color: colors.secondary[600] }}>
                  {stats?.counts.quizAttempts || 0}
                </p>
                <p className="text-sm" style={{ color: colors.secondary[700] }}>Quiz Attempts</p>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: colors.accent[50] }}>
                <p className="text-2xl font-bold mb-1" style={{ color: colors.accent[600] }}>
                  {stats?.performance.averageScore || 0}%
                </p>
                <p className="text-sm" style={{ color: colors.accent[700] }}>Average Score</p>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: colors.primary[100] }}>
                <p className="text-2xl font-bold mb-1" style={{ color: colors.primary[600] }}>
                  {stats ? formatStudyTime(stats.performance.totalStudyTime) : '0m'}
                </p>
                <p className="text-sm" style={{ color: colors.primary[700] }}>Total Study Time</p>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: colors.secondary[100] }}>
                <p className="text-2xl font-bold mb-1" style={{ color: colors.secondary[600] }}>
                  {stats?.streaks.currentStreak || 0} days
                </p>
                <p className="text-sm" style={{ color: colors.secondary[700] }}>Current Streak</p>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: colors.accent[100] }}>
                <p className="text-2xl font-bold mb-1" style={{ color: colors.accent[600] }}>
                  {stats?.performance.cardsPerMinute || 0}
                </p>
                <p className="text-sm" style={{ color: colors.accent[700] }}>Cards/Min</p>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: colors.primary[50],
                borderColor: colors.primary[200]
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium" style={{ color: styles.text.primary }}>Weekly Activity</h4>
                <span className="text-sm" style={{ color: styles.text.secondary }}>Last 7 days</span>
              </div>
              <div className="flex items-end justify-between h-20 gap-1">
                {stats?.activityPatterns.byDayOfWeek.map((count, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full rounded-t transition-all duration-300"
                      style={{ 
                        background: gradients.primary,
                        height: `${Math.min(count * 20, 100)}%`
                      }}
                    ></div>
                    <span className="text-xs mt-1" style={{ color: styles.text.secondary }}>
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
                    </span>
                  </div>
                )) || Array(7).fill(0).map((_, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full rounded-t transition-all duration-300"
                      style={{ 
                        background: gradients.primary,
                        height: '0%'
                      }}
                    ></div>
                    <span className="text-xs mt-1" style={{ color: styles.text.secondary }}>
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="border p-6 rounded-xl shadow-sm"
            style={{ 
              backgroundColor: styles.background.card,
              borderColor: styles.border.light,
              boxShadow: styles.shadow.sm
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: styles.text.primary }}>
              Account Settings
            </h3>
            
            <div className="space-y-4">
              {/* Notification Settings */}
              <div className="p-4 hover:bg-gray-50 rounded-lg border"
                style={{ 
                  borderColor: colors.neutral[100],
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[50]
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: styles.text.primary }}>Email Notifications</p>
                    <p className="text-sm" style={{ color: styles.text.secondary }}>Study reminders and progress updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.emailNotifications}
                      onChange={() => handleSettingToggle('emailNotifications')}
                    />
                    <div 
                      className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{ 
                        backgroundColor: settings.emailNotifications ? colors.primary[400] : colors.neutral[300],
                        borderColor: 'transparent'
                      }}
                    ></div>
                  </label>
                </div>
              </div>

              {/* Dark Mode */}
              <div className="p-4 hover:bg-gray-50 rounded-lg border"
                style={{ 
                  borderColor: colors.neutral[100],
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[50]
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: styles.text.primary }}>Dark Mode</p>
                    <p className="text-sm" style={{ color: styles.text.secondary }}>Switch to dark theme</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.darkMode}
                      onChange={() => handleSettingToggle('darkMode')}
                    />
                    <div 
                      className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{ 
                        backgroundColor: settings.darkMode ? colors.primary[400] : colors.neutral[300],
                        borderColor: 'transparent'
                      }}
                    ></div>
                  </label>
                </div>
              </div>

              {/* Study Reminders */}
              <div className="p-4 hover:bg-gray-50 rounded-lg border"
                style={{ 
                  borderColor: colors.neutral[100],
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[50]
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: styles.text.primary }}>Daily Study Reminders</p>
                    <p className="text-sm" style={{ color: styles.text.secondary }}>Get reminded to study every day</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.dailyReminders}
                      onChange={() => handleSettingToggle('dailyReminders')}
                    />
                    <div 
                      className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{ 
                        backgroundColor: settings.dailyReminders ? colors.primary[400] : colors.neutral[300],
                        borderColor: 'transparent'
                      }}
                    ></div>
                  </label>
                </div>
              </div>

              {/* Password Change Form */}
              {changingPassword ? (
                <form onSubmit={handleChangePassword} className="p-4 rounded-lg border space-y-3"
                  style={{ 
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[200]
                  }}
                >
                  <h4 className="font-medium" style={{ color: styles.text.primary }}>Change Password</h4>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm"
                    style={{ 
                      borderColor: styles.border.medium,
                      color: styles.text.primary,
                      backgroundColor: styles.background.card
                    }}
                    placeholder="Current password"
                    required
                  />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm"
                    style={{ 
                      borderColor: styles.border.medium,
                      color: styles.text.primary,
                      backgroundColor: styles.background.card
                    }}
                    placeholder="New password"
                    required
                    minLength={8}
                  />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm"
                    style={{ 
                      borderColor: styles.border.medium,
                      color: styles.text.primary,
                      backgroundColor: styles.background.card
                    }}
                    placeholder="Confirm new password"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium"
                      style={{ 
                        background: gradients.primary
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                      }}
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChangingPassword(false)
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg transition-colors text-sm font-medium"
                      style={{ 
                        color: styles.text.secondary,
                        borderColor: styles.border.medium,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.neutral[50]
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="py-3 rounded-lg transition-colors font-medium border"
                    style={{ 
                      color: colors.primary[400],
                      borderColor: colors.primary[400],
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary[50]
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Change Password
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="py-3 rounded-lg transition-colors font-medium border disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      color: colors.secondary[600],
                      borderColor: colors.secondary[400],
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!deletingAccount) {
                        e.currentTarget.style.backgroundColor = colors.secondary[50]
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deletingAccount) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    {deletingAccount ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border p-6 rounded-xl shadow-sm"
            style={{ 
              backgroundColor: styles.background.card,
              borderColor: styles.border.light,
              boxShadow: styles.shadow.sm
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: styles.text.primary }}>
              Recent Activity
            </h3>
            
            {profile?.recentActivity && (
              <div className="space-y-3">
                {/* Recent Quiz Results */}
                {profile.recentActivity.quizResults.slice(0, 3).map((result) => (
                  <div 
                    key={result.id} 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.neutral[50]
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mr-3"
                      style={{ backgroundColor: colors.primary[100] }}
                    >
                      <span style={{ color: colors.primary[600] }}>🧩</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: styles.text.primary }}>
                        Completed quiz: {result.quiz.title}
                      </p>
                      <p className="text-sm truncate" style={{ color: styles.text.secondary }}>
                        Score: {result.score}/{result.totalQuestions} • {result.quiz.subject}
                      </p>
                    </div>
                    <span className="text-xs flex-shrink-0 ml-2" style={{ color: styles.text.light }}>
                      {new Date(result.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}

                {/* Recent Study Sessions */}
                {profile.recentActivity.studySessions.slice(0, 2).map((session) => (
                  <div 
                    key={session.id} 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.neutral[50]
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mr-3"
                      style={{ backgroundColor: colors.secondary[100] }}
                    >
                      <span style={{ color: colors.secondary[600] }}>📚</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: styles.text.primary }}>
                        Studied flashcards ({session.cardsStudied} cards)
                      </p>
                      <p className="text-sm truncate" style={{ color: styles.text.secondary }}>
                        {session.correctAnswers}/{session.cardsStudied} correct • {session.duration}min
                      </p>
                    </div>
                    <span className="text-xs flex-shrink-0 ml-2" style={{ color: styles.text.light }}>
                      {new Date(session.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}

                {profile.recentActivity.quizResults.length === 0 && 
                 profile.recentActivity.studySessions.length === 0 && (
                  <div className="text-center py-8" style={{ color: styles.text.secondary }}>
                    No recent activity yet
                  </div>
                )}
              </div>
            )}

            {!profile?.recentActivity && (
              <div className="text-center py-8" style={{ color: styles.text.secondary }}>
                Loading activity...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  Zap,
  Calendar,
  FileText,
  Brain,
  PlusCircle,
  BarChart3,
  Award,
  TrendingDown,
  Activity,
  Sparkles,
  Users,
  CheckCircle
} from 'lucide-react'

// Import theme constants
import { colors, gradients, theme } from '@/lib/theme'

interface DashboardStats {
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

interface RecentActivity {
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

interface UserProfile {
  name: string
  userType: 'STUDENT' | 'TEACHER'
}

export default function Dashboard() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const styles = {
    background: {
      main: theme.backgrounds.main,
      card: theme.backgrounds.card,
    },
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary,
      light: theme.text.light,
      inverted: theme.text.inverted,
    },
    border: {
      light: theme.borders.light,
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

  // Fetch dashboard data when token is available
  useEffect(() => {
    if (token) {
      fetchDashboardData()
    }
  }, [token])

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch profile for user name
      const profileRes = await fetch('/api/profile', {
        headers: getAuthHeaders()
      })
      
      if (profileRes.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }
      
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setUserProfile({
          name: profileData.user.name,
          userType: profileData.user.userType
        })
        setRecentActivity(profileData.recentActivity)
      }

      // Fetch stats
      const statsRes = await fetch('/api/profile/stats', {
        headers: getAuthHeaders()
      })
      
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      } else if (statsRes.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
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

  // Format date relative
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffDay > 0) {
      return `${diffDay}d ago`
    } else if (diffHour > 0) {
      return `${diffHour}h ago`
    } else if (diffMin > 0) {
      return `${diffMin}m ago`
    } else {
      return 'Just now'
    }
  }

  // Calculate change from previous period
  const calculateChange = (current: number, previous?: number): { value: string; isPositive: boolean } => {
    if (!previous || previous === 0) return { value: '+0%', isPositive: true }
    const change = ((current - previous) / previous) * 100
    const sign = change >= 0 ? '+' : ''
    return {
      value: `${sign}${Math.round(change)}%`,
      isPositive: change >= 0
    }
  }

  // Get user avatar based on type
  const getUserAvatar = () => {
    if (!userProfile) return '👤'
    return userProfile.userType === 'TEACHER' ? '👨‍🏫' : '👨‍🎓'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen md:min-h-[calc(100vh-200px)]" style={{ backgroundColor: styles.background.main }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 md:w-16 md:h-16 border-2 rounded-full" style={{ borderColor: styles.border.light }}></div>
            <div 
              className="absolute top-0 left-0 w-12 h-12 md:w-16 md:h-16 border-2 rounded-full animate-spin" 
              style={{ 
                borderColor: colors.primary[400],
                borderTopColor: 'transparent' 
              }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-4" style={{ backgroundColor: styles.background.main }}>
        <div 
          className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(88, 164, 176, 0.1)' }}
        >
          <div className="text-xl md:text-2xl" style={{ color: colors.primary[400] }}>⚠️</div>
        </div>
        <h3 className="text-base md:text-lg font-medium mb-2" style={{ color: styles.text.primary }}>Unable to load dashboard</h3>
        <p className="mb-6 text-sm md:text-base" style={{ color: styles.text.secondary }}>{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2.5 md:px-6 md:py-3 rounded-lg transition-all duration-200 font-medium"
          style={{ 
            backgroundColor: colors.primary[600],
            color: 'white',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  const dashboardStats = [
    { 
      name: 'Flashcard Sets', 
      value: stats?.counts.flashcardSets.toString() || '0',
      change: calculateChange(stats?.counts.flashcardSets || 0, (stats?.counts.flashcardSets || 0) - 3),
      icon: <FileText className="w-4 h-4 md:w-5 md:h-5" />,
      color: colors.primary[500]
    },
    { 
      name: 'Quizzes', 
      value: stats?.counts.quizzes.toString() || '0',
      change: calculateChange(stats?.counts.quizzes || 0, (stats?.counts.quizzes || 0) - 1),
      icon: <Brain className="w-4 h-4 md:w-5 md:h-5" />,
      color: colors.secondary[500]
    },
    { 
      name: 'Sessions', 
      value: stats?.counts.studySessions.toString() || '0',
      change: calculateChange(stats?.counts.studySessions || 0, (stats?.counts.studySessions || 0) - 2),
      icon: <BookOpen className="w-4 h-4 md:w-5 md:h-5" />,
      color: colors.accent[500]
    },
    { 
      name: 'Avg Score', 
      value: `${stats?.performance.averageScore || 0}%`,
      change: calculateChange(stats?.performance.averageScore || 0, (stats?.performance.averageScore || 0) - 5),
      icon: <Target className="w-4 h-4 md:w-5 md:h-5" />,
      color: colors.success[500]
    },
  ]

  // Combine recent activities
  const allRecentActivities = [
    ...(recentActivity?.quizResults.slice(0, 2).map(result => ({
      type: 'quiz' as const,
      id: result.id,
      title: result.quiz.title,
      description: `${result.score}/${result.totalQuestions} correct • ${result.quiz.subject}`,
      date: result.completedAt,
      icon: <Brain className="w-3 h-3 md:w-4 md:h-4" />,
      color: colors.secondary[400]
    })) || []),
    ...(recentActivity?.studySessions.slice(0, 2).map(session => ({
      type: 'study' as const,
      id: session.id,
      title: `${session.cardsStudied} Questions studied`,
      description: `${session.correctAnswers} correct • ${session.duration} min`,
      date: session.startedAt,
      icon: <BookOpen className="w-3 h-3 md:w-4 md:h-4" />,
      color: colors.primary[400]
    })) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)

  return (
    <div className="pb-8" style={{ backgroundColor: styles.background.main }}>
      {/* Welcome Header */}
      <div className="px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}
                >
                  <span className="text-xl md:text-2xl">{getUserAvatar()}</span>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-medium" style={{ color: styles.text.primary }}>
                    Welcome back, {userProfile?.name || 'Student'}!
                  </h1>
                  <p className="text-sm md:text-base mt-0.5" style={{ color: styles.text.secondary }}>
                    Ready to continue learning?
                  </p>
                </div>
              </div>
            </div>
            
            {/* Streak Badge - Hidden on mobile if space is tight */}
            {stats?.streaks.currentStreak && stats.streaks.currentStreak > 0 && (
              <div 
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(255, 245, 235, 0.8)',
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: colors.accent[500] }} />
                <div>
                  <div className="text-sm font-medium" style={{ color: colors.accent[700] }}>Streak</div>
                  <div className="text-base font-bold" style={{ color: colors.accent[600] }}>
                    {stats.streaks.currentStreak} days
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="text-center p-3 rounded-lg border" style={{ borderColor: styles.border.light, backgroundColor: 'white' }}>
              <div className="text-lg md:text-xl font-light" style={{ color: styles.text.primary }}>
                {stats?.performance.totalCardsStudied || 0}
              </div>
              <div className="text-xs md:text-sm mt-1" style={{ color: styles.text.secondary }}>Questions</div>
            </div>
            <div className="text-center p-3 rounded-lg border" style={{ borderColor: styles.border.light, backgroundColor: 'white' }}>
              <div className="text-lg md:text-xl font-light" style={{ color: styles.text.primary }}>
                {formatStudyTime(stats?.performance.totalStudyTime || 0)}
              </div>
              <div className="text-xs md:text-sm mt-1" style={{ color: styles.text.secondary }}>Study Time</div>
            </div>
            <div className="text-center p-3 rounded-lg border" style={{ borderColor: styles.border.light, backgroundColor: 'white' }}>
              <div className="text-lg md:text-xl font-light" style={{ color: styles.text.primary }}>
                {stats?.performance.averageScore || 0}%
              </div>
              <div className="text-xs md:text-sm mt-1" style={{ color: styles.text.secondary }}>Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {dashboardStats.map((stat) => (
              <div 
                key={stat.name} 
                className="bg-white rounded-lg sm:rounded-xl border p-4"
                style={{ 
                  borderColor: styles.border.light,
                  backgroundColor: styles.background.card,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <div style={{ color: stat.color }}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm truncate" style={{ color: styles.text.secondary }}>
                      {stat.name}
                    </p>
                    <p className="text-lg sm:text-xl font-medium mt-0.5" style={{ color: styles.text.primary }}>
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                      stat.change.isPositive 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {stat.change.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.change.value}
                  </div>
                  <span className="text-xs" style={{ color: styles.text.light }}>vs last week</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div 
                className="bg-white rounded-lg sm:rounded-xl border p-4 sm:p-6"
                style={{ 
                  borderColor: styles.border.light,
                  backgroundColor: styles.background.card
                }}
              >
                <h2 className="text-base sm:text-lg font-medium mb-4 sm:mb-6" style={{ color: styles.text.primary }}>
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Link
                    href="/dashboard/flashcards"
                    className="group p-4 sm:p-5 rounded-lg border transition-all duration-200 hover:border-primary/30"
                    style={{ 
                      borderColor: styles.border.light,
                      backgroundColor: styles.background.card
                    }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3"
                        style={{ 
                          backgroundColor: colors.primary[50],
                          color: colors.primary[600]
                        }}
                      >
                        <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="font-medium text-sm sm:text-base mb-1" style={{ color: styles.text.primary }}>
                        New Flashcards
                      </p>
                      <p className="text-xs sm:text-sm" style={{ color: styles.text.secondary }}>
                        Create and study
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/quiz"
                    className="group p-4 sm:p-5 rounded-lg border transition-all duration-200 hover:border-primary/30"
                    style={{ 
                      borderColor: styles.border.light,
                      backgroundColor: styles.background.card
                    }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3"
                        style={{ 
                          backgroundColor: colors.secondary[50],
                          color: colors.secondary[600]
                        }}
                      >
                        <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="font-medium text-sm sm:text-base mb-1" style={{ color: styles.text.primary }}>
                        Generate Quiz
                      </p>
                      <p className="text-xs sm:text-sm" style={{ color: styles.text.secondary }}>
                        Test your knowledge
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div 
              className="bg-white rounded-lg sm:rounded-xl border p-4 sm:p-6"
              style={{ 
                borderColor: styles.border.light,
                backgroundColor: styles.background.card
              }}
            >
              <h2 className="text-base sm:text-lg font-medium mb-4 sm:mb-6" style={{ color: styles.text.primary }}>
                Recent Activity
              </h2>
              
              {allRecentActivities.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {allRecentActivities.map((activity) => (
                    <div 
                      key={`${activity.type}-${activity.id}`} 
                      className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/${activity.type}`)}
                    >
                      <div 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: `${activity.color}15`,
                          color: activity.color
                        }}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate" style={{ color: styles.text.primary }}>
                          {activity.title}
                        </p>
                        <p className="text-xs truncate" style={{ color: styles.text.secondary }}>
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: styles.text.light }}>
                        {formatRelativeTime(activity.date)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div 
                    className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                  >
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: colors.neutral[400] }} />
                  </div>
                  <p className="font-medium text-sm sm:text-base mb-1" style={{ color: styles.text.primary }}>
                    No recent activity
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: styles.text.secondary }}>
                    Start by creating flashcards
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Overview */}
          {stats && (
            <div 
              className="bg-white rounded-lg sm:rounded-xl border p-4 sm:p-6"
              style={{ 
                borderColor: styles.border.light,
                backgroundColor: styles.background.card
              }}
            >
              <h2 className="text-base sm:text-lg font-medium mb-4 sm:mb-6" style={{ color: styles.text.primary }}>
                Performance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div 
                  className="p-3 sm:p-4 rounded-lg border"
                  style={{ 
                    borderColor: 'rgba(88, 164, 176, 0.1)',
                    backgroundColor: 'rgba(88, 164, 176, 0.02)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'white',
                        border: '1px solid rgba(88, 164, 176, 0.1)',
                      }}
                    >
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.primary[400] }} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium" style={{ color: styles.text.primary }}>
                        Efficiency
                      </p>
                      <p className="text-base sm:text-lg font-medium" style={{ color: styles.text.primary }}>
                        {stats.performance.cardsPerMinute.toFixed(1)} cards/min
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="p-3 sm:p-4 rounded-lg border"
                  style={{ 
                    borderColor: 'rgba(88, 164, 176, 0.1)',
                    backgroundColor: 'rgba(88, 164, 176, 0.02)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'white',
                        border: '1px solid rgba(88, 164, 176, 0.1)',
                      }}
                    >
                      <Target className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.primary[400] }} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium" style={{ color: styles.text.primary }}>
                        Accuracy
                      </p>
                      <p className="text-base sm:text-lg font-medium" style={{ color: styles.text.primary }}>
                        {stats.performance.averageScore}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="p-3 sm:p-4 rounded-lg border"
                  style={{ 
                    borderColor: 'rgba(88, 164, 176, 0.1)',
                    backgroundColor: 'rgba(88, 164, 176, 0.02)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'white',
                        border: '1px solid rgba(88, 164, 176, 0.1)',
                      }}
                    >
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colors.primary[400] }} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium" style={{ color: styles.text.primary }}>
                        Active Days
                      </p>
                      <p className="text-base sm:text-lg font-medium" style={{ color: styles.text.primary }}>
                        {stats.streaks.daysActiveLast30} / 30
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Most Active Subject & Study Time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {stats?.activityPatterns.mostActiveSubject && (
              <div 
                className="bg-white rounded-lg sm:rounded-xl border p-4 sm:p-6"
                style={{ 
                  borderColor: styles.border.light,
                  backgroundColor: styles.background.card
                }}
              >
                <h2 className="text-base sm:text-lg font-medium mb-4" style={{ color: styles.text.primary }}>
                  Top Subject
                </h2>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div 
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center"
                    style={{ 
                      backgroundColor: colors.primary[50],
                      color: colors.primary[500]
                    }}
                  >
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-medium" style={{ color: styles.text.primary }}>
                      {stats.activityPatterns.mostActiveSubject.subject}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: styles.text.secondary }}>
                      {stats.activityPatterns.mostActiveSubject.count} activities
                    </p>
                    <div className="mt-2">
                      <div 
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: colors.neutral[100] }}
                      >
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            backgroundColor: colors.primary[300],
                            width: `${Math.min(stats.activityPatterns.mostActiveSubject.count * 10, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Study Time */}
            <div 
              className="bg-white rounded-lg sm:rounded-xl border p-4 sm:p-6"
              style={{ 
                borderColor: styles.border.light,
                backgroundColor: styles.background.card
              }}
            >
              <h2 className="text-base sm:text-lg font-medium mb-4" style={{ color: styles.text.primary }}>
                Study Time
              </h2>
              <div className="text-center py-2 sm:py-4">
                <div className="text-2xl sm:text-3xl font-light mb-2" style={{ color: styles.text.primary }}>
                  {formatStudyTime(stats?.performance.totalStudyTime || 0)}
                </div>
                <p className="text-sm" style={{ color: styles.text.secondary }}>Total time spent studying</p>
                <div 
                  className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: 'rgba(88, 164, 176, 0.08)' }}
                >
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: colors.primary[400] }} />
                  <span className="text-xs sm:text-sm font-medium" style={{ color: colors.primary[400] }}>
                    {stats?.performance.cardsPerMinute.toFixed(1)} cards per minute
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
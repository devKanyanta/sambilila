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
  ArrowRight,
  BarChart3,
  Award,
  TrendingDown
} from 'lucide-react'

// Import theme constants (you'll need to adjust the path based on your project structure)
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

  // Theme-based styles
  const styles = {
    // Backgrounds
    background: {
      main: theme.backgrounds.main,
      card: theme.backgrounds.card,
      sidebar: theme.backgrounds.sidebar,
      navbar: theme.backgrounds.navbar,
    },
    
    // Text
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary,
      light: theme.text.light,
      inverted: theme.text.inverted,
      accent: theme.text.accent,
      dark: theme.text.light,
    },
    
    // Borders
    border: {
      light: theme.borders.light,
      medium: theme.borders.medium,
      dark: theme.borders.dark,
      accent: theme.borders.accent,
    },
    
    // Interactive states
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
    
    // Shadows
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
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]" style={{ backgroundColor: styles.background.main }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 rounded-full" style={{ borderColor: styles.border.light }}></div>
            <div 
              className="absolute top-0 left-0 w-16 h-16 border-4 rounded-full animate-spin" 
              style={{ 
                borderColor: colors.primary[400],
                borderTopColor: 'transparent' 
              }}
            ></div>
          </div>
          <p className="mt-4 font-medium" style={{ color: styles.text.dark }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-4" style={{ backgroundColor: styles.background.main }}>
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(88, 164, 176, 0.1)' }}
        >
          <div className="text-2xl" style={{ color: colors.primary[400] }}>⚠️</div>
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: styles.text.dark }}>Unable to load dashboard</h3>
        <p className="mb-6" style={{ color: styles.text.secondary }}>{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          style={{ 
            background: gradients.primary,
            color: styles.text.inverted,
            boxShadow: styles.shadow.sm
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
      icon: <FileText className="w-5 h-5" />,
    },
    { 
      name: 'Quizzes Created', 
      value: stats?.counts.quizzes.toString() || '0',
      change: calculateChange(stats?.counts.quizzes || 0, (stats?.counts.quizzes || 0) - 1),
      icon: <Brain className="w-5 h-5" />,
    },
    { 
      name: 'Study Sessions', 
      value: stats?.counts.studySessions.toString() || '0',
      change: calculateChange(stats?.counts.studySessions || 0, (stats?.counts.studySessions || 0) - 2),
      icon: <BookOpen className="w-5 h-5" />,
    },
    { 
      name: 'Avg Score', 
      value: `${stats?.performance.averageScore || 0}%`,
      change: calculateChange(stats?.performance.averageScore || 0, (stats?.performance.averageScore || 0) - 5),
      icon: <Target className="w-5 h-5" />,
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
      icon: <Brain className="w-4 h-4" />,
    })) || []),
    ...(recentActivity?.studySessions.slice(0, 2).map(session => ({
      type: 'study' as const,
      id: session.id,
      title: `${session.cardsStudied} Questions studied`,
      description: `${session.correctAnswers} correct • ${session.duration} min`,
      date: session.startedAt,
      icon: <BookOpen className="w-4 h-4" />,
    })) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4)

  return (
    <div className="space-y-6 pb-8" style={{ backgroundColor: styles.background.main }}>
      {/* Welcome Header with Streak */}
      <div 
        className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-white shadow-lg"
        style={{ 
          background: gradients.primary,
          boxShadow: styles.shadow.lg
        }}
      >
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-12 h-12 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <span className="text-2xl">{getUserAvatar()}</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold" style={{ color: styles.text.inverted }}>
                    Welcome back, {userProfile?.name || 'Student'}!
                  </h1>
                  <p className="mt-1" style={{ color: colors.neutral[200] }}>
                    {stats?.streaks.currentStreak ? `🔥 ${stats.streaks.currentStreak}-day streak` : 'Ready to continue learning?'}
                  </p>
                </div>
              </div>
            </div>
            
            {stats?.streaks.currentStreak && (
              <div 
                className="backdrop-blur-sm rounded-xl p-4 min-w-[140px]"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="text-sm font-medium" style={{ color: colors.neutral[200] }}>Current Streak</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-2xl font-bold" style={{ color: styles.text.inverted }}>
                    {stats.streaks.currentStreak}
                  </div>
                  <div className="text-sm" style={{ color: colors.neutral[200] }}>days</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: styles.text.inverted }}>
                {stats?.performance.totalCardsStudied || 0}
              </div>
              <div className="text-sm" style={{ color: colors.neutral[200] }}>Questions Studied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: styles.text.inverted }}>
                {formatStudyTime(stats?.performance.totalStudyTime || 0)}
              </div>
              <div className="text-sm" style={{ color: colors.neutral[200] }}>Study Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: styles.text.inverted }}>
                {stats?.performance.averageScore || 0}%
              </div>
              <div className="text-sm" style={{ color: colors.neutral[200] }}>Avg Score</div>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-32 translate-x-32"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full translate-y-24 -translate-x-24"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        ></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => (
          <div 
            key={stat.name} 
            className="group bg-white rounded-xl border p-5 hover:shadow-lg transition-all duration-200"
            style={{ 
              borderColor: styles.border.light,
              backgroundColor: styles.background.card,
              boxShadow: styles.shadow.sm
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: gradients.primary }}
                  >
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: styles.text.secondary }}>
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: styles.text.primary }}>
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
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
                  <span className="text-xs" style={{ color: styles.text.secondary }}>vs last week</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div 
            className="bg-white rounded-xl border p-6"
            style={{ 
              borderColor: styles.border.light,
              backgroundColor: styles.background.card
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" style={{ color: styles.text.primary }}>
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/flashcards"
                className="group relative overflow-hidden rounded-xl border-2 border-dashed p-6 transition-all duration-200 text-center hover:shadow-lg"
                style={{ 
                  borderColor: styles.border.light,
                  backgroundColor: styles.background.card
                }}
              >
                <div className="relative z-10">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200"
                    style={{ 
                      background: gradients.primary
                    }}
                  >
                    <PlusCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold group-hover:text-blue-700" style={{ color: styles.text.primary }}>
                    New Flashcards
                  </p>
                  <p className="text-sm mt-1" style={{ color: styles.text.secondary }}>
                    Create and study flashcards
                  </p>
                </div>
              </Link>
              <Link
                href="/dashboard/quiz"
                className="group relative overflow-hidden rounded-xl border-2 border-dashed p-6 transition-all duration-200 text-center hover:shadow-lg"
                style={{ 
                  borderColor: styles.border.light,
                  backgroundColor: styles.background.card
                }}
              >
                <div className="relative z-10">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200"
                    style={{ 
                      background: gradients.primary
                    }}
                  >
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold group-hover:text-blue-700" style={{ color: styles.text.primary }}>
                    Generate Quiz
                  </p>
                  <p className="text-sm mt-1" style={{ color: styles.text.secondary }}>
                    Test your knowledge
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div 
          className="bg-white rounded-xl border p-6"
          style={{ 
            borderColor: styles.border.light,
            backgroundColor: styles.background.card
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: styles.text.primary }}>
              Recent Activity
            </h2>
          </div>
          
          {allRecentActivities.length > 0 ? (
            <div className="space-y-4">
              {allRecentActivities.map((activity) => (
                <div 
                  key={`${activity.type}-${activity.id}`} 
                  className="group flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/dashboard/${activity.type}`)}
                  style={{ 
                    backgroundColor: 'transparent',
                    borderColor: 'transparent'
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: 'rgba(88, 164, 176, 0.1)',
                      color: colors.primary[400]
                    }}
                  >
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: styles.text.primary }}>
                      {activity.title}
                    </p>
                    <p className="text-xs truncate" style={{ color: styles.text.secondary }}>
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: styles.text.secondary }}>
                    {formatRelativeTime(activity.date)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div 
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: colors.neutral[200] }}
              >
                <FileText className="w-8 h-8" style={{ color: colors.neutral[500] }} />
              </div>
              <p className="font-medium mb-2" style={{ color: styles.text.primary }}>
                No recent activity
              </p>
              <p className="text-sm" style={{ color: styles.text.secondary }}>
                Start by creating flashcards or taking a quiz!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      {stats && (
        <div 
          className="bg-white rounded-xl border p-6"
          style={{ 
            borderColor: styles.border.light,
            backgroundColor: styles.background.card
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: styles.text.primary }}>
              Performance Insights
            </h2>
            <BarChart3 className="w-5 h-5" style={{ color: colors.neutral[500] }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="group p-4 rounded-xl hover:shadow-md transition-all duration-200 border"
              style={{ 
                background: 'linear-gradient(to right, rgba(88, 164, 176, 0.05), rgba(169, 188, 208, 0.05))',
                borderColor: 'rgba(88, 164, 176, 0.2)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm"
                  style={{ boxShadow: styles.shadow.sm }}
                >
                  <Zap className="w-6 h-6" style={{ color: colors.primary[400] }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: styles.text.primary }}>
                    Study Efficiency
                  </p>
                  <p className="text-lg font-bold" style={{ color: styles.text.primary }}>
                    {stats.performance.cardsPerMinute.toFixed(1)} cards/min
                  </p>
                </div>
              </div>
            </div>
            
            <div 
              className="group p-4 rounded-xl hover:shadow-md transition-all duration-200 border"
              style={{ 
                background: 'linear-gradient(to right, rgba(88, 164, 176, 0.05), rgba(169, 188, 208, 0.05))',
                borderColor: 'rgba(88, 164, 176, 0.2)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm"
                  style={{ boxShadow: styles.shadow.sm }}
                >
                  <Target className="w-6 h-6" style={{ color: colors.primary[400] }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: styles.text.primary }}>
                    Quiz Accuracy
                  </p>
                  <p className="text-lg font-bold" style={{ color: styles.text.primary }}>
                    {stats.performance.averageScore}%
                  </p>
                </div>
              </div>
            </div>
            
            <div 
              className="group p-4 rounded-xl hover:shadow-md transition-all duration-200 border"
              style={{ 
                background: 'linear-gradient(to right, rgba(88, 164, 176, 0.05), rgba(169, 188, 208, 0.05))',
                borderColor: 'rgba(88, 164, 176, 0.2)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm"
                  style={{ boxShadow: styles.shadow.sm }}
                >
                  <Calendar className="w-6 h-6" style={{ color: colors.primary[400] }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: styles.text.primary }}>
                    Active Days
                  </p>
                  <p className="text-lg font-bold" style={{ color: styles.text.primary }}>
                    {stats.streaks.daysActiveLast30} / 30 days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Most Active Subject & Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats?.activityPatterns.mostActiveSubject && (
          <div 
            className="bg-white rounded-xl border p-6"
            style={{ 
              borderColor: styles.border.light,
              backgroundColor: styles.background.card
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: styles.text.primary }}>
                Most Active Subject
              </h2>
              <Award className="w-5 h-5" style={{ color: colors.primary[400] }} />
            </div>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: gradients.primary,
                  boxShadow: styles.shadow.md
                }}
              >
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold" style={{ color: styles.text.primary }}>
                  {stats.activityPatterns.mostActiveSubject.subject}
                </h3>
                <p style={{ color: styles.text.secondary }}>
                  {stats.activityPatterns.mostActiveSubject.count} activities completed
                </p>
                <div className="mt-2">
                  <div 
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.neutral[200] }}
                  >
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        background: gradients.primary,
                        width: `${Math.min(stats.activityPatterns.mostActiveSubject.count * 10, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Tracking */}
        <div 
          className="bg-white rounded-xl border p-6"
          style={{ 
            borderColor: styles.border.light,
            backgroundColor: styles.background.card
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: styles.text.primary }}>
              Study Time
            </h2>
            <Clock className="w-5 h-5" style={{ color: colors.neutral[500] }} />
          </div>
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-2" style={{ color: styles.text.primary }}>
              {formatStudyTime(stats?.performance.totalStudyTime || 0)}
            </div>
            <p style={{ color: styles.text.secondary }}>Total time spent studying</p>
            <div 
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'rgba(88, 164, 176, 0.1)' }}
            >
              <Zap className="w-4 h-4" style={{ color: colors.primary[400] }} />
              <span className="text-sm font-medium" style={{ color: colors.primary[400] }}>
                {stats?.performance.cardsPerMinute.toFixed(1)} cards per minute
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
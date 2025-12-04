'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  // Calculate change from previous period (simplified)
  const calculateChange = (current: number, previous?: number): string => {
    if (!previous || previous === 0) return '+0'
    const change = ((current - previous) / previous) * 100
    const sign = change >= 0 ? '+' : ''
    return `${sign}${Math.round(change)}%`
  }

  // Get emoji based on user type
  const getUserEmoji = () => {
    if (!userProfile) return '👤'
    return userProfile.userType === 'TEACHER' ? '👨‍🏫' : '👨‍🎓'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">⚠️ {error}</div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      icon: '🎴',
      color: 'blue'
    },
    { 
      name: 'Quizzes Created', 
      value: stats?.counts.quizzes.toString() || '0',
      change: calculateChange(stats?.counts.quizzes || 0, (stats?.counts.quizzes || 0) - 1),
      icon: '🧩',
      color: 'green'
    },
    { 
      name: 'Study Sessions', 
      value: stats?.counts.studySessions.toString() || '0',
      change: calculateChange(stats?.counts.studySessions || 0, (stats?.counts.studySessions || 0) - 2),
      icon: '📚',
      color: 'purple'
    },
    { 
      name: 'Average Score', 
      value: `${stats?.performance.averageScore || 0}%`,
      change: calculateChange(stats?.performance.averageScore || 0, (stats?.performance.averageScore || 0) - 5),
      icon: '⭐',
      color: 'yellow'
    },
  ]

  // Combine recent activities
  const allRecentActivities = [
    ...(recentActivity?.quizResults.slice(0, 2).map(result => ({
      type: 'quiz' as const,
      id: result.id,
      title: `Completed: ${result.quiz.title}`,
      description: `${result.score}/${result.totalQuestions} correct • ${result.quiz.subject}`,
      date: result.completedAt,
      icon: '🧩',
      color: 'green'
    })) || []),
    ...(recentActivity?.studySessions.slice(0, 2).map(session => ({
      type: 'study' as const,
      id: session.id,
      title: `Studied ${session.cardsStudied} cards`,
      description: `${session.correctAnswers}/${session.cardsStudied} correct • ${session.duration}min`,
      date: session.startedAt,
      icon: '📚',
      color: 'blue'
    })) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {userProfile?.name || 'Student'}! {getUserEmoji()}
            </h1>
            <p className="text-gray-600 mt-2">
              {stats?.streaks.currentStreak ? `🔥 You're on a ${stats.streaks.currentStreak}-day streak! Keep going!` : 'Ready to continue your learning journey?'}
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            {stats?.streaks.currentStreak && (
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-2 rounded-lg">
                <div className="text-sm font-medium text-orange-800">Current Streak</div>
                <div className="text-xl font-bold text-orange-600">{stats.streaks.currentStreak} days</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {dashboardStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl">{stat.icon}</span>
                  <p className="text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{stat.value}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                stat.change.startsWith('+') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {stat.change}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Total</span>
                {stat.name === 'Total Study Time' ? (
                  <span>{formatStudyTime(stats?.performance.totalStudyTime || 0)}</span>
                ) : stat.name === 'Cards Mastered' ? (
                  <span>{stats?.performance.totalCardsStudied || 0} cards</span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/dashboard/flashcards"
              className="group p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 text-center"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">🎴</div>
              <p className="text-sm font-medium text-gray-600 group-hover:text-blue-700">New Flashcards</p>
            </Link>
            <Link
              href="/dashboard/quiz"
              className="group p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 text-center"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">🧩</div>
              <p className="text-sm font-medium text-gray-600 group-hover:text-green-700">Generate Quiz</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link 
              href="/profile" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          
          {allRecentActivities.length > 0 ? (
            <div className="space-y-4">
              {allRecentActivities.map((activity) => (
                <div 
                  key={`${activity.type}-${activity.id}`} 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.color === 'green' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <span className="text-lg">{activity.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-4">
                    {formatRelativeTime(activity.date)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-gray-500 mb-2">No recent activity</p>
              <p className="text-sm text-gray-400">Start by creating flashcards or taking a quiz!</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      {stats && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <span className="text-blue-600">⚡</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Study Efficiency</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.performance.cardsPerMinute.toFixed(1)} cards/min
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <span className="text-green-600">🎯</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Quiz Accuracy</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.performance.averageScore}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <span className="text-purple-600">📅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Active Days (30d)</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.streaks.daysActiveLast30} days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Quick Stats */}
      <div className="lg:hidden bg-white rounded-xl shadow-sm border p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats ? formatStudyTime(stats.performance.totalStudyTime) : '0m'}
            </div>
            <div className="text-xs text-blue-800 mt-1">Study Time</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats?.performance.totalCardsStudied || 0}
            </div>
            <div className="text-xs text-green-800 mt-1">Cards Studied</div>
          </div>
        </div>
      </div>

      {/* Most Active Subject */}
      {stats?.activityPatterns.mostActiveSubject && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Active Subject</h2>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-2xl">📚</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">
                {stats.activityPatterns.mostActiveSubject.subject}
              </h3>
              <p className="text-gray-600">
                {stats.activityPatterns.mostActiveSubject.count} activities
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
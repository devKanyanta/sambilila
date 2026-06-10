'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  BookOpen,
  Target,
  Plus,
  Brain,
  FileText,
  Calendar,
  BarChart3,
  Sparkles,
  Zap,
  Flame,
  Clock,
  ChevronRight,
  GraduationCap,
} from 'lucide-react'
import AnimatedSection, { AnimatedItem } from './components/AnimatedSection'
import StreakCard from './components/StreakCard'
import StatBlock from './components/StatBlock'
import Card from './components/Card'
import FirstTimeModal from './components/FirstTimeModal'
import {
  ShimmerBlock,
  ShimmerHeading,
  ShimmerStatBlock,
  ShimmerActivityRow,
  ShimmerCard,
} from './components/Shimmer'
import {
  fadeSlideDown,
  fadeSlideUp,
  statCardItem,
  quickActionItem,
  activityItem,
  cardHover,
  buttonHover,
  containerStagger,
  containerStaggerSlow,
  scaleInBouncy,
} from './animations'

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
    quiz: { title: string; subject: string }
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
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      router.push('/login')
      return
    }
    setToken(storedToken)
  }, [router])

  useEffect(() => {
    if (token) fetchDashboardData()
  }, [token])

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  })

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const profileRes = await fetch('/api/profile', { headers: getAuthHeaders() })
      if (profileRes.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }
      if (profileRes.ok) {
        const data = await profileRes.json()
        setUserProfile({ name: data.user.name, userType: data.user.userType })
        setRecentActivity(data.recentActivity)
      }

      const statsRes = await fetch('/api/profile/stats', { headers: getAuthHeaders() })
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      } else if (statsRes.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Determine if user is a first-time user (no content created yet)
  const isFirstTimeUser = !loading && stats && stats.counts.flashcardSets === 0 && stats.counts.quizzes === 0

  // Show welcome modal after a brief delay for first-time users
  useEffect(() => {
    if (isFirstTimeUser) {
      const timer = setTimeout(() => setShowWelcome(true), 600)
      return () => clearTimeout(timer)
    }
  }, [isFirstTimeUser])

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)
    if (diffDay > 0) return `${diffDay}d ago`
    if (diffHour > 0) return `${diffHour}h ago`
    if (diffMin > 0) return `${diffMin}m ago`
    return 'Just now'
  }

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading dashboard">
        {/* Welcome Header Shimmer */}
        <ShimmerHeading />

        {/* Streak Card Shimmer */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShimmerBlock className="w-10 h-10 rounded-lg" />
              <div className="space-y-1">
                <ShimmerBlock className="h-5 w-24" />
                <ShimmerBlock className="h-3 w-16" />
              </div>
            </div>
            <ShimmerBlock className="w-12 h-12 rounded-xl" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((i) => (
                <ShimmerBlock key={i} className="w-10 h-14 rounded-lg" />
              ))}
            </div>
            <ShimmerBlock className="w-32 h-4" />
          </div>
        </div>

        {/* Stats Grid Shimmer */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <ShimmerStatBlock key={i} />
          ))}
        </div>

        {/* Activity + Quick Actions Shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShimmerBlock className="w-4 h-4 rounded-sm" />
                <ShimmerBlock className="h-5 w-32" />
              </div>
              <ShimmerBlock className="h-3 w-20" />
            </div>
            <div className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <ShimmerActivityRow key={i} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <ShimmerBlock className="h-5 w-28 mb-4" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <ShimmerCard key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Performance Section Shimmer */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShimmerBlock className="w-4 h-4 rounded-sm" />
            <ShimmerBlock className="h-5 w-40" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <ShimmerStatBlock key={i} />
            ))}
          </div>
        </div>

        <span className="sr-only">Loading dashboard content...</span>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-heading font-medium text-neutral-800 mb-1">
          Unable to load dashboard
        </h3>
        <p className="text-sm text-neutral-500 mb-6">{error}</p>
        <motion.button
          onClick={fetchDashboardData}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#ff5252] hover:bg-[#fc0b06] transition-all shadow-md"
        >
          Try Again
        </motion.button>
      </div>
    )
  }

  // Combine and sort recent activities
  const allRecentActivities = [
    ...(recentActivity?.quizResults.slice(0, 3).map((r) => ({
      type: 'quiz' as const,
      id: r.id,
      title: r.quiz.title,
      description: `${r.score}/${r.totalQuestions} correct`,
      date: r.completedAt,
      icon: Brain,
      color: '#ff5252',
      bg: 'bg-[#ff5252]/10',
    })) || []),
    ...(recentActivity?.studySessions.slice(0, 3).map((s) => ({
      type: 'study' as const,
      id: s.id,
      title: `Studied ${s.cardsStudied} cards`,
      description: `${s.correctAnswers} correct • ${s.duration} min`,
      date: s.startedAt,
      icon: BookOpen,
      color: '#193827',
      bg: 'bg-[#193827]/10',
    })) || []),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Calculate total study time
  const totalStudyMinutes = stats?.performance.totalStudyTime || 0
  const studyHours = Math.floor(totalStudyMinutes / 60)
  const studyMins = totalStudyMinutes % 60
  const studyTimeDisplay = studyHours > 0
    ? `${studyHours}h ${studyMins}m`
    : `${studyMins}m`

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerStaggerSlow}
      className="space-y-6"
    >
      {/* ===== 1. Welcome Header ===== */}
      <motion.div variants={fadeSlideDown} className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, mass: 0.6 }}
          className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center shadow-sm"
        >
          <GraduationCap className="w-6 h-6 text-primary-600" />
        </motion.div>
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-neutral-800">
            Welcome back, {userProfile?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-sm text-neutral-500">Ready to continue learning?</p>
        </div>
      </motion.div>

      {/* ===== 2. Streak Card (Stats Hero) ===== */}
      {stats && (
        <motion.div variants={fadeSlideUp}>
          <StreakCard
            currentStreak={stats.streaks.currentStreak}
            longestStreak={stats.streaks.longestStreak}
            daysActiveLast30={stats.streaks.daysActiveLast30}
          />
        </motion.div>
      )}

      {/* ===== 3. Stats Grid (2×2 Clean Blocks) ===== */}
      <motion.div variants={containerStagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBlock
          icon={FileText}
          value={stats?.counts.flashcardSets || 0}
          label="Flashcard Sets"
          color="#193827"
          iconBg="#1938271a"
        />
        <StatBlock
          icon={Brain}
          value={stats?.counts.quizzes || 0}
          label="Quizzes Created"
          color="#ff5252"
          iconBg="#ff52521a"
        />
        <StatBlock
          icon={Clock}
          value={studyTimeDisplay}
          label="Total Study Time"
          color="#2d6b4d"
          iconBg="#2d6b4d1a"
        />
        <StatBlock
          icon={Target}
          value={`${stats?.performance.averageScore || 0}%`}
          label="Average Score"
          color="#ff5252"
          iconBg="#ff52521a"
          trend={stats ? { value: 'this month', positive: (stats.performance.averageScore || 0) >= 60 } : undefined}
        />
      </motion.div>

      {/* ===== 4. Recent Activity + Quick Actions ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (takes 2 columns) */}
        <motion.div variants={fadeSlideUp} className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <h2 className="text-base font-heading font-medium text-neutral-800">Recent Activity</h2>
              </div>
              <span className="text-xs text-neutral-400">
                {allRecentActivities.length} activities
              </span>
            </div>

            {allRecentActivities.length > 0 ? (
              <div className="space-y-1">
                {allRecentActivities.map((activity, idx) => {
                  const Icon = activity.icon
                  return (
                    <motion.div
                      key={`${activity.type}-${activity.id}`}
                      variants={activityItem}
                      custom={idx}
                      onClick={() => router.push(`/dashboard/${activity.type === 'quiz' ? 'quiz' : 'flashcards'}`)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 cursor-pointer transition-all group"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.bg}`}>
                        <Icon className="w-4 h-4" style={{ color: activity.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-heading font-medium text-neutral-800 truncate group-hover:text-primary-500 transition-colors">
                          {activity.title}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-neutral-400">
                          {formatRelativeTime(activity.date)}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center py-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-neutral-400" />
                </div>
                <p className="text-sm font-heading font-medium text-neutral-600 mb-0.5">
                  No recent activity yet
                </p>
                <p className="text-xs text-neutral-400">Start by creating flashcards or taking a quiz</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions (takes 1 column) */}
        <motion.div variants={fadeSlideUp}>
          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-base font-heading font-medium text-neutral-800 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/flashcards"
                className="block p-4 rounded-xl border-2 border-neutral-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <Plus className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-heading font-medium text-neutral-800 group-hover:text-primary-600 transition-colors">
                      New Flashcards
                    </p>
                    <p className="text-xs text-neutral-500">Create AI-powered cards</p>
                  </div>
                </motion.div>
              </Link>

              <Link
                href="/dashboard/quiz"
                className="block p-4 rounded-xl border-2 border-neutral-100 hover:border-secondary-200 hover:bg-secondary-50/30 transition-all group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-secondary-50 flex items-center justify-center group-hover:bg-secondary-100 transition-colors">
                    <Brain className="w-5 h-5 text-secondary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-heading font-medium text-neutral-800 group-hover:text-secondary-600 transition-colors">
                      Generate Quiz
                    </p>
                    <p className="text-xs text-neutral-500">Test your knowledge</p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== 5. Performance Section ===== */}
      {stats && (
        <motion.div variants={fadeSlideUp}>
          <div className="bg-white rounded-xl shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-neutral-400" />
                <h2 className="text-base font-heading font-medium text-neutral-800">Learning Performance</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: 'Accuracy',
                  value: `${stats.performance.averageScore}%`,
                  icon: Target,
                  color: '#193827',
                  bg: 'bg-[#193827]/5',
                },
                {
                  label: 'Active Days',
                  value: `${stats.streaks.daysActiveLast30} / 30`,
                  icon: Calendar,
                  color: '#ff5252',
                  bg: 'bg-[#ff5252]/5',
                },
                {
                  label: 'Cards/min',
                  value: stats.performance.cardsPerMinute.toFixed(1),
                  icon: Zap,
                  color: '#2d6b4d',
                  bg: 'bg-[#2d6b4d]/5',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.label}
                    variants={statCardItem}
                    className={`p-4 rounded-xl ${item.bg} shadow-sm`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 font-medium">
                          {item.label}
                        </p>
                        <p className="text-lg font-heading font-semibold text-neutral-800">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== First Time Welcome Modal ===== */}
      <FirstTimeModal
        show={showWelcome}
        onClose={() => setShowWelcome(false)}
      />

      {/* ===== 6. Top Subject ===== */}
      {stats?.activityPatterns.mostActiveSubject && (
        <motion.div variants={fadeSlideUp}>
          <div className="bg-white rounded-xl shadow-md p-5">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-14 h-14 rounded-2xl bg-secondary-50 flex items-center justify-center flex-shrink-0"
              >
                <BookOpen className="w-6 h-6 text-secondary-500" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 font-medium mb-0.5">Most Active Subject</p>
                <h3 className="text-lg font-heading font-semibold text-neutral-800">
                  {stats.activityPatterns.mostActiveSubject.subject}
                </h3>
                <div className="mt-2 h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${Math.min(
                        stats.activityPatterns.mostActiveSubject.count * 10,
                        100
                      )}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-secondary-500 to-secondary-400"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {stats.activityPatterns.mostActiveSubject.count} activities
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

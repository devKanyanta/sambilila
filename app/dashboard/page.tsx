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
} from 'lucide-react'
import AnimatedSection, { AnimatedItem } from './components/AnimatedSection'
import StreakCard from './components/StreakCard'
import {
  fadeSlideDown,
  fadeSlideUp,
  statCardItem,
  quickActionItem,
  activityItem,
  cardHover,
  buttonHover,
  containerStagger,
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-10 h-10">
          <div className="w-10 h-10 border-2 border-neutral-200 rounded-full" />
          <div className="absolute top-0 left-0 w-10 h-10 border-2 border-[#ff5252] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-neutral-800 mb-1">
          Unable to load dashboard
        </h3>
        <p className="text-sm text-neutral-500 mb-6">{error}</p>
        <motion.button
          onClick={fetchDashboardData}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#ff5252] hover:bg-[#fc0b06] transition-all"
        >
          Try Again
        </motion.button>
      </div>
    )
  }

  const allRecentActivities = [
    ...(recentActivity?.quizResults.slice(0, 2).map((r) => ({
      type: 'quiz' as const,
      id: r.id,
      title: r.quiz.title,
      description: `${r.score}/${r.totalQuestions} correct`,
      date: r.completedAt,
      icon: Brain,
      color: '#ff5252',
    })) || []),
    ...(recentActivity?.studySessions.slice(0, 2).map((s) => ({
      type: 'study' as const,
      id: s.id,
      title: `${s.cardsStudied} questions studied`,
      description: `${s.correctAnswers} correct • ${s.duration} min`,
      date: s.startedAt,
      icon: BookOpen,
      color: '#193827',
    })) || []),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  const statCards = [
    {
      name: 'Flashcard Sets',
      value: stats?.counts.flashcardSets.toString() || '0',
      icon: FileText,
      color: '#193827',
      bg: 'bg-[#193827]/5',
    },
    {
      name: 'Quizzes',
      value: stats?.counts.quizzes.toString() || '0',
      icon: Brain,
      color: '#ff5252',
      bg: 'bg-[#ff5252]/5',
    },
    {
      name: 'Sessions',
      value: stats?.counts.studySessions.toString() || '0',
      icon: BookOpen,
      color: '#2d6b4d',
      bg: 'bg-[#2d6b4d]/5',
    },
    {
      name: 'Avg Score',
      value: `${stats?.performance.averageScore || 0}%`,
      icon: Target,
      color: '#ff5252',
      bg: 'bg-[#ff5252]/5',
    },
  ]

  return (
    <div className="space-y-8">
      {/* ===== 1. Welcome Header ===== */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeSlideDown}
        className="flex items-center gap-4"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}            className="w-12 h-12 rounded-2xl bg-[#193827]/10 flex items-center justify-center text-xl"
        >
          {userProfile?.userType === 'TEACHER' ? '👨‍🏫' : '👨‍🎓'}
        </motion.div>
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-semibold text-neutral-800">
            Welcome back, {userProfile?.name || 'Student'}!
          </h1>
          <p className="text-sm text-neutral-500">Ready to continue learning?</p>
        </div>
      </motion.div>

      {/* ===== 2. Streak Card ===== */}
      {stats && (
        <AnimatedSection variants={containerStagger}>
          <AnimatedItem>
            <StreakCard
              currentStreak={stats.streaks.currentStreak}
              longestStreak={stats.streaks.longestStreak}
              daysActiveLast30={stats.streaks.daysActiveLast30}
            />
          </AnimatedItem>
        </AnimatedSection>
      )}

      {/* ===== 3. Stats Grid (Consolidated) ===== */}
      <AnimatedSection>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <AnimatedItem key={stat.name} variants={statCardItem}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className={`${stat.bg} rounded-xl p-5 shadow-md`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center bg-white shadow-sm"
                    >
                      <Icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                    <span className="text-lg font-heading font-semibold text-neutral-800">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-medium">{stat.name}</p>
                </motion.div>
              </AnimatedItem>
            )
          })}
        </div>
      </AnimatedSection>

      {/* ===== 4. Quick Actions + Recent Activity ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <AnimatedSection className="lg:col-span-2">
          <motion.div
            variants={fadeSlideUp}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-base font-heading font-semibold text-neutral-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/dashboard/flashcards"
                className="p-4 rounded-xl border border-neutral-200 hover:border-[#193827]/30 hover:shadow-md transition-all text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className="w-12 h-12 rounded-xl bg-[#193827]/10 flex items-center justify-center mx-auto mb-3"
                >
                  <Plus className="w-6 h-6 text-[#193827]" />
                </motion.div>
                <p className="font-heading font-semibold text-sm text-neutral-800">
                  New Flashcards
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">Create and study</p>
              </Link>
              <Link
                href="/dashboard/quiz"
                className="p-4 rounded-xl border border-neutral-200 hover:border-[#ff5252]/30 hover:shadow-md transition-all text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className="w-12 h-12 rounded-xl bg-[#ff5252]/10 flex items-center justify-center mx-auto mb-3"
                >
                  <Brain className="w-6 h-6 text-[#ff5252]" />
                </motion.div>
                <p className="font-heading font-semibold text-sm text-neutral-800">
                  Generate Quiz
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">Test your knowledge</p>
              </Link>
            </div>
          </motion.div>
        </AnimatedSection>

        {/* Recent Activity */}
        <AnimatedSection>
          <motion.div
            variants={fadeSlideUp}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-base font-heading font-semibold text-neutral-800 mb-4">
              Recent Activity
            </h2>
            {allRecentActivities.length > 0 ? (
              <div className="space-y-2">
                {allRecentActivities.map((activity, idx) => {
                  const Icon = activity.icon
                  return (
                    <motion.div
                      key={`${activity.type}-${activity.id}`}
                      variants={activityItem}
                      custom={idx}
                      onClick={() => router.push(`/dashboard/${activity.type}`)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${activity.color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: activity.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-heading font-medium text-neutral-800 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-400 flex-shrink-0">
                        {formatRelativeTime(activity.date)}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-5 h-5 text-neutral-400" />
                </div>
                <p className="text-sm font-heading font-medium text-neutral-600 mb-0.5">
                  No recent activity
                </p>
                <p className="text-xs text-neutral-400">Start by creating flashcards</p>
              </div>
            )}
          </motion.div>
        </AnimatedSection>
      </div>

      {/* ===== 5. Performance ===== */}
      {stats && (
        <AnimatedSection>
          <motion.div
            variants={fadeSlideUp}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-base font-heading font-semibold text-neutral-800 mb-4">
              Performance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: 'Accuracy',
                  value: `${stats.performance.averageScore}%`,
                  icon: Target,
                  color: '#193827',
                  bg: 'bg-[#193827]/5',
                  border: 'border-[#193827]/10',
                },
                {
                  label: 'Active Days',
                  value: `${stats.streaks.daysActiveLast30} / 30`,
                  icon: Calendar,
                  color: '#ff5252',
                  bg: 'bg-[#ff5252]/5',
                  border: 'border-[#ff5252]/10',
                },
                {
                  label: 'Cards/Min',
                  value: stats.performance.cardsPerMinute.toFixed(1),
                  icon: Zap,
                  color: '#2d6b4d',
                  bg: 'bg-[#2d6b4d]/5',
                  border: 'border-[#2d6b4d]/10',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <AnimatedItem key={item.label} variants={statCardItem}>
                    <div className={`p-4 rounded-xl ${item.bg} shadow-sm`}>
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
                    </div>
                  </AnimatedItem>
                )
              })}
            </div>
          </motion.div>
        </AnimatedSection>
      )}

      {/* ===== 6. Top Subject ===== */}
      {stats?.activityPatterns.mostActiveSubject && (
        <AnimatedSection>
          <motion.div
            variants={fadeSlideUp}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-base font-heading font-semibold text-neutral-800 mb-4">
              Top Subject
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#ff5252]/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-[#ff5252]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-heading font-semibold text-neutral-800">
                  {stats.activityPatterns.mostActiveSubject.subject}
                </h3>
                <p className="text-sm text-neutral-500">
                  {stats.activityPatterns.mostActiveSubject.count} activities
                </p>
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
                    className="h-full rounded-full bg-gradient-to-r from-[#ff5252] to-[#ff7a7a]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatedSection>
      )}

      {/* Quick tip footer */}
      <AnimatedSection>
        <motion.div
          variants={fadeSlideUp}
          className="text-center py-4"
        >
          <p className="text-xs text-neutral-400">
            💡 Tip: Use spaced repetition for better retention!
          </p>
        </motion.div>
      </AnimatedSection>
    </div>
  )
}

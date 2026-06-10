// app/dashboard/admin/types/admin.ts

export interface AdminUser {
  id: string
  email: string
  name: string
  avatar: string | null
  userType: 'STUDENT' | 'TEACHER'
  suspended: boolean
  createdAt: string
  subscription: {
    planName: string
    planSlug: string
    status: string
    priceUSD: number
    period: string
    currentPeriodEnd: string | null
  } | null
  usage: {
    quizzesCreatedThisWeek: number
    flashcardsCreated: number
    studySessionsTotal: number
    quizResultsTotal: number
  }
}

export interface UsersResponse {
  users: AdminUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    totalUsers: number
    activeSubscriptions: number
    suspendedUsers: number
    totalRevenue: number
  }
}

export interface AdminStats {
  summary: {
    totalUsers: number
    totalStudents: number
    totalTeachers: number
    activeSubscriptions: number
    totalRevenueUSD: number
    mrrUSD: number
    suspendedUsers: number
    usersJoinedThisMonth: number
  }
  planDistribution: Record<string, number>
  userGrowth: Array<{ month: string; count: number }>
  revenueOverTime: Array<{ month: string; revenue: number }>
  topUsersByUsage: Array<{
    userId: string
    name: string
    totalQuizzes: number
    totalFlashcards: number
  }>
}

export interface UserDetail {
  user: {
    id: string
    email: string
    name: string
    avatar: string | null
    userType: 'STUDENT' | 'TEACHER'
    suspended: boolean
    createdAt: string
    updatedAt: string
  }
  currentSubscription: {
    id: string
    plan: { id: string; name: string; slug: string; priceUSD: number; period: string }
    status: string
    provider: string
    currentPeriodEnd: string | null
    currentPeriodStart: string | null
    canceledAt: string | null
    createdAt: string
  } | null
  subscriptionHistory: Array<{
    id: string
    plan: { name: string; slug: string; priceUSD: number }
    status: string
    provider: string
    currentPeriodEnd: string | null
    createdAt: string
  }>
  monthlyUsage: Array<{ month: string; quizzes: number; flashcards: number }>
  recentActivity: {
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
}

export interface PlanOption {
  id: string
  name: string
  slug: string
  priceUSD: number
  period: string
}

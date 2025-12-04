export interface ProfileResponse {
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

export interface UpdateProfileRequest {
  name?: string
  userType?: 'STUDENT' | 'TEACHER'
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ProfileStatsResponse {
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
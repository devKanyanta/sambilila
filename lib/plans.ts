// lib/plans.ts — Plan definitions (source of truth)

export interface PlanLimits {
  maxQuizzesPerWeek: number | null  // null = unlimited
  maxFlashcardsTotal: number | null
  maxQuestionsPerQuiz: number | null
  priorityProcessing: boolean
  progressTracking: boolean
}

export interface PlanDefinition {
  name: string
  slug: string
  priceUSD: number
  period: 'week' | 'month'
  description: string
  features: string[]
  limits: PlanLimits
  highlighted: boolean
  paypalPlanId?: string
}

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    name: 'Free',
    slug: 'free',
    priceUSD: 0,
    period: 'month',
    description: 'Best for students trying out the app',
    features: [
      'Create up to 3 quizzes per week',
      'Create up to 50 flashcards total',
      'Max 10 questions per quiz',
    ],
    limits: {
      maxQuizzesPerWeek: 3,
      maxFlashcardsTotal: 50,
      maxQuestionsPerQuiz: 10,
      priorityProcessing: false,
      progressTracking: false,
    },
    highlighted: false,
  },
  weekly: {
    name: 'Weekly',
    slug: 'weekly',
    priceUSD: 0.99,
    period: 'week',
    description: 'Best for short term studying during exams',
    features: [
      'Create unlimited quizzes',
      'Create up to 500 flashcards total',
      'Max 50 questions per quiz',
      'Access full quiz history',
    ],
    limits: {
      maxQuizzesPerWeek: null,
      maxFlashcardsTotal: 500,
      maxQuestionsPerQuiz: 50,
      priorityProcessing: false,
      progressTracking: true,
    },
    highlighted: true,
    paypalPlanId: process.env.PAYPAL_WEEKLY_PLAN_ID,
  },
  monthly: {
    name: 'Monthly',
    slug: 'monthly',
    priceUSD: 3.99,
    period: 'month',
    description: 'Best for committed students & exam preparation',
    features: [
      'Create unlimited quizzes',
      'Create unlimited flashcards',
      'Progress tracking',
      'Performance stats',
      'Priority processing',
    ],
    limits: {
      maxQuizzesPerWeek: null,
      maxFlashcardsTotal: null,
      maxQuestionsPerQuiz: null,
      priorityProcessing: true,
      progressTracking: true,
    },
    highlighted: false,
    paypalPlanId: process.env.PAYPAL_MONTHLY_PLAN_ID,
  },
}

export function getPlan(slug: string): PlanDefinition | undefined {
  return PLANS[slug]
}

export function getPlanByPrice(priceUSD: number): PlanDefinition | undefined {
  return Object.values(PLANS).find((p) => p.priceUSD === priceUSD)
}

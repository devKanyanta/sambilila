// lib/plans.ts — Plan types and PayPal config (actual plan data comes from DB)

export interface PlanLimits {
  maxQuizzesPerWeek: number | null  // null = unlimited
  maxFlashcardsTotal: number | null
  maxQuestionsPerQuiz: number | null
  priorityProcessing: boolean
  progressTracking: boolean
}

// PayPal-specific config (not stored in DB because paypalPlanId is env-var based)
export const PAYPAL_PLAN_IDS: Record<string, string | undefined> = {
  weekly: process.env.PAYPAL_WEEKLY_PLAN_ID,
  monthly: process.env.PAYPAL_MONTHLY_PLAN_ID,
}

export function getPaypalPlanId(slug: string): string | undefined {
  return PAYPAL_PLAN_IDS[slug]
}

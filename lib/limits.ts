// lib/limits.ts — Usage enforcement helpers

import { prisma } from '@/lib/db'
import { getActiveSubscription } from './subscriptions'
import { PLANS, PlanLimits, type PlanDefinition } from './plans'
import { UsageResource } from './generated/prisma/client'

export class LimitReachedError extends Error {
  public limit: number | null
  public used: number
  public plan: string
  public resource: string

  constructor(resource: string, limit: number | null, used: number, plan: string) {
    super(`You've reached your ${resource} limit on the ${plan} plan. Upgrade to create more.`)
    this.name = 'LimitReachedError'
    this.limit = limit
    this.used = used
    this.plan = plan
    this.resource = resource
  }
}

export interface UsageCheckResult {
  allowed: boolean
  limit: number | null
  used: number
  plan: string
}

/**
 * Check if a user is allowed to perform a given resource creation action.
 * Throws LimitReachedError if not allowed.
 */
export async function checkAndRecordUsage(
  userId: string,
  resource: 'quiz' | 'flashcard'
): Promise<void> {
  const result = await checkUsageLimit(userId, resource)

  if (!result.allowed) {
    throw new LimitReachedError(resource, result.limit, result.used, result.plan)
  }

  // Record usage
  await recordUsage(userId, resource)
}

/**
 * Check if a user is allowed to perform a given resource creation action.
 * Returns the check result without recording.
 */
export async function checkUsageLimit(
  userId: string,
  resource: 'quiz' | 'flashcard'
): Promise<UsageCheckResult> {
  const activeSub = await getActiveSubscription(userId)
  const planSlug = activeSub?.plan.slug || 'free'
  const plan = PLANS[planSlug] || PLANS.free

  const limits = plan.limits

  if (resource === 'quiz') {
    // Rolling 7-day window
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const count = await prisma.usageRecord.count({
      where: {
        userId,
        resource: UsageResource.QUIZ_CREATION,
        createdAt: { gte: sevenDaysAgo },
      },
    })

    const limit = limits.maxQuizzesPerWeek
    if (limit === null) {
      return { allowed: true, limit: null, used: count, plan: planSlug }
    }

    return {
      allowed: count < limit,
      limit,
      used: count,
      plan: planSlug,
    }
  } else {
    // Total flashcard count (all time)
    const count = await prisma.usageRecord.count({
      where: {
        userId,
        resource: UsageResource.FLASHCARD_CREATION,
      },
    })

    const limit = limits.maxFlashcardsTotal
    if (limit === null) {
      return { allowed: true, limit: null, used: count, plan: planSlug }
    }

    return {
      allowed: count < limit,
      limit,
      used: count,
      plan: planSlug,
    }
  }
}

/**
 * Record a usage event for a user.
 */
export async function recordUsage(
  userId: string,
  resource: 'quiz' | 'flashcard'
): Promise<void> {
  const usageResource =
    resource === 'quiz'
      ? UsageResource.QUIZ_CREATION
      : UsageResource.FLASHCARD_CREATION

  await prisma.usageRecord.create({
    data: {
      userId,
      resource: usageResource,
    },
  })
}

/**
 * Get current usage stats for a user (for display purposes).
 */
export async function getCurrentUsage(userId: string): Promise<{
  quizzesCreatedThisWeek: number
  flashcardsCreated: number
}> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [quizzesThisWeek, flashcardsTotal] = await Promise.all([
    prisma.usageRecord.count({
      where: {
        userId,
        resource: UsageResource.QUIZ_CREATION,
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.usageRecord.count({
      where: {
        userId,
        resource: UsageResource.FLASHCARD_CREATION,
      },
    }),
  ])

  return {
    quizzesCreatedThisWeek: quizzesThisWeek,
    flashcardsCreated: flashcardsTotal,
  }
}

/**
 * Get the effective limits for a user (based on their active plan).
 */
export async function getCurrentLimits(userId: string): Promise<PlanLimits> {
  const activeSub = await getActiveSubscription(userId)
  const planSlug = activeSub?.plan.slug || 'free'
  const plan = PLANS[planSlug] || PLANS.free
  return plan.limits
}

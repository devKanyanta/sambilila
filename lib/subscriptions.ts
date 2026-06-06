// lib/subscriptions.ts — Shared subscription helpers

import { prisma } from '@/lib/db'
import { SubscriptionStatus, PaymentProvider } from './generated/prisma/client'

export interface ActiveSubscriptionResult {
  id: string
  plan: {
    id: string
    name: string
    slug: string
    priceUSD: number
    period: string
    limits: any
    features: any
  }
  status: string
  provider: string
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  canceledAt: Date | null
}

/**
 * Get the user's active subscription (if any).
 * Returns null for free plan users.
 */
export async function getActiveSubscription(
  userId: string
): Promise<ActiveSubscriptionResult | null> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: { gte: new Date() },
    },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!subscription) return null

  return {
    id: subscription.id,
    plan: {
      id: subscription.plan.id,
      name: subscription.plan.name,
      slug: subscription.plan.slug,
      priceUSD: subscription.plan.priceUSD,
      period: subscription.plan.period,
      limits: subscription.plan.limits,
      features: subscription.plan.features,
    },
    status: subscription.status,
    provider: subscription.provider,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    canceledAt: subscription.canceledAt,
  }
}

/**
 * Create a new subscription record.
 */
export async function createSubscription(
  userId: string,
  planId: string,
  provider: 'PAYPAL' | 'LENCO',
  providerId?: string
) {
  return prisma.subscription.create({
    data: {
      userId,
      planId,
      provider: provider as PaymentProvider,
      providerId,
      status: SubscriptionStatus.PAST_DUE, // Always start as PAST_DUE; webhook activates it
    },
  })
}

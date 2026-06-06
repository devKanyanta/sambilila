// lib/webhookWorker.ts — Postgres-based webhook queue processor

import { prisma } from '@/lib/db'
import {
  PaymentProvider,
  WebhookEventStatus,
  SubscriptionStatus,
} from './generated/prisma/client'

/**
 * Process all pending webhook events from the queue.
 * Call this from a cron job or server-side interval.
 */
export async function processWebhookQueue(): Promise<{ processed: number; failed: number }> {
  let processed = 0
  let failed = 0

  while (true) {
    const event = await prisma.webhookEvent.findFirst({
      where: { status: WebhookEventStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    })

    if (!event) break

    try {
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { status: WebhookEventStatus.PROCESSING },
      })

      if (event.provider === PaymentProvider.PAYPAL) {
        await processPayPalEvent(event)
      } else if (event.provider === PaymentProvider.LENCO) {
        await processLencoEvent(event)
      }

      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: {
          status: WebhookEventStatus.COMPLETED,
          processedAt: new Date(),
        },
      })
      processed++
    } catch (err: any) {
      const newAttempts = event.attempts + 1
      const isFinal = newAttempts >= event.maxAttempts

      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: {
          status: isFinal ? WebhookEventStatus.FAILED : WebhookEventStatus.PENDING,
          attempts: newAttempts,
          lastError: err.message || String(err),
        },
      })
      failed++
    }
  }

  return { processed, failed }
}

/**
 * Process a PayPal webhook event.
 */
async function processPayPalEvent(event: any): Promise<void> {
  const payload = event.payload as any
  const eventType = payload.event_type

  const userId = payload.resource?.custom_id || payload.resource?.subscriber?.custom_id

  if (!userId) {
    console.warn('PayPal webhook missing custom_id (userId)')
    return
  }

  const subscriptionId = payload.resource?.id

  switch (eventType) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      // Find the pending subscription and activate it
      await handleSubscriptionActivated(userId, subscriptionId, 'PAYPAL', payload)
      break

    case 'BILLING.SUBSCRIPTION.CANCELLED':
      await handleSubscriptionCancelled(userId, subscriptionId)
      break

    case 'BILLING.SUBSCRIPTION.EXPIRED':
      await handleSubscriptionExpired(userId, subscriptionId)
      break

    case 'PAYMENT.SALE.COMPLETED':
      // Extend the subscription period
      await handleSaleCompleted(userId, subscriptionId, payload)
      break

    default:
      console.log(`Unhandled PayPal event: ${eventType}`)
  }
}

/**
 * Process a Lenco webhook event.
 */
async function processLencoEvent(event: any): Promise<void> {
  const payload = event.payload as any

  if (payload.status === 'completed') {
    // Find subscription by providerId (reference)
    const subscription = await prisma.subscription.findFirst({
      where: {
        provider: PaymentProvider.LENCO,
        providerId: payload.reference,
      },
      include: { plan: true },
    })

    if (!subscription) {
      console.warn(`Lenco: No subscription found for reference ${payload.reference}`)
      return
    }

    // Calculate period end based on plan
    const periodEnd = calculatePeriodEnd(
      new Date(),
      subscription.plan.period as 'week' | 'month'
    )

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    })
  }
}

/**
 * Handle subscription activated event (both PayPal and internal).
 */
async function handleSubscriptionActivated(
  userId: string,
  providerId: string,
  provider: 'PAYPAL' | 'LENCO',
  payload: any
): Promise<void> {
  // Find the pending subscription
  // Find the pending subscription and activate it
  const subscription = await prisma.subscription.findFirst({
    where: { userId, providerId, status: SubscriptionStatus.PAST_DUE },
    orderBy: { createdAt: 'desc' },
  })

  if (!subscription) return

  const plan = await prisma.billingPlan.findUnique({
    where: { id: subscription.planId },
  })

  if (!plan) return

  const periodEnd = calculatePeriodEnd(new Date(), plan.period as 'week' | 'month')

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    },
  })
}

/**
 * Handle subscription cancelled event.
 */
async function handleSubscriptionCancelled(
  userId: string,
  providerId: string
): Promise<void> {
  // Cancel the user's active subscription
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      provider: PaymentProvider.PAYPAL,
      status: SubscriptionStatus.ACTIVE,
    },
  })

  for (const sub of subscriptions) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
      },
    })
  }
}

/**
 * Handle subscription expired event.
 */
async function handleSubscriptionExpired(
  userId: string,
  providerId: string
): Promise<void> {
  const subscription = await prisma.subscription.findFirst({
    where: { providerId, provider: PaymentProvider.PAYPAL },
  })

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.EXPIRED },
    })
  }
}

/**
 * Handle sale completed (renewal payment).
 */
async function handleSaleCompleted(
  userId: string,
  providerId: string,
  payload: any
): Promise<void> {
  const subscription = await prisma.subscription.findFirst({
    where: { providerId, provider: PaymentProvider.PAYPAL },
    include: { plan: true },
  })

  if (!subscription) return

  // Extend the period
  const currentEnd = subscription.currentPeriodEnd || new Date()
  const periodEnd = calculatePeriodEnd(
    currentEnd,
    subscription.plan.period as 'week' | 'month'
  )

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: periodEnd,
    },
  })
}

/**
 * Calculate period end date from a start date.
 */
function calculatePeriodEnd(
  startDate: Date,
  period: 'week' | 'month'
): Date {
  const end = new Date(startDate)
  if (period === 'week') {
    end.setDate(end.getDate() + 7)
  } else {
    end.setMonth(end.getMonth() + 1)
  }
  return end
}

/**
 * Queue a webhook event for processing.
 */
export async function queueWebhookEvent(
  provider: 'PAYPAL' | 'LENCO',
  eventType: string,
  payload: any
): Promise<void> {
  await prisma.webhookEvent.create({
    data: {
      provider: provider as PaymentProvider,
      eventType,
      payload,
    },
  })
}

/**
 * Get the count of unprocessed webhook events.
 */
export async function getPendingWebhookCount(): Promise<number> {
  return prisma.webhookEvent.count({
    where: { status: WebhookEventStatus.PENDING },
  })
}

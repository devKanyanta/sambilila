// app/api/subscriptions/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getActiveSubscription } from '@/lib/subscriptions'
import { cancelSubscription as cancelPayPalSubscription } from '@/lib/paypal'
import { SubscriptionStatus, PaymentProvider } from '@/lib/generated/prisma/client'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await getActiveSubscription(userId)

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // If PayPal subscription, cancel at PayPal too
    // Gracefully handle cases where the subscription hasn't been activated yet
    if (subscription.provider === 'PAYPAL' && subscription.id) {
      try {
        const dbSub = await prisma.subscription.findUnique({
          where: { id: subscription.id },
        })
        if (dbSub?.providerId) {
          await cancelPayPalSubscription(dbSub.providerId, 'Cancelled by user')
        }
      } catch (err: any) {
        // If PayPal subscription hasn't been approved yet, cancel will fail.
        // That's fine — we'll just cancel locally.
        console.warn('PayPal cancel error (non-fatal, sub may not yet be approved):', err.message)
      }
    }

    // Cancel locally
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, message: 'Subscription cancelled' })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}

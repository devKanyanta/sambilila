// app/api/subscriptions/lenco/verify/route.ts
// Allows frontend to verify payment completion and activate subscription
import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/lenco'
import { prisma } from '@/lib/db'
import { SubscriptionStatus } from '@/lib/generated/prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 })
    }

    console.log(`[Lenco Verify] Checking payment status for reference: ${reference}`)

    // Find subscription by provider reference
    const subscription = await prisma.subscription.findFirst({
      where: { providerId: reference },
      include: { plan: true, user: true },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found for this reference' },
        { status: 404 }
      )
    }

    // Verify payment status with Lenco API
    const verification = await verifyPayment(reference)

    console.log(
      `[Lenco Verify] Payment status for ref=${reference}: ${verification.status}`
    )

    // If payment is completed and subscription is still PAST_DUE, activate it
    if (verification.status === 'completed' && subscription.status === SubscriptionStatus.PAST_DUE) {
      // Calculate billing period dates based on plan type
      const now = new Date()
      const currentPeriodStart = now
      const currentPeriodEnd = new Date()

      if (subscription.plan.period === 'week') {
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 7)
      } else if (subscription.plan.period === 'month') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
      }

      // Activate subscription
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart,
          currentPeriodEnd,
        },
      })

      console.log(
        `[Lenco Verify] Subscription activated: userId=${subscription.userId}, subscriptionId=${subscription.id}`
      )

      return NextResponse.json({
        success: true,
        paymentStatus: 'completed',
        subscriptionStatus: 'activated',
        message: 'Payment verified and subscription activated',
      })
    }

    return NextResponse.json({
      success: true,
      paymentStatus: verification.status,
      subscriptionStatus: subscription.status,
      message: `Payment status: ${verification.status}`,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed'
    console.error('[Lenco Verify] Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

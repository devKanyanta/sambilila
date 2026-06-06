// app/api/subscriptions/lenco/webhook/route.ts
// Handles Lenco payment completion webhooks
import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/lenco'
import { prisma } from '@/lib/db'
import { SubscriptionStatus } from '@/lib/generated/prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract payment reference from webhook payload
    const { reference, status } = body

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    console.log(`[Lenco Webhook] Received payment notification: ref=${reference}, status=${status}`)

    // Find subscription by provider reference
    const subscription = await prisma.subscription.findFirst({
      where: { providerId: reference },
      include: { plan: true, user: true },
    })

    if (!subscription) {
      console.warn(`[Lenco Webhook] Subscription not found for reference: ${reference}`)
      // Still return 200 to Lenco to acknowledge receipt
      return NextResponse.json({ success: true, message: 'Webhook received' })
    }

    // Only activate on successful payment
    if (status === 'completed') {
      // Verify payment status with Lenco API for extra security
      let verifiedStatus = status
      try {
        const verification = await verifyPayment(reference)
        verifiedStatus = verification.status
        console.log(
          `[Lenco Webhook] Verified payment status: ${verifiedStatus} for ref=${reference}`
        )
      } catch (verifyError) {
        console.warn(`[Lenco Webhook] Verification failed for ref=${reference}:`, verifyError)
        // Still proceed if verification fails (webhook is authoritative)
      }

      if (verifiedStatus === 'completed') {
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
          `[Lenco Webhook] Subscription activated: userId=${subscription.userId}, subscriptionId=${subscription.id}, planPeriod=${subscription.plan.period}`
        )
      }
    } else if (status === 'failed' || status === 'cancelled') {
      // Mark subscription as expired on failure
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.EXPIRED,
        },
      })

      console.log(
        `[Lenco Webhook] Subscription marked expired: userId=${subscription.userId}, subscriptionId=${subscription.id}, reason=${status}`
      )
    }

    // Acknowledge webhook receipt
    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
      subscriptionId: subscription.id,
      newStatus: status,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process webhook'
    console.error('[Lenco Webhook] Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

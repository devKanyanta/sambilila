// app/api/subscriptions/paypal/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth'
import { createSubscription as createPayPalSubscription } from '@/lib/paypal'
import { createSubscription as createDbSubscription } from '@/lib/subscriptions'
import { prisma } from '@/lib/db'
import { getPaypalPlanId } from '@/lib/plans'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planSlug } = await request.json()

    if (!planSlug || !['weekly', 'monthly'].includes(planSlug)) {
      return NextResponse.json({ error: 'Invalid plan slug' }, { status: 400 })
    }

    // Get PayPal plan ID from config (env-var based)
    const paypalPlanId = getPaypalPlanId(planSlug)
    if (!paypalPlanId) {
      return NextResponse.json(
        { error: 'PayPal plan ID not configured. Contact support.' },
        { status: 400 }
      )
    }

    // Get plan from database
    const dbPlan = await prisma.billingPlan.findUnique({ where: { slug: planSlug } })
    if (!dbPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?canceled=true`

    // Create PayPal subscription
    const { approvalUrl, subscriptionId } = await createPayPalSubscription(
      paypalPlanId,
      userId,
      returnUrl,
      cancelUrl
    )

    // Store subscription record (starts as PAST_DUE, webhook activates it)
    await createDbSubscription(userId, dbPlan.id, 'PAYPAL', subscriptionId)

    return NextResponse.json({ approvalUrl, subscriptionId })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create subscription'
    console.error('PayPal create subscription error:', error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

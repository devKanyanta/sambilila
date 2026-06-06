// app/api/subscriptions/paypal/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth'
import { createSubscription as createPayPalSubscription } from '@/lib/paypal'
import { createSubscription as createDbSubscription } from '@/lib/subscriptions'
import { prisma } from '@/lib/db'
import { PLANS } from '@/lib/plans'

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

    // Get the plan config (source of truth for PayPal plan IDs)
    const planConfig = PLANS[planSlug]
    if (!planConfig) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (!planConfig.paypalPlanId) {
      return NextResponse.json(
        { error: 'PayPal plan ID not configured. Contact support.' },
        { status: 400 }
      )
    }

    // Ensure the billing plan exists even if the database was not seeded.
    const dbPlan = await prisma.billingPlan.upsert({
      where: { slug: planSlug },
      update: {
        name: planConfig.name,
        priceUSD: planConfig.priceUSD,
        period: planConfig.period,
        features: planConfig.features,
        limits: planConfig.limits,
      },
      create: {
        name: planConfig.name,
        slug: planSlug,
        priceUSD: planConfig.priceUSD,
        period: planConfig.period,
        features: planConfig.features,
        limits: planConfig.limits,
      },
    })

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?canceled=true`

    // Create PayPal subscription
    const { approvalUrl, subscriptionId } = await createPayPalSubscription(
      planConfig.paypalPlanId,
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

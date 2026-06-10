// app/api/admin/users/[id]/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { SubscriptionStatus, PaymentProvider } from '@/lib/generated/prisma/client'

// PATCH /api/admin/users/[id]/subscription — Manage a user's subscription
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const { id: userId } = await params
    const body = await request.json()
    const { action, planSlug, provider, providerId } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    switch (action) {
      case 'change-plan': {
        if (!planSlug) {
          return NextResponse.json({ error: 'planSlug is required' }, { status: 400 })
        }

        const plan = await prisma.billingPlan.findUnique({ where: { slug: planSlug } })
        if (!plan) {
          return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
        }

        // Cancel current active subscription
        await prisma.subscription.updateMany({
          where: { userId, status: SubscriptionStatus.ACTIVE },
          data: { status: SubscriptionStatus.CANCELED, canceledAt: new Date() },
        })

        // Create new subscription
        const newSub = await prisma.subscription.create({
          data: {
            userId,
            planId: plan.id,
            status: SubscriptionStatus.ACTIVE,
            provider: provider as PaymentProvider || 'LENCO',
            providerId: providerId || `admin-${auth.email}-${Date.now()}`,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
          },
          include: { plan: true },
        })

        console.log(`[AUDIT] Admin ${auth.email} changed user ${userId} subscription to plan ${planSlug}`)

        return NextResponse.json({
          message: 'Subscription updated successfully',
          subscription: {
            id: newSub.id,
            plan: { name: newSub.plan.name, slug: newSub.plan.slug, priceUSD: newSub.plan.priceUSD },
            status: newSub.status,
            provider: newSub.provider,
            currentPeriodEnd: newSub.currentPeriodEnd?.toISOString() || null,
          },
        })
      }

      case 'cancel': {
        const activeSub = await prisma.subscription.findFirst({
          where: { userId, status: SubscriptionStatus.ACTIVE },
          include: { plan: true },
        })

        if (!activeSub) {
          return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
        }

        await prisma.subscription.update({
          where: { id: activeSub.id },
          data: { status: SubscriptionStatus.CANCELED, canceledAt: new Date() },
        })

        console.log(`[AUDIT] Admin ${auth.email} canceled user ${userId} subscription`)

        return NextResponse.json({ message: 'Subscription canceled successfully' })
      }

      case 'activate': {
        if (!planSlug) {
          return NextResponse.json({ error: 'planSlug is required' }, { status: 400 })
        }

        const plan = await prisma.billingPlan.findUnique({ where: { slug: planSlug } })
        if (!plan) {
          return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
        }

        const newSub = await prisma.subscription.create({
          data: {
            userId,
            planId: plan.id,
            status: SubscriptionStatus.ACTIVE,
            provider: (provider as PaymentProvider) || 'LENCO',
            providerId: providerId || `admin-${auth.email}-${Date.now()}`,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          include: { plan: true },
        })

        console.log(`[AUDIT] Admin ${auth.email} activated subscription for user ${userId} on plan ${planSlug}`)

        return NextResponse.json({
          message: 'Subscription activated successfully',
          subscription: {
            id: newSub.id,
            plan: { name: newSub.plan.name, slug: newSub.plan.slug, priceUSD: newSub.plan.priceUSD },
            status: newSub.status,
            provider: newSub.provider,
            currentPeriodEnd: newSub.currentPeriodEnd?.toISOString() || null,
          },
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: change-plan, cancel, activate' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error managing subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

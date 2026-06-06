// app/api/subscriptions/my/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth'
import { getActiveSubscription } from '@/lib/subscriptions'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await getActiveSubscription(userId)

    return NextResponse.json({
      subscription: subscription
        ? {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            provider: subscription.provider,
            currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
            canceledAt: subscription.canceledAt?.toISOString() || null,
          }
        : null,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

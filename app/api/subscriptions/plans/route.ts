// app/api/subscriptions/plans/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PLANS } from '@/lib/plans'

export async function GET() {
  try {
    const dbPlans = await prisma.billingPlan.findMany({
      where: { active: true },
    })

    const dbPlanBySlug = new Map(dbPlans.map((plan) => [plan.slug, plan]))

    // Always expose the configured plans so the UI can render options even if
    // the database was not seeded yet. DB values still win when present.
    const mergedPlans = Object.values(PLANS).map((configPlan) => {
      const dbPlan = dbPlanBySlug.get(configPlan.slug)

      return {
        id: dbPlan?.id || configPlan.slug,
        name: dbPlan?.name || configPlan.name,
        slug: configPlan.slug,
        priceUSD: dbPlan?.priceUSD ?? configPlan.priceUSD,
        period: dbPlan?.period || configPlan.period,
        description: configPlan.description,
        features: (dbPlan?.features as string[] | undefined) || configPlan.features,
        limits: dbPlan?.limits || configPlan.limits,
        highlighted: configPlan.highlighted,
      }
    })

    return NextResponse.json({ plans: mergedPlans })
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

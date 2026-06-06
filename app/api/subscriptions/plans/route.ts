// app/api/subscriptions/plans/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const dbPlans = await prisma.billingPlan.findMany({
      where: { active: true },
      orderBy: { priceUSD: 'asc' },
    })

    if (dbPlans.length === 0) {
      // Fallback: return minimal plan info if database is empty
      return NextResponse.json({
        plans: [
          {
            name: 'Free',
            slug: 'free',
            priceUSD: 0,
            period: 'month',
            description: 'Best for students trying out the app',
            features: [
              'Create up to 3 quizzes per week',
              'Create up to 3 flashcards per week',
              'Max 10 questions per quiz',
            ],
            limits: {
              maxQuizzesPerWeek: 3,
              maxFlashcardsTotal: 3,
              maxQuestionsPerQuiz: 10,
              priorityProcessing: false,
              progressTracking: false,
            },
            highlighted: false,
          },
        ],
      })
    }

    const plans = dbPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      priceUSD: plan.priceUSD,
      period: plan.period,
      description: plan.description,
      features: plan.features as string[],
      limits: plan.limits,
      highlighted: plan.highlighted,
    }))

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

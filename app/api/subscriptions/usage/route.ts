// app/api/subscriptions/usage/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth'
import { getCurrentUsage, getCurrentLimits } from '@/lib/limits'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [usage, limits] = await Promise.all([
      getCurrentUsage(userId),
      getCurrentLimits(userId),
    ])

    return NextResponse.json({
      quizzesCreatedThisWeek: usage.quizzesCreatedThisWeek,
      flashcardsCreated: usage.flashcardsCreated,
      limits: {
        maxQuizzesPerWeek: limits.maxQuizzesPerWeek,
        maxFlashcardsTotal: limits.maxFlashcardsTotal,
        maxQuestionsPerQuiz: limits.maxQuestionsPerQuiz,
        priorityProcessing: limits.priorityProcessing,
        progressTracking: limits.progressTracking,
      },
    })
  } catch (error) {
    console.error('Error fetching usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

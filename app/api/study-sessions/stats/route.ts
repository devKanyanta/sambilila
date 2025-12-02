import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.substring(7)
  try {
    const decoded = verifyToken(token)
    return decoded.userId
  } catch {
    return null
  }
}

// GET /api/study-sessions/stats - Get study statistics
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // all, week, month

    // Calculate date range based on period
    let startDate = new Date('2020-01-01') // Very old date for 'all'
    if (period === 'week') {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === 'month') {
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
    }

    // Get total study time
    const totalStudyTime = await prisma.studySession.aggregate({
      where: {
        userId,
        startedAt: { gte: startDate }
      },
      _sum: {
        duration: true
      }
    })

    // Get total sessions
    const totalSessions = await prisma.studySession.count({
      where: {
        userId,
        startedAt: { gte: startDate }
      }
    })

    // Get total cards studied
    const totalCardsStudied = await prisma.studySession.aggregate({
      where: {
        userId,
        startedAt: { gte: startDate }
      },
      _sum: {
        cardsStudied: true
      }
    })

    // Get accuracy rate
    const accuracyStats = await prisma.studySession.aggregate({
      where: {
        userId,
        startedAt: { gte: startDate },
        cardsStudied: { gt: 0 }
      },
      _sum: {
        cardsStudied: true,
        correctAnswers: true
      }
    })

    const accuracyRate = accuracyStats._sum.cardsStudied && accuracyStats._sum.correctAnswers
      ? Math.round((accuracyStats._sum.correctAnswers / accuracyStats._sum.cardsStudied) * 100)
      : 0

    // Get sessions by type
    const sessionsByType = await prisma.studySession.groupBy({
      by: ['sessionType'],
      where: {
        userId,
        startedAt: { gte: startDate }
      },
      _count: {
        id: true
      }
    })

    // Get weekly study time for chart
    const weeklyStudyTime = await prisma.studySession.groupBy({
      by: ['startedAt'],
      where: {
        userId,
        startedAt: { gte: startDate }
      },
      _sum: {
        duration: true
      },
      orderBy: {
        startedAt: 'asc'
      }
    })

    const stats = {
  sessionsByType: sessionsByType.reduce(
    (
      acc: Record<string, number>,
      item: {
        sessionType: string
        _count: { id: number }
      }
    ) => {
      acc[item.sessionType] = item._count.id
      return acc
    },
    {}
  ),

  weeklyStudyTime: weeklyStudyTime.map(
    (item: {
      startedAt: Date
      _sum: { duration: number | null }
    }) => ({
      date: item.startedAt,
      duration: item._sum.duration ?? 0,
    })
  ),
}

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get study stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
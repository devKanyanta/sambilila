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

// GET /api/quiz-results/stats - Get quiz statistics
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all'

    // Calculate date range based on period
    let startDate = new Date('2020-01-01')
    if (period === 'week') {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === 'month') {
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
    }

    // Get total quizzes taken
    const totalQuizzes = await prisma.quizResult.count({
      where: {
        userId,
        completedAt: { gte: startDate }
      }
    })

    // Get average score
    const averageScore = await prisma.quizResult.aggregate({
      where: {
        userId,
        completedAt: { gte: startDate }
      },
      _avg: {
        score: true
      }
    })

    // Get best score
    const bestScore = await prisma.quizResult.aggregate({
      where: {
        userId,
        completedAt: { gte: startDate }
      },
      _max: {
        score: true
      }
    })

    // Get quizzes by subject
    const quizzesBySubject = await prisma.quizResult.groupBy({
      by: ['quizId'],
      where: {
        userId,
        completedAt: { gte: startDate }
      },
      _count: {
        id: true
      },
      _avg: {
        score: true
      }
    })

    // Get quiz details for subjects
    const subjectStats = await Promise.all(
      quizzesBySubject.map(async (item: { quizId: any; _count: { id: any }; _avg: { score: any } }) => {
        const quiz = await prisma.quiz.findUnique({
          where: { id: item.quizId },
          select: { subject: true, title: true }
        })
        return {
          subject: quiz?.subject || 'Unknown',
          title: quiz?.title || 'Unknown',
          count: item._count.id,
          averageScore: Math.round(item._avg.score || 0)
        }
      })
    )

    // Group by subject
    const groupedBySubject = subjectStats.reduce((acc, item) => {
      if (!acc[item.subject]) {
        acc[item.subject] = {
          subject: item.subject,
          count: 0,
          totalScore: 0,
          quizzes: []
        }
      }
      acc[item.subject].count += item.count
      acc[item.subject].totalScore += item.averageScore * item.count
      acc[item.subject].quizzes.push(item)
      return acc
    }, {} as Record<string, any>)

    // Calculate average per subject
    Object.keys(groupedBySubject).forEach(subject => {
      const data = groupedBySubject[subject]
      data.averageScore = Math.round(data.totalScore / data.count)
      delete data.totalScore
    })

    // Get progress over time
    const progressOverTime = await prisma.quizResult.groupBy({
      by: ['completedAt'],
      where: {
        userId,
        completedAt: { gte: startDate }
      },
      _avg: {
        score: true
      },
      orderBy: {
        completedAt: 'asc'
      }
    })

    const stats = {
      totalQuizzes,
      averageScore: Math.round(averageScore._avg.score || 0),
      bestScore: Math.round(bestScore._max.score || 0),
      subjects: Object.values(groupedBySubject),
      progressOverTime: progressOverTime.map((item: { completedAt: any; _avg: { score: any } }) => ({
        date: item.completedAt,
        score: Math.round(item._avg.score || 0)
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get quiz stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
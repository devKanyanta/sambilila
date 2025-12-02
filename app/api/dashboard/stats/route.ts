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

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts for different resources
    const [
      flashcardSetsCount,
      quizzesCount,
      studySessionsCount,
      quizResultsCount,
      totalStudyTime,
      recentActivity
    ] = await Promise.all([
      // Flashcard sets count
      prisma.flashcardSet.count({ where: { userId } }),
      
      // Quizzes count
      prisma.quiz.count({ where: { userId } }),
      
      // Study sessions count
      prisma.studySession.count({ where: { userId } }),
      
      // Quiz results count
      prisma.quizResult.count({ where: { userId } }),
      
      // Total study time
      prisma.studySession.aggregate({
        where: { userId },
        _sum: { duration: true }
      }),
      
      // Recent activity (last 5 items)
      Promise.all([
        // Recent flashcard sets
        prisma.flashcardSet.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            title: true,
            subject: true,
            createdAt: true,
            _count: { select: { cards: true } }
          }
        }),
        // Recent quiz results
        prisma.quizResult.findMany({
          where: { userId },
          orderBy: { completedAt: 'desc' },
          take: 3,
          include: {
            quiz: {
              select: { title: true, subject: true }
            }
          }
        })
      ])
    ])

    const stats = {
      counts: {
        flashcardSets: flashcardSetsCount,
        quizzes: quizzesCount,
        studySessions: studySessionsCount,
        quizzesTaken: quizResultsCount,
        totalStudyMinutes: totalStudyTime._sum.duration || 0
      },
      recentActivity: {
        flashcardSets: recentActivity[0],
        quizResults: recentActivity[1]
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
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

// GET /api/quiz-results - Get user's quiz results
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const quizId = searchParams.get('quizId')

    const quizResults = await prisma.quizResult.findMany({
      where: { 
        userId,
        ...(quizId && { quizId })
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: limit
    })

    return NextResponse.json(quizResults)
  } catch (error) {
    console.error('Get quiz results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/quiz-results - Submit quiz results
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quizId, score, totalQuestions, answers } = await request.json()

    const quizResult = await prisma.quizResult.create({
      data: {
        score,
        totalQuestions,
        answers,
        userId,
        quizId,
        completedAt: new Date()
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true
          }
        }
      }
    })

    // Also create a study session record for the quiz
    await prisma.studySession.create({
      data: {
        duration: 0, // Could calculate actual duration if tracked
        cardsStudied: totalQuestions,
        correctAnswers: Math.round((score / 100) * totalQuestions),
        sessionType: 'QUIZ',
        userId,
        startedAt: new Date(),
        endedAt: new Date()
      }
    })

    return NextResponse.json(quizResult)
  } catch (error) {
    console.error('Create quiz result error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
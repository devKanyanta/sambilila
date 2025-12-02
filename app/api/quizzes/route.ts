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

// GET /api/quizzes - Get all quizzes for user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const subject = searchParams.get('subject')

    const quizzes = await prisma.quiz.findMany({
      where: { 
        userId,
        ...(subject && { subject })
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { 
            questions: true,
            results: true
          }
        },
        results: {
          take: 1,
          orderBy: { completedAt: 'desc' },
          select: {
            score: true,
            completedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error('Get quizzes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/quizzes - Create a new quiz
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, subject, description, questions } = await request.json()

    // Validate input
    if (!title || !subject || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        subject,
        description,
        userId,
        questions: {
          create: questions.map((question: any, index: number) => ({
            type: question.type,
            question: question.question,
            options: question.options || [],
            correctAnswer: JSON.stringify(question.correctAnswer),
            order: index
          }))
        }
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Create quiz error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
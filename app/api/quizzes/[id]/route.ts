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

// GET /api/quizzes/[id] - Get specific quiz
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quiz = await prisma.quiz.findFirst({
      where: { 
        id: params.id,
        userId 
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        results: {
          orderBy: { completedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            score: true,
            totalQuestions: true,
            completedAt: true
          }
        },
        _count: {
          select: {
            questions: true,
            results: true
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Get quiz error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/quizzes/[id] - Update quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, subject, description, questions } = await request.json()

    // Check if quiz exists and belongs to user
    const existingQuiz = await prisma.quiz.findFirst({
      where: { 
        id: params.id,
        userId 
      }
    })

    if (!existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Update quiz (in a real app, you might want more sophisticated update logic)
    const quiz = await prisma.quiz.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(subject && { subject }),
        ...(description && { description }),
        ...(questions && {
          // Delete existing questions and create new ones
          questions: {
            deleteMany: {},
            create: questions.map((question: any, index: number) => ({
              type: question.type,
              question: question.question,
              options: question.options || [],
              correctAnswer: JSON.stringify(question.correctAnswer),
              order: index
            }))
          }
        })
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Update quiz error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/quizzes/[id] - Delete quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if quiz exists and belongs to user
    const existingQuiz = await prisma.quiz.findFirst({
      where: { 
        id: params.id,
        userId 
      }
    })

    if (!existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Delete quiz (cascade will delete questions and results)
    await prisma.quiz.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Quiz deleted successfully' })
  } catch (error) {
    console.error('Delete quiz error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
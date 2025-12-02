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

// GET /api/study-sessions - Get user's study sessions
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const sessionType = searchParams.get('type')

    const studySessions = await prisma.studySession.findMany({
      where: { 
        userId,
        ...(sessionType && { sessionType: sessionType as any })
      },
      include: {
        flashcardSet: {
          select: {
            id: true,
            title: true,
            subject: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: limit
    })

    return NextResponse.json(studySessions)
  } catch (error) {
    console.error('Get study sessions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/study-sessions - Create a new study session
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      duration, 
      cardsStudied, 
      correctAnswers, 
      sessionType, 
      flashcardSetId,
      startedAt 
    } = await request.json()

    const studySession = await prisma.studySession.create({
      data: {
        duration,
        cardsStudied,
        correctAnswers,
        sessionType,
        flashcardSetId: flashcardSetId || null,
        userId,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        endedAt: new Date()
      },
      include: {
        flashcardSet: {
          select: {
            id: true,
            title: true,
            subject: true
          }
        }
      }
    })

    return NextResponse.json(studySession)
  } catch (error) {
    console.error('Create study session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
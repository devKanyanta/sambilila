import { NextRequest, NextResponse } from 'next/server'
import {prisma} from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
        
            if (!userId) {
              return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
            }
    

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            flashcardSets: true,
            quizResults: true,
            studySessions: true,
            quizzes: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Add additional stats
    const recentQuizResults = await prisma.quizResult.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        score: true,
        totalQuestions: true,
        completedAt: true,
        quiz: {
          select: {
            title: true,
            subject: true
          }
        }
      }
    })

    const recentStudySessions = await prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        duration: true,
        cardsStudied: true,
        correctAnswers: true,
        sessionType: true,
        startedAt: true,
        endedAt: true
      }
    })

    return NextResponse.json({
      user,
      stats: {
        totalQuizzes: user._count.quizzes,
        totalFlashcardSets: user._count.flashcardSets,
        totalQuizAttempts: user._count.quizResults,
        totalStudySessions: user._count.studySessions,
        averageScore: await calculateAverageScore(user.id)
      },
      recentActivity: {
        quizResults: recentQuizResults,
        studySessions: recentStudySessions
      }
    })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    
        if (!userId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }


    const data = await request.json()
    const { name, userType } = data

    // Validate input
    if (name && (typeof name !== 'string' || name.trim().length < 2)) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    if (userType && !['STUDENT', 'TEACHER'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name) updateData.name = name.trim()
    if (userType) updateData.userType = userType

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        userType: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    
    // Handle Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    
        if (!userId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }


    // Optional: Add confirmation logic here
    const { searchParams } = new URL(request.url)
    const confirm = searchParams.get('confirm')
    
    if (!confirm) {
      return NextResponse.json(
        { 
          error: 'Confirmation required',
          message: 'Please confirm account deletion by adding ?confirm=true to the URL'
        },
        { status: 400 }
      )
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to calculate average score
async function calculateAverageScore(userId: string): Promise<number> {
  const results = await prisma.quizResult.findMany({
    where: { userId },
    select: { score: true }
  })

  if (results.length === 0) return 0

  const total = results.reduce((sum, result) => sum + result.score, 0)
  return parseFloat((total / results.length).toFixed(2))
}
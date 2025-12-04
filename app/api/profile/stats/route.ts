import { NextRequest, NextResponse } from 'next/server'
import {prisma} from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

// GET - Get user statistics
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
                
                    if (!userId) {
                      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
                    }


    // Get basic counts
    const counts = await prisma.user.findUnique({
      where: { id: userId },
      select: {
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

    // Get quiz performance stats
    const quizResults = await prisma.quizResult.findMany({
      where: { userId },
      select: {
        score: true,
        totalQuestions: true,
        completedAt: true
      }
    })

    // Get study session stats
    const studySessions = await prisma.studySession.findMany({
      where: { userId },
      select: {
        duration: true,
        cardsStudied: true,
        correctAnswers: true,
        sessionType: true,
        startedAt: true
      }
    })

    // Calculate statistics
    const totalQuizScore = quizResults.reduce((sum, result) => sum + result.score, 0)
    const averageScore = quizResults.length > 0 
      ? parseFloat((totalQuizScore / quizResults.length).toFixed(2))
      : 0

    const totalStudyTime = studySessions.reduce((sum, session) => sum + session.duration, 0)
    const totalCardsStudied = studySessions.reduce((sum, session) => sum + session.cardsStudied, 0)

    // Get streak data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSessions = await prisma.studySession.findMany({
      where: {
        userId,
        startedAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        startedAt: true
      }
    })

    // Calculate current streak
    const sessionDates = recentSessions.map(s => 
      new Date(s.startedAt).toDateString()
    )
    const uniqueDays = [...new Set(sessionDates)]
    const sortedDays = uniqueDays.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    
    let currentStreak = 0
    let today = new Date()
    
    // Check if user studied today
    if (uniqueDays.includes(today.toDateString())) {
      currentStreak = 1
      let checkDate = new Date(today)
      
      // Count consecutive days backwards
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1)
        if (uniqueDays.includes(checkDate.toDateString())) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // Get activity by day of week
    const dayOfWeekStats = Array(7).fill(0)
    studySessions.forEach(session => {
      const day = new Date(session.startedAt).getDay()
      dayOfWeekStats[day]++
    })

    // Get most active subject
    const flashcardSubjects = await prisma.flashcardSet.groupBy({
      by: ['subject'],
      where: { userId },
      _count: true
    })

    const quizSubjects = await prisma.quiz.groupBy({
      by: ['subject'],
      where: { userId },
      _count: true
    })

    // Combine subject counts
    const subjectCounts: Record<string, number> = {}
    
    flashcardSubjects.forEach(subject => {
      subjectCounts[subject.subject] = (subjectCounts[subject.subject] || 0) + subject._count
    })
    
    quizSubjects.forEach(subject => {
      subjectCounts[subject.subject] = (subjectCounts[subject.subject] || 0) + subject._count
    })

    const mostActiveSubject = Object.entries(subjectCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([subject, count]) => ({ subject, count }))[0]

    return NextResponse.json({
      counts: {
        flashcardSets: counts?._count.flashcardSets || 0,
        quizzes: counts?._count.quizzes || 0,
        quizAttempts: counts?._count.quizResults || 0,
        studySessions: counts?._count.studySessions || 0
      },
      performance: {
        averageScore,
        totalQuizAttempts: quizResults.length,
        totalStudyTime, // in minutes
        totalCardsStudied,
        cardsPerMinute: totalStudyTime > 0 
          ? parseFloat((totalCardsStudied / totalStudyTime).toFixed(2))
          : 0
      },
      streaks: {
        currentStreak,
        longestStreak: currentStreak, // You might want to calculate this differently
        daysActiveLast30: uniqueDays.length
      },
      activityPatterns: {
        byDayOfWeek: dayOfWeekStats,
        mostActiveSubject: mostActiveSubject || null,
        preferredSessionType: studySessions.length > 0 
          ? studySessions.reduce((acc, session) => {
              acc[session.sessionType] = (acc[session.sessionType] || 0) + 1
              return acc
            }, {} as Record<string, number>)
          : {}
      }
    })

  } catch (error) {
    console.error('Error fetching profile stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
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

// POST /api/quizzes/generate - Generate quiz using AI
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topic, questionCount = 5, difficulty = 'beginner' } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would call an AI service here
    // For now, we'll generate dummy questions based on the topic
    const generatedQuestions = generateDummyQuestions(topic, questionCount, difficulty)

    // Create the quiz in the database
    const quiz = await prisma.quiz.create({
      data: {
        title: `${topic} Quiz`,
        subject: getSubjectFromTopic(topic),
        description: `AI-generated quiz about ${topic}`,
        userId,
        questions: {
          create: generatedQuestions.map((question, index) => ({
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
    console.error('Generate quiz error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate dummy questions (replace with actual AI integration)
function generateDummyQuestions(topic: string, count: number, difficulty: string) {
  const questions = []

  for (let i = 0; i < count; i++) {
    const questionTypes = ['multiple_choice', 'true_false', 'short_answer']
    const type = questionTypes[i % questionTypes.length]

    if (type === 'multiple_choice') {
      questions.push({
        type: 'MULTIPLE_CHOICE',
        question: `What is a key aspect of ${topic}?`,
        options: [
          'Option A related to ' + topic,
          'Option B related to ' + topic,
          'Option C related to ' + topic,
          'Correct answer about ' + topic
        ],
        correctAnswer: 3
      })
    } else if (type === 'true_false') {
      questions.push({
        type: 'TRUE_FALSE',
        question: `${topic} is an important subject in its field.`,
        correctAnswer: true
      })
    } else {
      questions.push({
        type: 'SHORT_ANSWER',
        question: `Name one important concept in ${topic}.`,
        correctAnswer: 'key concept'
      })
    }
  }

  return questions
}

function getSubjectFromTopic(topic: string): string {
  const lowerTopic = topic.toLowerCase()
  
  if (lowerTopic.includes('photo') || lowerTopic.includes('bio') || lowerTopic.includes('cell')) {
    return 'Biology'
  } else if (lowerTopic.includes('history') || lowerTopic.includes('war') || lowerTopic.includes('revolution')) {
    return 'History'
  } else if (lowerTopic.includes('python') || lowerTopic.includes('javascript') || lowerTopic.includes('program')) {
    return 'Programming'
  } else if (lowerTopic.includes('math') || lowerTopic.includes('algebra') || lowerTopic.includes('calculus')) {
    return 'Mathematics'
  } else if (lowerTopic.includes('chem') || lowerTopic.includes('element') || lowerTopic.includes('reaction')) {
    return 'Chemistry'
  } else {
    return 'General'
  }
}
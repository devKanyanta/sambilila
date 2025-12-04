// app/api/quizzes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

// GET - List all quizzes for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
        
            if (!userId) {
              return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
            }
    

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: any = {
      userId: userId,
    };

    if (subject) {
      where.subject = subject;
    }

    // Fetch quizzes with pagination
    const [quizzes, totalCount] = await Promise.all([
      prisma.quiz.findMany({
        where,
        include: {
          _count: {
            select: {
              questions: true,
              results: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.quiz.count({ where }),
    ]);

    return NextResponse.json({
      quizzes,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

// POST - Create a manual quiz (without AI generation)
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    
        if (!userId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }


    const body = await request.json();
    const { title, subject, description, questions } = body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Title and questions are required' },
        { status: 400 }
      );
    }

    // Validate each question
    for (const q of questions) {
      if (!q.type || !q.question || !q.correctAnswer) {
        return NextResponse.json(
          { error: 'Each question must have type, question, and correctAnswer' },
          { status: 400 }
        );
      }

      if (q.type === 'MULTIPLE_CHOICE' && (!q.options || q.options.length !== 4)) {
        return NextResponse.json(
          { error: 'Multiple choice questions must have exactly 4 options' },
          { status: 400 }
        );
      }
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        subject: subject || 'General',
        description,
        userId: userId,
        questions: {
          create: questions.map((q: any, index: number) => ({
            type: q.type,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            order: index + 1,
          })),
        },
      },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json({ quiz }, { status: 201 });

  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
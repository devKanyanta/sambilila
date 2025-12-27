// app/api/flashcards/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

/* ================= POST: Queue Flashcard Generation Job ================= */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contentType = req.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Use your existing upload route for file uploads
      // Or modify to also create a job
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/quizzes/upload`, {
        method: 'POST',
        headers: req.headers,
        body: await req.blob()
      })
      
      return NextResponse.json(await uploadResponse.json())
      
    } else if (contentType.includes('application/json')) {
      // Handle text input - create job
      const body = await req.json()
      
      if (!body.text || body.text.trim().length === 0) {
        return NextResponse.json({ error: 'Text required' }, { status: 400 })
      }

      const job = await prisma.flashcardJob.create({
        data: {
          userId,
          text: body.text,
          title: body.title || 'AI Generated quiz',
          subject: body.subject || 'General',
          description: body.description || 'Generated from text',
          status: 'PENDING'
        }
      })

      return NextResponse.json({ 
        success: true, 
        jobId: job.id,
        message: 'Flashcard generation queued. Please check back in a moment.' 
      })
      
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
    }
    
  } catch (err) {
    console.error('Error queuing job:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* ================= GET: Check Job Status ================= */
// export async function GET(req: NextRequest) {
//   try {
//     const userId = await getUserIdFromToken(req)
//     const searchParams = req.nextUrl.searchParams
//     const jobId = searchParams.get('jobId')

//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     // app/api/flashcards/route.ts - GET handler
// if (jobId) {
//   // Check specific job status
//   const job = await prisma.quizJob.findFirst({
//     where: { 
//       id: jobId,
//       userId 
//     },
//     include: {
//       quiz: {
//         include: { 
//           questions: { 
//             orderBy: { order: 'asc' } 
//           } 
//         }
//       }
//     }
//   })

//   if (!job) {
//     return NextResponse.json({ error: 'Job not found' }, { status: 404 })
//   }

//   return NextResponse.json({ 
//     job: {
//       id: job.id,
//       status: job.status,
//       error: job.error,
//       createdAt: job.createdAt,
//       title: job.title
//     },
//     // Access flashcardSet directly from job
//     flashcardSet: job.flashcardSet ? {
//       id: job.flashcardSet.id,
//       title: job.flashcardSet.title,
//       subject: job.flashcardSet.subject,
//       description: job.flashcardSet.description,
//       cards: job.flashcardSet.cards,
//       createdAt: job.flashcardSet.createdAt
//     } : null
//   })
//     } else {
//       // List all flashcard sets (existing functionality)
//       const flashcardSets = await prisma.flashcardSet.findMany({
//         where: { userId },
//         include: { cards: { orderBy: { order: 'asc' } } },
//         orderBy: { createdAt: 'desc' }
//       })

//       return NextResponse.json({ data: flashcardSets })
//     }
//   } catch (err) {
//     console.error('Get flashcards error:', err)
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
//   }
// }

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

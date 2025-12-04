// app/api/quizzes/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';
import { extractTextFromPDF } from '@/lib/pdf';
import { getUserIdFromToken } from '@/lib/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface GeneratedQuestion {
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  question: string;
  options?: string[];
  correctAnswer: string;
}

interface QuizGenerationResponse {
  title: string;
  subject: string;
  description: string;
  questions: GeneratedQuestion[];
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const text = formData.get('text') as string | null;
    const pdf = formData.get('pdf') as File | null;
    const numberOfQuestions = parseInt(formData.get('numberOfQuestions') as string) || 10;
    const difficulty = formData.get('difficulty') as string || 'medium';
    const questionTypes = formData.get('questionTypes') as string || 'MULTIPLE_CHOICE,TRUE_FALSE';

    // Extract content from either text or PDF
    let content = '';
    if (pdf) {
      // Convert File to Uint8Array
      const arrayBuffer = await pdf.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      content = await extractTextFromPDF(uint8Array);
    } else if (text) {
      content = text;
    } else {
      return NextResponse.json(
        { error: 'Please provide either text or a PDF file' },
        { status: 400 }
      );
    }

    if (content.length < 100) {
      return NextResponse.json(
        { error: 'Content is too short to generate a meaningful quiz' },
        { status: 400 }
      );
    }

    // Generate quiz using Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are an expert quiz creator. Based on the following content, create a comprehensive quiz.

Content:
${content}

Requirements:
- Generate exactly ${numberOfQuestions} questions
- Difficulty level: ${difficulty}
- Question types to include: ${questionTypes}
- Distribute question types evenly
- Ensure questions test understanding, not just memorization
- Make questions clear and unambiguous
- For multiple choice, provide 4 options with only one correct answer
- For true/false, ensure the statement is clearly true or false
- For short answer, make the expected answer concise (1-3 words or a short phrase)

Return your response as a valid JSON object with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "title": "A descriptive title for the quiz",
  "subject": "The main subject/topic",
  "description": "A brief description of what this quiz covers",
  "questions": [
    {
      "type": "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER",
      "question": "The question text",
      "options": ["option1", "option2", "option3", "option4"], // only for MULTIPLE_CHOICE
      "correctAnswer": "The correct answer"
    }
  ]
}

Important formatting rules:
- For MULTIPLE_CHOICE: options must be an array of exactly 4 strings, correctAnswer must be one of those options
- For TRUE_FALSE: omit options array, correctAnswer must be exactly "true" or "false"
- For SHORT_ANSWER: omit options array, correctAnswer should be the expected answer (case-insensitive matching will be used)
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let generatedText = response.text();

    // Clean up the response - remove markdown code blocks if present
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    let quizData: QuizGenerationResponse;
    try {
      quizData = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText);
      return NextResponse.json(
        { error: 'Failed to generate quiz. Please try again.' },
        { status: 500 }
      );
    }

    // Validate the generated quiz structure
    if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
      return NextResponse.json(
        { error: 'Invalid quiz structure generated' },
        { status: 500 }
      );
    }

    // Create the quiz in the database
    const quiz = await prisma.quiz.create({
      data: {
        title: quizData.title,
        subject: quizData.subject || 'General',
        description: quizData.description,
        userId: userId,
        questions: {
          create: quizData.questions.map((q, index) => ({
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

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        description: quiz.description,
        questionCount: quiz.questions.length,
      },
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
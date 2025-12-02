import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromToken, verifyToken } from '@/lib/auth'
import { extractTextFromPDF } from '@/lib/pdf'
import { generateFlashcardsFromText } from '@/lib/flashcardGenerator'
import { saveFlashcardSet } from './services/saveFlashcards'

/* ================= POST: Generate & Save Flashcards ================= */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }


    // Parse form data (supporting PDF upload or text)
    const contentType = req.headers.get('content-type') || ''
    let textContent = ''

    if (contentType.includes('application/json')) {
      const body = await req.json()
      if (!body.text || body.text.trim().length === 0) {
        return NextResponse.json({ error: 'Text required' }, { status: 400 })
      }
      textContent = body.text
    } else if (contentType.includes('multipart/form-data')) {
      // If using file upload (PDF), you need to parse FormData
      const formData = await req.formData()
      const file = formData.get('file') as File
      if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })
      const arrayBuffer = await file.arrayBuffer()
      textContent = await extractTextFromPDF(Buffer.from(arrayBuffer))
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
    }

    if (textContent.length < 50)
      return NextResponse.json({ error: 'Content too short to generate flashcards' }, { status: 400 })

    /// Generate flashcards using Gemini API
    const cards = await generateFlashcardsFromText(textContent);

    // Save to DB
    const savedSet = await saveFlashcardSet(userId, {
    title: "AI Generated Flashcards",
    subject: "General",
    description: "Generated from uploaded content",
    cards
    });

    return NextResponse.json({ data: savedSet })
  } catch (err) {
    console.error('Generate flashcards error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* ================= GET: Fetch User Flashcard Sets ================= */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }


    const flashcardSets = await prisma.flashcardSet.findMany({
      where: { userId },
      include: { cards: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ data: flashcardSets })
  } catch (err) {
    console.error('Get flashcards error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

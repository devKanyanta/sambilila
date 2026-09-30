// app/api/feedback/route.ts — Public feedback endpoints
// POST: submit feedback (anyone — signed-in users get linked automatically)
// GET:  approved feedback for the public testimonials wall

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

const MESSAGE_MAX = 600
const NAME_MAX = 60
const ROLE_MAX = 40

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const role = typeof body?.role === 'string' ? body.role.trim().slice(0, ROLE_MAX) : ''
    const rating = Number(body?.rating)

    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Feedback must be at least 10 characters' },
        { status: 400 }
      )
    }
    if (message.length > MESSAGE_MAX) {
      return NextResponse.json(
        { error: `Feedback must be at most ${MESSAGE_MAX} characters` },
        { status: 400 }
      )
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Please choose a star rating' }, { status: 400 })
    }

    // Optional identity: signed-in users are linked; guests/anonymous fall back
    // to the name they typed (feedback stays unlinked).
    const userId = await getUserIdFromToken(request)
    let resolvedName = name.slice(0, NAME_MAX)
    let email: string | null = null

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, isGuest: true },
      })
      if (user && !user.isGuest) {
        resolvedName = user.name
        email = user.email
      }
    }

    if (!resolvedName) {
      return NextResponse.json({ error: 'Please tell us your name' }, { status: 400 })
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: userId || null,
        name: resolvedName,
        email,
        role: role || null,
        rating,
        message,
        // Reviewed by a human before it appears on the landing page
        status: 'PENDING',
      },
    })

    return NextResponse.json(
      {
        success: true,
        id: feedback.id,
        message: 'Thank you! Your feedback was submitted and will appear after review.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const feedback = await prisma.feedback.findMany({
      where: { status: 'APPROVED' },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 24,
      select: {
        id: true,
        name: true,
        role: true,
        rating: true,
        message: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

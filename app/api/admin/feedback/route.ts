// app/api/admin/feedback/route.ts — Admin moderation for landing-page feedback
// GET:    list all feedback (newest first), optional ?status=PENDING|APPROVED|REJECTED
// PATCH:  approve / reject / feature a piece of feedback
// DELETE: remove a piece of feedback

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { FeedbackStatus } from '@/lib/generated/prisma/client'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status')

  const where =
    statusFilter && ['PENDING', 'APPROVED', 'REJECTED'].includes(statusFilter)
      ? { status: statusFilter as FeedbackStatus }
      : {}

  const feedback = await prisma.feedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const counts = {
    all: await prisma.feedback.count(),
    pending: await prisma.feedback.count({ where: { status: 'PENDING' } }),
    approved: await prisma.feedback.count({ where: { status: 'APPROVED' } }),
    rejected: await prisma.feedback.count({ where: { status: 'REJECTED' } }),
  }

  return NextResponse.json({ feedback, counts })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { id, status, featured } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing feedback id' }, { status: 400 })
    }

    if (status !== undefined && !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const data: {
      status?: FeedbackStatus
      featured?: boolean
      reviewedAt?: Date
    } = {}

    if (status !== undefined) {
      data.status = status
      data.reviewedAt = new Date()
    }
    if (featured !== undefined) data.featured = Boolean(featured)

    const feedback = await prisma.feedback.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, feedback })
  } catch (error) {
    console.error('Feedback update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing feedback id' }, { status: 400 })
  }

  await prisma.feedback.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

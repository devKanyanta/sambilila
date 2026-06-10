// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, isAdminEmail } from '@/lib/admin'

// GET /api/admin/users/[id] — Full user detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        userType: true,
        suspended: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get subscription history
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })

    // Get usage by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        userId: id,
        createdAt: { gte: sixMonthsAgo },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Aggregate usage by month
    const usageByMonth = new Map<string, { quizzes: number; flashcards: number }>()
    usageRecords.forEach((record) => {
      const month = record.createdAt.toISOString().slice(0, 7)
      if (!usageByMonth.has(month)) {
        usageByMonth.set(month, { quizzes: 0, flashcards: 0 })
      }
      const entry = usageByMonth.get(month)!
      if (record.resource === 'QUIZ_CREATION') entry.quizzes++
      if (record.resource === 'FLASHCARD_CREATION') entry.flashcards++
    })

    const monthlyUsage = Array.from(usageByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({ month, ...counts }))

    // Get recent activity
    const [recentQuizResults, recentStudySessions] = await Promise.all([
      prisma.quizResult.findMany({
        where: { userId: id },
        orderBy: { completedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          score: true,
          totalQuestions: true,
          completedAt: true,
          quiz: { select: { title: true, subject: true } },
        },
      }),
      prisma.studySession.findMany({
        where: { userId: id },
        orderBy: { startedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          duration: true,
          cardsStudied: true,
          correctAnswers: true,
          sessionType: true,
          startedAt: true,
          endedAt: true,
        },
      }),
    ])

    // Current active subscription
    const activeSub = subscriptions.find((s) => s.status === 'ACTIVE') || null

    return NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      currentSubscription: activeSub
        ? {
            id: activeSub.id,
            plan: {
              id: activeSub.plan.id,
              name: activeSub.plan.name,
              slug: activeSub.plan.slug,
              priceUSD: activeSub.plan.priceUSD,
              period: activeSub.plan.period,
            },
            status: activeSub.status,
            provider: activeSub.provider,
            currentPeriodEnd: activeSub.currentPeriodEnd?.toISOString() || null,
            currentPeriodStart: activeSub.currentPeriodStart?.toISOString() || null,
            canceledAt: activeSub.canceledAt?.toISOString() || null,
            createdAt: activeSub.createdAt.toISOString(),
          }
        : null,
      subscriptionHistory: subscriptions.map((s) => ({
        id: s.id,
        plan: { name: s.plan.name, slug: s.plan.slug, priceUSD: s.plan.priceUSD },
        status: s.status,
        provider: s.provider,
        currentPeriodEnd: s.currentPeriodEnd?.toISOString() || null,
        createdAt: s.createdAt.toISOString(),
      })),
      monthlyUsage,
      recentActivity: {
        quizResults: recentQuizResults.map((r) => ({
          ...r,
          completedAt: r.completedAt.toISOString(),
        })),
        studySessions: recentStudySessions.map((s) => ({
          ...s,
          startedAt: s.startedAt.toISOString(),
          endedAt: s.endedAt?.toISOString() || null,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching user detail:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/users/[id] — Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const body = await request.json()
    const { name, userType, suspended } = body

    // Prevent admin from suspending/deleting themselves
    if (typeof suspended === 'boolean') {
      const userToUpdate = await prisma.user.findUnique({
        where: { id },
        select: { email: true },
      })
      if (userToUpdate && isAdminEmail(userToUpdate.email) && auth.email === userToUpdate.email) {
        return NextResponse.json(
          { error: 'Cannot suspend or modify your own admin account' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (userType !== undefined) updateData.userType = userType
    if (suspended !== undefined) updateData.suspended = suspended

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        userType: true,
        suspended: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    console.log(`[AUDIT] Admin ${auth.email} updated user ${id}:`, JSON.stringify(updateData))

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] — Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const confirm = searchParams.get('confirm')

    if (!confirm) {
      return NextResponse.json(
        { error: 'Confirmation required', message: 'Add ?confirm=true to confirm deletion' },
        { status: 400 }
      )
    }

    // Prevent admin from deleting themselves
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    })

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (userToDelete.email === auth.email) {
      return NextResponse.json(
        { error: 'Cannot delete your own admin account' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    console.log(`[AUDIT] Admin ${auth.email} deleted user ${id} (${userToDelete.email})`)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



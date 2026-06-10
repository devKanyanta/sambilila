// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { SubscriptionStatus, UsageResource } from '@/lib/generated/prisma/client'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    const planFilter = searchParams.get('plan') || ''
    const statusFilter = searchParams.get('status') || ''
    const userTypeFilter = searchParams.get('userType') || ''

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (statusFilter === 'suspended') {
      where.suspended = true
    } else if (statusFilter === 'active') {
      where.suspended = false
    }

    if (userTypeFilter) {
      where.userType = userTypeFilter
    }

    // Get total count
    const total = await prisma.user.count({ where })

    // Get users
    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortBy === 'plan' ? 'createdAt' : sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        userType: true,
        suspended: true,
        createdAt: true,
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE },
          select: {
            status: true,
            currentPeriodEnd: true,
            plan: {
              select: {
                name: true,
                slug: true,
                priceUSD: true,
                period: true,
              },
            },
          },
          take: 1,
        },
        _count: {
          select: {
            quizzes: true,
            flashcardSets: true,
            studySessions: true,
            quizResults: true,
          },
        },
      },
    })

    // Get usage stats for these users
    const userIds = users.map((u) => u.id)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const usageRecords = await prisma.usageRecord.groupBy({
      by: ['userId', 'resource'],
      where: {
        userId: { in: userIds },
        createdAt: { gte: sevenDaysAgo },
      },
      _count: true,
    })

    // Build usage map: userId -> { quizzesCreatedThisWeek, flashcardsCreatedTotal }
    const usageMap = new Map<string, { quizzesCreatedThisWeek: number; flashcardsCreated: number }>()
    for (const record of usageRecords) {
      const key = record.userId
      if (!usageMap.has(key)) {
        usageMap.set(key, { quizzesCreatedThisWeek: 0, flashcardsCreated: 0 })
      }
      const entry = usageMap.get(key)!
      if (record.resource === UsageResource.QUIZ_CREATION) {
        entry.quizzesCreatedThisWeek += record._count
      } else if (record.resource === UsageResource.FLASHCARD_CREATION) {
        entry.flashcardsCreated += record._count
      }
    }

    // Get all-time flashcard counts
    const allTimeFlashcardRecords = await prisma.usageRecord.groupBy({
      by: ['userId'],
      where: {
        userId: { in: userIds },
        resource: UsageResource.FLASHCARD_CREATION,
      },
      _count: true,
    })

    const allTimeFlashcardMap = new Map<string, number>()
    for (const record of allTimeFlashcardRecords) {
      allTimeFlashcardMap.set(record.userId, record._count)
    }

    // Merge usage data
    const usersWithUsage = users.map((u) => {
      const sub = u.subscriptions[0]
      const weeklyUsage = usageMap.get(u.id)
      const allTimeFlashcards = allTimeFlashcardMap.get(u.id) || u._count.flashcardSets
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        avatar: u.avatar,
        userType: u.userType,
        suspended: u.suspended,
        createdAt: u.createdAt.toISOString(),
        subscription: sub
          ? {
              planName: sub.plan.name,
              planSlug: sub.plan.slug,
              status: sub.status,
              priceUSD: sub.plan.priceUSD,
              period: sub.plan.period,
              currentPeriodEnd: sub.currentPeriodEnd?.toISOString() || null,
            }
          : null,
        usage: {
          quizzesCreatedThisWeek: weeklyUsage?.quizzesCreatedThisWeek || u._count.quizzes,
          flashcardsCreated: allTimeFlashcards,
          studySessionsTotal: u._count.studySessions,
          quizResultsTotal: u._count.quizResults,
        },
      }
    })

    // Sort by plan if requested
    if (sortBy === 'plan') {
      usersWithUsage.sort((a, b) => {
        const aPlan = a.subscription?.planName || 'Free'
        const bPlan = b.subscription?.planName || 'Free'
        return sortOrder === 'asc' ? aPlan.localeCompare(bPlan) : bPlan.localeCompare(aPlan)
      })
    }

    // Filter by plan if specified (after fetching)
    // NOTE: Plan filtering is done post-query because plan info is on a related table (subscriptions),
    // not on the User model directly. This means pagination.total reflects ALL users matching the other
    // filters, not just those on the specified plan. This is a known MVP limitation — for better accuracy
    // at scale, this should be moved to a Prisma raw query or a sub-query filter.
    const filteredUsers = planFilter
      ? usersWithUsage.filter((u) => {
          const userPlanSlug = u.subscription?.planSlug || 'free'
          return userPlanSlug === planFilter
        })
      : usersWithUsage

    // Summary
    const activeSubscriptions = usersWithUsage.filter((u) => u.subscription?.status === 'ACTIVE').length
    const suspendedUsers = usersWithUsage.filter((u) => u.suspended).length
    const totalRevenue = usersWithUsage.reduce((sum, u) => {
      if (u.subscription?.status === 'ACTIVE' && u.subscription.priceUSD) {
        return sum + u.subscription.priceUSD
      }
      return sum
    }, 0)

    return NextResponse.json({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalUsers: total,
        activeSubscriptions,
        suspendedUsers,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      },
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

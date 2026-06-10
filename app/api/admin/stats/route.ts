// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { SubscriptionStatus } from '@/lib/generated/prisma/client'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    // Get total user counts
    const [totalUsers, totalStudents, totalTeachers, suspendedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { userType: 'STUDENT' } }),
      prisma.user.count({ where: { userType: 'TEACHER' } }),
      prisma.user.count({ where: { suspended: true } }),
    ])

    // Get subscription-related stats
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: SubscriptionStatus.ACTIVE },
    })

    // Aggregate all subscription revenue (from completed payments)
    const subscriptions = await prisma.subscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE },
      include: { plan: true },
    })

    const mrrUSD = subscriptions.reduce(
      (sum, sub) => {
        const price = sub.plan.priceUSD || 0
        // Normalize to monthly: divide weekly by 4.33
        if (sub.plan.period === 'week') return sum + price * 4.33
        return sum + price
      },
      0
    )

    // Total revenue: count all subscriptions ever created by their plan price at time of creation
    // For simplicity, sum active subscription prices
    const totalRevenueUSD = subscriptions.reduce(
      (sum, sub) => sum + (sub.plan.priceUSD || 0),
      0
    )

    // Plan distribution
    const allSubscriptions = await prisma.subscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE },
      include: { plan: true },
    })

    const planDistribution: Record<string, number> = { free: 0 }
    const subscribedUserIds = new Set<string>()

    allSubscriptions.forEach((sub) => {
      subscribedUserIds.add(sub.userId)
      const slug = sub.plan.slug
      planDistribution[slug] = (planDistribution[slug] || 0) + 1
    })

    planDistribution.free = totalUsers - subscribedUserIds.size

    // User growth by month (all time)
    const users = await prisma.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const userGrowthMap = new Map<string, number>()
    users.forEach((user) => {
      const month = user.createdAt.toISOString().slice(0, 7) // "YYYY-MM"
      userGrowthMap.set(month, (userGrowthMap.get(month) || 0) + 1)
    })

    // Running total
    let runningTotal = 0
    const userGrowth = Array.from(userGrowthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        runningTotal += count
        return { month, count: runningTotal }
      })

    // Revenue over time (by subscription creation month, based on plan price)
    const allPaidSubscriptions = await prisma.subscription.findMany({
      where: {
        plan: { priceUSD: { gt: 0 } },
      },
      include: { plan: true },
      orderBy: { createdAt: 'asc' },
    })

    const revenueMap = new Map<string, number>()
    allPaidSubscriptions.forEach((sub) => {
      const month = sub.createdAt.toISOString().slice(0, 7)
      const price = sub.plan.priceUSD || 0
      revenueMap.set(month, (revenueMap.get(month) || 0) + price)
    })

    let runningRevenue = 0
    const revenueOverTime = Array.from(revenueMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => {
        runningRevenue += revenue
        return { month, revenue: parseFloat(runningRevenue.toFixed(2)) }
      })

    // Users joined this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const usersJoinedThisMonth = await prisma.user.count({
      where: { createdAt: { gte: startOfMonth } },
    })

    // Top users by usage
    const usageRecords = await prisma.usageRecord.groupBy({
      by: ['userId'],
      _count: true,
    })

    const topUserIds = usageRecords
      .sort((a, b) => b._count - a._count)
      .slice(0, 5)
      .map((u) => u.userId)

    const topUsers = await prisma.user.findMany({
      where: { id: { in: topUserIds } },
      select: {
        id: true,
        name: true,
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

    const topUsersByUsage = topUsers
      .map((u) => ({
        userId: u.id,
        name: u.name,
        totalQuizzes: u._count.quizzes,
        totalFlashcards: u._count.flashcardSets,
      }))
      .sort((a, b) => b.totalQuizzes + b.totalFlashcards - (a.totalQuizzes + a.totalFlashcards))

    return NextResponse.json({
      summary: {
        totalUsers,
        totalStudents,
        totalTeachers,
        activeSubscriptions,
        totalRevenueUSD: parseFloat(totalRevenueUSD.toFixed(2)),
        mrrUSD: parseFloat(mrrUSD.toFixed(2)),
        suspendedUsers,
        usersJoinedThisMonth,
      },
      planDistribution,
      userGrowth: userGrowth.length > 0 ? userGrowth : [{ month: new Date().toISOString().slice(0, 7), count: totalUsers }],
      revenueOverTime: revenueOverTime.length > 0 ? revenueOverTime : [{ month: new Date().toISOString().slice(0, 7), revenue: 0 }],
      topUsersByUsage,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

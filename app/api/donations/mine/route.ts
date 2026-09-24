// app/api/donations/mine/route.ts — List the current session's donations
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const donations = await prisma.donation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        amountUSD: true,
        status: true,
        provider: true,
        message: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ donations })
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

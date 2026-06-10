// lib/admin.ts — Admin authorization helpers

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

export function getAdminEmail(): string | null {
  return process.env.ADMIN_EMAIL || null
}

export function isAdminEmail(email: string): boolean {
  const adminEmail = getAdminEmail()
  if (!adminEmail) return false
  return email.toLowerCase() === adminEmail.toLowerCase()
}

/**
 * Middleware for admin API routes.
 * Extracts the JWT, finds the user's email from DB, and checks it against ADMIN_EMAIL.
 * Returns a 401/403 response if not authorized, or null if authorized.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | { userId: string; email: string }> {
  const userId = await getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 })
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }

  return { userId: user.id, email: user.email }
}

/**
 * Check if a user is suspended. Returns a 403 response if suspended, or null if active.
 */
export async function checkSuspended(
  userId: string
): Promise<NextResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { suspended: true },
  })

  if (user?.suspended) {
    return NextResponse.json(
      { error: 'Account suspended. Contact support for assistance.' },
      { status: 403 }
    )
  }

  return null
}

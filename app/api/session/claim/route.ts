// app/api/session/claim/route.ts — Upgrade a guest session to a real account
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth'
import { claimGuestAccount } from '@/lib/guest'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, password, name } = await request.json()

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const result = await claimGuestAccount(userId, email.toLowerCase().trim(), password, name)

    if (!result.ok) {
      const messages: Record<string, string> = {
        email_taken: 'An account with this email already exists',
        not_found: 'Session not found — please refresh and try again',
        not_guest: 'This account already has an email and password',
      }
      return NextResponse.json({ error: messages[result.error] }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Account created' })
  } catch (error) {
    console.error('Guest claim failed:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}

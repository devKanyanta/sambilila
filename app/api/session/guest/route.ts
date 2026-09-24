// app/api/session/guest/route.ts — Create an anonymous guest session
import { NextResponse } from 'next/server'
import { createGuestSession } from '@/lib/guest'

export async function POST() {
  try {
    const { token, userId, name } = await createGuestSession()

    return NextResponse.json({
      token,
      user: { id: userId, name, isGuest: true },
    })
  } catch (error) {
    console.error('Guest session creation failed:', error)
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
  }
}

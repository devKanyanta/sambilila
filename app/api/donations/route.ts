// app/api/donations/route.ts — Create a donation (PayPal or Lenco)
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth'
import { createDonation, DONATION_MIN, DONATION_MAX } from '@/lib/donations'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      amountUSD,
      provider,
      message,
      isAnonymous,
      phone,
      operator,
      country,
    } = await request.json()

    if (!['PAYPAL', 'LENCO'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid payment provider' }, { status: 400 })
    }

    const amount = Number(amountUSD)
    if (!Number.isFinite(amount) || amount < DONATION_MIN || amount > DONATION_MAX) {
      return NextResponse.json(
        { error: `Amount must be between $${DONATION_MIN} and $${DONATION_MAX}` },
        { status: 400 }
      )
    }

    const result = await createDonation({
      userId,
      amountUSD: amount,
      provider,
      message,
      isAnonymous,
      phone,
      operator,
      country,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create donation'
    console.error('Donation creation error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

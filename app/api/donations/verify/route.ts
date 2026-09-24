// app/api/donations/verify/route.ts — Verify a Lenco donation by reference
import { NextRequest, NextResponse } from 'next/server'
import { verifyDonation } from '@/lib/donations'

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    const result = await verifyDonation(reference)
    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Verification failed'
    console.error('Donation verify error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

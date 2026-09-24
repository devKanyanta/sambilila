// app/api/donations/paypal/capture/route.ts — Capture an approved PayPal donation order
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth'
import { getAccessToken } from '@/lib/paypal'
import { prisma } from '@/lib/db'
import { DonationStatus } from '@/lib/generated/prisma/client'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const donation = await prisma.donation.findFirst({
      where: { providerId: orderId, provider: 'PAYPAL' },
    })

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    const token = await getAccessToken()
    const apiBase =
      process.env.PAYPAL_ENV === 'live' || process.env.NODE_ENV === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'

    const res = await fetch(`${apiBase}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const errText = await res.text()
      // Order might already be captured (e.g. double-submit) — treat as success if so
      if (errText.includes('ALREADY_CAPTURED') || errText.includes('ORDER_ALREADY_CAPTURED')) {
        await prisma.donation.update({
          where: { id: donation.id },
          data: { status: DonationStatus.COMPLETED, completedAt: new Date() },
        })
        return NextResponse.json({ success: true, alreadyCaptured: true })
      }
      throw new Error(`PayPal capture failed: ${res.status} ${errText}`)
    }

    const capture = await res.json()
    const isCompleted = capture.status === 'COMPLETED'

    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: isCompleted ? DonationStatus.COMPLETED : DonationStatus.PENDING,
        completedAt: isCompleted ? new Date() : null,
      },
    })

    return NextResponse.json({ success: isCompleted, status: capture.status })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Capture failed'
    console.error('PayPal capture error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

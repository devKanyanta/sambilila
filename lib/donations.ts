// lib/donations.ts — One-time donation helpers (PayPal + Lenco)
// Replaces the subscription model: visitors pick an amount and pay once.

import { prisma } from '@/lib/db'
import { getAccessToken } from '@/lib/paypal'
import { initiatePayment } from '@/lib/lenco'

export interface CreateDonationInput {
  userId: string
  amountUSD: number
  provider: 'PAYPAL' | 'LENCO'
  message?: string
  isAnonymous?: boolean
  phone?: string
  operator?: string
  country?: string
}

export const DONATION_MIN = 1
export const DONATION_MAX = 1000

/** Preset amounts shown in the donation UI. */
export const DONATION_PRESETS = [2, 5, 10, 20]

/** Rough conversion rates for mobile money (local currency units per USD). */
const USD_TO_ZMW = 26

export async function createDonation(input: CreateDonationInput) {
  const { userId, amountUSD, provider, message, isAnonymous } = input

  if (!Number.isFinite(amountUSD) || amountUSD < DONATION_MIN || amountUSD > DONATION_MAX) {
    throw new Error(`Donation amount must be between $${DONATION_MIN} and $${DONATION_MAX}`)
  }

  const donation = await prisma.donation.create({
    data: {
      userId,
      amountUSD,
      currency: 'USD',
      provider,
      message: message?.slice(0, 500),
      isAnonymous: isAnonymous ?? false,
      status: 'PENDING',
    },
  })

  if (provider === 'PAYPAL') {
    const token = await getAccessToken()

    const res = await fetch(`${process.env.PAYPAL_ENV === 'live' || process.env.NODE_ENV === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'
      }/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `don_${donation.id}_${Date.now()}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            custom_id: donation.id,
            description: 'Lernopia donation',
            amount: { currency_code: 'USD', value: amountUSD.toFixed(2) },
          },
        ],
        application_context: {
          brand_name: 'Lernopia',
          locale: 'en-US',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/donate?paypal_return=1`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/donate?paypal_cancel=1`,
        },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`PayPal order creation failed: ${res.status} ${errText}`)
    }

    const order = await res.json()
    const approvalLink = order.links?.find((l: { rel: string }) => l.rel === 'payer-action' || l.rel === 'approve')

    await prisma.donation.update({
      where: { id: donation.id },
      data: { providerId: order.id },
    })

    return { donation, approvalUrl: approvalLink?.href }
  }

  // Lenco mobile money
  if (!input.phone || !input.operator || !input.country) {
    throw new Error('Phone, operator and country are required for mobile money donations')
  }

  const amountLocal = Math.round(amountUSD * USD_TO_ZMW)
  const payment = await initiatePayment(
    amountLocal,
    input.phone,
    input.operator,
    input.country,
    `DON_${donation.id}`
  )

  await prisma.donation.update({
    where: { id: donation.id },
    data: {
      providerId: payment.reference,
      amountLocal,
      currency: payment.currency || 'ZMW',
    },
  })

  return {
    donation,
    reference: payment.reference,
    message: 'Payment initiated. Check your phone to approve the transaction.',
  }
}

/** Verify a Lenco donation by reference and mark it completed. */
export async function verifyDonation(reference: string) {
  const donation = await prisma.donation.findFirst({
    where: { providerId: reference, provider: 'LENCO' },
  })

  if (!donation) {
    throw new Error('Donation not found for this reference')
  }

  const { verifyPayment } = await import('@/lib/lenco')
  const verification = await verifyPayment(reference)

  if (verification.status === 'completed' && donation.status === 'PENDING') {
    await prisma.donation.update({
      where: { id: donation.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })
  }

  return {
    donationStatus: verification.status === 'completed' && donation.status === 'PENDING'
      ? 'COMPLETED'
      : donation.status,
    paymentStatus: verification.status,
  }
}

/** Total donated (completed donations only) — for a public support counter. */
export async function getTotalDonated(): Promise<number> {
  const agg = await prisma.donation.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { amountUSD: true },
  })
  return agg._sum.amountUSD ?? 0
}

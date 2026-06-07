// app/api/subscriptions/lenco/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth'
import { initiatePayment, validatePhone, getOperators } from '@/lib/lenco'
import { createSubscription } from '@/lib/subscriptions'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planSlug, phone, operator } = await request.json()

    if (!planSlug || !['weekly', 'monthly'].includes(planSlug)) {
      return NextResponse.json({ error: 'Invalid plan slug' }, { status: 400 })
    }

    if (!phone || !operator) {
      return NextResponse.json({ error: 'Phone number and operator are required' }, { status: 400 })
    }

    // Detect country from phone prefix (simplified)
    let country = 'ZM'
    if (phone.startsWith('256')) country = 'UG'
    else if (phone.startsWith('254')) country = 'KE'
    else if (phone.startsWith('233')) country = 'GH'
    else if (phone.startsWith('255')) country = 'TZ'
    else if (phone.startsWith('250')) country = 'RW'

    // Validate phone
    if (!validatePhone(phone, country)) {
      const operators = getOperators(country)
      return NextResponse.json({
        error: `Invalid phone number for ${country}. Expected format: country code + 9 digits. Supported operators: ${operators.join(', ')}`,
      }, { status: 400 })
    }

    // Validate operator
    const validOperators = getOperators(country)
    const matchedOperator = validOperators.find(
      (validOperator) => validOperator.toUpperCase() === operator.toUpperCase()
    )

    if (!matchedOperator) {
      return NextResponse.json({
        error: `Invalid operator for ${country}. Supported: ${validOperators.join(', ')}`,
      }, { status: 400 })
    }

    // Get plan from database
    const plan = await prisma.billingPlan.findUnique({ where: { slug: planSlug } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Convert USD to ZMW (approximately 1 USD = 1 ZMW for simplicity)
    const amountInZMW = Math.round(plan.priceUSD * 1)

    // Create subscription record (PAST_DUE until paid)
    const subscription = await createSubscription(userId, plan.id, 'LENCO')

    // Initiate payment with Lenco
    const paymentResult = await initiatePayment(
      amountInZMW,
      phone,
      matchedOperator.toUpperCase(),
      country,
      `SUB_${subscription.id}_${Date.now()}`
    )

    // Persist provider identifiers (subscription stays PAST_DUE until webhook confirms payment)
    const providerIdToStore = paymentResult.reference || paymentResult.transaction_id || null

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        providerId: providerIdToStore,
      },
    })

    // Return a stable, client-friendly payload including status
    return NextResponse.json({
      success: true,
      reference: paymentResult.reference || null,
      transactionId: paymentResult.transaction_id || null,
      status: paymentResult.status || 'unknown',
      message: 'Payment initiated. Please check your phone to complete the transaction.',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to initiate payment'
    console.error('Lenco initiate error:', error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

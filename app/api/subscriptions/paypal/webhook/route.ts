// app/api/subscriptions/paypal/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paypal'
import { queueWebhookEvent } from '@/lib/webhookWorker'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(request.headers, body)

    if (!isValid) {
      console.warn('Invalid PayPal webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const eventType = payload.event_type

    if (!eventType) {
      return NextResponse.json({ error: 'Missing event_type' }, { status: 400 })
    }

    // Queue for async processing
    await queueWebhookEvent('PAYPAL', eventType, payload)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 })
  }
}

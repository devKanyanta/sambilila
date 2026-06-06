// app/api/subscriptions/webhook/process/route.ts
import { NextResponse } from 'next/server'
import { processWebhookQueue } from '@/lib/webhookWorker'

// This endpoint can be called by a cron job or manually
export async function GET() {
  try {
    const result = await processWebhookQueue()

    return NextResponse.json({
      processed: result.processed,
      failed: result.failed,
      message: `Processed ${result.processed} events, ${result.failed} failed`,
    })
  } catch (error) {
    console.error('Process webhooks error:', error)
    return NextResponse.json({ error: 'Failed to process webhooks' }, { status: 500 })
  }
}

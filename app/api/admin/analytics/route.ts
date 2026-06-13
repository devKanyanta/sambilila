// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

const ANALYTICS_SERVER_URL = process.env.ANALYTICS_SERVER_URL || 'http://localhost:3001'
const ADMIN_API_KEY = process.env.ANALYTICS_ADMIN_KEY || process.env.ADMIN_API_KEY || ''

async function getAnalyticsServerErrorBody(response: Response): Promise<string | null> {
  try {
    const body = await response.json()
    return body?.error || null
  } catch {
    return null
  }
}

/**
 * GET /api/admin/analytics?range=7d
 * Proxies to the analytics server's /api/stats endpoint.
 * Requires admin auth.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    const customStart = searchParams.get('custom_start') || ''
    const customEnd = searchParams.get('custom_end') || ''

    const params = new URLSearchParams({ range })
    if (customStart) params.set('custom_start', customStart)
    if (customEnd) params.set('custom_end', customEnd)

    const headers: Record<string, string> = {
      'Authorization': request.headers.get('authorization') || '',
    }
    // Only send X-Admin-Key if actually configured; an empty string will
    // mismatch against the analytics server's undefined env var and reject auth.
    if (ADMIN_API_KEY) {
      headers['X-Admin-Key'] = ADMIN_API_KEY
    }

    const analyticsUrl = `${ANALYTICS_SERVER_URL}/api/stats?${params.toString()}`
    const response = await fetch(
      analyticsUrl,
      {
        headers,
        next: { revalidate: 0 },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      const upstreamError = await getAnalyticsServerErrorBody(response)
      const statusCode = response.status

      // Try to interpret common upstream status codes for a more helpful message
      let hint = ''
      if (statusCode === 401 || statusCode === 403) {
        hint = 'Authentication failed. Check that ANALYTICS_ADMIN_KEY matches between the Next.js app and the analytics server.'
      } else if (statusCode === 429) {
        hint = 'Rate limited by analytics server. Requests are being throttled.'
      } else if (statusCode >= 500) {
        hint = 'Analytics server encountered an internal error.'
      }

      return NextResponse.json(
        {
          error: 'Analytics server returned an error',
          detail: upstreamError || 'No additional detail from upstream',
          upstream_status: statusCode,
          hint: hint || 'Check the analytics server logs for more details.',
        },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const isNetworkError = message.includes('fetch') || message.includes('connect') || message.includes('ECONNREFUSED')
    console.error('Analytics proxy error:', message)

    return NextResponse.json(
      {
        error: 'Failed to reach analytics server',
        detail: message,
        hint: isNetworkError
          ? `The analytics server at ${ANALYTICS_SERVER_URL} is not running or unreachable. Start it with: cd analytics-server && node src/index.js`
          : 'An unexpected error occurred while proxying the request to the analytics server.',
      },
      { status: 503 }
    )
  }
}

/**
 * POST /api/admin/analytics/events
 * Accepts analytics events from the client and proxies to the analytics server.
 * This endpoint is unauthenticated (any visitor can send events).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${ANALYTICS_SERVER_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    if (!response.ok) {
      // Log the upstream error for debugging, but don't break the client experience
      const upstreamError = await getAnalyticsServerErrorBody(response)
      console.error(
        `Analytics event proxy: analytics server returned ${response.status}` +
        (upstreamError ? ` - ${upstreamError}` : '')
      )
      return NextResponse.json({
        ok: false,
        error: 'Analytics server rejected the event batch',
        upstream_status: response.status,
      }, { status: 200 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    // Log and silently fail - analytics should never break the main app
    const message = error instanceof Error ? error.message : String(error)
    console.error('Analytics event proxy error:', message)
    return NextResponse.json({
      ok: false,
      error: 'Failed to send analytics events',
      detail: message,
    }, { status: 200 })
  }
}

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      // Avoid stale edge cache for location-based responses.
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      const countryCode = typeof data?.country_code === 'string' ? data.country_code.toUpperCase() : null

      if (countryCode) {
        return NextResponse.json({ countryCode, source: 'ipapi' }, { status: 200 })
      }
    }

    // Fallback provider to avoid being stuck on one upstream's rate limits.
    const fallbackResponse = await fetch('https://ipwho.is/', {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json()
      const countryCode = typeof fallbackData?.country_code === 'string'
        ? fallbackData.country_code.toUpperCase()
        : null

      if (countryCode) {
        return NextResponse.json({ countryCode, source: 'ipwhois' }, { status: 200 })
      }
    }

    return NextResponse.json(
      { countryCode: 'US', source: 'fallback', reason: 'all-providers-failed' },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { countryCode: 'US', source: 'fallback', reason: 'fetch-failed' },
      { status: 200 }
    )
  }
}

// lib/paypal.ts — PayPal Subscriptions API integration

const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === 'live' || process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!

interface PayPalAccessToken {
  access_token: string
  token_type: string
  expires_in: number
}

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getAccessToken(): Promise<string> {
  // Check cache first
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status} ${res.statusText}`)
  }

  const data: PayPalAccessToken = await res.json()

  // Cache token with 5-minute buffer
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  }

  return data.access_token
}

export async function createSubscription(
  planId: string,
  userId: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ approvalUrl: string; subscriptionId: string }> {
  const token = await getAccessToken()

  const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `sub_${userId}_${Date.now()}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      application_context: {
        brand_name: 'Lernopia',
        locale: 'en-US',
        user_action: 'SUBSCRIBE_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
      custom_id: userId, // Attach userId for webhook identification
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal create subscription failed: ${res.status} ${err}`)
  }

  const data = await res.json()

  // Find the approval URL
  const approvalLink = data.links?.find(
    (link: { rel: string; href: string }) => link.rel === 'approve'
  )

  return {
    approvalUrl: approvalLink?.href || data.links?.[0]?.href,
    subscriptionId: data.id,
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  reason?: string
): Promise<void> {
  const token = await getAccessToken()

  const res = await fetch(
    `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: reason || 'User requested cancellation',
      }),
    }
  )

  if (!res.ok) {
    throw new Error(`PayPal cancel subscription failed: ${res.status}`)
  }
}

export async function getSubscriptionDetails(subscriptionId: string): Promise<any> {
  const token = await getAccessToken()

  const res = await fetch(
    `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!res.ok) {
    throw new Error(`PayPal get subscription failed: ${res.status}`)
  }

  return res.json()
}

export async function verifyWebhookSignature(
  headers: Headers,
  body: string
): Promise<boolean> {
  const token = await getAccessToken()
  const webhookId = process.env.PAYPAL_WEBHOOK_ID

  if (!webhookId) {
    throw new Error('PAYPAL_WEBHOOK_ID not configured')
  }

  const res = await fetch(
    `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers.get('PAYPAL-AUTH-ALGO') || '',
        cert_url: headers.get('PAYPAL-CERT-URL') || '',
        transmission_id: headers.get('PAYPAL-TRANSMISSION-ID') || '',
        transmission_sig: headers.get('PAYPAL-TRANSMISSION-SIG') || '',
        transmission_time: headers.get('PAYPAL-TRANSMISSION-TIME') || '',
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    }
  )

  if (!res.ok) {
    return false
  }

  const data = await res.json()
  return data.verification_status === 'SUCCESS'
}

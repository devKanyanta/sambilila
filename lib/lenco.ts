// lib/lenco.ts — Lenco Mobile Money API integration
// Based on PAYMENT_PROCESS.md

const LENCO_API_BASE = process.env.LENCO_API_BASE?.replace(/\/$/, '')
const LENCO_API_KEY = process.env.LENCO_API_KEY

interface InitiatePaymentResponse {
  success: boolean
  status: string
  reference: string
  amount: number
  currency: string
  timestamp: string
  transaction_id: string
}

interface VerifyPaymentResponse {
  reference: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: number
  currency: string
  phone: string
  operator: string
  country: string
  timestamp: string
  completed_at?: string
}

function getAuthHeaders(): Record<string, string> {
  if (!LENCO_API_KEY) {
    throw new Error('Lenco is not configured: LENCO_API_KEY is missing')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${LENCO_API_KEY}`,
  }

  return headers
}

function getApiBase(): string {
  if (!LENCO_API_BASE) {
    throw new Error(
      'Lenco is not configured: LENCO_API_BASE is missing (expected your payment API base URL)'
    )
  }

  return LENCO_API_BASE.endsWith('/api') ? LENCO_API_BASE : `${LENCO_API_BASE}/api`
}

/**
 * Initiate a mobile money payment via Lenco.
 */
export async function initiatePayment(
  amount: number,
  phone: string,
  operator: string,
  country: string,
  reference?: string
): Promise<InitiatePaymentResponse> {
  const txnReference =
    reference || `TXN${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  const apiBase = getApiBase()
  let res: Response

  try {
    res = await fetch(`${apiBase}/payment/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount,
        reference: txnReference,
        phone,
        operator,
        country,
        bearer: 'customer',
      }),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown network error'
    throw new Error(`Lenco API is unreachable at ${apiBase} (${message})`)
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Lenco payment initiation failed: ${res.status} ${err}`)
  }

  const body = await res.json().catch(() => null)

  // Lenco returns a wrapper like { success, message, status, data: { ... } }
  if (!body) {
    throw new Error('Lenco returned an empty response body')
  }

  // If the provider signals failure
  if (body.success === false) {
    const errMsg = body.message || JSON.stringify(body)
    throw new Error(`Lenco payment failed: ${errMsg}`)
  }

  // Determine the actual data payload — handle both direct and wrapped responses
  const data = body.data || body

  // Map provider-specific fields to a stable shape expected by callers
  // The verification reference MUST match what we can use on GET /verify/:ref
  const mapped = {
    success: Boolean(body.success ?? true),
    // Skip boolean body.status ("API call OK" flag); use the string status from data
    status: typeof body.status === 'boolean' ? (data.status || 'unknown') : (body.status ?? data.status ?? 'unknown'),
    // Prefer the top-level `reference` returned by the initiate API — this is the
    // value that must be passed to the verify endpoint.  Fall back to the nested
    // data fields or our own generated reference.
    reference: body.reference || data.reference || data.lencoReference || reference || txnReference,
    // transaction id — use data.id when available
    transaction_id: data.id || data.operatorTransactionId || data.lencoReference || null,
    amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
    currency: data.currency || 'ZMW',
    timestamp: data.initiatedAt || new Date().toISOString(),
  }

  return mapped as InitiatePaymentResponse
}

/**
 * Verify payment status by reference.
 */
export async function verifyPayment(
  reference: string
): Promise<VerifyPaymentResponse> {
  const apiBase = getApiBase()
  const res = await fetch(
    `${apiBase}/payment/verify/${reference}`,
    {
      headers: getAuthHeaders(),
    }
  )

  if (!res.ok) {
    let errorBody = ''
    try {
      errorBody = await res.text()
    } catch {}
    throw new Error(`Lenco payment verification failed: ${res.status}${errorBody ? ` - ${errorBody}` : ''}`)
  }

  const body = await res.json().catch(() => null)

  if (!body) {
    throw new Error('Lenco verification returned an empty response')
  }

  console.log('[Lenco verifyPayment] Raw body:', JSON.stringify(body))

  // Handle both direct and wrapped responses (same pattern as initiatePayment)
  const data = body.data || body

  // Extract the raw status value.
  // The API returns:
  //   body.status = true (boolean — "API call OK", NOT payment status)
  //   data.status = "successful" | "pending" | "failed" | "cancelled" (string — actual payment status)
  // We MUST skip boolean body.status and only use a string status from data.
  const rawStatus =
    typeof body.status === 'boolean'
      ? data.status
      : (body.status ?? data.status)

  console.log('[Lenco verifyPayment] body.status=%s (type=%s), data.status=%s, rawStatus=%s (type=%s)',
    body.status, typeof body.status, data.status, rawStatus, typeof rawStatus)

  // Map Lenco-specific status strings to our standard set
  const statusMap: Record<string, VerifyPaymentResponse['status']> = {
    successful: 'completed',
    pending: 'pending',
    completed: 'completed',
    failed: 'failed',
    cancelled: 'cancelled',
    settled: 'completed',
  }

  const status =
    typeof rawStatus === 'string' && statusMap[rawStatus]
      ? statusMap[rawStatus]
      : 'pending'

  console.log('[Lenco verifyPayment] Mapped status=%s', status)

  return {
    reference: data.reference || body.reference || reference,
    status,
    amount: typeof data.amount === 'string' ? parseFloat(data.amount) : (data.amount ?? 0),
    currency: data.currency || 'ZMW',
    phone: data.phone || data.mobileMoneyDetails?.phone || '',
    operator: data.operator || data.mobileMoneyDetails?.operator || '',
    country: data.country || data.mobileMoneyDetails?.country?.toUpperCase() || '',
    timestamp: data.timestamp || data.initiatedAt || new Date().toISOString(),
    completed_at: data.completedAt || data.completed_at || undefined,
  }
}

/**
 * Validate phone number format for supported countries.
 */
export function validatePhone(phone: string, country: string): boolean {
  const patterns: Record<string, RegExp> = {
    ZM: /^260\d{9}$/,     // Zambia
    UG: /^256\d{9}$/,     // Uganda
    KE: /^254\d{9}$/,     // Kenya
    GH: /^233\d{9}$/,     // Ghana
    TZ: /^255\d{9}$/,     // Tanzania
    RW: /^250\d{9}$/,     // Rwanda
  }

  const pattern = patterns[country.toUpperCase()]
  if (!pattern) return false
  return pattern.test(phone)
}

/**
 * Get supported operators for a country.
 */
export function getOperators(country: string): string[] {
  const operators: Record<string, string[]> = {
    ZM: ['MTN', 'Airtel'],
  }

  return operators[country.toUpperCase()] || []
}

// lib/guest.ts — Anonymous guest session helpers
// Guests get a real User row (isGuest: true) with a placeholder email,
// a long-lived JWT in localStorage, and can later "claim" the account
// by registering with a real email + password — keeping all their data.

import { prisma } from '@/lib/db'
import { generateToken } from '@/lib/auth'

const GUEST_EMAIL_DOMAIN = 'guests.lernopia.internal'

export function makeGuestEmail(): string {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  return `guest-${suffix}@${GUEST_EMAIL_DOMAIN}`
}

const GUEST_NAMES = [
  'Learner', 'Scholar', 'Thinker', 'Explorer', 'Student',
  'Reader', 'Dreamer', 'Achiever', 'Curious Mind', 'Bright Spark',
]

export function makeGuestName(): string {
  return GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)]
}

/**
 * Create a guest user and return its JWT token.
 * Guest accounts are invisible to admin dashboards via isGuest flag.
 */
export async function createGuestSession(): Promise<{ token: string; userId: string; name: string }> {
  const user = await prisma.user.create({
    data: {
      email: makeGuestEmail(),
      // Random unguessable password — guests claim the account by setting their own
      password: `${Math.random().toString(36)}${Date.now()}`,
      name: makeGuestName(),
      isGuest: true,
    },
  })

  return { token: generateToken(user.id), userId: user.id, name: user.name }
}

export function isGuestEmail(email: string): boolean {
  return email.endsWith(`@${GUEST_EMAIL_DOMAIN}`)
}

/**
 * Claim a guest account: set real email/password/name and flip isGuest off.
 * Returns the user or null if the guest id is invalid or email is taken.
 */
export async function claimGuestAccount(
  guestUserId: string,
  email: string,
  password: string,
  name?: string
): Promise<{ ok: true } | { ok: false; error: 'not_found' | 'email_taken' | 'not_guest' }> {
  const guest = await prisma.user.findUnique({ where: { id: guestUserId } })
  if (!guest) return { ok: false, error: 'not_found' }
  if (!guest.isGuest) return { ok: false, error: 'not_guest' }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { ok: false, error: 'email_taken' }

  const { hashPassword } = await import('@/lib/auth')
  await prisma.user.update({
    where: { id: guestUserId },
    data: {
      email,
      password: await hashPassword(password),
      name: name?.trim() || guest.name,
      isGuest: false,
    },
  })

  return { ok: true }
}

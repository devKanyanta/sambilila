import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET as string;

const JWT_EXPIRES_IN =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string }
}

export async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
  try {
    const header = req.headers.get("authorization")
    if (!header || !header.startsWith("Bearer ")) return null

    const token = header.replace("Bearer ", "")

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }

    return payload.userId
  } catch (err) {
    console.error("JWT verify failed:", err)
    return null
  }
}
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_SECRET || 'EEmp967'

export function signToken(payload: { email: string; isAdmin: boolean }) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): { email: string; isAdmin: boolean } | null {
  try {
    return jwt.verify(token, SECRET) as { email: string; isAdmin: boolean }
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export function requireAuth(req: NextRequest): { email: string; isAdmin: boolean } | null {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}

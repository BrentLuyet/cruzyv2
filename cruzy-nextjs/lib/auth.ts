import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'cruzy-demo-secret-change-in-prod'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(contactId: string, email: string): string {
  return jwt.sign({ contactId, email }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { contactId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { contactId: string; email: string }
  } catch {
    return null
  }
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function getResetExpiry(): string {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 1)
  return expiry.toISOString()
}

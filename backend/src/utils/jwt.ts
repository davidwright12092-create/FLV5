import jwt from 'jsonwebtoken'
import env from '../config/env.js'

export interface JwtPayload {
  id: string
  email: string
  role: string
  organizationId: string
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET as string, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  })
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

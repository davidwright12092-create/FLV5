import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types/express.js'
import { verifyToken } from '../utils/jwt.js'
import { AuthenticationError, AuthorizationError } from '../utils/errors.js'
import prisma from '../config/database.js'

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided')
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid token')
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    }

    next()
  } catch (error) {
    next(error)
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'))
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(
        new AuthorizationError('You do not have permission to access this resource')
      )
    }

    next()
  }
}

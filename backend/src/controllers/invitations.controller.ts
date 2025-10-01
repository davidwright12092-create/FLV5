import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../types/express.js'
import prisma from '../config/database.js'
import crypto from 'crypto'
import { NotFoundError, ConflictError, ValidationError, AuthorizationError, AuthenticationError } from '../utils/errors.js'
import { hashPassword } from '../utils/password.js'
import { generateToken } from '../utils/jwt.js'

/**
 * Create a new invitation to join the organization
 * @route POST /api/invitations
 * @access Private (ADMIN, MANAGER)
 */
export async function createInvitation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { organizationId, role: senderRole } = req.user!
    const { email, role } = req.body

    // Only admins and managers can send invitations
    if (senderRole !== 'ADMIN' && senderRole !== 'MANAGER') {
      throw new AuthorizationError('Only administrators and managers can invite users')
    }

    // Only admins can invite other admins or managers
    if ((role === 'ADMIN' || role === 'MANAGER') && senderRole !== 'ADMIN') {
      throw new AuthorizationError('Only administrators can invite other administrators or managers')
    }

    // Check if user already exists in the organization
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        organizationId,
      },
    })

    if (existingUser) {
      throw new ConflictError('User with this email is already a member of your organization')
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        organizationId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (existingInvitation) {
      throw new ConflictError('An active invitation for this email already exists')
    }

    // Generate unique invitation token
    const token = crypto.randomBytes(32).toString('hex')

    // Create invitation (expires in 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        organizationId,
        expiresAt,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // TODO: Send invitation email
    console.log(`Invitation created for ${email}. Token: ${token}`)
    console.log(`Invitation link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${token}`)

    res.status(201).json({
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        organization: invitation.organization,
      },
      message: 'Invitation sent successfully',
      // Only include token in development for testing
      ...(process.env.NODE_ENV === 'development' && { invitationToken: token }),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get all pending invitations for the organization
 * @route GET /api/invitations
 * @access Private (ADMIN, MANAGER)
 */
export async function getInvitations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { organizationId, role } = req.user!

    // Only admins and managers can view invitations
    if (role !== 'ADMIN' && role !== 'MANAGER') {
      throw new AuthorizationError('Only administrators and managers can view invitations')
    }

    const { includeExpired, includeAccepted } = req.query

    const invitations = await prisma.invitation.findMany({
      where: {
        organizationId,
        ...(includeAccepted !== 'true' && { acceptedAt: null }),
        ...(includeExpired !== 'true' && { expiresAt: { gt: new Date() } }),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
      },
    })

    res.json({
      success: true,
      data: invitations,
      count: invitations.length,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Resend an invitation email
 * @route POST /api/invitations/:id/resend
 * @access Private (ADMIN, MANAGER)
 */
export async function resendInvitation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { organizationId, role } = req.user!

    // Only admins and managers can resend invitations
    if (role !== 'ADMIN' && role !== 'MANAGER') {
      throw new AuthorizationError('Only administrators and managers can resend invitations')
    }

    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!invitation) {
      throw new NotFoundError('Invitation not found')
    }

    if (invitation.acceptedAt) {
      throw new ValidationError('This invitation has already been accepted')
    }

    // Extend expiration if expired or about to expire
    const now = new Date()
    let newExpiresAt = invitation.expiresAt

    if (invitation.expiresAt <= now) {
      // Expired - extend by 7 days from now
      newExpiresAt = new Date()
      newExpiresAt.setDate(newExpiresAt.getDate() + 7)

      await prisma.invitation.update({
        where: { id },
        data: { expiresAt: newExpiresAt },
      })
    }

    // TODO: Resend invitation email
    console.log(`Invitation resent for ${invitation.email}. Token: ${invitation.token}`)

    res.json({
      success: true,
      message: 'Invitation resent successfully',
      data: {
        id: invitation.id,
        email: invitation.email,
        expiresAt: newExpiresAt,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Cancel a pending invitation
 * @route DELETE /api/invitations/:id
 * @access Private (ADMIN, MANAGER)
 */
export async function cancelInvitation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { organizationId, role } = req.user!

    // Only admins and managers can cancel invitations
    if (role !== 'ADMIN' && role !== 'MANAGER') {
      throw new AuthorizationError('Only administrators and managers can cancel invitations')
    }

    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        organizationId,
      },
    })

    if (!invitation) {
      throw new NotFoundError('Invitation not found')
    }

    if (invitation.acceptedAt) {
      throw new ValidationError('Cannot cancel an invitation that has already been accepted')
    }

    await prisma.invitation.delete({
      where: { id },
    })

    res.json({
      success: true,
      message: 'Invitation cancelled successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Accept an invitation and create user account
 * @route POST /api/invitations/:token/accept
 * @access Public
 */
export async function acceptInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params
    const { firstName, lastName, password } = req.body

    if (!firstName || !lastName || !password) {
      throw new ValidationError('First name, last name, and password are required')
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters')
    }

    // Find valid invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        token,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
      },
    })

    if (!invitation) {
      throw new NotFoundError('Invalid or expired invitation')
    }

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    })

    if (existingUser) {
      throw new ConflictError('An account with this email already exists')
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user and mark invitation as accepted in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          password: hashedPassword,
          firstName,
          lastName,
          role: invitation.role,
          organizationId: invitation.organizationId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          organizationId: true,
          isActive: true,
        },
      })

      // Mark invitation as accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      })

      return user
    })

    // Generate JWT token
    const authToken = generateToken({
      id: result.id,
      email: result.email,
      role: result.role,
      organizationId: result.organizationId,
    })

    res.status(201).json({
      success: true,
      data: {
        user: result,
        organization: invitation.organization,
        token: authToken,
      },
      message: 'Invitation accepted successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Verify invitation token (check if valid without accepting)
 * @route GET /api/invitations/:token/verify
 * @access Public
 */
export async function verifyInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params

    const invitation = await prisma.invitation.findFirst({
      where: {
        token,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!invitation) {
      throw new NotFoundError('Invalid or expired invitation')
    }

    res.json({
      success: true,
      data: {
        email: invitation.email,
        role: invitation.role,
        organizationName: invitation.organization.name,
        expiresAt: invitation.expiresAt,
      },
    })
  } catch (error) {
    next(error)
  }
}

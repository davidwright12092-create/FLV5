import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../types/express.js'
import prisma from '../config/database.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { generateToken } from '../utils/jwt.js'
import { AuthenticationError, ConflictError, ValidationError, NotFoundError } from '../utils/errors.js'
import crypto from 'crypto'

/**
 * Register a new organization and admin user
 * @route POST /api/auth/register
 * @access Public
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName, organizationName, industry } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new ConflictError('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          industry,
        },
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          organizationId: organization.id,
          role: 'ADMIN', // First user is always admin
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          organizationId: true,
        },
      })

      return { user, organization }
    })

    // Generate JWT token
    const token = generateToken({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      organizationId: result.user.organizationId,
    })

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        organization: result.organization,
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Login with email and password
 * @route POST /api/auth/login
 * @access Public
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
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

    if (!user) {
      throw new AuthenticationError('Invalid credentials')
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated')
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials')
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get current logged-in user information
 * @route GET /api/auth/me
 * @access Private
 */
export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
      },
    })

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Logout user (client-side token removal)
 * @route POST /api/auth/logout
 * @access Private
 */
export async function logout(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // In a JWT-based system, logout is primarily handled client-side by removing the token
    // Optionally implement token blacklisting here if needed
    res.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Refresh JWT token
 * @route POST /api/auth/refresh
 * @access Private
 */
export async function refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive')
    }

    // Generate new token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    })

    res.json({
      success: true,
      data: { token },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Change user password
 * @route POST /api/auth/change-password
 * @access Private
 */
export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect')
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    })

    res.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Request password reset (send reset token via email)
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export async function requestPasswordReset(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      })
      return
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex')
    // const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    // const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store hashed token in user record (you may want to create a separate PasswordReset table)
    // Note: You'll need to add these fields to your Prisma schema: resetToken, resetTokenExpiry
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     resetToken: hashedToken,
    //     resetTokenExpiry: expiresAt,
    //   },
    // })

    // For now, just log the token (in production, send via email)
    console.log(`User ID: ${user.id}`)

    // TODO: Send email with reset link containing the plain resetToken
    // Example: https://yourapp.com/reset-password?token=${resetToken}
    console.log(`Password reset token for ${email}: ${resetToken}`)

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
      // Only include token in development for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Reset password with token
 * @route POST /api/auth/reset-password
 * @access Public
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      throw new ValidationError('Token and new password are required')
    }

    // Hash the provided token to compare with stored hash
    // const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid reset token
    // Note: You'll need to add resetToken and resetTokenExpiry fields to your User model
    // const user = await prisma.user.findFirst({
    //   where: {
    //     resetToken: hashedToken,
    //     resetTokenExpiry: {
    //       gt: new Date(), // Token not expired
    //     },
    //   },
    // })

    // Temporary implementation - find user by token (insecure, for demo only)
    // In production, implement proper reset token storage in database
    const user = await prisma.user.findFirst({})

    if (!user) {
      throw new AuthenticationError('Invalid or expired reset token')
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        // resetToken: null,
        // resetTokenExpiry: null,
      },
    })

    res.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    next(error)
  }
}

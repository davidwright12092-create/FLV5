import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types/express.js'
import prisma from '../config/database.js'
import { NotFoundError, AuthorizationError, ConflictError } from '../utils/errors.js'
import { hashPassword } from '../utils/password.js'

/**
 * Get all users in organization with pagination
 * @route GET /api/users
 * @access Private
 */
export async function getUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { page = 1, limit = 10 } = req.query as any
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          organizationId: req.user!.organizationId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({
        where: {
          organizationId: req.user!.organizationId,
        },
      }),
    ])

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get single user details
 * @route GET /api/users/:id
 * @access Private
 */
export async function getUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params

    const user = await prisma.user.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create new user in organization (admin/manager only)
 * @route POST /api/users
 * @access Private (Admin/Manager)
 */
export async function createUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, firstName, lastName, role } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new ConflictError('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'USER',
        organizationId: req.user!.organizationId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    })

    res.status(201).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update user information
 * @route PATCH /api/users/:id
 * @access Private
 */
export async function updateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params
    const { firstName, lastName, avatar, role, isActive } = req.body

    // Check if user exists and belongs to same organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existingUser) {
      throw new NotFoundError('User not found')
    }

    // Only admins can change role and isActive status
    if ((role || isActive !== undefined) && req.user!.role !== 'ADMIN') {
      throw new AuthorizationError('Only admins can modify user roles and status')
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        avatar,
        role,
        isActive,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
 * Soft delete user (admin only)
 * @route DELETE /api/users/:id
 * @access Private (Admin)
 */
export async function deleteUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params

    // Check if user exists and belongs to same organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existingUser) {
      throw new NotFoundError('User not found')
    }

    // Cannot delete yourself
    if (id === req.user!.id) {
      throw new AuthorizationError('Cannot delete your own account')
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    res.json({
      success: true,
      message: 'User deactivated successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update user role (admin only)
 * @route PATCH /api/users/:id/role
 * @access Private (Admin)
 */
export async function updateUserRole(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params
    const { role } = req.body

    // Check if user exists and belongs to same organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existingUser) {
      throw new NotFoundError('User not found')
    }

    // Cannot change your own role
    if (id === req.user!.id) {
      throw new AuthorizationError('Cannot change your own role')
    }

    // Update user role
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
 * Get user performance statistics
 * @route GET /api/users/:id/stats
 * @access Private
 */
export async function getUserStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params

    // Check if user exists and belongs to same organization
    const user = await prisma.user.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    // Get recording statistics
    const [totalRecordings, recordingsByStatus, recentRecordings] = await Promise.all([
      // Total recordings count
      prisma.recording.count({
        where: { userId: id },
      }),

      // Recordings grouped by status
      prisma.recording.groupBy({
        by: ['status'],
        where: { userId: id },
        _count: {
          id: true,
        },
      }),

      // Recent recordings (last 30 days)
      prisma.recording.count({
        where: {
          userId: id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    // Calculate total duration
    const durationResult = await prisma.recording.aggregate({
      where: { userId: id },
      _sum: {
        duration: true,
      },
    })

    // Format status breakdown
    const statusBreakdown = recordingsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {} as Record<string, number>)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        stats: {
          totalRecordings,
          recentRecordings, // Last 30 days
          totalDuration: durationResult._sum.duration || 0, // in seconds
          statusBreakdown,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

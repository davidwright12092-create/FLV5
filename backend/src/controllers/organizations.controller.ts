import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types/express.js'
import prisma from '../config/database.js'
import { NotFoundError, AuthorizationError, ValidationError } from '../utils/errors.js'

/**
 * Get current user's organization details
 * @route GET /api/organization
 * @access Private
 */
export async function getOrganization(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { organizationId } = req.user!

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        industry: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            recordings: true,
            processTemplates: { where: { isActive: true } },
          },
        },
      },
    })

    if (!organization) {
      throw new NotFoundError('Organization not found')
    }

    res.json({
      success: true,
      data: {
        ...organization,
        stats: {
          totalUsers: organization._count.users,
          totalRecordings: organization._count.recordings,
          activeTemplates: organization._count.processTemplates,
        },
        _count: undefined,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update organization details (admin only)
 * @route PATCH /api/organization
 * @access Private (ADMIN)
 */
export async function updateOrganization(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { organizationId, role } = req.user!
    const { name, industry } = req.body

    if (role !== 'ADMIN') {
      throw new AuthorizationError('Only administrators can update organization details')
    }

    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(name && { name }),
        ...(industry !== undefined && { industry }),
      },
      select: {
        id: true,
        name: true,
        industry: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.json({
      success: true,
      data: organization,
      message: 'Organization updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get organization statistics
 * @route GET /api/organization/stats
 * @access Private
 */
export async function getOrganizationStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { organizationId } = req.user!

    // Get basic counts
    const [
      totalUsers,
      activeUsers,
      totalRecordings,
      completedRecordings,
      totalTemplates,
      activeTemplates,
    ] = await Promise.all([
      prisma.user.count({ where: { organizationId } }),
      prisma.user.count({ where: { organizationId, isActive: true } }),
      prisma.recording.count({ where: { organizationId } }),
      prisma.recording.count({ where: { organizationId, status: 'COMPLETED' } }),
      prisma.processTemplate.count({ where: { organizationId } }),
      prisma.processTemplate.count({ where: { organizationId, isActive: true } }),
    ])

    // Get recording statistics by status
    const recordingsByStatus = await prisma.recording.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: {
        status: true,
      },
    })

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      where: { organizationId },
      _count: {
        role: true,
      },
    })

    // Get recent activity (recordings in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentRecordings = await prisma.recording.count({
      where: {
        organizationId,
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    // Get storage usage (total file size)
    const storageUsage = await prisma.recording.aggregate({
      where: { organizationId },
      _sum: {
        fileSize: true,
      },
    })

    // Get average processing time (time from upload to completion)
    const processingStats = await prisma.recording.findMany({
      where: {
        organizationId,
        status: 'COMPLETED',
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    })

    let averageProcessingTime = 0
    if (processingStats.length > 0) {
      const totalTime = processingStats.reduce((acc, recording) => {
        return acc + (recording.updatedAt.getTime() - recording.createdAt.getTime())
      }, 0)
      averageProcessingTime = Math.round(totalTime / processingStats.length / 1000) // Convert to seconds
    }

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          byRole: usersByRole.map(r => ({
            role: r.role,
            count: r._count.role,
          })),
        },
        recordings: {
          total: totalRecordings,
          completed: completedRecordings,
          recentActivity: recentRecordings,
          byStatus: recordingsByStatus.map(r => ({
            status: r.status,
            count: r._count.status,
          })),
        },
        templates: {
          total: totalTemplates,
          active: activeTemplates,
          inactive: totalTemplates - activeTemplates,
        },
        storage: {
          totalBytes: storageUsage._sum.fileSize?.toString() || '0',
          totalMB: storageUsage._sum.fileSize
            ? Math.round(Number(storageUsage._sum.fileSize) / (1024 * 1024))
            : 0,
        },
        performance: {
          averageProcessingTimeSeconds: averageProcessingTime,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get organization settings
 * @route GET /api/organization/settings
 * @access Private
 */
export async function getSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { organizationId } = req.user!

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        settings: true,
      },
    })

    if (!organization) {
      throw new NotFoundError('Organization not found')
    }

    res.json({
      success: true,
      data: organization.settings || {},
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update organization settings (admin only)
 * @route PATCH /api/organization/settings
 * @access Private (ADMIN)
 */
export async function updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { organizationId, role } = req.user!

    if (role !== 'ADMIN') {
      throw new AuthorizationError('Only administrators can update organization settings')
    }

    // Get current settings
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    })

    if (!organization) {
      throw new NotFoundError('Organization not found')
    }

    // Merge existing settings with new settings
    const currentSettings = (organization.settings as Record<string, any>) || {}
    const newSettings = {
      ...currentSettings,
      ...req.body,
    }

    // Validate defaultProcessTemplateId if provided
    if (req.body.defaultProcessTemplateId) {
      const template = await prisma.processTemplate.findFirst({
        where: {
          id: req.body.defaultProcessTemplateId,
          organizationId,
        },
      })

      if (!template) {
        throw new ValidationError('Invalid default process template ID')
      }
    }

    // Update settings
    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        settings: newSettings,
      },
      select: {
        id: true,
        settings: true,
        updatedAt: true,
      },
    })

    res.json({
      success: true,
      data: updatedOrganization.settings,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

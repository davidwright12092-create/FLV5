import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types/express.js'
import prisma from '../config/database.js'
import { NotFoundError, ConflictError, ValidationError, AuthorizationError } from '../utils/errors.js'

/**
 * Get all process templates for the user's organization
 * @route GET /api/process-templates
 * @access Private
 */
export async function getTemplates(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { organizationId } = req.user!
    const { includeInactive } = req.query

    const templates = await prisma.processTemplate.findMany({
      where: {
        organizationId,
        ...(includeInactive !== 'true' && { isActive: true }),
      },
      orderBy: [
        { isDefault: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        steps: true,
        isActive: true,
        isDefault: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get a single process template by ID
 * @route GET /api/process-templates/:id
 * @access Private
 */
export async function getTemplate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { organizationId } = req.user!

    const template = await prisma.processTemplate.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        steps: true,
        isActive: true,
        isDefault: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!template) {
      throw new NotFoundError('Process template not found')
    }

    res.json({
      success: true,
      data: template,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create a new process template
 * @route POST /api/process-templates
 * @access Private (ADMIN, MANAGER)
 */
export async function createTemplate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { organizationId } = req.user!
    const { name, description, steps, isDefault } = req.body

    // Check for duplicate template name in organization
    const existingTemplate = await prisma.processTemplate.findFirst({
      where: {
        organizationId,
        name,
      },
    })

    if (existingTemplate) {
      throw new ConflictError('A template with this name already exists in your organization')
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.processTemplate.updateMany({
        where: {
          organizationId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    const template = await prisma.processTemplate.create({
      data: {
        organizationId,
        name,
        description,
        steps,
        isDefault: isDefault || false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        steps: true,
        isActive: true,
        isDefault: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.status(201).json({
      success: true,
      data: template,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update an existing process template
 * @route PATCH /api/process-templates/:id
 * @access Private (ADMIN, MANAGER)
 */
export async function updateTemplate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { organizationId } = req.user!
    const { name, description, steps, isActive, isDefault } = req.body

    // Check if template exists and belongs to organization
    const existingTemplate = await prisma.processTemplate.findFirst({
      where: {
        id,
        organizationId,
      },
    })

    if (!existingTemplate) {
      throw new NotFoundError('Process template not found')
    }

    // Check for duplicate name if name is being changed
    if (name && name !== existingTemplate.name) {
      const duplicateName = await prisma.processTemplate.findFirst({
        where: {
          organizationId,
          name,
          id: { not: id },
        },
      })

      if (duplicateName) {
        throw new ConflictError('A template with this name already exists in your organization')
      }
    }

    // If setting as default, unset other defaults
    if (isDefault === true) {
      await prisma.processTemplate.updateMany({
        where: {
          organizationId,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      })
    }

    const template = await prisma.processTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(steps && { steps }),
        ...(isActive !== undefined && { isActive }),
        ...(isDefault !== undefined && { isDefault }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        steps: true,
        isActive: true,
        isDefault: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.json({
      success: true,
      data: template,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a process template
 * @route DELETE /api/process-templates/:id
 * @access Private (ADMIN, MANAGER)
 */
export async function deleteTemplate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { organizationId } = req.user!

    // Check if template exists and belongs to organization
    const template = await prisma.processTemplate.findFirst({
      where: {
        id,
        organizationId,
      },
    })

    if (!template) {
      throw new NotFoundError('Process template not found')
    }

    // Prevent deletion if it's the default template
    if (template.isDefault) {
      throw new ValidationError('Cannot delete the default template. Set another template as default first.')
    }

    await prisma.processTemplate.delete({
      where: { id },
    })

    res.json({
      success: true,
      message: 'Process template deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Set a template as the default for the organization
 * @route POST /api/process-templates/:id/set-default
 * @access Private (ADMIN, MANAGER)
 */
export async function setDefaultTemplate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { organizationId } = req.user!

    // Check if template exists and belongs to organization
    const template = await prisma.processTemplate.findFirst({
      where: {
        id,
        organizationId,
      },
    })

    if (!template) {
      throw new NotFoundError('Process template not found')
    }

    // If template is inactive, activate it
    const shouldActivate = !template.isActive

    // Unset other defaults and set this one
    await prisma.$transaction([
      prisma.processTemplate.updateMany({
        where: {
          organizationId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      prisma.processTemplate.update({
        where: { id },
        data: {
          isDefault: true,
          ...(shouldActivate && { isActive: true }),
        },
      }),
    ])

    const updatedTemplate = await prisma.processTemplate.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        steps: true,
        isActive: true,
        isDefault: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.json({
      success: true,
      data: updatedTemplate,
      message: 'Template set as default successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Duplicate an existing template
 * @route POST /api/process-templates/:id/duplicate
 * @access Private (ADMIN, MANAGER)
 */
export async function duplicateTemplate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { organizationId } = req.user!
    const { name } = req.body

    // Check if source template exists and belongs to organization
    const sourceTemplate = await prisma.processTemplate.findFirst({
      where: {
        id,
        organizationId,
      },
    })

    if (!sourceTemplate) {
      throw new NotFoundError('Process template not found')
    }

    // Generate new name if not provided
    const newName = name || `${sourceTemplate.name} (Copy)`

    // Check for duplicate name
    const existingTemplate = await prisma.processTemplate.findFirst({
      where: {
        organizationId,
        name: newName,
      },
    })

    if (existingTemplate) {
      throw new ConflictError('A template with this name already exists in your organization')
    }

    // Create duplicate
    const duplicatedTemplate = await prisma.processTemplate.create({
      data: {
        organizationId,
        name: newName,
        description: sourceTemplate.description,
        steps: sourceTemplate.steps,
        isActive: true,
        isDefault: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        steps: true,
        isActive: true,
        isDefault: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.status(201).json({
      success: true,
      data: duplicatedTemplate,
      message: 'Template duplicated successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get usage statistics for a template
 * @route GET /api/process-templates/:id/stats
 * @access Private
 */
export async function getTemplateUsageStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { organizationId } = req.user!

    // Check if template exists and belongs to organization
    const template = await prisma.processTemplate.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
        isDefault: true,
      },
    })

    if (!template) {
      throw new NotFoundError('Process template not found')
    }

    // Calculate additional statistics
    const totalTemplates = await prisma.processTemplate.count({
      where: { organizationId, isActive: true },
    })

    const totalUsage = await prisma.processTemplate.aggregate({
      where: { organizationId },
      _sum: {
        usageCount: true,
      },
    })

    const usagePercentage = totalUsage._sum.usageCount
      ? ((template.usageCount / totalUsage._sum.usageCount) * 100).toFixed(2)
      : '0.00'

    res.json({
      success: true,
      data: {
        template: {
          id: template.id,
          name: template.name,
          isDefault: template.isDefault,
        },
        statistics: {
          usageCount: template.usageCount,
          usagePercentage: parseFloat(usagePercentage),
          totalTemplates,
          totalOrganizationUsage: totalUsage._sum.usageCount || 0,
          createdAt: template.createdAt,
          lastUpdated: template.updatedAt,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

import { Router } from 'express'
import * as templateController from '../controllers/process-templates.controller.js'
import { validate } from '../middleware/validate.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { createProcessTemplateSchema, updateProcessTemplateSchema } from '../utils/validation.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

/**
 * @route   GET /api/process-templates
 * @desc    Get all process templates for organization
 * @access  Private
 */
router.get('/', templateController.getTemplates)

/**
 * @route   GET /api/process-templates/:id
 * @desc    Get single process template
 * @access  Private
 */
router.get('/:id', templateController.getTemplate)

/**
 * @route   POST /api/process-templates
 * @desc    Create new process template
 * @access  Private (ADMIN, MANAGER)
 */
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(createProcessTemplateSchema),
  templateController.createTemplate
)

/**
 * @route   PATCH /api/process-templates/:id
 * @desc    Update process template
 * @access  Private (ADMIN, MANAGER)
 */
router.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(updateProcessTemplateSchema),
  templateController.updateTemplate
)

/**
 * @route   DELETE /api/process-templates/:id
 * @desc    Delete process template
 * @access  Private (ADMIN, MANAGER)
 */
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  templateController.deleteTemplate
)

/**
 * @route   POST /api/process-templates/:id/set-default
 * @desc    Set template as default for organization
 * @access  Private (ADMIN, MANAGER)
 */
router.post(
  '/:id/set-default',
  authorize('ADMIN', 'MANAGER'),
  templateController.setDefaultTemplate
)

/**
 * @route   POST /api/process-templates/:id/duplicate
 * @desc    Duplicate an existing template
 * @access  Private (ADMIN, MANAGER)
 */
router.post(
  '/:id/duplicate',
  authorize('ADMIN', 'MANAGER'),
  templateController.duplicateTemplate
)

/**
 * @route   GET /api/process-templates/:id/stats
 * @desc    Get usage statistics for template
 * @access  Private
 */
router.get('/:id/stats', templateController.getTemplateUsageStats)

export default router

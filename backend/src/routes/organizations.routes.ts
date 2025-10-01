import { Router } from 'express'
import * as organizationController from '../controllers/organizations.controller.js'
import { validate } from '../middleware/validate.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { updateOrganizationSchema, organizationSettingsSchema } from '../utils/validation.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

/**
 * @route   GET /api/organization
 * @desc    Get current user's organization details
 * @access  Private
 */
router.get('/', organizationController.getOrganization)

/**
 * @route   PATCH /api/organization
 * @desc    Update organization details
 * @access  Private (ADMIN only)
 */
router.patch(
  '/',
  authorize('ADMIN'),
  validate(updateOrganizationSchema),
  organizationController.updateOrganization
)

/**
 * @route   GET /api/organization/stats
 * @desc    Get organization statistics
 * @access  Private
 */
router.get('/stats', organizationController.getOrganizationStats)

/**
 * @route   GET /api/organization/settings
 * @desc    Get organization settings
 * @access  Private
 */
router.get('/settings', organizationController.getSettings)

/**
 * @route   PATCH /api/organization/settings
 * @desc    Update organization settings
 * @access  Private (ADMIN only)
 */
router.patch(
  '/settings',
  authorize('ADMIN'),
  validate(organizationSettingsSchema),
  organizationController.updateSettings
)

export default router

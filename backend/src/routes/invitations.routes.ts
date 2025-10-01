import { Router } from 'express'
import * as invitationController from '../controllers/invitations.controller.js'
import { validate } from '../middleware/validate.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { createInvitationSchema } from '../utils/validation.js'

const router = Router()

/**
 * Public routes (no authentication required)
 */

/**
 * @route   GET /api/invitations/:token/verify
 * @desc    Verify invitation token
 * @access  Public
 */
router.get('/:token/verify', invitationController.verifyInvitation)

/**
 * @route   POST /api/invitations/:token/accept
 * @desc    Accept invitation and create user account
 * @access  Public
 */
router.post('/:token/accept', invitationController.acceptInvitation)

/**
 * Protected routes (require authentication)
 */
router.use(authenticate)

/**
 * @route   POST /api/invitations
 * @desc    Create new invitation
 * @access  Private (ADMIN, MANAGER)
 */
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(createInvitationSchema),
  invitationController.createInvitation
)

/**
 * @route   GET /api/invitations
 * @desc    Get all pending invitations for organization
 * @access  Private (ADMIN, MANAGER)
 */
router.get(
  '/',
  authorize('ADMIN', 'MANAGER'),
  invitationController.getInvitations
)

/**
 * @route   POST /api/invitations/:id/resend
 * @desc    Resend invitation email
 * @access  Private (ADMIN, MANAGER)
 */
router.post(
  '/:id/resend',
  authorize('ADMIN', 'MANAGER'),
  invitationController.resendInvitation
)

/**
 * @route   DELETE /api/invitations/:id
 * @desc    Cancel pending invitation
 * @access  Private (ADMIN, MANAGER)
 */
router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  invitationController.cancelInvitation
)

export default router

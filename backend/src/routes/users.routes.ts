import { Router } from 'express'
import * as usersController from '../controllers/users.controller.js'
import { validate, validateQuery } from '../middleware/validate.js'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
  paginationSchema,
} from '../utils/validation.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// List users with pagination
router.get('/', validateQuery(paginationSchema), usersController.getUsers)

// Create new user (Admin and Manager only)
router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(createUserSchema),
  usersController.createUser
)

// Get single user details
router.get('/:id', usersController.getUser)

// Get user statistics
router.get('/:id/stats', usersController.getUserStats)

// Update user information
router.patch('/:id', validate(updateUserSchema), usersController.updateUser)

// Update user role (Admin only)
router.patch(
  '/:id/role',
  authorize('ADMIN'),
  validate(updateUserRoleSchema),
  usersController.updateUserRole
)

// Soft delete user (Admin only)
router.delete('/:id', authorize('ADMIN'), usersController.deleteUser)

export default router

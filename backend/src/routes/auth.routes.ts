import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../utils/validation.js'

const router = Router()

// Public routes
router.post('/register', validate(registerSchema), authController.register)
router.post('/login', validate(loginSchema), authController.login)
router.post('/forgot-password', validate(forgotPasswordSchema), authController.requestPasswordReset)
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword)

// Protected routes (require authentication)
router.use(authenticate)

router.get('/me', authController.getMe)
router.post('/logout', authController.logout)
router.post('/refresh', authController.refreshToken)
router.post('/change-password', validate(changePasswordSchema), authController.changePassword)

export default router

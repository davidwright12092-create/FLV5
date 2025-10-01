import { Router } from 'express'
import * as analyticsController from '../controllers/analytics.controller.js'
import { validate, validateQuery } from '../middleware/validate.js'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  createAnalysisSchema,
  reportGenerationSchema,
  analyticsFilterSchema,
} from '../utils/validation.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Dashboard statistics (available to all authenticated users)
router.get(
  '/dashboard',
  validateQuery(analyticsFilterSchema),
  analyticsController.getDashboardStats
)

// Conversation analytics
router.get(
  '/conversations',
  validateQuery(analyticsFilterSchema),
  analyticsController.getConversationAnalytics
)

// Sentiment analytics
router.get(
  '/sentiment',
  validateQuery(analyticsFilterSchema),
  analyticsController.getSentimentAnalytics
)

// Process adherence analytics
router.get(
  '/process-adherence',
  validateQuery(analyticsFilterSchema),
  analyticsController.getProcessAdherence
)

// Sales opportunities
router.get(
  '/opportunities',
  validateQuery(analyticsFilterSchema),
  analyticsController.getSalesOpportunities
)

// Team performance (restricted to MANAGER and ADMIN)
router.get(
  '/team',
  authorize('MANAGER', 'ADMIN'),
  validateQuery(analyticsFilterSchema),
  analyticsController.getTeamPerformance
)

// Report generation and management (restricted to MANAGER and ADMIN)
router.post(
  '/reports',
  authorize('MANAGER', 'ADMIN'),
  validate(reportGenerationSchema),
  analyticsController.generateReport
)

router.get(
  '/reports',
  authorize('MANAGER', 'ADMIN'),
  analyticsController.getReports
)

router.get(
  '/reports/:id/export',
  authorize('MANAGER', 'ADMIN'),
  analyticsController.exportReport
)

export default router

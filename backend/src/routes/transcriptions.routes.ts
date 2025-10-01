import { Router } from 'express'
import * as transcriptionsController from '../controllers/transcriptions.controller.js'
import { validateQuery } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import {
  searchTranscriptionsSchema,
} from '../utils/validation.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Search transcriptions across all recordings
router.get(
  '/search',
  validateQuery(searchTranscriptionsSchema),
  transcriptionsController.searchTranscriptions
)

export default router

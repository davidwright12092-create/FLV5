import { Router } from 'express'
import * as recordingsController from '../controllers/recordings.controller.js'
import * as transcriptionsController from '../controllers/transcriptions.controller.js'
import * as analyticsController from '../controllers/analytics.controller.js'
import { validate, validateQuery } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import { uploadMiddleware, handleMulterError } from '../middleware/upload.js'
import {
  createRecordingSchema,
  updateRecordingSchema,
  uploadRecordingSchema,
  createTranscriptionSchema,
  createAnalysisSchema,
  paginationSchema,
  dateRangeSchema,
} from '../utils/validation.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Upload endpoint - must come before /:id to avoid route conflicts
router.post(
  '/upload',
  uploadMiddleware.single('file'),
  handleMulterError,
  validate(uploadRecordingSchema),
  recordingsController.uploadRecording
)

// Stats endpoint
router.get('/stats', recordingsController.getRecordingStats)

// Date range endpoint
router.get(
  '/date-range',
  validateQuery(paginationSchema),
  validateQuery(dateRangeSchema),
  recordingsController.getRecordingsByDateRange
)

// Standard CRUD endpoints
router.get('/', validateQuery(paginationSchema), recordingsController.getRecordings)
router.get('/:id', recordingsController.getRecording)
router.post('/', validate(createRecordingSchema), recordingsController.createRecording)
router.patch('/:id', validate(updateRecordingSchema), recordingsController.updateRecording)
router.delete('/:id', recordingsController.deleteRecording)

// Transcription endpoints for specific recordings
router.get('/:id/transcription', transcriptionsController.getTranscription)
router.post(
  '/:id/transcription',
  validate(createTranscriptionSchema),
  transcriptionsController.createTranscription
)

// Analysis endpoints for specific recordings
router.get('/:id/analysis', analyticsController.getAnalysis)
router.post(
  '/:id/analysis',
  validate(createAnalysisSchema),
  analyticsController.createAnalysis
)

export default router

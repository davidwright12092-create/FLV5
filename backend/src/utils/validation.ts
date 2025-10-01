import { z } from 'zod'

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  industry: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

// Recording schemas
export const createRecordingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  duration: z.number().positive('Duration must be positive'),
  fileSize: z.number().positive('File size must be positive'),
  s3Key: z.string().min(1, 'S3 key is required'),
  s3Url: z.string().url('Invalid S3 URL'),
})

export const uploadRecordingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
})

export const updateRecordingSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  status: z.enum(['UPLOADED', 'TRANSCRIBING', 'ANALYZING', 'COMPLETED', 'FAILED']).optional(),
})

export const dateRangeSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format',
  }),
})

// Transcription schemas
export const createTranscriptionSchema = z.object({
  content: z.string().min(1, 'Transcription content is required'),
  language: z.string().optional().default('en'),
  confidence: z.number().min(0).max(1).optional().default(0),
  segments: z.array(z.object({
    text: z.string(),
    startTime: z.number(),
    endTime: z.number(),
    confidence: z.number().optional(),
    speaker: z.string().optional(),
  })).optional(),
})

export const searchTranscriptionsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
})

// Process template schemas
export const createProcessTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  steps: z.array(
    z.object({
      name: z.string().min(1, 'Step name is required'),
      keywords: z.array(z.string()),
      order: z.number().int().min(0),
      required: z.boolean().default(false),
    })
  ).min(1, 'At least one step is required'),
  isDefault: z.boolean().default(false).optional(),
})

export const updateProcessTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  steps: z.array(
    z.object({
      name: z.string().min(1, 'Step name is required'),
      keywords: z.array(z.string()),
      order: z.number().int().min(0),
      required: z.boolean().default(false),
    })
  ).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
})

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).default('USER'),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional(),
  isActive: z.boolean().optional(),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'USER'], {
    errorMap: () => ({ message: 'Invalid role. Must be ADMIN, MANAGER, or USER' }),
  }),
})

// Organization schemas
export const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  industry: z.string().max(100, 'Industry too long').optional(),
})

export const organizationSettingsSchema = z.object({
  defaultProcessTemplateId: z.string().uuid().optional(),
  enableAutoAnalysis: z.boolean().optional(),
  retentionDays: z.number().int().min(1).max(365).optional(),
  allowedDomains: z.array(z.string().email()).optional(),
  notificationEmail: z.string().email().optional(),
  features: z.object({
    recordings: z.boolean().optional(),
    transcription: z.boolean().optional(),
    analysis: z.boolean().optional(),
    reports: z.boolean().optional(),
  }).optional(),
})

// Invitation schemas
export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// Analytics schemas
export const createAnalysisSchema = z.object({
  forceReanalysis: z.boolean().optional().default(false),
})

export const analyticsFilterSchema = z.object({
  dateRange: z.string().regex(/^\d+$/).optional().default('30'),
  userId: z.string().uuid().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
  type: z.enum(['upsell', 'cross-sell', 'renewal', 'expansion', 'follow-up']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  templateId: z.string().uuid().optional(),
})

export const reportGenerationSchema = z.object({
  name: z.string().min(1, 'Report name is required').max(200, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  dateRange: z.string().regex(/^\d+$/).default('30'),
  userId: z.string().uuid().optional(),
  metrics: z.array(
    z.enum(['recordings', 'sentiment', 'opportunities', 'process', 'team'])
  ).optional(),
  filters: z.object({
    type: z.string().optional(),
    priority: z.string().optional(),
    minConfidence: z.number().min(0).max(1).optional(),
  }).optional(),
})

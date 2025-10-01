import { Router, Request, Response } from 'express'
import authRoutes from './auth.routes.js'
import recordingsRoutes from './recordings.routes.js'
import usersRoutes from './users.routes.js'
import analyticsRoutes from './analytics.routes.js'
import processTemplatesRoutes from './process-templates.routes.js'
import organizationsRoutes from './organizations.routes.js'
import invitationsRoutes from './invitations.routes.js'
import transcriptionsRoutes from './transcriptions.routes.js'

const router = Router()

// API version prefix for future versioning
const v1Router = Router()

// Mount all routes under /v1
v1Router.use('/auth', authRoutes)
v1Router.use('/recordings', recordingsRoutes)
v1Router.use('/transcriptions', transcriptionsRoutes)
v1Router.use('/users', usersRoutes)
v1Router.use('/analytics', analyticsRoutes)
v1Router.use('/process-templates', processTemplatesRoutes)
v1Router.use('/organization', organizationsRoutes)
v1Router.use('/invitations', invitationsRoutes)

// Mount v1 routes
router.use('/v1', v1Router)

// For backward compatibility, also mount at root level
router.use('/auth', authRoutes)
router.use('/recordings', recordingsRoutes)
router.use('/transcriptions', transcriptionsRoutes)
router.use('/users', usersRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/process-templates', processTemplatesRoutes)
router.use('/organization', organizationsRoutes)
router.use('/invitations', invitationsRoutes)

// Route listing endpoint - returns all available routes
router.get('/routes', (req: Request, res: Response) => {
  const routes = [
    // Authentication routes
    {
      method: 'POST',
      path: '/api/v1/auth/register',
      description: 'Register a new user account',
      authentication: 'None',
      version: 'v1'
    },
    {
      method: 'POST',
      path: '/api/v1/auth/login',
      description: 'Login with email and password',
      authentication: 'None',
      version: 'v1'
    },
    {
      method: 'POST',
      path: '/api/v1/auth/forgot-password',
      description: 'Request password reset',
      authentication: 'None',
      version: 'v1'
    },
    {
      method: 'POST',
      path: '/api/v1/auth/reset-password',
      description: 'Reset password with token',
      authentication: 'None',
      version: 'v1'
    },
    {
      method: 'GET',
      path: '/api/v1/auth/me',
      description: 'Get current authenticated user',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'POST',
      path: '/api/v1/auth/logout',
      description: 'Logout current user',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'POST',
      path: '/api/v1/auth/refresh',
      description: 'Refresh authentication token',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'POST',
      path: '/api/v1/auth/change-password',
      description: 'Change user password',
      authentication: 'Bearer Token',
      version: 'v1'
    },

    // User routes
    {
      method: 'GET',
      path: '/api/v1/users',
      description: 'Get all users (paginated)',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'GET',
      path: '/api/v1/users/:id',
      description: 'Get a specific user by ID',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'PATCH',
      path: '/api/v1/users/:id',
      description: 'Update a user',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'DELETE',
      path: '/api/v1/users/:id',
      description: 'Delete a user (admin only)',
      authentication: 'Bearer Token (Admin)',
      version: 'v1'
    },

    // Recording routes
    {
      method: 'GET',
      path: '/api/v1/recordings',
      description: 'Get all recordings (paginated)',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'GET',
      path: '/api/v1/recordings/:id',
      description: 'Get a specific recording by ID',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'POST',
      path: '/api/v1/recordings',
      description: 'Create a new recording',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'PATCH',
      path: '/api/v1/recordings/:id',
      description: 'Update a recording',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'DELETE',
      path: '/api/v1/recordings/:id',
      description: 'Delete a recording',
      authentication: 'Bearer Token',
      version: 'v1'
    },

    // Analytics routes
    {
      method: 'GET',
      path: '/api/v1/recordings/:id/analysis',
      description: 'Get AI analysis for a recording',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'POST',
      path: '/api/v1/recordings/:id/analysis',
      description: 'Trigger/create analysis for a recording',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/dashboard',
      description: 'Get overall dashboard statistics',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/conversations',
      description: 'Get conversation metrics and trends',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/sentiment',
      description: 'Get sentiment analytics and trends',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/process-adherence',
      description: 'Get process adherence analytics',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/opportunities',
      description: 'Get detected sales opportunities',
      authentication: 'Bearer Token',
      version: 'v1'
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/team',
      description: 'Get team performance metrics (Manager/Admin only)',
      authentication: 'Bearer Token (Manager/Admin)',
      version: 'v1'
    },
    {
      method: 'POST',
      path: '/api/v1/analytics/reports',
      description: 'Generate custom analytics report (Manager/Admin only)',
      authentication: 'Bearer Token (Manager/Admin)',
      version: 'v1'
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/reports',
      description: 'Get list of saved reports (Manager/Admin only)',
      authentication: 'Bearer Token (Manager/Admin)',
      version: 'v1'
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/reports/:id/export',
      description: 'Export report in PDF/Excel/CSV format (Manager/Admin only)',
      authentication: 'Bearer Token (Manager/Admin)',
      version: 'v1'
    },

    // System routes
    {
      method: 'GET',
      path: '/api/routes',
      description: 'List all available API routes',
      authentication: 'None',
      version: 'v1'
    }
  ]

  res.json({
    success: true,
    version: '5.0.0',
    totalRoutes: routes.length,
    routes
  })
})

export default router

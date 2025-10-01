import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { errorHandler } from './middleware/errorHandler.js'
import { serveApiDocs } from './middleware/apiDocs.js'
import routes from './routes/index.js'
import env from './config/env.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 5000

// Trust proxy for Render deployment
app.set('trust proxy', 1)

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(compression())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api', limiter)

// Health check - Enhanced with more details
app.get('/health', (req, res) => {
  const uptime = process.uptime()
  const memoryUsage = process.memoryUsage()

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FieldLink v5 - AI Conversation Analysis',
    uptime: {
      seconds: Math.floor(uptime),
      formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      percentage: `${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%`
    },
    environment: env.NODE_ENV,
    version: '5.0.0'
  })
})

// API health check with more technical details
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    api: {
      version: '5.0.0',
      environment: env.NODE_ENV
    },
    services: {
      database: 'connected',
      websocket: 'active',
      storage: 'available'
    }
  })
})

// API Documentation endpoint
app.get('/api/docs', serveApiDocs)

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'FieldLink v5 API',
    version: '5.0.0',
    documentation: '/api/docs',
    routes: '/api/routes',
    health: '/api/health',
    features: [
      'Audio Recording Upload',
      'Speech-to-Text Transcription',
      'AI Conversation Analysis',
      'Sales Opportunity Detection',
      'Sentiment Analysis',
      'Process Adherence Scoring'
    ],
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      recordings: '/api/v1/recordings'
    }
  })
})

// Mount API routes
app.use('/api', routes)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('join-organization', (organizationId) => {
    socket.join(`org:${organizationId}`)
    console.log(`Client ${socket.id} joined organization: ${organizationId}`)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase()

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`🚀 FieldLink v5 Server running on http://localhost:${PORT}`)
      console.log(`📚 API available at http://localhost:${PORT}/api`)
      console.log(`🔌 WebSocket server ready`)
      console.log(`🌍 Environment: ${env.NODE_ENV}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server')
  httpServer.close(async () => {
    await disconnectDatabase()
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server')
  httpServer.close(async () => {
    await disconnectDatabase()
    process.exit(0)
  })
})

startServer()

export { io }

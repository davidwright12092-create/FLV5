import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Test database connection
export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    console.warn('⚠️  Running in demo mode without database')
    // Don't exit in development mode - allow running without DB for demo
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await prisma.$disconnect()
  console.log('Database disconnected')
}

export default prisma

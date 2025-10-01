import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors.js'
import { Prisma } from '@prisma/client'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  })

  // AppError (known operational errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        status: err.statusCode,
      },
    })
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: {
          message: 'A record with this value already exists',
          status: 409,
        },
      })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: {
          message: 'Record not found',
          status: 404,
        },
      })
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        message: 'Invalid token',
        status: 401,
      },
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        message: 'Token expired',
        status: 401,
      },
    })
  }

  // Default server error
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
      status: 500,
    },
  })
}

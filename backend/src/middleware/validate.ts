import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'
import { ValidationError } from '../utils/errors.js'

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => err.message).join(', ')
        next(new ValidationError(messages))
      } else {
        next(error)
      }
    }
  }
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => err.message).join(', ')
        next(new ValidationError(messages))
      } else {
        next(error)
      }
    }
  }
}

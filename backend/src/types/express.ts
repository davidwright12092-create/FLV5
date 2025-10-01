import { Request } from 'express'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    organizationId: string
  }
}

export interface PaginationQuery {
  page?: string
  limit?: string
  sortBy?: string
  order?: 'asc' | 'desc'
}

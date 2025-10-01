import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types/express.js'
import prisma from '../config/database.js'
import { NotFoundError } from '../utils/errors.js'

/**
 * Get transcription for a specific recording
 * GET /api/recordings/:id/transcription
 */
export async function getTranscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params

    // Check if recording exists and belongs to organization
    const recording = await prisma.recording.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!recording) {
      throw new NotFoundError('Recording not found')
    }

    // Get transcription
    const transcription = await prisma.transcription.findUnique({
      where: {
        recordingId: id,
      },
      include: {
        recording: {
          select: {
            id: true,
            title: true,
            duration: true,
            createdAt: true,
          },
        },
      },
    })

    if (!transcription) {
      throw new NotFoundError('Transcription not found for this recording')
    }

    res.json({
      success: true,
      data: transcription,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create or update transcription for a recording
 * POST /api/recordings/:id/transcription
 */
export async function createTranscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params
    const { content, language, confidence, segments } = req.body

    // Check if recording exists and belongs to organization
    const recording = await prisma.recording.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!recording) {
      throw new NotFoundError('Recording not found')
    }

    // Check if transcription already exists
    const existingTranscription = await prisma.transcription.findUnique({
      where: {
        recordingId: id,
      },
    })

    let transcription

    if (existingTranscription) {
      // Update existing transcription
      transcription = await prisma.transcription.update({
        where: {
          recordingId: id,
        },
        data: {
          text: content,
          language: language || 'en',
          confidence: confidence || 0.0,
          speakerSegments: segments || [],
        },
        include: {
          recording: {
            select: {
              id: true,
              title: true,
              duration: true,
            },
          },
        },
      })

      // Update recording status
      await prisma.recording.update({
        where: { id },
        data: {
          status: 'COMPLETED',
        },
      })
    } else {
      // Create new transcription
      transcription = await prisma.transcription.create({
        data: {
          text: content,
          language: language || 'en',
          confidence: confidence || 0.0,
          speakerSegments: segments || [],
          recordingId: id,
        },
        include: {
          recording: {
            select: {
              id: true,
              title: true,
              duration: true,
            },
          },
        },
      })

      // Update recording status
      await prisma.recording.update({
        where: { id },
        data: {
          status: 'COMPLETED',
        },
      })
    }

    res.status(existingTranscription ? 200 : 201).json({
      success: true,
      data: transcription,
      message: existingTranscription
        ? 'Transcription updated successfully'
        : 'Transcription created successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Search across all transcriptions
 * GET /api/transcriptions/search
 */
export async function searchTranscriptions(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { query, page = '1', limit = '10' } = req.query
    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const searchQuery = query as string

    const skip = (pageNum - 1) * limitNum

    // Search for transcriptions containing the query
    // This is a basic text search - you may want to implement full-text search
    // using PostgreSQL's full-text search or a service like Elasticsearch
    const [transcriptions, total] = await Promise.all([
      prisma.transcription.findMany({
        where: {
          recording: {
            organizationId: req.user!.organizationId,
          },
          text: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        include: {
          recording: {
            select: {
              id: true,
              title: true,
              duration: true,
              createdAt: true,
              status: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.transcription.count({
        where: {
          recording: {
            organizationId: req.user!.organizationId,
          },
          text: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      }),
    ])

    // Highlight search results in text
    const highlightedResults = transcriptions.map((transcription) => {
      // Simple highlighting - you may want to use a more sophisticated approach
      const regex = new RegExp(`(${searchQuery})`, 'gi')

      // Extract context around matches (100 chars before and after)
      const matches: string[] = []
      const textLower = transcription.text.toLowerCase()
      const queryLower = searchQuery.toLowerCase()
      let index = textLower.indexOf(queryLower)

      while (index !== -1 && matches.length < 3) {
        const start = Math.max(0, index - 100)
        const end = Math.min(transcription.text.length, index + searchQuery.length + 100)
        const snippet = transcription.text.substring(start, end)
        const highlightedSnippet = snippet.replace(regex, '<mark>$1</mark>')
        matches.push(
          (start > 0 ? '...' : '') + highlightedSnippet + (end < transcription.text.length ? '...' : '')
        )
        index = textLower.indexOf(queryLower, index + 1)
      }

      return {
        ...transcription,
        matches,
        matchCount: (transcription.text.match(regex) || []).length,
      }
    })

    res.json({
      success: true,
      data: highlightedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      query: searchQuery,
    })
  } catch (error) {
    next(error)
  }
}

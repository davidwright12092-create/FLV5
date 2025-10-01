import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types/express.js'
import prisma from '../config/database.js'
import { NotFoundError, AuthorizationError } from '../utils/errors.js'

export async function getRecordings(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query as any
    const skip = (page - 1) * limit

    const [recordings, total] = await Promise.all([
      prisma.recording.findMany({
        where: {
          organizationId: req.user!.organizationId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          transcription: {
            select: {
              id: true,
              confidence: true,
              language: true,
            },
          },
          analysisResult: {
            select: {
              id: true,
              confidence: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order,
        },
      }),
      prisma.recording.count({
        where: {
          organizationId: req.user!.organizationId,
        },
      }),
    ])

    res.json({
      success: true,
      data: recordings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getRecording(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params

    const recording = await prisma.recording.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        transcription: true,
        analysisResult: true,
      },
    })

    if (!recording) {
      throw new NotFoundError('Recording not found')
    }

    res.json({
      success: true,
      data: recording,
    })
  } catch (error) {
    next(error)
  }
}

export async function createRecording(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, duration, fileSize, s3Key, s3Url } = req.body

    const recording = await prisma.recording.create({
      data: {
        title,
        duration,
        fileSize,
        s3Key,
        s3Url,
        userId: req.user!.id,
        organizationId: req.user!.organizationId,
        status: 'UPLOADED',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    res.status(201).json({
      success: true,
      data: recording,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateRecording(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params
    const { title, status } = req.body

    // Check if recording exists and belongs to organization
    const existing = await prisma.recording.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      throw new NotFoundError('Recording not found')
    }

    const recording = await prisma.recording.update({
      where: { id },
      data: {
        title,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    res.json({
      success: true,
      data: recording,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteRecording(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params

    // Check if recording exists and belongs to organization
    const existing = await prisma.recording.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existing) {
      throw new NotFoundError('Recording not found')
    }

    // Delete from S3 if s3Key exists
    if (existing.s3Key) {
      try {
        const { deleteFromS3 } = await import('../services/upload.service.js')
        await deleteFromS3(existing.s3Key)
      } catch (error) {
        console.error('Failed to delete file from S3:', error)
        // Continue with database deletion even if S3 deletion fails
      }
    }

    await prisma.recording.delete({
      where: { id },
    })

    res.json({
      success: true,
      message: 'Recording deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export async function uploadRecording(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) {
      throw new NotFoundError('No file uploaded')
    }

    const { title } = req.body
    const file = req.file

    // Import upload service functions
    const { uploadToS3, validateFileType, validateFileSize } = await import('../services/upload.service.js')

    // Validate file type and size (already validated by multer, but double-check)
    if (!validateFileType(file.mimetype)) {
      throw new AuthorizationError('Invalid file type. Only mp3, wav, m4a, and ogg files are allowed.')
    }

    if (!validateFileSize(file.size)) {
      throw new AuthorizationError('File size exceeds 100MB limit')
    }

    // Upload to S3
    const { s3Key, s3Url } = await uploadToS3(
      file.buffer,
      req.user!.organizationId,
      file.originalname,
      file.mimetype
    )

    // Get audio duration (you may want to use a library like 'music-metadata' for this)
    // For now, we'll set it to 0 and let the client provide it or calculate later
    const duration = 0

    // Create recording metadata in database
    const recording = await prisma.recording.create({
      data: {
        title: title || file.originalname,
        duration,
        fileSize: file.size,
        s3Key,
        s3Url,
        userId: req.user!.id,
        organizationId: req.user!.organizationId,
        status: 'UPLOADED',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Process transcription and analysis in background (don't await)
    processRecordingAsync(recording.id, s3Url).catch((error) => {
      console.error(`Failed to process recording ${recording.id}:`, error)
    })

    res.status(201).json({
      success: true,
      data: recording,
      message: 'Recording uploaded successfully. Processing has started.',
    })
  } catch (error) {
    next(error)
  }
}

export async function getRecordingStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const organizationId = req.user!.organizationId

    // Get total recordings count
    const totalRecordings = await prisma.recording.count({
      where: { organizationId },
    })

    // Get recordings by status
    const recordingsByStatus = await prisma.recording.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: true,
    })

    // Get total storage used (in bytes)
    const storageResult = await prisma.recording.aggregate({
      where: { organizationId },
      _sum: {
        fileSize: true,
      },
    })

    const totalStorage = storageResult._sum.fileSize || 0

    // Get recordings count by date (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentRecordings = await prisma.recording.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    })

    // Group by date
    const recordingsByDate: Record<string, number> = {}
    recentRecordings.forEach((recording) => {
      const date = recording.createdAt.toISOString().split('T')[0]
      recordingsByDate[date] = (recordingsByDate[date] || 0) + 1
    })

    // Get total duration
    const durationResult = await prisma.recording.aggregate({
      where: { organizationId },
      _sum: {
        duration: true,
      },
    })

    const totalDuration = durationResult._sum.duration || 0

    res.json({
      success: true,
      data: {
        totalRecordings,
        recordingsByStatus: recordingsByStatus.map((item) => ({
          status: item.status,
          count: item._count,
        })),
        totalStorage,
        totalDuration,
        recordingsByDate,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getRecordingsByDateRange(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string }
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query as any

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Set end date to end of day
    end.setHours(23, 59, 59, 999)

    const skip = (page - 1) * limit

    const [recordings, total] = await Promise.all([
      prisma.recording.findMany({
        where: {
          organizationId: req.user!.organizationId,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          transcription: {
            select: {
              id: true,
              confidence: true,
              language: true,
            },
          },
          analysisResult: {
            select: {
              id: true,
              confidence: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order,
        },
      }),
      prisma.recording.count({
        where: {
          organizationId: req.user!.organizationId,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
    ])

    res.json({
      success: true,
      data: recordings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      dateRange: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Process recording asynchronously: transcription + analysis
 */
async function processRecordingAsync(recordingId: string, s3Url: string) {
  try {
    console.log(`Starting processing for recording ${recordingId}`)

    // Update status to TRANSCRIBING
    await prisma.recording.update({
      where: { id: recordingId },
      data: { status: 'TRANSCRIBING' },
    })

    // Import OpenAI
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Download audio from S3 and transcribe with Whisper
    const response = await fetch(s3Url)
    const audioBuffer = await response.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
    const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' })

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile as any,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment'],
    } as any) as any

    // Save transcription to database
    await prisma.transcription.create({
      data: {
        recordingId,
        text: transcription.text || '',
        confidence: 0.95, // Whisper doesn't provide confidence, using default
        language: (transcription.language || 'en') as string,
        speakerSegments: (transcription.segments || []) as any,
      },
    })

    console.log(`Transcription completed for recording ${recordingId}`)

    // Update status to ANALYZING
    await prisma.recording.update({
      where: { id: recordingId },
      data: { status: 'ANALYZING' },
    })

    // Import analysis service
    const { analyzeRecording } = await import('../services/analysis.service.js')

    // Run AI analysis
    await analyzeRecording(recordingId)

    console.log(`Analysis completed for recording ${recordingId}`)

    // Update status to COMPLETED
    await prisma.recording.update({
      where: { id: recordingId },
      data: { status: 'COMPLETED' },
    })

  } catch (error) {
    console.error(`Error processing recording ${recordingId}:`, error)

    // Update status to FAILED
    await prisma.recording.update({
      where: { id: recordingId },
      data: { status: 'FAILED' },
    }).catch(err => console.error('Failed to update status to FAILED:', err))
  }
}

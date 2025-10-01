import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types/express.js'
import prisma from '../config/database.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'
import * as analysisService from '../services/analysis.service.js'

/**
 * Get AI analysis for a specific recording
 * GET /api/recordings/:id/analysis
 */
export async function getAnalysis(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params

    // Find recording and verify ownership
    const recording = await prisma.recording.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
      include: {
        analysisResult: true,
        transcription: true,
      },
    })

    if (!recording) {
      throw new NotFoundError('Recording not found')
    }

    if (!recording.analysisResult) {
      throw new NotFoundError('Analysis not found for this recording')
    }

    res.json({
      success: true,
      data: recording.analysisResult,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Trigger/create analysis for a recording
 * POST /api/recordings/:id/analysis
 */
export async function createAnalysis(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params

    // Find recording and verify ownership
    const recording = await prisma.recording.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
      include: {
        transcription: true,
      },
    })

    if (!recording) {
      throw new NotFoundError('Recording not found')
    }

    if (!recording.transcription) {
      throw new ValidationError('Recording must be transcribed before analysis')
    }

    // Update status to ANALYZING
    await prisma.recording.update({
      where: { id },
      data: { status: 'ANALYZING' },
    })

    // Trigger analysis (in production, this might be async via queue)
    const analysisResult = await analysisService.analyzeRecording(id)

    res.status(201).json({
      success: true,
      data: analysisResult,
      message: 'Analysis completed successfully',
    })
  } catch (error) {
    // Update status to FAILED on error
    try {
      await prisma.recording.update({
        where: { id: req.params.id },
        data: { status: 'FAILED' },
      })
    } catch (updateError) {
      // Ignore update errors
    }
    next(error)
  }
}

/**
 * Get overall dashboard statistics
 * GET /api/analytics/dashboard
 */
export async function getDashboardStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { dateRange = '30', userId } = req.query as any
    const organizationId = req.user!.organizationId

    // Calculate date filter
    const dateFilter = getDateFilter(dateRange)

    // Build where clause
    const whereClause: any = {
      organizationId,
      createdAt: dateFilter,
    }

    if (userId) {
      whereClause.userId = userId
    }

    // Get all statistics in parallel
    const [
      totalRecordings,
      completedRecordings,
      totalDuration,
      averageSentiment,
      totalOpportunities,
      processAdherenceAvg,
      recentRecordings,
      sentimentDistribution,
    ] = await Promise.all([
      // Total recordings count
      prisma.recording.count({ where: whereClause }),

      // Completed recordings count
      prisma.recording.count({
        where: { ...whereClause, status: 'COMPLETED' },
      }),

      // Total duration (sum)
      prisma.recording.aggregate({
        where: whereClause,
        _sum: { duration: true },
      }),

      // Average sentiment score
      prisma.analysisResult.aggregate({
        where: {
          recording: whereClause,
        },
        _avg: { confidence: true },
      }),

      // Total opportunities
      prisma.analysisResult.count({
        where: {
          recording: whereClause,
        },
      }),

      // Average process adherence (calculated from JSON field)
      prisma.analysisResult.findMany({
        where: {
          recording: whereClause,
        },
        select: { processScore: true },
      }),

      // Recent recordings
      prisma.recording.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          analysisResult: {
            select: {
              sentiment: true,
              confidence: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Sentiment distribution
      prisma.analysisResult.findMany({
        where: {
          recording: whereClause,
        },
        select: { sentiment: true },
      }),
    ])

    // Calculate process adherence average
    const processScores = processAdherenceAvg
      .map((result: any) => result.processScore?.overallScore || 0)
      .filter((score: number) => score > 0)

    const avgProcessScore =
      processScores.length > 0
        ? processScores.reduce((a: number, b: number) => a + b, 0) / processScores.length
        : 0

    // Calculate sentiment distribution
    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0,
      mixed: 0,
    }

    sentimentDistribution.forEach((result: any) => {
      const sentiment = result.sentiment?.overall || 'neutral'
      if (sentiment in sentimentCounts) {
        sentimentCounts[sentiment as keyof typeof sentimentCounts]++
      }
    })

    res.json({
      success: true,
      data: {
        overview: {
          totalRecordings,
          completedRecordings,
          totalDuration: totalDuration._sum.duration || 0,
          averageSentiment: averageSentiment._avg.confidence || 0,
          totalOpportunities,
          processAdherenceAvg: Math.round(avgProcessScore),
        },
        sentimentDistribution: sentimentCounts,
        recentRecordings,
        dateRange,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get conversation analytics with trends
 * GET /api/analytics/conversations
 */
export async function getConversationAnalytics(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { dateRange = '30', userId, groupBy = 'day' } = req.query as any
    const organizationId = req.user!.organizationId

    const dateFilter = getDateFilter(dateRange)

    const whereClause: any = {
      organizationId,
      createdAt: dateFilter,
    }

    if (userId) {
      whereClause.userId = userId
    }

    // Get recordings with analysis results
    const recordings = await prisma.recording.findMany({
      where: whereClause,
      include: {
        analysisResult: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group recordings by time period
    const groupedData = groupRecordingsByTime(recordings, groupBy as string)

    // Calculate metrics per group
    const trends = groupedData.map((group) => {
      const totalDuration = group.recordings.reduce(
        (sum, r) => sum + r.duration,
        0
      )
      const avgDuration =
        group.recordings.length > 0
          ? totalDuration / group.recordings.length
          : 0

      const withAnalysis = group.recordings.filter((r) => r.analysisResult)
      const avgConfidence =
        withAnalysis.length > 0
          ? withAnalysis.reduce((sum, r) => sum + (r.analysisResult?.confidence || 0), 0) /
            withAnalysis.length
          : 0

      return {
        period: group.period,
        count: group.recordings.length,
        totalDuration,
        avgDuration: Math.round(avgDuration),
        avgConfidence: Number(avgConfidence.toFixed(2)),
      }
    })

    // Calculate top performers
    const userStats = new Map<string, any>()

    recordings.forEach((recording) => {
      const userId = recording.userId
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          user: recording.user,
          count: 0,
          totalDuration: 0,
          totalConfidence: 0,
          withAnalysis: 0,
        })
      }

      const stats = userStats.get(userId)
      stats.count++
      stats.totalDuration += recording.duration

      if (recording.analysisResult) {
        stats.totalConfidence += recording.analysisResult.confidence
        stats.withAnalysis++
      }
    })

    const topPerformers = Array.from(userStats.values())
      .map((stats) => ({
        user: stats.user,
        recordingsCount: stats.count,
        totalDuration: stats.totalDuration,
        avgConfidence:
          stats.withAnalysis > 0
            ? Number((stats.totalConfidence / stats.withAnalysis).toFixed(2))
            : 0,
      }))
      .sort((a, b) => b.avgConfidence - a.avgConfidence)
      .slice(0, 10)

    res.json({
      success: true,
      data: {
        trends,
        topPerformers,
        summary: {
          totalRecordings: recordings.length,
          totalDuration: recordings.reduce((sum, r) => sum + r.duration, 0),
          avgDuration: Math.round(
            recordings.reduce((sum, r) => sum + r.duration, 0) / Math.max(recordings.length, 1)
          ),
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get sentiment analytics and trends
 * GET /api/analytics/sentiment
 */
export async function getSentimentAnalytics(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { dateRange = '30', userId, groupBy = 'day' } = req.query as any
    const organizationId = req.user!.organizationId

    const dateFilter = getDateFilter(dateRange)

    const whereClause: any = {
      organizationId,
      createdAt: dateFilter,
    }

    if (userId) {
      whereClause.userId = userId
    }

    // Get recordings with sentiment data
    const recordings = await prisma.recording.findMany({
      where: whereClause,
      include: {
        analysisResult: {
          select: {
            sentiment: true,
            confidence: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const withSentiment = recordings.filter((r) => r.analysisResult)

    // Group by time period
    const grouped = groupRecordingsByTime(withSentiment, groupBy as string)

    const trends = grouped.map((group) => {
      const sentiments = group.recordings
        .filter((r) => r.analysisResult?.sentiment)
        .map((r) => r.analysisResult!.sentiment as any)

      const avgScore =
        sentiments.length > 0
          ? sentiments.reduce((sum: number, s: any) => sum + (s.score || 0), 0) /
            sentiments.length
          : 0

      const distribution = {
        positive: sentiments.filter((s: any) => s.overall === 'positive').length,
        negative: sentiments.filter((s: any) => s.overall === 'negative').length,
        neutral: sentiments.filter((s: any) => s.overall === 'neutral').length,
        mixed: sentiments.filter((s: any) => s.overall === 'mixed').length,
      }

      return {
        period: group.period,
        avgScore: Number(avgScore.toFixed(2)),
        distribution,
        count: sentiments.length,
      }
    })

    // Overall sentiment stats
    const allSentiments = withSentiment
      .map((r) => r.analysisResult!.sentiment as any)
      .filter(Boolean)

    const overallDistribution = {
      positive: allSentiments.filter((s: any) => s.overall === 'positive').length,
      negative: allSentiments.filter((s: any) => s.overall === 'negative').length,
      neutral: allSentiments.filter((s: any) => s.overall === 'neutral').length,
      mixed: allSentiments.filter((s: any) => s.overall === 'mixed').length,
    }

    const avgScore =
      allSentiments.length > 0
        ? allSentiments.reduce((sum: number, s: any) => sum + (s.score || 0), 0) /
          allSentiments.length
        : 0

    // Extract common key phrases
    const keyPhrases = allSentiments
      .flatMap((s: any) => s.keyPhrases || [])
      .filter((phrase: string) => phrase && !phrase.includes('Mock'))
      .slice(0, 10)

    res.json({
      success: true,
      data: {
        trends,
        overall: {
          avgScore: Number(avgScore.toFixed(2)),
          distribution: overallDistribution,
          totalAnalyzed: allSentiments.length,
        },
        keyPhrases,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get process adherence analytics
 * GET /api/analytics/process-adherence
 */
export async function getProcessAdherence(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { dateRange = '30', userId, templateId } = req.query as any
    const organizationId = req.user!.organizationId

    const dateFilter = getDateFilter(dateRange)

    const whereClause: any = {
      organizationId,
      createdAt: dateFilter,
    }

    if (userId) {
      whereClause.userId = userId
    }

    // Get recordings with process scores
    const recordings = await prisma.recording.findMany({
      where: whereClause,
      include: {
        analysisResult: {
          select: {
            processScore: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const withProcessScore = recordings.filter(
      (r) => r.analysisResult?.processScore
    )

    // Calculate overall metrics
    const processScores = withProcessScore.map(
      (r) => r.analysisResult!.processScore as any
    )

    const avgScore =
      processScores.length > 0
        ? processScores.reduce((sum, ps) => sum + (ps.overallScore || 0), 0) /
          processScores.length
        : 0

    const avgCompletion =
      processScores.length > 0
        ? processScores.reduce(
            (sum, ps) =>
              sum + (ps.completedSteps || 0) / Math.max(ps.totalSteps || 1, 1),
            0
          ) / processScores.length
        : 0

    // Find most commonly missed steps
    const missedStepsMap = new Map<string, number>()
    processScores.forEach((ps) => {
      ;(ps.missedSteps || []).forEach((step: string) => {
        missedStepsMap.set(step, (missedStepsMap.get(step) || 0) + 1)
      })
    })

    const commonlyMissedSteps = Array.from(missedStepsMap.entries())
      .map(([step, count]) => ({
        step,
        count,
        percentage: Number(((count / processScores.length) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get step performance breakdown
    const stepPerformance = new Map<string, { total: number; scores: number[] }>()

    processScores.forEach((ps) => {
      ;(ps.stepScores || []).forEach((step: any) => {
        if (!stepPerformance.has(step.name)) {
          stepPerformance.set(step.name, { total: 0, scores: [] })
        }
        const perf = stepPerformance.get(step.name)!
        perf.total++
        perf.scores.push(step.score || 0)
      })
    })

    const stepBreakdown = Array.from(stepPerformance.entries())
      .map(([name, data]) => ({
        name,
        avgScore: Number(
          (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
        ),
        detected: data.scores.filter((s) => s > 30).length,
        total: data.total,
        detectionRate: Number(
          ((data.scores.filter((s) => s > 30).length / data.total) * 100).toFixed(1)
        ),
      }))
      .sort((a, b) => b.avgScore - a.avgScore)

    // User performance comparison
    const userPerformance = new Map<string, any>()

    withProcessScore.forEach((recording) => {
      const userId = recording.userId
      if (!userPerformance.has(userId)) {
        userPerformance.set(userId, {
          user: recording.user,
          scores: [],
          count: 0,
        })
      }

      const perf = userPerformance.get(userId)
      const processScore = recording.analysisResult!.processScore as any
      perf.scores.push(processScore.overallScore || 0)
      perf.count++
    })

    const teamPerformance = Array.from(userPerformance.values())
      .map((data) => ({
        user: data.user,
        avgScore: Number(
          (data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length).toFixed(1)
        ),
        recordingsCount: data.count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10)

    res.json({
      success: true,
      data: {
        overall: {
          avgScore: Number(avgScore.toFixed(1)),
          avgCompletion: Number((avgCompletion * 100).toFixed(1)),
          totalAnalyzed: processScores.length,
        },
        stepBreakdown,
        commonlyMissedSteps,
        teamPerformance,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get detected sales opportunities
 * GET /api/analytics/opportunities
 */
export async function getSalesOpportunities(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { dateRange = '30', userId, type, priority } = req.query as any
    const organizationId = req.user!.organizationId

    const dateFilter = getDateFilter(dateRange)

    const whereClause: any = {
      organizationId,
      createdAt: dateFilter,
    }

    if (userId) {
      whereClause.userId = userId
    }

    // Get recordings with opportunities
    const recordings = await prisma.recording.findMany({
      where: whereClause,
      include: {
        analysisResult: {
          select: {
            salesOpportunities: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Extract and filter opportunities
    let allOpportunities: any[] = []

    recordings.forEach((recording) => {
      const opportunities = (recording.analysisResult?.salesOpportunities as any[]) || []
      opportunities.forEach((opp) => {
        allOpportunities.push({
          ...opp,
          recordingId: recording.id,
          recordingTitle: recording.title,
          user: recording.user,
          createdAt: recording.createdAt,
        })
      })
    })

    // Apply filters
    if (type) {
      allOpportunities = allOpportunities.filter((opp) => opp.type === type)
    }

    if (priority) {
      allOpportunities = allOpportunities.filter((opp) => opp.priority === priority)
    }

    // Sort by confidence and priority
    allOpportunities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff =
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)

      if (priorityDiff !== 0) return priorityDiff
      return (b.confidence || 0) - (a.confidence || 0)
    })

    // Calculate statistics
    const stats = {
      total: allOpportunities.length,
      byType: {
        upsell: allOpportunities.filter((o) => o.type === 'upsell').length,
        'cross-sell': allOpportunities.filter((o) => o.type === 'cross-sell').length,
        renewal: allOpportunities.filter((o) => o.type === 'renewal').length,
        expansion: allOpportunities.filter((o) => o.type === 'expansion').length,
        'follow-up': allOpportunities.filter((o) => o.type === 'follow-up').length,
      },
      byPriority: {
        high: allOpportunities.filter((o) => o.priority === 'high').length,
        medium: allOpportunities.filter((o) => o.priority === 'medium').length,
        low: allOpportunities.filter((o) => o.priority === 'low').length,
      },
      avgConfidence:
        allOpportunities.length > 0
          ? Number(
              (
                allOpportunities.reduce((sum, o) => sum + (o.confidence || 0), 0) /
                allOpportunities.length
              ).toFixed(2)
            )
          : 0,
    }

    res.json({
      success: true,
      data: {
        opportunities: allOpportunities.slice(0, 100), // Limit to 100
        stats,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get team performance metrics
 * GET /api/analytics/team
 */
export async function getTeamPerformance(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { dateRange = '30' } = req.query as any
    const organizationId = req.user!.organizationId

    const dateFilter = getDateFilter(dateRange)

    // Get all users in organization
    const users = await prisma.user.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
      },
    })

    // Get recordings with analysis for each user
    const userStats = await Promise.all(
      users.map(async (user) => {
        const recordings = await prisma.recording.findMany({
          where: {
            userId: user.id,
            createdAt: dateFilter,
          },
          include: {
            analysisResult: true,
          },
        })

        const withAnalysis = recordings.filter((r) => r.analysisResult)

        // Calculate metrics
        const totalRecordings = recordings.length
        const totalDuration = recordings.reduce((sum, r) => sum + r.duration, 0)
        const avgDuration =
          totalRecordings > 0 ? totalDuration / totalRecordings : 0

        const avgSentiment =
          withAnalysis.length > 0
            ? withAnalysis.reduce((sum, r) => {
                const sentiment = r.analysisResult!.sentiment as any
                return sum + (sentiment?.score || 0)
              }, 0) / withAnalysis.length
            : 0

        const avgProcessScore =
          withAnalysis.length > 0
            ? withAnalysis.reduce((sum, r) => {
                const processScore = r.analysisResult!.processScore as any
                return sum + (processScore?.overallScore || 0)
              }, 0) / withAnalysis.length
            : 0

        const totalOpportunities = withAnalysis.reduce((sum, r) => {
          const opportunities = r.analysisResult!.salesOpportunities as any[]
          return sum + (opportunities?.length || 0)
        }, 0)

        return {
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
          },
          metrics: {
            totalRecordings,
            totalDuration,
            avgDuration: Math.round(avgDuration),
            avgSentiment: Number(avgSentiment.toFixed(2)),
            avgProcessScore: Number(avgProcessScore.toFixed(1)),
            totalOpportunities,
          },
        }
      })
    )

    // Sort by total recordings
    userStats.sort((a, b) => b.metrics.totalRecordings - a.metrics.totalRecordings)

    // Calculate team averages
    const teamAvg = {
      avgRecordings:
        userStats.length > 0
          ? Number(
              (
                userStats.reduce((sum, u) => sum + u.metrics.totalRecordings, 0) /
                userStats.length
              ).toFixed(1)
            )
          : 0,
      avgDuration:
        userStats.length > 0
          ? Math.round(
              userStats.reduce((sum, u) => sum + u.metrics.avgDuration, 0) /
                userStats.length
            )
          : 0,
      avgSentiment:
        userStats.length > 0
          ? Number(
              (
                userStats.reduce((sum, u) => sum + u.metrics.avgSentiment, 0) /
                userStats.length
              ).toFixed(2)
            )
          : 0,
      avgProcessScore:
        userStats.length > 0
          ? Number(
              (
                userStats.reduce((sum, u) => sum + u.metrics.avgProcessScore, 0) /
                userStats.length
              ).toFixed(1)
            )
          : 0,
    }

    res.json({
      success: true,
      data: {
        teamMembers: userStats,
        teamAverage: teamAvg,
        totalMembers: userStats.length,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Generate custom analytics report
 * POST /api/analytics/reports
 */
export async function generateReport(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      name,
      description,
      dateRange,
      userId,
      metrics,
      filters,
    } = req.body

    const organizationId = req.user!.organizationId

    // For now, we'll store report configuration
    // In production, this would generate and cache the actual report
    const reportConfig = {
      name,
      description,
      dateRange,
      userId,
      metrics: metrics || ['recordings', 'sentiment', 'opportunities', 'process'],
      filters: filters || {},
      createdBy: req.user!.id,
      organizationId,
      generatedAt: new Date().toISOString(),
    }

    // Generate report ID
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    res.status(201).json({
      success: true,
      data: {
        id: reportId,
        ...reportConfig,
      },
      message: 'Report generated successfully',
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get list of saved reports
 * GET /api/analytics/reports
 */
export async function getReports(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // In production, this would fetch from a reports table
    // For now, return empty array
    res.json({
      success: true,
      data: {
        reports: [],
        message: 'Report storage not yet implemented - use POST to generate reports on-demand',
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Export report in specified format (PDF/Excel/CSV)
 * GET /api/analytics/reports/:id/export
 */
export async function exportReport(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params
    const { format = 'pdf' } = req.query as any

    if (!['pdf', 'excel', 'csv'].includes(format)) {
      throw new ValidationError('Invalid export format. Use pdf, excel, or csv')
    }

    // In production, this would generate actual file exports
    // For now, return a placeholder
    res.json({
      success: true,
      data: {
        reportId: id,
        format,
        downloadUrl: `/exports/${id}.${format}`,
        message: 'Export functionality not yet implemented',
      },
    })
  } catch (error) {
    next(error)
  }
}

// Helper functions

/**
 * Get date filter based on date range string
 */
function getDateFilter(dateRange: string) {
  const days = parseInt(dateRange, 10)

  if (isNaN(days) || days <= 0) {
    return undefined
  }

  const date = new Date()
  date.setDate(date.getDate() - days)

  return {
    gte: date,
  }
}

/**
 * Group recordings by time period (day, week, month)
 */
function groupRecordingsByTime(recordings: any[], groupBy: string) {
  const groups = new Map<string, any[]>()

  recordings.forEach((recording) => {
    const date = new Date(recording.createdAt)
    let key: string

    if (groupBy === 'week') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      key = weekStart.toISOString().split('T')[0]
    } else if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    } else {
      // day
      key = date.toISOString().split('T')[0]
    }

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(recording)
  })

  return Array.from(groups.entries())
    .map(([period, recordings]) => ({
      period,
      recordings,
    }))
    .sort((a, b) => a.period.localeCompare(b.period))
}

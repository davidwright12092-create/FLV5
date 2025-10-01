import OpenAI from 'openai'
import prisma from '../config/database.js'
import { NotFoundError } from '../utils/errors.js'

// Initialize OpenAI client with graceful handling if key is missing
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// Constants for configuration
const MAX_TOKENS = 2000
const TEMPERATURE = 0.2
const MODEL = 'gpt-4'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Represents a segment of transcribed conversation
 */
export interface TranscriptionSegment {
  speaker: string
  text: string
  startTime: number
  endTime: number
  confidence?: number
}

/**
 * Multi-dimensional sentiment analysis with confidence scores
 */
export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral' | 'mixed'
  confidence: number // 0-1
  scores: {
    positive: number // 0-1
    negative: number // 0-1
    neutral: number // 0-1
  }
  score: number // -1 (very negative) to 1 (very positive)
  summary: string
}

/**
 * Emotion detection with intensity scores
 */
export interface EmotionAnalysis {
  emotions: {
    joy: number // 0-1
    anger: number // 0-1
    sadness: number // 0-1
    fear: number // 0-1
    surprise: number // 0-1
    disgust: number // 0-1
  }
  dominant: string // The strongest emotion
  intensity: number // Overall emotional intensity (0-1)
  summary: string
}

/**
 * Key phrases with sentiment tags
 */
export interface KeyPhrase {
  phrase: string
  sentiment: 'positive' | 'negative' | 'neutral'
  importance: number // 0-1
  context: string
}

/**
 * Customer satisfaction score analysis
 */
export interface CSATScore {
  score: number // 0-100
  category: 'poor' | 'fair' | 'good' | 'excellent'
  justification: string
  factors: {
    name: string
    score: number // 0-100
    impact: 'positive' | 'negative' | 'neutral'
  }[]
}

/**
 * Tone shift detection throughout conversation
 */
export interface ToneShift {
  timestamp: number
  from: string
  to: string
  intensity: number // 0-1
  trigger?: string // What caused the shift
  context: string
}

/**
 * Overall call quality metrics
 */
export interface CallQualityMetrics {
  overallScore: number // 0-100
  engagement: number // 0-100
  clarity: number // 0-100
  professionalism: number // 0-100
  effectiveness: number // 0-100
  rapport: number // 0-100
  summary: string
  strengths: string[]
  weaknesses: string[]
}

/**
 * Customer intent classification
 */
export type CustomerIntent =
  | 'inquiry'
  | 'complaint'
  | 'purchase'
  | 'support'
  | 'feedback'
  | 'cancellation'
  | 'other'

/**
 * Red flag detection
 */
export interface RedFlag {
  type: 'frustration' | 'confusion' | 'anger' | 'dissatisfaction' | 'churn_risk'
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp?: number
  description: string
  quote: string
  recommendation: string
}

/**
 * Key moment in conversation
 */
export interface KeyMoment {
  timestamp: number
  type: 'positive' | 'negative' | 'turning_point' | 'critical'
  description: string
  impact: number // 0-1
  context: string
}

/**
 * Comprehensive sentiment result
 */
export interface ComprehensiveSentimentResult {
  recordingId?: string
  sentiment: SentimentAnalysis
  emotions: EmotionAnalysis
  keyPhrases: KeyPhrase[]
  csatScore: CSATScore
  toneShifts: ToneShift[]
  callQuality: CallQualityMetrics
  intent: {
    primary: CustomerIntent
    secondary?: CustomerIntent
    confidence: number
  }
  keyMoments: KeyMoment[]
  redFlags: RedFlag[]
  recommendations: string[]
  conversationFlow: {
    beginning: SentimentAnalysis
    middle: SentimentAnalysis
    end: SentimentAnalysis
  }
  cached: boolean
  analyzedAt: Date
}

/**
 * Progress callback for long transcriptions
 */
export type ProgressCallback = (progress: number, stage: string) => void

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Check if sentiment analysis is cached in database
 */
async function getCachedSentiment(
  recordingId: string
): Promise<ComprehensiveSentimentResult | null> {
  try {
    const cached = await prisma.analysisResult.findUnique({
      where: { recordingId },
      select: {
        sentiment: true,
        createdAt: true,
      },
    })

    if (cached && cached.sentiment && typeof cached.sentiment === 'object') {
      const sentimentData = cached.sentiment as any

      // Check if this is a comprehensive sentiment result (has our new structure)
      if (sentimentData.keyPhrases && sentimentData.callQuality) {
        return {
          ...sentimentData,
          cached: true,
          analyzedAt: cached.createdAt,
        } as ComprehensiveSentimentResult
      }
    }

    return null
  } catch (error) {
    console.error('Error retrieving cached sentiment:', error)
    return null
  }
}

/**
 * Store sentiment analysis in database cache
 */
async function cacheSentiment(
  recordingId: string,
  result: ComprehensiveSentimentResult
): Promise<void> {
  try {
    await prisma.analysisResult.update({
      where: { recordingId },
      data: {
        sentiment: result as any,
      },
    })
  } catch (error) {
    console.error('Error caching sentiment:', error)
    // Non-fatal error, continue without caching
  }
}

// ============================================================================
// Retry Logic with Exponential Backoff
// ============================================================================

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries === 0) {
      throw error
    }

    // Check if it's a rate limit error
    if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
      console.warn(`Rate limit hit, retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retryWithBackoff(fn, retries - 1, delay * 2)
    }

    throw error
  }
}

// ============================================================================
// Core Analysis Functions
// ============================================================================

/**
 * Comprehensive sentiment analysis of a transcription
 * @param transcription - The transcription text to analyze
 * @param recordingId - Optional recording ID for caching
 * @param progressCallback - Optional callback for progress updates
 * @returns Comprehensive sentiment analysis result
 */
export async function analyzeSentiment(
  transcription: string,
  recordingId?: string,
  progressCallback?: ProgressCallback
): Promise<ComprehensiveSentimentResult> {
  // Check cache first if recordingId provided
  if (recordingId) {
    progressCallback?.(5, 'Checking cache')
    const cached = await getCachedSentiment(recordingId)
    if (cached) {
      progressCallback?.(100, 'Retrieved from cache')
      return cached
    }
  }

  // If OpenAI not available, return mock data
  if (!openai) {
    progressCallback?.(100, 'Using mock data')
    return generateMockComprehensiveSentiment(transcription, recordingId)
  }

  try {
    // Parallel analysis for better performance
    progressCallback?.(10, 'Starting analysis')

    const [
      sentiment,
      emotions,
      keyPhrases,
      csatScore,
      callQuality,
      intent,
      redFlags,
    ] = await Promise.all([
      analyzeSentimentDetailed(transcription, progressCallback),
      analyzeEmotions(transcription, progressCallback),
      extractKeyPhrases(transcription, progressCallback),
      calculateCustomerSatisfactionScore(transcription, progressCallback),
      analyzeCallQualityInternal(transcription, 0, progressCallback),
      analyzeIntent(transcription, progressCallback),
      detectRedFlags(transcription, progressCallback),
    ])

    progressCallback?.(80, 'Analyzing conversation flow')

    // Context-aware analysis (beginning, middle, end)
    const conversationFlow = await analyzeConversationFlow(transcription)

    progressCallback?.(85, 'Detecting key moments')

    // Detect key moments
    const keyMoments = await detectKeyMoments(transcription)

    progressCallback?.(90, 'Generating recommendations')

    // Generate recommendations
    const recommendations = await generateRecommendations({
      sentiment,
      emotions,
      csatScore,
      callQuality,
      redFlags,
    })

    const result: ComprehensiveSentimentResult = {
      recordingId,
      sentiment,
      emotions,
      keyPhrases,
      csatScore,
      toneShifts: [], // Will be populated by detectToneShift
      callQuality,
      intent,
      keyMoments,
      redFlags,
      recommendations,
      conversationFlow,
      cached: false,
      analyzedAt: new Date(),
    }

    progressCallback?.(95, 'Caching results')

    // Cache the result if recordingId provided
    if (recordingId) {
      await cacheSentiment(recordingId, result)
    }

    progressCallback?.(100, 'Analysis complete')

    return result
  } catch (error) {
    console.error('Sentiment analysis error:', error)
    progressCallback?.(100, 'Error - using mock data')
    return generateMockComprehensiveSentiment(transcription, recordingId)
  }
}

/**
 * Detailed sentiment analysis using GPT-4
 */
async function analyzeSentimentDetailed(
  transcription: string,
  progressCallback?: ProgressCallback
): Promise<SentimentAnalysis> {
  progressCallback?.(15, 'Analyzing sentiment')

  const response = await retryWithBackoff(() =>
    openai!.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a sentiment analysis expert. Analyze the conversation and provide detailed sentiment metrics.

Return JSON with this exact structure:
{
  "overall": "positive|negative|neutral|mixed",
  "confidence": 0.0-1.0,
  "scores": {
    "positive": 0.0-1.0,
    "negative": 0.0-1.0,
    "neutral": 0.0-1.0
  },
  "score": -1.0 to 1.0,
  "summary": "brief summary"
}`,
        },
        {
          role: 'user',
          content: transcription.substring(0, 10000),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
    })
  )

  const result = JSON.parse(response.choices[0].message.content || '{}')

  return {
    overall: result.overall || 'neutral',
    confidence: result.confidence || 0.5,
    scores: result.scores || { positive: 0.33, negative: 0.33, neutral: 0.34 },
    score: result.score || 0,
    summary: result.summary || 'Unable to determine sentiment',
  }
}

/**
 * Analyze emotions in the transcription
 * @param transcription - The text to analyze
 * @param progressCallback - Optional progress callback
 * @returns Emotion analysis with intensity scores
 */
export async function analyzeEmotions(
  transcription: string,
  progressCallback?: ProgressCallback
): Promise<EmotionAnalysis> {
  if (!openai) {
    return generateMockEmotions()
  }

  try {
    progressCallback?.(25, 'Analyzing emotions')

    const response = await retryWithBackoff(() =>
      openai!.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an emotion detection expert. Analyze the conversation and detect emotions with intensity scores.

Return JSON with this exact structure:
{
  "emotions": {
    "joy": 0.0-1.0,
    "anger": 0.0-1.0,
    "sadness": 0.0-1.0,
    "fear": 0.0-1.0,
    "surprise": 0.0-1.0,
    "disgust": 0.0-1.0
  },
  "dominant": "emotion name",
  "intensity": 0.0-1.0,
  "summary": "brief summary"
}`,
          },
          {
            role: 'user',
            content: transcription.substring(0, 10000),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
      })
    )

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return {
      emotions: result.emotions || {
        joy: 0,
        anger: 0,
        sadness: 0,
        fear: 0,
        surprise: 0,
        disgust: 0,
      },
      dominant: result.dominant || 'neutral',
      intensity: result.intensity || 0,
      summary: result.summary || 'No strong emotions detected',
    }
  } catch (error) {
    console.error('Emotion analysis error:', error)
    return generateMockEmotions()
  }
}

/**
 * Extract key phrases and keywords from transcription
 * @param transcription - The text to analyze
 * @param progressCallback - Optional progress callback
 * @returns Array of key phrases with sentiment tags
 */
export async function extractKeyPhrases(
  transcription: string,
  progressCallback?: ProgressCallback
): Promise<KeyPhrase[]> {
  if (!openai) {
    return generateMockKeyPhrases()
  }

  try {
    progressCallback?.(35, 'Extracting key phrases')

    const response = await retryWithBackoff(() =>
      openai!.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a key phrase extraction expert. Extract the most important phrases and keywords from the conversation.

Return JSON with this exact structure:
{
  "phrases": [
    {
      "phrase": "text",
      "sentiment": "positive|negative|neutral",
      "importance": 0.0-1.0,
      "context": "brief context"
    }
  ]
}

Extract 5-15 key phrases that best represent the conversation.`,
          },
          {
            role: 'user',
            content: transcription.substring(0, 10000),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
      })
    )

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result.phrases || []
  } catch (error) {
    console.error('Key phrase extraction error:', error)
    return generateMockKeyPhrases()
  }
}

/**
 * Calculate customer satisfaction score (CSAT)
 * @param transcription - The text to analyze
 * @param progressCallback - Optional progress callback
 * @returns CSAT score (0-100) with justification
 */
export async function calculateCustomerSatisfactionScore(
  transcription: string,
  progressCallback?: ProgressCallback
): Promise<CSATScore> {
  if (!openai) {
    return generateMockCSAT()
  }

  try {
    progressCallback?.(45, 'Calculating CSAT score')

    const response = await retryWithBackoff(() =>
      openai!.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a customer satisfaction expert. Analyze the conversation and provide a CSAT score.

Return JSON with this exact structure:
{
  "score": 0-100,
  "category": "poor|fair|good|excellent",
  "justification": "detailed explanation",
  "factors": [
    {
      "name": "factor name",
      "score": 0-100,
      "impact": "positive|negative|neutral"
    }
  ]
}

Categories:
- poor: 0-40
- fair: 41-60
- good: 61-80
- excellent: 81-100

Consider factors like: response quality, problem resolution, agent courtesy, wait time, clarity, professionalism.`,
          },
          {
            role: 'user',
            content: transcription.substring(0, 10000),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
      })
    )

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return {
      score: result.score || 50,
      category: result.category || 'fair',
      justification: result.justification || 'Unable to calculate CSAT score',
      factors: result.factors || [],
    }
  } catch (error) {
    console.error('CSAT calculation error:', error)
    return generateMockCSAT()
  }
}

/**
 * Detect tone shifts throughout the conversation
 * @param segments - Array of transcription segments with timestamps
 * @param progressCallback - Optional progress callback
 * @returns Array of detected tone shifts
 */
export async function detectToneShift(
  segments: TranscriptionSegment[],
  progressCallback?: ProgressCallback
): Promise<ToneShift[]> {
  if (!openai || segments.length === 0) {
    return []
  }

  try {
    progressCallback?.(60, 'Detecting tone shifts')

    // Analyze segments in batches
    const batchSize = 10
    const toneShifts: ToneShift[] = []

    for (let i = 0; i < segments.length; i += batchSize) {
      const batch = segments.slice(i, i + batchSize)
      const segmentText = batch
        .map(
          (s) =>
            `[${Math.floor(s.startTime)}s - ${s.speaker}] ${s.text}`
        )
        .join('\n')

      const response = await retryWithBackoff(() =>
        openai!.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: `You are a conversation tone analysis expert. Detect significant tone shifts in this conversation segment.

Return JSON with this exact structure:
{
  "shifts": [
    {
      "timestamp": seconds,
      "from": "previous tone",
      "to": "new tone",
      "intensity": 0.0-1.0,
      "trigger": "what caused it",
      "context": "brief context"
    }
  ]
}

Only report significant tone shifts (intensity > 0.5). Examples: positive to negative, calm to frustrated, professional to casual.`,
            },
            {
              role: 'user',
              content: segmentText,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: TEMPERATURE,
          max_tokens: 1000,
        })
      )

      const result = JSON.parse(response.choices[0].message.content || '{}')
      if (result.shifts && Array.isArray(result.shifts)) {
        toneShifts.push(...result.shifts)
      }
    }

    return toneShifts
  } catch (error) {
    console.error('Tone shift detection error:', error)
    return []
  }
}

/**
 * Analyze overall call quality
 * @param transcription - The text to analyze
 * @param duration - Call duration in seconds
 * @param progressCallback - Optional progress callback
 * @returns Call quality metrics
 */
export async function analyzeCallQuality(
  transcription: string,
  duration: number,
  progressCallback?: ProgressCallback
): Promise<CallQualityMetrics> {
  return analyzeCallQualityInternal(transcription, duration, progressCallback)
}

/**
 * Internal call quality analysis (used by comprehensive analysis)
 */
async function analyzeCallQualityInternal(
  transcription: string,
  duration: number,
  progressCallback?: ProgressCallback
): Promise<CallQualityMetrics> {
  if (!openai) {
    return generateMockCallQuality()
  }

  try {
    progressCallback?.(55, 'Analyzing call quality')

    const response = await retryWithBackoff(() =>
      openai!.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a call quality assessment expert. Analyze the conversation and provide comprehensive quality metrics.

Return JSON with this exact structure:
{
  "overallScore": 0-100,
  "engagement": 0-100,
  "clarity": 0-100,
  "professionalism": 0-100,
  "effectiveness": 0-100,
  "rapport": 0-100,
  "summary": "brief summary",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"]
}

Metrics:
- engagement: How engaged both parties are
- clarity: How clear the communication is
- professionalism: Professional conduct and language
- effectiveness: How well the call achieved its purpose
- rapport: Quality of relationship building`,
          },
          {
            role: 'user',
            content: `Duration: ${duration}s\n\nConversation:\n${transcription.substring(0, 10000)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
      })
    )

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return {
      overallScore: result.overallScore || 50,
      engagement: result.engagement || 50,
      clarity: result.clarity || 50,
      professionalism: result.professionalism || 50,
      effectiveness: result.effectiveness || 50,
      rapport: result.rapport || 50,
      summary: result.summary || 'Unable to assess call quality',
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
    }
  } catch (error) {
    console.error('Call quality analysis error:', error)
    return generateMockCallQuality()
  }
}

// ============================================================================
// Supporting Analysis Functions
// ============================================================================

/**
 * Analyze customer intent
 */
async function analyzeIntent(
  transcription: string,
  progressCallback?: ProgressCallback
): Promise<{
  primary: CustomerIntent
  secondary?: CustomerIntent
  confidence: number
}> {
  if (!openai) {
    return { primary: 'inquiry', confidence: 0.5 }
  }

  try {
    const response = await retryWithBackoff(() =>
      openai!.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a customer intent classification expert. Determine the primary and secondary intent of the customer.

Return JSON with this exact structure:
{
  "primary": "inquiry|complaint|purchase|support|feedback|cancellation|other",
  "secondary": "optional secondary intent",
  "confidence": 0.0-1.0
}`,
          },
          {
            role: 'user',
            content: transcription.substring(0, 5000),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: TEMPERATURE,
        max_tokens: 500,
      })
    )

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return {
      primary: result.primary || 'inquiry',
      secondary: result.secondary,
      confidence: result.confidence || 0.5,
    }
  } catch (error) {
    console.error('Intent analysis error:', error)
    return { primary: 'inquiry', confidence: 0.5 }
  }
}

/**
 * Detect red flags in the conversation
 */
async function detectRedFlags(
  transcription: string,
  progressCallback?: ProgressCallback
): Promise<RedFlag[]> {
  if (!openai) {
    return []
  }

  try {
    const response = await retryWithBackoff(() =>
      openai!.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a customer risk detection expert. Identify red flags that indicate problems.

Return JSON with this exact structure:
{
  "flags": [
    {
      "type": "frustration|confusion|anger|dissatisfaction|churn_risk",
      "severity": "low|medium|high|critical",
      "description": "what's wrong",
      "quote": "relevant quote from conversation",
      "recommendation": "what to do about it"
    }
  ]
}`,
          },
          {
            role: 'user',
            content: transcription.substring(0, 10000),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
      })
    )

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result.flags || []
  } catch (error) {
    console.error('Red flag detection error:', error)
    return []
  }
}

/**
 * Detect key moments in the conversation
 */
async function detectKeyMoments(transcription: string): Promise<KeyMoment[]> {
  if (!openai) {
    return []
  }

  try {
    const response = await retryWithBackoff(() =>
      openai!.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a conversation analysis expert. Identify key moments in the conversation.

Return JSON with this exact structure:
{
  "moments": [
    {
      "timestamp": 0,
      "type": "positive|negative|turning_point|critical",
      "description": "what happened",
      "impact": 0.0-1.0,
      "context": "brief context"
    }
  ]
}`,
          },
          {
            role: 'user',
            content: transcription.substring(0, 10000),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
      })
    )

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result.moments || []
  } catch (error) {
    console.error('Key moment detection error:', error)
    return []
  }
}

/**
 * Analyze conversation flow (beginning, middle, end)
 */
async function analyzeConversationFlow(transcription: string): Promise<{
  beginning: SentimentAnalysis
  middle: SentimentAnalysis
  end: SentimentAnalysis
}> {
  const length = transcription.length
  const third = Math.floor(length / 3)

  const beginning = transcription.substring(0, third)
  const middle = transcription.substring(third, third * 2)
  const end = transcription.substring(third * 2)

  if (!openai) {
    return {
      beginning: generateMockSentimentAnalysis('neutral'),
      middle: generateMockSentimentAnalysis('neutral'),
      end: generateMockSentimentAnalysis('neutral'),
    }
  }

  try {
    const [beginningResult, middleResult, endResult] = await Promise.all([
      analyzeSentimentDetailed(beginning),
      analyzeSentimentDetailed(middle),
      analyzeSentimentDetailed(end),
    ])

    return {
      beginning: beginningResult,
      middle: middleResult,
      end: endResult,
    }
  } catch (error) {
    console.error('Conversation flow analysis error:', error)
    return {
      beginning: generateMockSentimentAnalysis('neutral'),
      middle: generateMockSentimentAnalysis('neutral'),
      end: generateMockSentimentAnalysis('neutral'),
    }
  }
}

/**
 * Generate recommendations based on analysis
 */
async function generateRecommendations(context: {
  sentiment: SentimentAnalysis
  emotions: EmotionAnalysis
  csatScore: CSATScore
  callQuality: CallQualityMetrics
  redFlags: RedFlag[]
}): Promise<string[]> {
  if (!openai) {
    return [
      'Review the conversation for improvement opportunities',
      'Follow up with the customer to ensure satisfaction',
    ]
  }

  try {
    const response = await retryWithBackoff(() =>
      openai!.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a customer service improvement expert. Based on the analysis, provide 3-7 specific, actionable recommendations.

Return JSON with this exact structure:
{
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`,
          },
          {
            role: 'user',
            content: JSON.stringify(context, null, 2),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: TEMPERATURE,
        max_tokens: 1000,
      })
    )

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result.recommendations || []
  } catch (error) {
    console.error('Recommendation generation error:', error)
    return [
      'Review the conversation for improvement opportunities',
      'Follow up with the customer to ensure satisfaction',
    ]
  }
}

// ============================================================================
// Batch Processing
// ============================================================================

/**
 * Batch process multiple transcription segments
 * @param segments - Array of segments to process
 * @param batchSize - Number of segments to process at once
 * @param progressCallback - Optional progress callback
 * @returns Array of sentiment results for each segment
 */
export async function batchAnalyzeSentiment(
  segments: TranscriptionSegment[],
  batchSize: number = 5,
  progressCallback?: ProgressCallback
): Promise<SentimentAnalysis[]> {
  const results: SentimentAnalysis[] = []

  for (let i = 0; i < segments.length; i += batchSize) {
    const batch = segments.slice(i, i + batchSize)
    const progress = Math.floor((i / segments.length) * 100)
    progressCallback?.(progress, `Processing batch ${Math.floor(i / batchSize) + 1}`)

    const batchResults = await Promise.all(
      batch.map((segment) => analyzeSentimentDetailed(segment.text))
    )

    results.push(...batchResults)
  }

  progressCallback?.(100, 'Batch processing complete')
  return results
}

// ============================================================================
// Mock Data Generators (for when OpenAI is not available)
// ============================================================================

function generateMockComprehensiveSentiment(
  transcription: string,
  recordingId?: string
): ComprehensiveSentimentResult {
  const text = transcription.toLowerCase()
  const hasPositive = text.includes('great') || text.includes('excellent') || text.includes('happy')
  const hasNegative = text.includes('problem') || text.includes('issue') || text.includes('bad')

  return {
    recordingId,
    sentiment: generateMockSentimentAnalysis(
      hasPositive ? 'positive' : hasNegative ? 'negative' : 'neutral'
    ),
    emotions: generateMockEmotions(),
    keyPhrases: generateMockKeyPhrases(),
    csatScore: generateMockCSAT(),
    toneShifts: [],
    callQuality: generateMockCallQuality(),
    intent: { primary: 'inquiry', confidence: 0.5 },
    keyMoments: [],
    redFlags: [],
    recommendations: [
      'OpenAI API not configured - using mock data',
      'Configure OPENAI_API_KEY for real analysis',
    ],
    conversationFlow: {
      beginning: generateMockSentimentAnalysis('neutral'),
      middle: generateMockSentimentAnalysis('neutral'),
      end: generateMockSentimentAnalysis('neutral'),
    },
    cached: false,
    analyzedAt: new Date(),
  }
}

function generateMockSentimentAnalysis(
  overall: 'positive' | 'negative' | 'neutral' | 'mixed'
): SentimentAnalysis {
  const scoreMap = { positive: 0.7, negative: -0.6, neutral: 0, mixed: 0.2 }

  return {
    overall,
    confidence: 0.5,
    scores: {
      positive: overall === 'positive' ? 0.7 : 0.2,
      negative: overall === 'negative' ? 0.7 : 0.1,
      neutral: overall === 'neutral' ? 0.7 : 0.2,
    },
    score: scoreMap[overall],
    summary: 'Mock sentiment analysis - OpenAI not configured',
  }
}

function generateMockEmotions(): EmotionAnalysis {
  return {
    emotions: {
      joy: 0.3,
      anger: 0.1,
      sadness: 0.1,
      fear: 0.05,
      surprise: 0.15,
      disgust: 0.05,
    },
    dominant: 'neutral',
    intensity: 0.3,
    summary: 'Mock emotion analysis - OpenAI not configured',
  }
}

function generateMockKeyPhrases(): KeyPhrase[] {
  return [
    {
      phrase: 'Mock analysis',
      sentiment: 'neutral',
      importance: 0.5,
      context: 'OpenAI not configured',
    },
  ]
}

function generateMockCSAT(): CSATScore {
  return {
    score: 50,
    category: 'fair',
    justification: 'Mock CSAT score - OpenAI not configured',
    factors: [
      {
        name: 'Overall experience',
        score: 50,
        impact: 'neutral',
      },
    ],
  }
}

function generateMockCallQuality(): CallQualityMetrics {
  return {
    overallScore: 50,
    engagement: 50,
    clarity: 50,
    professionalism: 50,
    effectiveness: 50,
    rapport: 50,
    summary: 'Mock call quality metrics - OpenAI not configured',
    strengths: ['Mock data'],
    weaknesses: ['OpenAI not configured'],
  }
}

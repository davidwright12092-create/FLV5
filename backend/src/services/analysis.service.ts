import OpenAI from 'openai'
import prisma from '../config/database.js'
import { NotFoundError } from '../utils/errors.js'

// Initialize OpenAI client with graceful handling if key is missing
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

interface SentimentResult {
  overall: 'positive' | 'negative' | 'neutral' | 'mixed'
  score: number // -1 to 1
  emotions: {
    joy: number
    anger: number
    surprise: number
    sadness: number
  }
  keyPhrases: string[]
}

interface Opportunity {
  type: 'upsell' | 'cross-sell' | 'renewal' | 'expansion' | 'follow-up'
  description: string
  confidence: number
  context: string
  priority: 'low' | 'medium' | 'high'
}

interface ProcessScore {
  overallScore: number // 0-100
  completedSteps: number
  totalSteps: number
  stepScores: {
    name: string
    score: number
    detected: boolean
    keywords: string[]
    matchedKeywords: string[]
  }[]
  missedSteps: string[]
  recommendations: string[]
}

interface ActionItem {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  assignee?: string
  category: 'follow-up' | 'task' | 'reminder' | 'decision'
}

/**
 * Orchestrates full analysis of a recording
 * @param recordingId - The recording ID to analyze
 * @returns Analysis result with all components
 */
export async function analyzeRecording(recordingId: string) {
  // Fetch recording with transcription
  const recording = await prisma.recording.findUnique({
    where: { id: recordingId },
    include: {
      transcription: true,
      user: {
        include: {
          organization: {
            include: {
              processTemplates: {
                where: { isActive: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  })

  if (!recording) {
    throw new NotFoundError('Recording not found')
  }

  if (!recording.transcription) {
    throw new NotFoundError('Transcription not found for this recording')
  }

  const transcriptionText = recording.transcription.text
  const processTemplate = recording.user.organization.processTemplates[0]

  // Run all analyses in parallel
  const [sentiment, opportunities, processScore, actionItems] = await Promise.all([
    analyzeSentiment(transcriptionText),
    detectOpportunities(transcriptionText),
    processTemplate
      ? scoreProcessAdherence(transcriptionText, processTemplate)
      : Promise.resolve(null),
    extractActionItems(transcriptionText),
  ])

  // Calculate overall confidence
  const confidence =
    (sentiment.score + opportunities.reduce((sum, o) => sum + o.confidence, 0) /
    Math.max(opportunities.length, 1) +
    (processScore?.overallScore || 50) / 100) / 3

  // Store or update analysis result
  const analysisResult = await prisma.analysisResult.upsert({
    where: { recordingId },
    create: {
      recordingId,
      processScore: processScore || {},
      salesOpportunities: opportunities,
      sentiment,
      actionItems,
      confidence,
    },
    update: {
      processScore: processScore || {},
      salesOpportunities: opportunities,
      sentiment,
      actionItems,
      confidence,
    },
  })

  // Update recording status to COMPLETED
  await prisma.recording.update({
    where: { id: recordingId },
    data: { status: 'COMPLETED' },
  })

  return analysisResult
}

/**
 * Analyzes sentiment of a transcription using OpenAI or mock data
 * @param transcription - The text to analyze
 * @returns Sentiment analysis result
 */
export async function analyzeSentiment(transcription: string): Promise<SentimentResult> {
  if (!openai) {
    // Return mock data when OpenAI is not configured
    return generateMockSentiment(transcription)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a sentiment analysis expert. Analyze the following conversation and provide:
1. Overall sentiment (positive, negative, neutral, or mixed)
2. A sentiment score from -1 (very negative) to 1 (very positive)
3. Emotion scores for joy, anger, surprise, and sadness (0-1 scale)
4. Key phrases that indicate sentiment

Respond in JSON format only.`,
        },
        {
          role: 'user',
          content: transcription.substring(0, 10000), // Limit to avoid token limits
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return {
      overall: result.overall || 'neutral',
      score: result.score || 0,
      emotions: {
        joy: result.emotions?.joy || 0,
        anger: result.emotions?.anger || 0,
        surprise: result.emotions?.surprise || 0,
        sadness: result.emotions?.sadness || 0,
      },
      keyPhrases: result.keyPhrases || [],
    }
  } catch (error) {
    console.error('OpenAI sentiment analysis error:', error)
    // Fallback to mock data on error
    return generateMockSentiment(transcription)
  }
}

/**
 * Detects sales opportunities in the transcription using OpenAI or mock data
 * @param transcription - The text to analyze
 * @returns Array of detected opportunities
 */
export async function detectOpportunities(transcription: string): Promise<Opportunity[]> {
  if (!openai) {
    // Return mock data when OpenAI is not configured
    return generateMockOpportunities(transcription)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a sales opportunity detection expert. Analyze the conversation and identify:
- Upsell opportunities (customer needs more/better features)
- Cross-sell opportunities (complementary products/services)
- Renewal opportunities (contract/subscription mentions)
- Expansion opportunities (growth, scaling needs)
- Follow-up opportunities (open questions, unresolved issues)

For each opportunity provide:
- type: one of (upsell, cross-sell, renewal, expansion, follow-up)
- description: brief description
- confidence: 0-1 score
- context: relevant quote from conversation
- priority: low, medium, or high

Respond in JSON format with an array of opportunities.`,
        },
        {
          role: 'user',
          content: transcription.substring(0, 10000),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result.opportunities || []
  } catch (error) {
    console.error('OpenAI opportunity detection error:', error)
    return generateMockOpportunities(transcription)
  }
}

/**
 * Scores process adherence against a template
 * @param transcription - The text to analyze
 * @param template - The process template to score against
 * @returns Process adherence score
 */
export async function scoreProcessAdherence(
  transcription: string,
  template: any
): Promise<ProcessScore> {
  const steps = template.steps as any[]
  const transcriptionLower = transcription.toLowerCase()

  const stepScores = steps.map((step) => {
    const keywords = step.keywords || []
    const matchedKeywords = keywords.filter((keyword: string) =>
      transcriptionLower.includes(keyword.toLowerCase())
    )

    const score = matchedKeywords.length / Math.max(keywords.length, 1) * 100
    const detected = score > 30 // Consider detected if 30% keywords found

    return {
      name: step.name,
      score: Math.round(score),
      detected,
      keywords,
      matchedKeywords,
    }
  })

  const completedSteps = stepScores.filter((s) => s.detected).length
  const overallScore = Math.round(
    stepScores.reduce((sum, s) => sum + s.score, 0) / stepScores.length
  )

  const missedSteps = stepScores
    .filter((s) => !s.detected)
    .map((s) => s.name)

  // Generate recommendations using OpenAI if available
  let recommendations: string[] = []
  if (openai && missedSteps.length > 0) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a sales process expert. The following process steps were missed in a conversation: ${missedSteps.join(', ')}. Provide 3-5 specific, actionable recommendations to improve process adherence. Return as a JSON array of strings.`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      recommendations = result.recommendations || []
    } catch (error) {
      console.error('OpenAI recommendations error:', error)
    }
  }

  if (recommendations.length === 0) {
    // Fallback recommendations
    recommendations = missedSteps.map(
      (step) => `Ensure to cover the "${step}" step in future conversations`
    )
  }

  return {
    overallScore,
    completedSteps,
    totalSteps: steps.length,
    stepScores,
    missedSteps,
    recommendations,
  }
}

/**
 * Extracts action items from the transcription using OpenAI or mock data
 * @param transcription - The text to analyze
 * @returns Array of action items
 */
export async function extractActionItems(transcription: string): Promise<ActionItem[]> {
  if (!openai) {
    // Return mock data when OpenAI is not configured
    return generateMockActionItems(transcription)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an action item extraction expert. Analyze the conversation and extract all action items, tasks, follow-ups, and decisions that need to be made.

For each action item provide:
- title: brief title
- description: detailed description
- priority: low, medium, or high
- category: follow-up, task, reminder, or decision
- assignee: if mentioned in conversation (optional)
- dueDate: if mentioned (ISO format, optional)

Respond in JSON format with an array of action items.`,
        },
        {
          role: 'user',
          content: transcription.substring(0, 10000),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result.actionItems || []
  } catch (error) {
    console.error('OpenAI action items extraction error:', error)
    return generateMockActionItems(transcription)
  }
}

// Mock data generators for when OpenAI is not available

function generateMockSentiment(transcription: string): SentimentResult {
  const positiveWords = ['great', 'excellent', 'happy', 'pleased', 'love', 'perfect']
  const negativeWords = ['bad', 'issue', 'problem', 'concern', 'unhappy', 'disappointed']

  const text = transcription.toLowerCase()
  const positiveCount = positiveWords.filter(w => text.includes(w)).length
  const negativeCount = negativeWords.filter(w => text.includes(w)).length

  let overall: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral'
  let score = 0

  if (positiveCount > negativeCount + 1) {
    overall = 'positive'
    score = 0.6
  } else if (negativeCount > positiveCount + 1) {
    overall = 'negative'
    score = -0.6
  } else if (positiveCount > 0 && negativeCount > 0) {
    overall = 'mixed'
    score = 0.1
  }

  return {
    overall,
    score,
    emotions: {
      joy: overall === 'positive' ? 0.7 : 0.3,
      anger: overall === 'negative' ? 0.6 : 0.1,
      surprise: 0.2,
      sadness: overall === 'negative' ? 0.4 : 0.1,
    },
    keyPhrases: ['Mock analysis - OpenAI not configured'],
  }
}

function generateMockOpportunities(transcription: string): Opportunity[] {
  const opportunities: Opportunity[] = []

  if (transcription.toLowerCase().includes('price') || transcription.toLowerCase().includes('cost')) {
    opportunities.push({
      type: 'upsell',
      description: 'Customer discussing pricing - potential upsell opportunity',
      confidence: 0.6,
      context: 'Mock detection - OpenAI not configured',
      priority: 'medium',
    })
  }

  if (transcription.toLowerCase().includes('follow') || transcription.toLowerCase().includes('next')) {
    opportunities.push({
      type: 'follow-up',
      description: 'Follow-up required',
      confidence: 0.7,
      context: 'Mock detection - OpenAI not configured',
      priority: 'high',
    })
  }

  return opportunities
}

function generateMockActionItems(transcription: string): ActionItem[] {
  return [
    {
      title: 'Review conversation',
      description: 'Mock action item - OpenAI not configured',
      priority: 'medium',
      category: 'task',
    },
  ]
}

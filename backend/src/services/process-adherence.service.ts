import OpenAI from 'openai'
import prisma from '../config/database.js'
import { NotFoundError } from '../utils/errors.js'

// Initialize OpenAI client with graceful handling if key is missing
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Represents a step in a process template
 */
export interface ProcessStep {
  name: string
  description?: string
  keywords: string[]
  required: boolean
  order: number
  weight?: number // Importance weight (1-10), default 5
  expectedTiming?: 'early' | 'middle' | 'late' // When in conversation
  synonyms?: string[] // Alternative phrases/keywords
  context?: string[] // Context phrases that indicate this step
}

/**
 * Process template structure
 */
export interface ProcessTemplate {
  id: string
  name: string
  description?: string
  steps: ProcessStep[]
  organizationId: string
}

/**
 * Detailed analysis of a single step
 */
export interface StepAnalysis {
  stepName: string
  completed: boolean
  quality: number // 0-100
  confidence: number // 0-100
  timestamp?: number // Position in conversation (0-1)
  keywords: string[]
  matchedKeywords: string[]
  matchedSynonyms: string[]
  contextMatches: string[]
  timingScore: number // How well-timed was this step (0-100)
  recommendations: string[]
  excerpts: string[] // Relevant quotes from transcription
}

/**
 * Complete process adherence analysis result
 */
export interface ProcessAnalysis {
  overallScore: number // 0-100
  qualityScore: number // 0-100 - average quality of completed steps
  sequenceScore: number // 0-100 - how well the sequence was followed
  timingScore: number // 0-100 - how well-timed the steps were
  stepBreakdown: StepAnalysis[]
  missedSteps: string[]
  completedSteps: string[]
  stepSequence: string[] // Order in which steps were detected
  strengths: string[]
  improvements: string[]
  complianceLevel: 'excellent' | 'good' | 'needs_improvement' | 'critical'
  certificationReady: boolean
  coachingPoints: string[]
  bestPracticeComparison?: BestPracticeComparison
  metadata: {
    templateId: string
    templateName: string
    recordingId?: string
    analyzedAt: Date
    analysisVersion: string
  }
}

/**
 * Best practice comparison data
 */
export interface BestPracticeComparison {
  topPerformerAverage: number
  gap: number // Difference from top performers
  improvementAreas: string[]
  strengths: string[]
  percentile: number // Where this performance ranks (0-100)
}

/**
 * Step sequence information
 */
export interface StepSequenceInfo {
  stepName: string
  detectedPosition: number // 0-1, position in conversation
  expectedPosition?: number // 0-1, where it should ideally be
  order: number // Expected order
}

/**
 * Compliance report structure
 */
export interface ComplianceReport {
  summary: {
    overallCompliance: number
    criticalStepsMissed: number
    totalSteps: number
    completedSteps: number
  }
  details: {
    step: string
    status: 'completed' | 'missed' | 'partial'
    qualityRating: string // e.g., "Excellent", "Good", "Needs Improvement"
    evidence: string[]
  }[]
  recommendations: string[]
  certificationStatus: {
    ready: boolean
    blockers: string[]
    nextSteps: string[]
  }
  generatedAt: Date
}

/**
 * Template cache for performance optimization
 */
interface TemplateCache {
  template: ProcessTemplate
  cachedAt: Date
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

const templateCache = new Map<string, TemplateCache>()
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Get template from cache or database
 * @param templateId - Template ID to fetch
 * @returns Process template
 */
async function getCachedTemplate(templateId: string): Promise<ProcessTemplate> {
  // Check cache
  const cached = templateCache.get(templateId)
  if (cached && Date.now() - cached.cachedAt.getTime() < CACHE_DURATION_MS) {
    return cached.template
  }

  // Fetch from database
  const template = await prisma.processTemplate.findUnique({
    where: { id: templateId },
  })

  if (!template) {
    throw new NotFoundError(`Process template ${templateId} not found`)
  }

  const processTemplate: ProcessTemplate = {
    id: template.id,
    name: template.name,
    description: template.description || undefined,
    steps: template.steps as ProcessStep[],
    organizationId: template.organizationId,
  }

  // Cache it
  templateCache.set(templateId, {
    template: processTemplate,
    cachedAt: new Date(),
  })

  return processTemplate
}

/**
 * Clear cache for a specific template or all templates
 * @param templateId - Optional template ID to clear
 */
export function clearTemplateCache(templateId?: string): void {
  if (templateId) {
    templateCache.delete(templateId)
  } else {
    templateCache.clear()
  }
}

// ============================================================================
// FUZZY MATCHING & NLP UTILITIES
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Distance score
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Calculate similarity score between two strings (0-1)
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score
 */
function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) {
    return 1.0
  }

  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Find fuzzy matches for a keyword in text
 * @param keyword - Keyword to search for
 * @param text - Text to search in
 * @param threshold - Minimum similarity threshold (0-1)
 * @returns Array of matched phrases
 */
function findFuzzyMatches(
  keyword: string,
  text: string,
  threshold: number = 0.8
): string[] {
  const keywordLower = keyword.toLowerCase()
  const words = text.toLowerCase().split(/\s+/)
  const matches: string[] = []

  // Check single words
  for (const word of words) {
    const similarity = stringSimilarity(keywordLower, word)
    if (similarity >= threshold) {
      matches.push(word)
    }
  }

  // Check phrases (2-5 words)
  const keywordWordCount = keywordLower.split(/\s+/).length
  if (keywordWordCount > 1) {
    for (let i = 0; i <= words.length - keywordWordCount; i++) {
      const phrase = words.slice(i, i + keywordWordCount).join(' ')
      const similarity = stringSimilarity(keywordLower, phrase)
      if (similarity >= threshold) {
        matches.push(phrase)
      }
    }
  }

  return [...new Set(matches)] // Remove duplicates
}

/**
 * Extract sentences containing specific keywords
 * @param text - Text to extract from
 * @param keywords - Keywords to look for
 * @returns Array of relevant sentences
 */
function extractRelevantSentences(text: string, keywords: string[]): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const relevant: string[] = []

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()
    for (const keyword of keywords) {
      if (lowerSentence.includes(keyword.toLowerCase())) {
        relevant.push(sentence.trim())
        break
      }
    }
  }

  return relevant.slice(0, 3) // Return top 3 most relevant
}

/**
 * Find the position of text in the overall transcription (0-1)
 * @param transcription - Full transcription
 * @param searchText - Text to find position of
 * @returns Position as decimal (0 = start, 1 = end)
 */
function findTextPosition(transcription: string, searchText: string): number {
  const index = transcription.toLowerCase().indexOf(searchText.toLowerCase())
  if (index === -1) return 0.5 // Default to middle if not found

  return index / transcription.length
}

/**
 * Calculate timing score based on when step should occur
 * @param actualPosition - When step was detected (0-1)
 * @param expectedTiming - When step should occur
 * @returns Score from 0-100
 */
function calculateTimingScore(
  actualPosition: number,
  expectedTiming?: 'early' | 'middle' | 'late'
): number {
  if (!expectedTiming) return 100 // No expectation = perfect score

  let idealPosition: number
  let tolerance: number

  switch (expectedTiming) {
    case 'early':
      idealPosition = 0.2
      tolerance = 0.25
      break
    case 'middle':
      idealPosition = 0.5
      tolerance = 0.3
      break
    case 'late':
      idealPosition = 0.8
      tolerance = 0.25
      break
  }

  const deviation = Math.abs(actualPosition - idealPosition)
  if (deviation <= tolerance) {
    return 100
  }

  // Decrease score as deviation increases
  const maxDeviation = 1 - tolerance
  const score = Math.max(0, 100 - (deviation - tolerance) / maxDeviation * 100)
  return Math.round(score)
}

// ============================================================================
// STEP DETECTION & ANALYSIS
// ============================================================================

/**
 * Detect if a specific step was completed in the transcription
 * @param transcription - Transcription text
 * @param step - Process step to check
 * @returns Step analysis result
 */
export async function detectStepCompletion(
  transcription: string,
  step: ProcessStep
): Promise<StepAnalysis> {
  const transcriptionLower = transcription.toLowerCase()
  const matchedKeywords: string[] = []
  const matchedSynonyms: string[] = []
  const contextMatches: string[] = []

  // Check exact keyword matches
  for (const keyword of step.keywords) {
    if (transcriptionLower.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword)
    }
  }

  // Check fuzzy matches for keywords
  for (const keyword of step.keywords) {
    const fuzzyMatches = findFuzzyMatches(keyword, transcriptionLower, 0.85)
    matchedKeywords.push(...fuzzyMatches)
  }

  // Check synonyms if provided
  if (step.synonyms) {
    for (const synonym of step.synonyms) {
      if (transcriptionLower.includes(synonym.toLowerCase())) {
        matchedSynonyms.push(synonym)
      }
    }
  }

  // Check context phrases
  if (step.context) {
    for (const contextPhrase of step.context) {
      if (transcriptionLower.includes(contextPhrase.toLowerCase())) {
        contextMatches.push(contextPhrase)
      }
    }
  }

  // Calculate base detection score
  const totalKeywords = step.keywords.length
  const keywordScore = matchedKeywords.length / totalKeywords
  const synonymScore = step.synonyms
    ? matchedSynonyms.length / step.synonyms.length * 0.5
    : 0
  const contextScore = step.context
    ? contextMatches.length / step.context.length * 0.3
    : 0

  const detectionScore = Math.min(1, keywordScore + synonymScore + contextScore)
  const completed = detectionScore > 0.3 // 30% threshold for detection

  // Calculate quality score
  let quality = Math.round(detectionScore * 100)

  // Use OpenAI for enhanced quality scoring if available
  if (openai && completed) {
    try {
      const excerpts = extractRelevantSentences(
        transcription,
        [...matchedKeywords, ...matchedSynonyms]
      )

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a sales process quality analyst. Evaluate how well the following step was executed: "${step.name}".
Description: ${step.description || 'No description provided'}
Expected keywords: ${step.keywords.join(', ')}

Rate the quality from 0-100 based on:
- Completeness (was the step thoroughly executed?)
- Professionalism (was it done well?)
- Customer engagement (did it resonate with customer?)
- Timing and flow (was it well-integrated?)

Respond with JSON: { "quality": number, "reasoning": string }`,
          },
          {
            role: 'user',
            content: `Relevant excerpts from conversation:\n${excerpts.join('\n')}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      if (result.quality && typeof result.quality === 'number') {
        quality = Math.round(result.quality)
      }
    } catch (error) {
      console.error('OpenAI quality scoring error:', error)
      // Keep the basic quality score
    }
  }

  // Calculate timing score
  const firstMatchPosition = matchedKeywords.length > 0
    ? findTextPosition(transcription, matchedKeywords[0])
    : 0.5
  const timingScore = calculateTimingScore(firstMatchPosition, step.expectedTiming)

  // Generate recommendations
  const recommendations: string[] = []
  if (!completed) {
    recommendations.push(`Ensure to explicitly cover "${step.name}" in the conversation`)
    if (step.description) {
      recommendations.push(step.description)
    }
  } else if (quality < 70) {
    recommendations.push(`Improve the quality of "${step.name}" step execution`)
    recommendations.push(`Focus on: ${step.keywords.slice(0, 3).join(', ')}`)
  }

  if (timingScore < 70 && step.expectedTiming) {
    recommendations.push(
      `Consider introducing "${step.name}" ${step.expectedTiming} in the conversation`
    )
  }

  const excerpts = extractRelevantSentences(
    transcription,
    [...matchedKeywords, ...matchedSynonyms]
  )

  return {
    stepName: step.name,
    completed,
    quality,
    confidence: Math.round(detectionScore * 100),
    timestamp: completed ? firstMatchPosition : undefined,
    keywords: step.keywords,
    matchedKeywords: [...new Set(matchedKeywords)],
    matchedSynonyms: [...new Set(matchedSynonyms)],
    contextMatches,
    timingScore,
    recommendations,
    excerpts,
  }
}

/**
 * Extract the sequence in which steps were followed
 * @param transcription - Transcription text
 * @param steps - Process steps to track
 * @returns Array of steps in the order they were detected
 */
export async function extractStepSequence(
  transcription: string,
  steps: ProcessStep[]
): Promise<StepSequenceInfo[]> {
  const sequence: StepSequenceInfo[] = []

  for (const step of steps) {
    const transcriptionLower = transcription.toLowerCase()
    let earliestPosition = 1 // Start at end

    // Find earliest occurrence of any keyword
    for (const keyword of step.keywords) {
      const index = transcriptionLower.indexOf(keyword.toLowerCase())
      if (index !== -1) {
        const position = index / transcription.length
        if (position < earliestPosition) {
          earliestPosition = position
        }
      }
    }

    // Check synonyms too
    if (step.synonyms) {
      for (const synonym of step.synonyms) {
        const index = transcriptionLower.indexOf(synonym.toLowerCase())
        if (index !== -1) {
          const position = index / transcription.length
          if (position < earliestPosition) {
            earliestPosition = position
          }
        }
      }
    }

    // Only add if found (position < 1)
    if (earliestPosition < 1) {
      let expectedPosition: number | undefined
      if (step.expectedTiming === 'early') expectedPosition = 0.2
      if (step.expectedTiming === 'middle') expectedPosition = 0.5
      if (step.expectedTiming === 'late') expectedPosition = 0.8

      sequence.push({
        stepName: step.name,
        detectedPosition: earliestPosition,
        expectedPosition,
        order: step.order,
      })
    }
  }

  // Sort by detected position
  return sequence.sort((a, b) => a.detectedPosition - b.detectedPosition)
}

/**
 * Identify steps that were missed
 * @param completedSteps - Names of completed steps
 * @param requiredSteps - All required process steps
 * @returns Array of missed step names
 */
export function identifyMissedSteps(
  completedSteps: string[],
  requiredSteps: ProcessStep[]
): string[] {
  const missedSteps: string[] = []
  const completedSet = new Set(completedSteps)

  for (const step of requiredSteps) {
    if (step.required && !completedSet.has(step.name)) {
      missedSteps.push(step.name)
    }
  }

  return missedSteps
}

/**
 * Score the quality of a specific step execution
 * @param transcription - Transcription text
 * @param step - Process step to score
 * @returns Quality score from 0-100
 */
export async function scoreStepQuality(
  transcription: string,
  step: ProcessStep
): Promise<number> {
  const analysis = await detectStepCompletion(transcription, step)
  return analysis.quality
}

// ============================================================================
// COMPREHENSIVE ANALYSIS
// ============================================================================

/**
 * Perform complete process adherence analysis
 * @param transcription - Transcription text to analyze
 * @param template - Process template to analyze against
 * @param recordingId - Optional recording ID for reference
 * @returns Complete process analysis
 */
export async function analyzeProcessAdherence(
  transcription: string,
  template: ProcessTemplate,
  recordingId?: string
): Promise<ProcessAnalysis> {
  // Analyze each step
  const stepAnalyses = await Promise.all(
    template.steps.map(step => detectStepCompletion(transcription, step))
  )

  // Extract completed and missed steps
  const completedSteps = stepAnalyses
    .filter(a => a.completed)
    .map(a => a.stepName)

  const missedSteps = identifyMissedSteps(
    completedSteps,
    template.steps
  )

  // Calculate sequence score
  const sequence = await extractStepSequence(transcription, template.steps)
  const sequenceScore = calculateSequenceScore(sequence, template.steps)

  // Calculate various scores
  const completedCount = completedSteps.length
  const totalSteps = template.steps.length
  const requiredSteps = template.steps.filter(s => s.required).length
  const completedRequiredSteps = template.steps.filter(
    s => s.required && completedSteps.includes(s.name)
  ).length

  // Base score: percentage of completed steps (weighted by importance)
  const totalWeight = template.steps.reduce((sum, s) => sum + (s.weight || 5), 0)
  const completedWeight = stepAnalyses
    .filter(a => a.completed)
    .reduce((sum, a) => {
      const step = template.steps.find(s => s.name === a.stepName)
      return sum + (step?.weight || 5)
    }, 0)
  const baseScore = (completedWeight / totalWeight) * 100

  // Quality multiplier: average quality of completed steps
  const qualityScores = stepAnalyses.filter(a => a.completed).map(a => a.quality)
  const qualityScore = qualityScores.length > 0
    ? qualityScores.reduce((sum, q) => sum + q, 0) / qualityScores.length
    : 0

  // Timing score: average timing score
  const timingScores = stepAnalyses.filter(a => a.completed).map(a => a.timingScore)
  const timingScore = timingScores.length > 0
    ? timingScores.reduce((sum, t) => sum + t, 0) / timingScores.length
    : 0

  // Calculate overall score with bonuses and penalties
  let overallScore = baseScore

  // Quality multiplier (0.7-1.3)
  const qualityMultiplier = 0.7 + (qualityScore / 100) * 0.6
  overallScore *= qualityMultiplier

  // Sequence bonus: +10% if steps followed in correct order
  if (sequenceScore >= 80) {
    overallScore *= 1.1
  }

  // Timing bonus: +5% if steps well-timed
  if (timingScore >= 80) {
    overallScore *= 1.05
  }

  // Penalty for missed critical steps: -15% per critical step
  const missedCriticalSteps = template.steps.filter(
    s => s.required && missedSteps.includes(s.name) && (s.weight || 5) >= 8
  )
  overallScore -= missedCriticalSteps.length * 15

  // Ensure score stays within 0-100
  overallScore = Math.max(0, Math.min(100, Math.round(overallScore)))

  // Determine compliance level
  let complianceLevel: 'excellent' | 'good' | 'needs_improvement' | 'critical'
  if (overallScore >= 90 && completedRequiredSteps === requiredSteps) {
    complianceLevel = 'excellent'
  } else if (overallScore >= 75 && completedRequiredSteps >= requiredSteps * 0.8) {
    complianceLevel = 'good'
  } else if (overallScore >= 60) {
    complianceLevel = 'needs_improvement'
  } else {
    complianceLevel = 'critical'
  }

  // Certification readiness
  const certificationReady =
    overallScore >= 85 &&
    completedRequiredSteps === requiredSteps &&
    qualityScore >= 75

  // Identify strengths
  const strengths: string[] = []
  const highQualitySteps = stepAnalyses
    .filter(a => a.completed && a.quality >= 85)
    .map(a => a.stepName)

  if (highQualitySteps.length > 0) {
    strengths.push(`Excellent execution of: ${highQualitySteps.join(', ')}`)
  }

  if (sequenceScore >= 85) {
    strengths.push('Strong adherence to recommended step sequence')
  }

  if (timingScore >= 85) {
    strengths.push('Steps executed at appropriate times in conversation')
  }

  if (completedCount === totalSteps) {
    strengths.push('Complete coverage of all process steps')
  }

  // Identify improvement areas
  const improvements: string[] = []
  const lowQualitySteps = stepAnalyses
    .filter(a => a.completed && a.quality < 60)
    .map(a => a.stepName)

  if (lowQualitySteps.length > 0) {
    improvements.push(`Improve quality of: ${lowQualitySteps.join(', ')}`)
  }

  if (missedSteps.length > 0) {
    improvements.push(`Address missed steps: ${missedSteps.join(', ')}`)
  }

  if (sequenceScore < 70) {
    improvements.push('Follow the recommended step sequence more closely')
  }

  if (timingScore < 70) {
    improvements.push('Pay attention to when each step is introduced in the conversation')
  }

  // Generate coaching points
  const coachingPoints = await generateCoachingPoints(
    stepAnalyses,
    missedSteps,
    template.steps
  )

  return {
    overallScore,
    qualityScore: Math.round(qualityScore),
    sequenceScore: Math.round(sequenceScore),
    timingScore: Math.round(timingScore),
    stepBreakdown: stepAnalyses,
    missedSteps,
    completedSteps,
    stepSequence: sequence.map(s => s.stepName),
    strengths,
    improvements,
    complianceLevel,
    certificationReady,
    coachingPoints,
    metadata: {
      templateId: template.id,
      templateName: template.name,
      recordingId,
      analyzedAt: new Date(),
      analysisVersion: '2.0.0',
    },
  }
}

/**
 * Calculate sequence adherence score
 * @param detectedSequence - Sequence in which steps were detected
 * @param expectedSteps - Steps in their expected order
 * @returns Score from 0-100
 */
function calculateSequenceScore(
  detectedSequence: StepSequenceInfo[],
  expectedSteps: ProcessStep[]
): number {
  if (detectedSequence.length === 0) return 0

  let correctOrderCount = 0
  const sortedExpected = [...expectedSteps].sort((a, b) => a.order - b.order)

  // Create order map
  const expectedOrder = new Map(
    sortedExpected.map((step, index) => [step.name, index])
  )

  // Check if detected sequence matches expected order
  for (let i = 0; i < detectedSequence.length - 1; i++) {
    const currentStep = detectedSequence[i].stepName
    const nextStep = detectedSequence[i + 1].stepName

    const currentOrder = expectedOrder.get(currentStep) ?? Infinity
    const nextOrder = expectedOrder.get(nextStep) ?? Infinity

    if (currentOrder < nextOrder) {
      correctOrderCount++
    }
  }

  const possibleTransitions = detectedSequence.length - 1
  if (possibleTransitions === 0) return 100 // Only one step detected

  return Math.round((correctOrderCount / possibleTransitions) * 100)
}

/**
 * Generate actionable coaching points
 * @param stepAnalyses - Analysis of all steps
 * @param missedSteps - Steps that were missed
 * @param allSteps - All process steps
 * @returns Array of coaching points
 */
async function generateCoachingPoints(
  stepAnalyses: StepAnalysis[],
  missedSteps: string[],
  allSteps: ProcessStep[]
): Promise<string[]> {
  const coachingPoints: string[] = []

  // Points for missed steps
  for (const missedStep of missedSteps.slice(0, 3)) {
    const step = allSteps.find(s => s.name === missedStep)
    if (step) {
      coachingPoints.push(
        `Focus on incorporating "${step.name}" - use phrases like: ${step.keywords.slice(0, 2).join(', ')}`
      )
    }
  }

  // Points for low quality steps
  const lowQualitySteps = stepAnalyses
    .filter(a => a.completed && a.quality < 60)
    .slice(0, 2)

  for (const analysis of lowQualitySteps) {
    coachingPoints.push(
      `Enhance "${analysis.stepName}" by improving depth and engagement`
    )
  }

  // Points for timing issues
  const timingIssues = stepAnalyses
    .filter(a => a.completed && a.timingScore < 60)
    .slice(0, 2)

  for (const analysis of timingIssues) {
    const step = allSteps.find(s => s.name === analysis.stepName)
    if (step?.expectedTiming) {
      coachingPoints.push(
        `Introduce "${analysis.stepName}" ${step.expectedTiming} in the conversation for better flow`
      )
    }
  }

  // Use OpenAI for additional personalized coaching
  if (openai && stepAnalyses.length > 0) {
    try {
      const completedSteps = stepAnalyses
        .filter(a => a.completed)
        .map(a => `${a.stepName} (quality: ${a.quality})`)
        .join(', ')

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert sales coach. Provide 2-3 specific, actionable coaching points based on this performance:
Completed steps: ${completedSteps}
Missed steps: ${missedSteps.join(', ')}

Focus on practical improvements they can make in their next conversation. Be specific and encouraging.
Respond with JSON: { "points": string[] }`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      if (result.points && Array.isArray(result.points)) {
        coachingPoints.push(...result.points)
      }
    } catch (error) {
      console.error('OpenAI coaching points error:', error)
    }
  }

  return coachingPoints.slice(0, 5) // Return top 5 coaching points
}

// ============================================================================
// COMPLIANCE REPORTING
// ============================================================================

/**
 * Generate a detailed compliance report
 * @param analysis - Process analysis result
 * @returns Compliance report
 */
export function generateComplianceReport(
  analysis: ProcessAnalysis
): ComplianceReport {
  const criticalStepsMissed = analysis.stepBreakdown
    .filter(s => !s.completed && analysis.missedSteps.includes(s.stepName))
    .filter(s => {
      // Assuming critical = required steps
      return true // Would need to check if step is critical in real implementation
    }).length

  const details = analysis.stepBreakdown.map(step => {
    let status: 'completed' | 'missed' | 'partial'
    if (step.completed) {
      status = step.quality >= 70 ? 'completed' : 'partial'
    } else {
      status = 'missed'
    }

    let qualityRating: string
    if (step.quality >= 90) qualityRating = 'Excellent'
    else if (step.quality >= 75) qualityRating = 'Good'
    else if (step.quality >= 60) qualityRating = 'Satisfactory'
    else if (step.quality >= 40) qualityRating = 'Needs Improvement'
    else qualityRating = 'Poor'

    return {
      step: step.stepName,
      status,
      qualityRating,
      evidence: step.excerpts,
    }
  })

  // Certification status
  const blockers: string[] = []
  if (analysis.overallScore < 85) {
    blockers.push(`Overall score (${analysis.overallScore}) is below certification threshold (85)`)
  }
  if (analysis.qualityScore < 75) {
    blockers.push(`Quality score (${analysis.qualityScore}) is below certification threshold (75)`)
  }
  if (analysis.missedSteps.length > 0) {
    blockers.push(`Missing required steps: ${analysis.missedSteps.join(', ')}`)
  }

  const nextSteps: string[] = []
  if (blockers.length === 0) {
    nextSteps.push('Ready for certification review')
    nextSteps.push('Schedule certification call with manager')
  } else {
    nextSteps.push('Address all blockers listed above')
    nextSteps.push('Complete additional practice sessions')
    nextSteps.push('Review coaching points and training materials')
  }

  return {
    summary: {
      overallCompliance: analysis.overallScore,
      criticalStepsMissed,
      totalSteps: analysis.stepBreakdown.length,
      completedSteps: analysis.completedSteps.length,
    },
    details,
    recommendations: [...analysis.improvements, ...analysis.coachingPoints],
    certificationStatus: {
      ready: analysis.certificationReady,
      blockers,
      nextSteps,
    },
    generatedAt: new Date(),
  }
}

// ============================================================================
// BEST PRACTICE COMPARISON
// ============================================================================

/**
 * Compare performance against best practices and top performers
 * @param transcription - Transcription to analyze
 * @param template - Process template
 * @returns Best practice comparison
 */
export async function compareAgainstBestPractices(
  transcription: string,
  template: ProcessTemplate
): Promise<BestPracticeComparison> {
  // Get historical data for this template
  const historicalAnalyses = await prisma.analysisResult.findMany({
    where: {
      recording: {
        organization: {
          processTemplates: {
            some: {
              id: template.id,
            },
          },
        },
      },
    },
    select: {
      processScore: true,
      confidence: true,
    },
    orderBy: {
      confidence: 'desc',
    },
    take: 100, // Top 100 recordings
  })

  // Extract scores from historical data
  const historicalScores = historicalAnalyses
    .map(a => {
      const score = (a.processScore as any)?.overallScore
      return typeof score === 'number' ? score : null
    })
    .filter((s): s is number => s !== null)

  // Calculate statistics
  const topPerformerAverage =
    historicalScores.length > 0
      ? historicalScores.slice(0, 10).reduce((sum, s) => sum + s, 0) / 10
      : 85 // Default if no historical data

  // Analyze current transcription
  const currentAnalysis = await analyzeProcessAdherence(transcription, template)

  const gap = topPerformerAverage - currentAnalysis.overallScore

  // Calculate percentile
  const betterThanCount = historicalScores.filter(
    s => s < currentAnalysis.overallScore
  ).length
  const percentile = historicalScores.length > 0
    ? Math.round((betterThanCount / historicalScores.length) * 100)
    : 50

  // Identify improvement areas by comparing with top performers
  const improvementAreas: string[] = []
  if (currentAnalysis.qualityScore < topPerformerAverage - 10) {
    improvementAreas.push('Focus on improving step execution quality')
  }
  if (currentAnalysis.sequenceScore < 80) {
    improvementAreas.push('Follow the recommended process sequence more closely')
  }
  if (currentAnalysis.missedSteps.length > 0) {
    improvementAreas.push(`Complete all steps: ${currentAnalysis.missedSteps.slice(0, 3).join(', ')}`)
  }

  return {
    topPerformerAverage: Math.round(topPerformerAverage),
    gap: Math.round(gap),
    improvementAreas,
    strengths: currentAnalysis.strengths,
    percentile,
  }
}

// ============================================================================
// BATCH ANALYSIS UTILITIES
// ============================================================================

/**
 * Analyze multiple recordings in batch
 * @param recordingIds - Array of recording IDs to analyze
 * @param templateId - Template to use for analysis
 * @returns Array of analysis results
 */
export async function batchAnalyzeRecordings(
  recordingIds: string[],
  templateId: string
): Promise<ProcessAnalysis[]> {
  const template = await getCachedTemplate(templateId)
  const results: ProcessAnalysis[] = []

  for (const recordingId of recordingIds) {
    try {
      const recording = await prisma.recording.findUnique({
        where: { id: recordingId },
        include: {
          transcription: true,
        },
      })

      if (!recording?.transcription) {
        console.warn(`Skipping recording ${recordingId}: no transcription found`)
        continue
      }

      const analysis = await analyzeProcessAdherence(
        recording.transcription.text,
        template,
        recordingId
      )

      results.push(analysis)
    } catch (error) {
      console.error(`Error analyzing recording ${recordingId}:`, error)
    }
  }

  return results
}

/**
 * Update template usage count
 * @param templateId - Template ID to update
 */
export async function incrementTemplateUsage(templateId: string): Promise<void> {
  await prisma.processTemplate.update({
    where: { id: templateId },
    data: {
      usageCount: {
        increment: 1,
      },
    },
  })
}

/**
 * Get aggregate statistics for a template
 * @param templateId - Template ID
 * @returns Aggregate statistics
 */
export async function getTemplateStatistics(templateId: string) {
  const analyses = await prisma.analysisResult.findMany({
    where: {
      recording: {
        user: {
          organization: {
            processTemplates: {
              some: {
                id: templateId,
              },
            },
          },
        },
      },
    },
    select: {
      processScore: true,
      confidence: true,
    },
  })

  const scores = analyses
    .map(a => (a.processScore as any)?.overallScore)
    .filter((s): s is number => typeof s === 'number')

  if (scores.length === 0) {
    return {
      averageScore: 0,
      medianScore: 0,
      minScore: 0,
      maxScore: 0,
      totalAnalyses: 0,
    }
  }

  const sortedScores = [...scores].sort((a, b) => a - b)
  const sum = scores.reduce((acc, s) => acc + s, 0)

  return {
    averageScore: Math.round(sum / scores.length),
    medianScore: sortedScores[Math.floor(sortedScores.length / 2)],
    minScore: sortedScores[0],
    maxScore: sortedScores[sortedScores.length - 1],
    totalAnalyses: scores.length,
  }
}

import OpenAI from 'openai'

// Initialize OpenAI client with graceful handling if key is missing
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// ==================== Type Definitions ====================

/**
 * Types of sales opportunities
 */
export type OpportunityType =
  | 'upsell'
  | 'cross-sell'
  | 'renewal'
  | 'expansion'
  | 'referral'
  | 'quick-win'
  | 'strategic-deal'

/**
 * Priority levels for opportunities
 */
export type Priority = 'high' | 'medium' | 'low'

/**
 * Urgency levels for opportunities
 */
export type Urgency = 'immediate' | 'short-term' | 'long-term'

/**
 * Buying stage in the sales funnel
 */
export type BuyingStage = 'awareness' | 'consideration' | 'decision'

/**
 * Enhanced opportunity structure with ML-powered insights
 */
export interface Opportunity {
  id: string
  type: OpportunityType
  description: string
  priority: Priority
  confidence: number // 0-100
  estimatedValue: number
  urgency: Urgency
  buyingSignals: string[]
  painPoints: string[]
  nextSteps: string[]
  timeline?: string
  competitorsMentioned?: string[]
  decisionMaker?: string
  winProbability: number // 0-100
  buyingStage: BuyingStage
  budgetQualified: boolean
  objections?: string[]
}

/**
 * Buying signal detection result
 */
export interface BuyingSignal {
  type: string
  signal: string
  confidence: number
  context: string
}

/**
 * Pain point detection result
 */
export interface PainPoint {
  category: string
  description: string
  severity: 'low' | 'medium' | 'high'
  context: string
}

/**
 * Competitor mention detection result
 */
export interface CompetitorMention {
  competitor: string
  context: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

/**
 * Urgency analysis result
 */
export interface UrgencyAnalysis {
  level: Urgency
  score: number // 0-100
  indicators: string[]
  timeline?: string
}

/**
 * Action plan for an opportunity
 */
export interface ActionPlan {
  immediateActions: string[]
  followUpActions: string[]
  resources: string[]
  stakeholders: string[]
  timeline: string
  risks: string[]
}

/**
 * Complete opportunity detection result
 */
export interface OpportunityDetectionResult {
  opportunities: Opportunity[]
  totalEstimatedRevenue: number
  highPriorityCount: number
  summary: string
  buyingSignalsSummary: BuyingSignal[]
  painPointsSummary: PainPoint[]
  competitorsSummary: CompetitorMention[]
  urgencyAssessment: UrgencyAnalysis
}

// ==================== Main Service Functions ====================

/**
 * Main opportunity detection function with comprehensive ML-powered analysis
 * @param transcription - The conversation transcription to analyze
 * @param recordingId - Optional recording ID for reference
 * @returns Complete opportunity detection results
 */
export async function detectOpportunities(
  transcription: string,
  recordingId?: string
): Promise<OpportunityDetectionResult> {
  if (!openai) {
    return generateMockOpportunityDetection(transcription)
  }

  try {
    // Run all analyses in parallel for efficiency
    const [
      rawOpportunities,
      buyingSignals,
      painPoints,
      competitors,
      urgency,
    ] = await Promise.all([
      detectRawOpportunities(transcription),
      extractBuyingSignals(transcription),
      identifyPainPoints(transcription),
      detectCompetitorMentions(transcription),
      analyzeUrgency(transcription),
    ])

    // Enrich opportunities with additional data
    const enrichedOpportunities = await Promise.all(
      rawOpportunities.map(async (opp) => {
        const [classification, value, winProb, objections] = await Promise.all([
          classifyOpportunityType(opp.description + ' ' + opp.context),
          calculateOpportunityValue(opp),
          calculateWinProbability(opp, buyingSignals, painPoints),
          detectObjections(transcription),
        ])

        return {
          ...opp,
          id: generateOpportunityId(recordingId),
          type: classification.type,
          estimatedValue: value,
          winProbability: winProb,
          buyingStage: classification.stage,
          budgetQualified: classification.budgetQualified,
          buyingSignals: buyingSignals.map(s => s.signal).slice(0, 5),
          painPoints: painPoints.map(p => p.description).slice(0, 5),
          competitorsMentioned: competitors.map(c => c.competitor),
          urgency: urgency.level,
          timeline: urgency.timeline,
          objections: objections.slice(0, 3),
          nextSteps: await generateNextSteps(opp),
        }
      })
    )

    // Prioritize opportunities
    const prioritizedOpportunities = prioritizeOpportunities(enrichedOpportunities)

    // Calculate summary metrics
    const totalEstimatedRevenue = prioritizedOpportunities.reduce(
      (sum, opp) => sum + opp.estimatedValue,
      0
    )
    const highPriorityCount = prioritizedOpportunities.filter(
      opp => opp.priority === 'high'
    ).length

    // Generate summary
    const summary = await generateOpportunitiesSummary(
      prioritizedOpportunities,
      buyingSignals,
      painPoints
    )

    return {
      opportunities: prioritizedOpportunities,
      totalEstimatedRevenue,
      highPriorityCount,
      summary,
      buyingSignalsSummary: buyingSignals,
      painPointsSummary: painPoints,
      competitorsSummary: competitors,
      urgencyAssessment: urgency,
    }
  } catch (error) {
    console.error('Opportunity detection error:', error)
    return generateMockOpportunityDetection(transcription)
  }
}

/**
 * Classifies the type and characteristics of an opportunity
 * @param context - The context text to analyze
 * @returns Opportunity classification
 */
export async function classifyOpportunityType(context: string): Promise<{
  type: OpportunityType
  stage: BuyingStage
  budgetQualified: boolean
}> {
  if (!openai) {
    return generateMockClassification(context)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a sales opportunity classification expert. Analyze the context and classify the opportunity.

Opportunity Types:
- upsell: Customer wants premium features or higher tier
- cross-sell: Customer needs complementary products/services
- renewal: Opportunity to renew contract/subscription
- expansion: Growing team, usage, or scope
- referral: Customer mentions other potential clients
- quick-win: Small immediate opportunity (< 30 days)
- strategic-deal: Long-term high-value opportunity (> $50k or 6+ months)

Buying Stages:
- awareness: Customer is just learning about solutions
- consideration: Customer is evaluating options
- decision: Customer is ready to make a decision

Respond in JSON format with: type, stage, budgetQualified (boolean), reasoning`,
        },
        {
          role: 'user',
          content: context.substring(0, 5000),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return {
      type: result.type || 'upsell',
      stage: result.stage || 'awareness',
      budgetQualified: result.budgetQualified || false,
    }
  } catch (error) {
    console.error('Opportunity classification error:', error)
    return generateMockClassification(context)
  }
}

/**
 * Calculates the estimated revenue value of an opportunity
 * @param opportunity - The opportunity to evaluate
 * @param customerData - Optional customer data for context
 * @returns Estimated revenue value
 */
export async function calculateOpportunityValue(
  opportunity: any,
  customerData?: any
): Promise<number> {
  // Base values by opportunity type
  const baseValues: Record<string, number> = {
    'upsell': 5000,
    'cross-sell': 3000,
    'renewal': 10000,
    'expansion': 15000,
    'referral': 8000,
    'quick-win': 1000,
    'strategic-deal': 50000,
  }

  let baseValue = baseValues[opportunity.type] || 5000

  // Adjust based on confidence
  baseValue *= (opportunity.confidence / 100)

  // Adjust based on priority
  const priorityMultipliers = {
    high: 1.5,
    medium: 1.0,
    low: 0.6,
  }
  baseValue *= priorityMultipliers[opportunity.priority] || 1.0

  // Use customer data if available
  if (customerData?.currentMRR) {
    baseValue = Math.max(baseValue, customerData.currentMRR * 0.3)
  }

  // Round to nearest 100
  return Math.round(baseValue / 100) * 100
}

/**
 * Prioritizes opportunities by likelihood and value
 * @param opportunities - Array of opportunities to prioritize
 * @returns Sorted array of opportunities
 */
export function prioritizeOpportunities(opportunities: Opportunity[]): Opportunity[] {
  return opportunities.sort((a, b) => {
    // Calculate priority score
    const scoreA = calculatePriorityScore(a)
    const scoreB = calculatePriorityScore(b)
    return scoreB - scoreA
  })
}

/**
 * Extracts buying signals from the transcription
 * @param transcription - The conversation text
 * @returns Array of detected buying signals
 */
export async function extractBuyingSignals(
  transcription: string
): Promise<BuyingSignal[]> {
  if (!openai) {
    return generateMockBuyingSignals(transcription)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert at detecting buying signals in sales conversations.

Detect these types of buying signals:
- Budget discussion: Customer mentions allocated funds
- Timeline urgency: Customer needs solution by specific date
- Decision authority: Customer has approval power
- Competitor comparison: Customer evaluating alternatives
- Feature interest: Customer asks about specific capabilities
- Implementation questions: Customer asks about setup/onboarding
- Stakeholder involvement: Multiple decision-makers engaged
- Contract terms: Customer discusses agreements
- ROI focus: Customer asks about returns/value
- Pain acknowledgment: Customer admits current solution inadequate

For each signal provide:
- type: category of the signal
- signal: the actual statement or behavior
- confidence: 0-100 score
- context: relevant quote

Respond in JSON format with an array of signals.`,
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
    return result.signals || []
  } catch (error) {
    console.error('Buying signals extraction error:', error)
    return generateMockBuyingSignals(transcription)
  }
}

/**
 * Identifies pain points mentioned by the customer
 * @param transcription - The conversation text
 * @returns Array of identified pain points
 */
export async function identifyPainPoints(transcription: string): Promise<PainPoint[]> {
  if (!openai) {
    return generateMockPainPoints(transcription)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert at identifying customer pain points in sales conversations.

Pain point categories:
- Cost: Current solution is too expensive
- Time: Processes are too slow or inefficient
- Quality: Current solution has quality issues
- Scale: Cannot handle growth or volume
- Integration: Systems don't work together
- Complexity: Solution is too difficult to use
- Support: Lack of adequate support
- Features: Missing critical capabilities
- Reliability: System downtime or failures
- Compliance: Regulatory or security concerns

For each pain point provide:
- category: one of the above categories
- description: clear description of the pain
- severity: low, medium, or high
- context: relevant quote

Respond in JSON format with an array of painPoints.`,
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
    return result.painPoints || []
  } catch (error) {
    console.error('Pain points identification error:', error)
    return generateMockPainPoints(transcription)
  }
}

/**
 * Detects mentions of competitors in the conversation
 * @param transcription - The conversation text
 * @returns Array of competitor mentions
 */
export async function detectCompetitorMentions(
  transcription: string
): Promise<CompetitorMention[]> {
  if (!openai) {
    return generateMockCompetitorMentions(transcription)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert at detecting competitor mentions in sales conversations.

Identify:
- Direct competitor names
- Generic competitor references ("current provider", "existing solution")
- Sentiment about each competitor (positive, negative, neutral)
- Context of the mention

For each mention provide:
- competitor: name or description
- context: relevant quote
- sentiment: positive, negative, or neutral

Respond in JSON format with an array of competitors.`,
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
    return result.competitors || []
  } catch (error) {
    console.error('Competitor detection error:', error)
    return generateMockCompetitorMentions(transcription)
  }
}

/**
 * Analyzes the urgency level of the opportunity
 * @param transcription - The conversation text
 * @returns Urgency analysis result
 */
export async function analyzeUrgency(transcription: string): Promise<UrgencyAnalysis> {
  if (!openai) {
    return generateMockUrgency(transcription)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert at assessing sales urgency.

Urgency levels:
- immediate: Customer needs solution within 2 weeks
- short-term: Customer needs solution within 1-3 months
- long-term: Customer needs solution in 3+ months or unclear timeline

Look for indicators:
- Specific deadlines or dates mentioned
- Words like "urgent", "ASAP", "immediately", "soon"
- Business events (end of quarter, contract expiration, etc.)
- Competitor evaluation timelines
- Budget cycles

Provide:
- level: immediate, short-term, or long-term
- score: 0-100 urgency score
- indicators: array of urgency signals found
- timeline: specific timeline if mentioned

Respond in JSON format.`,
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
    return {
      level: result.level || 'long-term',
      score: result.score || 50,
      indicators: result.indicators || [],
      timeline: result.timeline,
    }
  } catch (error) {
    console.error('Urgency analysis error:', error)
    return generateMockUrgency(transcription)
  }
}

/**
 * Generates a recommended action plan for an opportunity
 * @param opportunity - The opportunity to create a plan for
 * @returns Action plan with next steps and recommendations
 */
export async function generateActionPlan(opportunity: Opportunity): Promise<ActionPlan> {
  if (!openai) {
    return generateMockActionPlan(opportunity)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a sales strategy expert. Generate a detailed action plan for pursuing this opportunity.

Include:
- immediateActions: 3-5 actions to take within 24-48 hours
- followUpActions: 3-5 actions for the next 2-4 weeks
- resources: materials, demos, case studies needed
- stakeholders: who should be involved
- timeline: suggested timeline for the sales cycle
- risks: potential risks and how to mitigate them

Respond in JSON format.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            type: opportunity.type,
            description: opportunity.description,
            priority: opportunity.priority,
            urgency: opportunity.urgency,
            painPoints: opportunity.painPoints,
            buyingSignals: opportunity.buyingSignals,
            winProbability: opportunity.winProbability,
          }),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return {
      immediateActions: result.immediateActions || [],
      followUpActions: result.followUpActions || [],
      resources: result.resources || [],
      stakeholders: result.stakeholders || [],
      timeline: result.timeline || '2-4 weeks',
      risks: result.risks || [],
    }
  } catch (error) {
    console.error('Action plan generation error:', error)
    return generateMockActionPlan(opportunity)
  }
}

// ==================== Helper Functions ====================

/**
 * Detects raw opportunities from transcription using GPT-4
 */
async function detectRawOpportunities(transcription: string): Promise<any[]> {
  const response = await openai!.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a sales opportunity detection expert. Analyze the conversation and identify all potential sales opportunities.

For each opportunity provide:
- description: clear description of the opportunity
- confidence: 0-100 score indicating likelihood
- context: relevant quote from conversation
- priority: initial priority (low, medium, high)
- decisionMaker: name or role if mentioned

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
}

/**
 * Calculates win probability based on multiple factors
 */
async function calculateWinProbability(
  opportunity: any,
  buyingSignals: BuyingSignal[],
  painPoints: PainPoint[]
): Promise<number> {
  let probability = 50 // Base probability

  // Adjust based on confidence
  probability += (opportunity.confidence - 50) * 0.5

  // Adjust based on buying signals
  probability += Math.min(buyingSignals.length * 5, 20)

  // Adjust based on pain points severity
  const highSeverityPains = painPoints.filter(p => p.severity === 'high').length
  probability += highSeverityPains * 5

  // Adjust based on priority
  const priorityAdjustments = { high: 10, medium: 0, low: -10 }
  probability += priorityAdjustments[opportunity.priority] || 0

  // Ensure within bounds
  return Math.max(0, Math.min(100, Math.round(probability)))
}

/**
 * Detects objections in the conversation
 */
async function detectObjections(transcription: string): Promise<string[]> {
  if (!openai) {
    return []
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert at detecting sales objections. Identify any concerns, objections, or hesitations the customer expresses.

Common objections:
- Price too high
- Need more time
- Happy with current solution
- Budget constraints
- Need to consult others
- Missing features
- Implementation concerns
- Timing not right

Extract the actual objections mentioned. Respond in JSON format with an array of objection strings.`,
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
    return result.objections || []
  } catch (error) {
    console.error('Objection detection error:', error)
    return []
  }
}

/**
 * Generates next steps for an opportunity
 */
async function generateNextSteps(opportunity: any): Promise<string[]> {
  // Default next steps based on opportunity type
  const defaultSteps: Record<string, string[]> = {
    'upsell': [
      'Schedule demo of premium features',
      'Share case studies of similar upgrades',
      'Prepare ROI analysis',
    ],
    'cross-sell': [
      'Present complementary product overview',
      'Arrange product integration demo',
      'Share bundle pricing options',
    ],
    'renewal': [
      'Send renewal proposal with terms',
      'Schedule renewal discussion call',
      'Prepare usage and value report',
    ],
    'expansion': [
      'Discuss scaling options and pricing',
      'Schedule technical scaling review',
      'Prepare expansion timeline',
    ],
    'referral': [
      'Request introduction to referred contact',
      'Prepare referral incentive information',
      'Draft outreach message for referral',
    ],
    'quick-win': [
      'Send proposal immediately',
      'Schedule quick close call',
      'Prepare contract for signature',
    ],
    'strategic-deal': [
      'Schedule executive-level meeting',
      'Prepare comprehensive proposal',
      'Conduct stakeholder analysis',
    ],
  }

  return defaultSteps[opportunity.type] || [
    'Schedule follow-up call',
    'Send additional information',
    'Prepare proposal',
  ]
}

/**
 * Generates a summary of all opportunities
 */
async function generateOpportunitiesSummary(
  opportunities: Opportunity[],
  buyingSignals: BuyingSignal[],
  painPoints: PainPoint[]
): Promise<string> {
  const highPriority = opportunities.filter(o => o.priority === 'high').length
  const totalValue = opportunities.reduce((sum, o) => sum + o.estimatedValue, 0)
  const avgWinProb = opportunities.length > 0
    ? Math.round(opportunities.reduce((sum, o) => sum + o.winProbability, 0) / opportunities.length)
    : 0

  const topTypes = getTopOpportunityTypes(opportunities)
  const criticalPains = painPoints.filter(p => p.severity === 'high').length

  return `Found ${opportunities.length} opportunity(ies) with ${highPriority} high-priority. ` +
    `Total estimated revenue: $${totalValue.toLocaleString()}. ` +
    `Average win probability: ${avgWinProb}%. ` +
    `Top opportunity types: ${topTypes.join(', ')}. ` +
    `Detected ${buyingSignals.length} buying signal(s) and ${criticalPains} critical pain point(s). ` +
    `Immediate action recommended for high-priority opportunities.`
}

/**
 * Calculates priority score for sorting
 */
function calculatePriorityScore(opportunity: Opportunity): number {
  const priorityWeights = { high: 100, medium: 50, low: 25 }
  const urgencyWeights = { immediate: 50, 'short-term': 30, 'long-term': 10 }

  return (
    priorityWeights[opportunity.priority] +
    urgencyWeights[opportunity.urgency] +
    opportunity.winProbability * 0.5 +
    opportunity.confidence * 0.3 +
    opportunity.estimatedValue / 100
  )
}

/**
 * Gets top 3 opportunity types
 */
function getTopOpportunityTypes(opportunities: Opportunity[]): string[] {
  const typeCounts = opportunities.reduce((acc, opp) => {
    acc[opp.type] = (acc[opp.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type)
}

/**
 * Generates unique opportunity ID
 */
function generateOpportunityId(recordingId?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `opp_${recordingId ? recordingId.substring(0, 8) + '_' : ''}${timestamp}_${random}`
}

// ==================== Mock Data Generators ====================

/**
 * Generates mock opportunity detection when OpenAI is not available
 */
function generateMockOpportunityDetection(
  transcription: string
): OpportunityDetectionResult {
  const mockOpportunities: Opportunity[] = []
  const text = transcription.toLowerCase()

  // Detect upsell opportunity
  if (text.includes('upgrade') || text.includes('premium') || text.includes('feature')) {
    mockOpportunities.push({
      id: generateOpportunityId(),
      type: 'upsell',
      description: 'Customer expressed interest in premium features',
      priority: 'high',
      confidence: 75,
      estimatedValue: 5000,
      urgency: 'short-term',
      buyingSignals: ['Premium feature inquiry', 'Upgrade discussion'],
      painPoints: ['Limited functionality', 'Need advanced features'],
      nextSteps: [
        'Schedule demo of premium features',
        'Share pricing comparison',
        'Send feature comparison matrix',
      ],
      competitorsMentioned: [],
      winProbability: 70,
      buyingStage: 'consideration',
      budgetQualified: false,
    })
  }

  // Detect expansion opportunity
  if (text.includes('team') || text.includes('grow') || text.includes('scale')) {
    mockOpportunities.push({
      id: generateOpportunityId(),
      type: 'expansion',
      description: 'Customer discussing team growth and scaling needs',
      priority: 'high',
      confidence: 80,
      estimatedValue: 12000,
      urgency: 'short-term',
      buyingSignals: ['Team expansion mentioned', 'Scaling requirements'],
      painPoints: ['Current capacity limitations'],
      nextSteps: [
        'Discuss volume pricing',
        'Schedule scaling consultation',
        'Prepare expansion proposal',
      ],
      winProbability: 75,
      buyingStage: 'consideration',
      budgetQualified: true,
    })
  }

  // Detect cross-sell opportunity
  if (text.includes('integration') || text.includes('additional') || text.includes('also')) {
    mockOpportunities.push({
      id: generateOpportunityId(),
      type: 'cross-sell',
      description: 'Customer inquired about complementary products',
      priority: 'medium',
      confidence: 65,
      estimatedValue: 3500,
      urgency: 'long-term',
      buyingSignals: ['Asked about integrations', 'Interest in additional products'],
      painPoints: ['System integration challenges'],
      nextSteps: [
        'Share product ecosystem overview',
        'Arrange integration demo',
        'Send bundle pricing',
      ],
      winProbability: 60,
      buyingStage: 'awareness',
      budgetQualified: false,
    })
  }

  // If no opportunities found, add a generic follow-up
  if (mockOpportunities.length === 0) {
    mockOpportunities.push({
      id: generateOpportunityId(),
      type: 'quick-win',
      description: 'Follow-up opportunity identified',
      priority: 'medium',
      confidence: 50,
      estimatedValue: 1000,
      urgency: 'short-term',
      buyingSignals: ['Engaged conversation'],
      painPoints: ['General business needs'],
      nextSteps: [
        'Schedule follow-up call',
        'Send additional resources',
        'Maintain relationship',
      ],
      winProbability: 50,
      buyingStage: 'awareness',
      budgetQualified: false,
    })
  }

  const totalEstimatedRevenue = mockOpportunities.reduce(
    (sum, opp) => sum + opp.estimatedValue,
    0
  )
  const highPriorityCount = mockOpportunities.filter(o => o.priority === 'high').length

  return {
    opportunities: mockOpportunities,
    totalEstimatedRevenue,
    highPriorityCount,
    summary: `Mock analysis: Found ${mockOpportunities.length} opportunities (${highPriorityCount} high-priority) worth $${totalEstimatedRevenue.toLocaleString()}. OpenAI not configured - using pattern-based detection.`,
    buyingSignalsSummary: generateMockBuyingSignals(transcription),
    painPointsSummary: generateMockPainPoints(transcription),
    competitorsSummary: generateMockCompetitorMentions(transcription),
    urgencyAssessment: generateMockUrgency(transcription),
  }
}

function generateMockClassification(context: string): {
  type: OpportunityType
  stage: BuyingStage
  budgetQualified: boolean
} {
  const text = context.toLowerCase()

  let type: OpportunityType = 'upsell'
  if (text.includes('renew')) type = 'renewal'
  else if (text.includes('expand') || text.includes('grow')) type = 'expansion'
  else if (text.includes('additional') || text.includes('also')) type = 'cross-sell'
  else if (text.includes('refer') || text.includes('recommend')) type = 'referral'

  let stage: BuyingStage = 'awareness'
  if (text.includes('compare') || text.includes('evaluate')) stage = 'consideration'
  else if (text.includes('buy') || text.includes('purchase') || text.includes('sign')) stage = 'decision'

  const budgetQualified = text.includes('budget') || text.includes('price') || text.includes('cost')

  return { type, stage, budgetQualified }
}

function generateMockBuyingSignals(transcription: string): BuyingSignal[] {
  const signals: BuyingSignal[] = []
  const text = transcription.toLowerCase()

  if (text.includes('budget') || text.includes('cost') || text.includes('price')) {
    signals.push({
      type: 'Budget discussion',
      signal: 'Customer discussing pricing and budget',
      confidence: 70,
      context: 'Mock signal - OpenAI not configured',
    })
  }

  if (text.includes('when') || text.includes('timeline') || text.includes('deadline')) {
    signals.push({
      type: 'Timeline urgency',
      signal: 'Customer mentioned specific timeline',
      confidence: 75,
      context: 'Mock signal - OpenAI not configured',
    })
  }

  if (text.includes('demo') || text.includes('show') || text.includes('see')) {
    signals.push({
      type: 'Feature interest',
      signal: 'Customer requested product demonstration',
      confidence: 80,
      context: 'Mock signal - OpenAI not configured',
    })
  }

  return signals
}

function generateMockPainPoints(transcription: string): PainPoint[] {
  const painPoints: PainPoint[] = []
  const text = transcription.toLowerCase()

  if (text.includes('slow') || text.includes('time') || text.includes('delay')) {
    painPoints.push({
      category: 'Time',
      description: 'Current processes are too slow',
      severity: 'high',
      context: 'Mock pain point - OpenAI not configured',
    })
  }

  if (text.includes('expensive') || text.includes('cost') || text.includes('save')) {
    painPoints.push({
      category: 'Cost',
      description: 'Current solution is too expensive',
      severity: 'medium',
      context: 'Mock pain point - OpenAI not configured',
    })
  }

  if (text.includes('difficult') || text.includes('complex') || text.includes('confusing')) {
    painPoints.push({
      category: 'Complexity',
      description: 'Current solution is too complex',
      severity: 'medium',
      context: 'Mock pain point - OpenAI not configured',
    })
  }

  return painPoints
}

function generateMockCompetitorMentions(transcription: string): CompetitorMention[] {
  const competitors: CompetitorMention[] = []
  const text = transcription.toLowerCase()

  if (text.includes('current') || text.includes('existing') || text.includes('using')) {
    competitors.push({
      competitor: 'Current provider (unspecified)',
      context: 'Mock competitor mention - OpenAI not configured',
      sentiment: 'neutral',
    })
  }

  return competitors
}

function generateMockUrgency(transcription: string): UrgencyAnalysis {
  const text = transcription.toLowerCase()

  let level: Urgency = 'long-term'
  let score = 30

  if (text.includes('asap') || text.includes('urgent') || text.includes('immediately')) {
    level = 'immediate'
    score = 90
  } else if (text.includes('soon') || text.includes('quickly') || text.includes('deadline')) {
    level = 'short-term'
    score = 65
  }

  return {
    level,
    score,
    indicators: ['Mock urgency analysis - OpenAI not configured'],
    timeline: undefined,
  }
}

function generateMockActionPlan(opportunity: Opportunity): ActionPlan {
  return {
    immediateActions: [
      'Review opportunity details with team',
      'Prepare relevant materials and proposals',
      'Schedule follow-up conversation',
    ],
    followUpActions: [
      'Send detailed proposal and pricing',
      'Arrange product demonstration',
      'Address any questions or concerns',
      'Move toward contract negotiation',
    ],
    resources: [
      'Product demo environment',
      'Case studies and testimonials',
      'Pricing and proposal templates',
    ],
    stakeholders: [
      'Sales representative',
      'Sales manager',
      'Solution engineer (if technical demo needed)',
    ],
    timeline: '2-4 weeks',
    risks: [
      'Budget constraints may delay decision',
      'Competitor activity may influence choice',
      'Multiple stakeholders may slow approval',
    ],
  }
}

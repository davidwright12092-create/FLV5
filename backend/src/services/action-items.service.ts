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
 * Action item categories for classification
 */
export type ActionCategory =
  | 'follow-up'
  | 'internal'
  | 'customer'
  | 'administrative'
  | 'technical'
  | 'sales'

/**
 * Priority levels for action items
 */
export type Priority = 'critical' | 'high' | 'medium' | 'low'

/**
 * Action item status tracking
 */
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

/**
 * Who made the commitment
 */
export type CommitmentOwner = 'rep' | 'customer' | 'both'

/**
 * Enhanced action item with full metadata
 */
export interface ActionItem {
  id: string
  title: string
  description: string
  category: ActionCategory
  priority: Priority
  assignedTo?: string
  dueDate?: Date
  estimatedMinutes?: number
  status: ActionStatus
  dependencies?: string[] // IDs of other action items
  source: string // Quote from transcription
  timestamp?: number // Position in transcription (seconds)
  urgencyScore: number // 0-100
  completionLikelihood: number // 0-100
  tags: string[]
}

/**
 * Commitment made during conversation
 */
export interface Commitment {
  who: CommitmentOwner
  what: string
  when?: Date
  confidence: number
  source: string
}

/**
 * Calendar event suggestion
 */
export interface CalendarEvent {
  title: string
  description: string
  date: Date
  duration: number // minutes
  attendees?: string[]
  relatedActionId?: string
}

/**
 * Complete action items analysis result
 */
export interface ActionItemsAnalysis {
  actionItems: ActionItem[]
  commitments: Commitment[]
  summary: string
  criticalActions: number
  overdueRisk: number // 0-100
  completionRate: number // 0-100 estimated
  emailDraft?: string
  calendarEvents?: CalendarEvent[]
  dependencies: Map<string, string[]>
  recommendedFollowUps: string[]
}

/**
 * Conversation analysis result from analysis service
 */
export interface ConversationAnalysis {
  sentiment: {
    overall: string
    score: number
  }
  opportunities: any[]
  actionItems: any[]
}

// ============================================================================
// ACTION DETECTION PATTERNS
// ============================================================================

/**
 * Regex patterns for detecting action items and commitments
 */
const ACTION_PATTERNS = {
  commitment: /\b(I will|I'll|We will|We'll|Let me|I'm going to|I can|We can)\b/gi,
  request: /\b(Can you|Could you|Would you|Please|Need you to|Asking you to)\b/gi,
  deadline: /\b(by|before|until|no later than|due|deadline)\s+(tomorrow|today|tonight|this week|next week|end of day|EOD|end of week|EOW|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|this month|next month)/gi,
  urgency: /\b(ASAP|urgent|immediately|critical|emergency|right away|as soon as possible|time sensitive|high priority)\b/gi,
  follow_up: /\b(follow up|check in|circle back|touch base|get back to|reach out|reconnect)\b/gi,
  send: /\b(send|email|forward|share|provide|deliver|transmit)\b/gi,
  schedule: /\b(schedule|book|set up|arrange|plan|organize)\b/gi,
  review: /\b(review|check|verify|confirm|validate|look at|examine)\b/gi,
  create: /\b(create|generate|build|prepare|draft|write|develop)\b/gi,
  update: /\b(update|modify|change|revise|edit|adjust)\b/gi,
}

/**
 * Priority keywords and their weights
 */
const PRIORITY_KEYWORDS = {
  critical: ['critical', 'emergency', 'urgent', 'asap', 'immediately', 'right away'],
  high: ['important', 'high priority', 'soon', 'quickly', 'today', 'tonight'],
  medium: ['should', 'need to', 'would like', 'this week', 'next few days'],
  low: ['when you can', 'eventually', 'sometime', 'no rush', 'later'],
}

/**
 * Category detection keywords
 */
const CATEGORY_KEYWORDS = {
  'follow-up': ['follow up', 'check in', 'touch base', 'get back', 'circle back'],
  internal: ['team', 'manager', 'approval', 'internal', 'discuss with', 'ask'],
  customer: ['customer will', 'client will', 'they will provide', 'they need to'],
  administrative: ['contract', 'paperwork', 'invoice', 'billing', 'payment', 'agreement'],
  technical: ['configure', 'setup', 'implementation', 'integration', 'technical', 'API'],
  sales: ['quote', 'proposal', 'pricing', 'demo', 'presentation', 'negotiation'],
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Generate comprehensive action items from transcription
 * @param transcription - The conversation text
 * @param recordingId - Optional recording ID for database storage
 * @returns Complete action items analysis
 */
export async function generateActionItems(
  transcription: string,
  recordingId?: string
): Promise<ActionItemsAnalysis> {
  if (!openai) {
    return generateMockActionItems(transcription)
  }

  try {
    // Extract action items using GPT-4
    const rawActions = await extractActionsWithAI(transcription)

    // Extract commitments
    const commitments = await detectCommitments(transcription)

    // Extract deadlines
    const deadlines = extractDeadlines(transcription)

    // Process and enhance each action item
    const actionItems: ActionItem[] = []
    for (let i = 0; i < rawActions.length; i++) {
      const raw = rawActions[i]

      const actionItem: ActionItem = {
        id: `action_${Date.now()}_${i}`,
        title: raw.title,
        description: raw.description,
        category: categorizeAction(raw),
        priority: assignPriority(raw),
        assignedTo: identifyOwner(transcription, raw),
        dueDate: findDeadlineForAction(raw, deadlines),
        estimatedMinutes: estimateTimeRequired(raw),
        status: 'pending',
        source: raw.source || raw.description,
        timestamp: raw.timestamp,
        urgencyScore: calculateUrgencyScore(raw),
        completionLikelihood: estimateCompletionLikelihood(raw),
        tags: extractTags(raw),
        dependencies: [],
      }

      actionItems.push(actionItem)
    }

    // Detect dependencies between actions
    const dependencies = detectDependencies(actionItems)
    actionItems.forEach((item) => {
      item.dependencies = dependencies.get(item.id) || []
    })

    // Generate summary
    const summary = await generateMeetingSummary(transcription, actionItems)

    // Calculate metrics
    const criticalActions = actionItems.filter(a => a.priority === 'critical').length
    const overdueRisk = calculateOverdueRisk(actionItems)
    const completionRate = calculateExpectedCompletionRate(actionItems)

    // Generate email draft
    const emailDraft = generateEmailDraft(actionItems, commitments)

    // Generate calendar events
    const calendarEvents = generateCalendarEvents(actionItems, deadlines)

    // Generate follow-up recommendations
    const recommendedFollowUps = await suggestFollowUpActions({
      sentiment: { overall: 'neutral', score: 0 },
      opportunities: [],
      actionItems: rawActions,
    })

    // Save to database if recordingId provided
    if (recordingId) {
      await saveActionItemsToDatabase(recordingId, {
        actionItems,
        commitments,
        summary,
        criticalActions,
        overdueRisk,
        completionRate,
      })
    }

    return {
      actionItems,
      commitments,
      summary,
      criticalActions,
      overdueRisk,
      completionRate,
      emailDraft,
      calendarEvents,
      dependencies,
      recommendedFollowUps,
    }
  } catch (error) {
    console.error('Error generating action items:', error)
    return generateMockActionItems(transcription)
  }
}

/**
 * Extract action items using OpenAI GPT-4
 * @param transcription - The conversation text
 * @returns Array of raw action items
 */
async function extractActionsWithAI(transcription: string): Promise<any[]> {
  if (!openai) {
    return []
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are an expert at extracting action items from conversations. Analyze the conversation and identify EVERY action item, task, commitment, follow-up, and decision point.

Look for:
- Explicit commitments ("I will send...", "We'll follow up...")
- Requests ("Can you please...", "Could you...")
- Implied tasks ("Need to check...", "Should verify...")
- Follow-up requirements
- Decisions that need to be made
- Information that needs to be gathered
- Documents to be created or sent
- Meetings to be scheduled
- People to contact

For each action item, provide:
- title: Brief, actionable title (start with verb)
- description: Detailed description with context
- source: Direct quote from conversation
- timestamp: Approximate time in conversation (in seconds, estimate based on position)
- actionVerb: Primary action verb (send, schedule, review, create, etc.)
- mentionedPerson: Any person mentioned in relation to this action
- urgencyIndicators: Any words indicating urgency
- timeframe: Any mentioned timeframe or deadline

Return JSON with an "actions" array.`,
      },
      {
        role: 'user',
        content: transcription.substring(0, 12000), // Increased token limit
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')
  return result.actions || []
}

/**
 * Categorize an action item by analyzing its content
 * @param action - The action item to categorize
 * @returns Action category
 */
export function categorizeAction(action: any): ActionCategory {
  const text = `${action.title} ${action.description}`.toLowerCase()

  // Score each category
  const scores: Record<ActionCategory, number> = {
    'follow-up': 0,
    'internal': 0,
    'customer': 0,
    'administrative': 0,
    'technical': 0,
    'sales': 0,
  }

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    keywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        scores[category as ActionCategory] += 1
      }
    })
  }

  // Find category with highest score
  let maxScore = 0
  let bestCategory: ActionCategory = 'follow-up'

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      bestCategory = category as ActionCategory
    }
  }

  return bestCategory
}

/**
 * Categorize multiple actions and group them
 * @param items - Array of action items
 * @returns Actions grouped by category
 */
export function categorizeActions(items: ActionItem[]): Map<ActionCategory, ActionItem[]> {
  const categorized = new Map<ActionCategory, ActionItem[]>()

  items.forEach((item) => {
    const category = item.category
    if (!categorized.has(category)) {
      categorized.set(category, [])
    }
    categorized.get(category)!.push(item)
  })

  return categorized
}

/**
 * Assign priority to an action item
 * @param action - The action item
 * @returns Priority level
 */
export function assignPriority(action: any): Priority {
  const text = `${action.title} ${action.description} ${action.urgencyIndicators || ''}`.toLowerCase()

  // Check for priority keywords
  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return priority as Priority
      }
    }
  }

  // Check for urgency patterns
  if (ACTION_PATTERNS.urgency.test(text)) {
    return 'critical'
  }

  // Check for deadline proximity
  if (action.timeframe) {
    const timeframe = action.timeframe.toLowerCase()
    if (timeframe.includes('today') || timeframe.includes('tonight') || timeframe.includes('eod')) {
      return 'critical'
    }
    if (timeframe.includes('tomorrow') || timeframe.includes('this week')) {
      return 'high'
    }
    if (timeframe.includes('next week') || timeframe.includes('this month')) {
      return 'medium'
    }
  }

  return 'medium'
}

/**
 * Extract deadlines and dates from transcription
 * @param transcription - The conversation text
 * @returns Array of detected deadlines
 */
export function extractDeadlines(transcription: string): Array<{ text: string; date: Date | null }> {
  const deadlines: Array<{ text: string; date: Date | null }> = []

  // Find deadline patterns
  const matches = transcription.matchAll(ACTION_PATTERNS.deadline)

  for (const match of matches) {
    const text = match[0]
    const date = parseRelativeDate(text)
    deadlines.push({ text, date })
  }

  return deadlines
}

/**
 * Parse relative dates like "tomorrow", "next week", etc.
 * @param text - Text containing date reference
 * @returns Parsed date or null
 */
function parseRelativeDate(text: string): Date | null {
  const now = new Date()
  const textLower = text.toLowerCase()

  // Today
  if (textLower.includes('today') || textLower.includes('eod')) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0)
  }

  // Tomorrow
  if (textLower.includes('tomorrow')) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(17, 0, 0, 0)
    return tomorrow
  }

  // This week
  if (textLower.includes('this week') || textLower.includes('eow')) {
    const endOfWeek = new Date(now)
    const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilFriday)
    endOfWeek.setHours(17, 0, 0, 0)
    return endOfWeek
  }

  // Next week
  if (textLower.includes('next week')) {
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(17, 0, 0, 0)
    return nextWeek
  }

  // Specific days of week
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (textLower.includes(daysOfWeek[i])) {
      const targetDay = new Date(now)
      const currentDay = now.getDay()
      const daysUntilTarget = (i - currentDay + 7) % 7 || 7
      targetDay.setDate(targetDay.getDate() + daysUntilTarget)
      targetDay.setHours(17, 0, 0, 0)
      return targetDay
    }
  }

  return null
}

/**
 * Find matching deadline for an action item
 * @param action - The action item
 * @param deadlines - Array of detected deadlines
 * @returns Matched date or undefined
 */
function findDeadlineForAction(
  action: any,
  deadlines: Array<{ text: string; date: Date | null }>
): Date | undefined {
  // If action has explicit timeframe, try to match it
  if (action.timeframe) {
    for (const deadline of deadlines) {
      if (deadline.text.toLowerCase().includes(action.timeframe.toLowerCase())) {
        return deadline.date || undefined
      }
    }

    // Try to parse the timeframe directly
    const parsed = parseRelativeDate(action.timeframe)
    if (parsed) {
      return parsed
    }
  }

  // Default: high priority = 2 days, medium = 5 days, low = 10 days
  const priority = action.priority || 'medium'
  const now = new Date()
  const daysToAdd = priority === 'critical' ? 1 : priority === 'high' ? 2 : priority === 'medium' ? 5 : 10

  const dueDate = new Date(now)
  dueDate.setDate(dueDate.getDate() + daysToAdd)
  dueDate.setHours(17, 0, 0, 0)

  return dueDate
}

/**
 * Identify who is responsible for an action item
 * @param transcription - Full conversation text
 * @param actionItem - The action item
 * @returns Assigned person or undefined
 */
export function identifyOwner(transcription: string, actionItem: any): string | undefined {
  // Check if action explicitly mentions a person
  if (actionItem.mentionedPerson) {
    return actionItem.mentionedPerson
  }

  // Look for ownership patterns in source quote
  const source = actionItem.source || actionItem.description
  const sourceLower = source.toLowerCase()

  // Check for first-person commitments (rep/agent)
  if (/\b(I will|I'll|I'm going to|Let me|I can)\b/i.test(source)) {
    return 'Sales Rep'
  }

  // Check for second-person requests (customer)
  if (/\b(You will|You'll|You need to|Can you|Could you)\b/i.test(source)) {
    return 'Customer'
  }

  // Check for third-person mentions
  const namePattern = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g
  const names = source.match(namePattern)
  if (names && names.length > 0) {
    return names[0]
  }

  // Check for role mentions
  if (sourceLower.includes('team') || sourceLower.includes('manager')) {
    return 'Internal Team'
  }

  if (sourceLower.includes('customer') || sourceLower.includes('client')) {
    return 'Customer'
  }

  return undefined
}

/**
 * Detect commitments made during conversation
 * @param transcription - The conversation text
 * @returns Array of commitments
 */
export async function detectCommitments(transcription: string): Promise<Commitment[]> {
  if (!openai) {
    return generateMockCommitments(transcription)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert at identifying commitments and promises in conversations. Find all commitments made by either the sales rep or the customer.

Look for:
- Promises ("I will...", "We'll...")
- Agreements ("I agree to...", "We can...")
- Obligations ("I need to...", "You need to...")
- Scheduled actions ("I'll send by...", "You'll receive by...")

For each commitment, identify:
- who: "rep", "customer", or "both"
- what: What they committed to do
- when: When it will be done (if mentioned)
- confidence: How confident you are this is a real commitment (0-1)
- source: Direct quote

Return JSON with a "commitments" array.`,
        },
        {
          role: 'user',
          content: transcription.substring(0, 10000),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    const rawCommitments = result.commitments || []

    return rawCommitments.map((c: any) => ({
      who: c.who,
      what: c.what,
      when: c.when ? parseRelativeDate(c.when) : undefined,
      confidence: c.confidence || 0.8,
      source: c.source || c.what,
    }))
  } catch (error) {
    console.error('Error detecting commitments:', error)
    return generateMockCommitments(transcription)
  }
}

/**
 * Generate AI-powered follow-up action recommendations
 * @param analysis - Conversation analysis result
 * @returns Array of recommended follow-up actions
 */
export async function suggestFollowUpActions(
  analysis: ConversationAnalysis
): Promise<string[]> {
  if (!openai) {
    return [
      'Send follow-up email summarizing discussion points',
      'Schedule next check-in meeting',
      'Review and address any customer concerns',
    ]
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a sales strategy expert. Based on the conversation analysis, suggest 3-5 strategic follow-up actions that will help move the deal forward and maintain customer satisfaction.

Focus on:
- Building relationship
- Addressing concerns
- Moving to next stage
- Providing value
- Maintaining momentum

Return JSON with a "followUps" array of strings.`,
        },
        {
          role: 'user',
          content: JSON.stringify(analysis),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result.followUps || []
  } catch (error) {
    console.error('Error suggesting follow-ups:', error)
    return [
      'Send follow-up email summarizing discussion points',
      'Schedule next check-in meeting',
      'Review and address any customer concerns',
    ]
  }
}

/**
 * Generate executive summary of the meeting with action items
 * @param transcription - The conversation text
 * @param actionItems - Extracted action items
 * @returns Executive summary
 */
export async function generateMeetingSummary(
  transcription: string,
  actionItems: ActionItem[]
): Promise<string> {
  if (!openai) {
    return generateMockSummary(actionItems)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an executive assistant creating meeting summaries. Create a concise, professional summary that includes:

1. Meeting overview (2-3 sentences)
2. Key discussion points (3-5 bullets)
3. Decisions made
4. Next steps overview

Keep it under 200 words and focus on what matters most.`,
        },
        {
          role: 'user',
          content: `Transcription:\n${transcription.substring(0, 8000)}\n\nAction Items:\n${actionItems.map(a => `- ${a.title}`).join('\n')}`,
        },
      ],
      temperature: 0.3,
    })

    return response.choices[0].message.content || generateMockSummary(actionItems)
  } catch (error) {
    console.error('Error generating summary:', error)
    return generateMockSummary(actionItems)
  }
}

/**
 * Create a formatted task list from action items
 * @param actionItems - Array of action items
 * @returns Formatted task list string
 */
export function createTaskList(actionItems: ActionItem[]): string {
  const grouped = categorizeActions(actionItems)

  let taskList = '# Action Items\n\n'

  // Sort categories by importance
  const categoryOrder: ActionCategory[] = ['sales', 'follow-up', 'customer', 'technical', 'internal', 'administrative']

  for (const category of categoryOrder) {
    const items = grouped.get(category)
    if (!items || items.length === 0) continue

    taskList += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`

    // Sort by priority
    const sorted = items.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    sorted.forEach((item) => {
      const priorityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
      }

      taskList += `- ${priorityEmoji[item.priority]} **${item.title}**\n`
      taskList += `  - ${item.description}\n`
      if (item.assignedTo) {
        taskList += `  - Assigned to: ${item.assignedTo}\n`
      }
      if (item.dueDate) {
        taskList += `  - Due: ${item.dueDate.toLocaleDateString()}\n`
      }
      if (item.estimatedMinutes) {
        taskList += `  - Estimated time: ${item.estimatedMinutes} minutes\n`
      }
      taskList += '\n'
    })
  }

  return taskList
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Estimate time required to complete an action
 * @param action - The action item
 * @returns Estimated minutes
 */
function estimateTimeRequired(action: any): number {
  const text = `${action.title} ${action.description}`.toLowerCase()

  // Quick tasks
  if (text.includes('send email') || text.includes('forward')) {
    return 10
  }

  // Scheduling
  if (text.includes('schedule') || text.includes('book')) {
    return 15
  }

  // Reviews
  if (text.includes('review') || text.includes('check')) {
    return 30
  }

  // Creation tasks
  if (text.includes('create') || text.includes('prepare') || text.includes('draft')) {
    return 60
  }

  // Complex tasks
  if (text.includes('implement') || text.includes('configure') || text.includes('setup')) {
    return 120
  }

  return 30 // Default
}

/**
 * Calculate urgency score for an action
 * @param action - The action item
 * @returns Urgency score 0-100
 */
function calculateUrgencyScore(action: any): number {
  let score = 50 // Base score

  const text = `${action.title} ${action.description}`.toLowerCase()

  // Priority boost
  if (action.priority === 'critical') score += 30
  if (action.priority === 'high') score += 20
  if (action.priority === 'medium') score += 10

  // Urgency keywords
  PRIORITY_KEYWORDS.critical.forEach((keyword) => {
    if (text.includes(keyword)) score += 10
  })

  // Time sensitivity
  if (action.timeframe) {
    const timeframe = action.timeframe.toLowerCase()
    if (timeframe.includes('today')) score += 20
    if (timeframe.includes('tomorrow')) score += 10
  }

  return Math.min(100, score)
}

/**
 * Estimate likelihood of completion
 * @param action - The action item
 * @returns Completion likelihood 0-100
 */
function estimateCompletionLikelihood(action: any): number {
  let score = 70 // Base score

  // Has clear owner
  if (action.mentionedPerson) score += 10

  // Has deadline
  if (action.timeframe) score += 10

  // Clear and specific
  if (action.description && action.description.length > 20) score += 5

  // Has urgency
  if (action.urgencyIndicators && action.urgencyIndicators.length > 0) score += 5

  return Math.min(100, score)
}

/**
 * Extract relevant tags from action item
 * @param action - The action item
 * @returns Array of tags
 */
function extractTags(action: any): string[] {
  const tags: string[] = []
  const text = `${action.title} ${action.description}`.toLowerCase()

  // Action type tags
  if (text.includes('email')) tags.push('email')
  if (text.includes('meeting') || text.includes('call')) tags.push('meeting')
  if (text.includes('document') || text.includes('contract')) tags.push('document')
  if (text.includes('approval')) tags.push('approval')
  if (text.includes('payment') || text.includes('invoice')) tags.push('financial')

  return tags
}

/**
 * Detect dependencies between action items
 * @param items - Array of action items
 * @returns Map of item ID to dependent item IDs
 */
function detectDependencies(items: ActionItem[]): Map<string, string[]> {
  const dependencies = new Map<string, string[]>()

  // Simple dependency detection based on sequential logic
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const deps: string[] = []

    // Check if this item depends on previous items
    for (let j = 0; j < i; j++) {
      const prevItem = items[j]

      // Check for keywords indicating dependency
      if (
        item.description.toLowerCase().includes('after') ||
        item.description.toLowerCase().includes('once') ||
        item.description.toLowerCase().includes('following')
      ) {
        // Simple heuristic: depends on immediately previous item
        if (j === i - 1) {
          deps.push(prevItem.id)
        }
      }
    }

    if (deps.length > 0) {
      dependencies.set(item.id, deps)
    }
  }

  return dependencies
}

/**
 * Calculate risk of items becoming overdue
 * @param items - Array of action items
 * @returns Risk score 0-100
 */
function calculateOverdueRisk(items: ActionItem[]): number {
  if (items.length === 0) return 0

  const now = new Date()
  let riskScore = 0

  items.forEach((item) => {
    if (!item.dueDate) {
      // No deadline = moderate risk
      riskScore += 30
      return
    }

    const daysUntilDue = (item.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

    if (daysUntilDue < 0) {
      // Already overdue
      riskScore += 100
    } else if (daysUntilDue < 1) {
      // Due today
      riskScore += 80
    } else if (daysUntilDue < 2) {
      // Due tomorrow
      riskScore += 60
    } else if (daysUntilDue < 7) {
      // Due this week
      riskScore += 40
    } else {
      riskScore += 20
    }
  })

  return Math.min(100, riskScore / items.length)
}

/**
 * Calculate expected completion rate
 * @param items - Array of action items
 * @returns Completion rate 0-100
 */
function calculateExpectedCompletionRate(items: ActionItem[]): number {
  if (items.length === 0) return 100

  const totalLikelihood = items.reduce((sum, item) => sum + item.completionLikelihood, 0)
  return Math.round(totalLikelihood / items.length)
}

/**
 * Generate email draft for follow-ups
 * @param items - Array of action items
 * @param commitments - Array of commitments
 * @returns Email draft string
 */
function generateEmailDraft(items: ActionItem[], commitments: Commitment[]): string {
  const myCommitments = commitments.filter(c => c.who === 'rep' || c.who === 'both')
  const customerCommitments = commitments.filter(c => c.who === 'customer' || c.who === 'both')

  let email = 'Subject: Follow-up from our conversation\n\n'
  email += 'Hi,\n\n'
  email += 'Thank you for taking the time to speak with me today. I wanted to recap our discussion and confirm next steps:\n\n'

  if (myCommitments.length > 0) {
    email += 'What I\'ll do:\n'
    myCommitments.forEach((c) => {
      email += `- ${c.what}`
      if (c.when) {
        email += ` (by ${c.when.toLocaleDateString()})`
      }
      email += '\n'
    })
    email += '\n'
  }

  if (customerCommitments.length > 0) {
    email += 'What we discussed you would do:\n'
    customerCommitments.forEach((c) => {
      email += `- ${c.what}`
      if (c.when) {
        email += ` (by ${c.when.toLocaleDateString()})`
      }
      email += '\n'
    })
    email += '\n'
  }

  email += 'Please let me know if I missed anything or if you have any questions.\n\n'
  email += 'Best regards'

  return email
}

/**
 * Generate calendar event suggestions
 * @param items - Array of action items
 * @param deadlines - Array of deadlines
 * @returns Array of calendar events
 */
function generateCalendarEvents(
  items: ActionItem[],
  deadlines: Array<{ text: string; date: Date | null }>
): CalendarEvent[] {
  const events: CalendarEvent[] = []

  items.forEach((item) => {
    // Create events for scheduling actions
    if (item.title.toLowerCase().includes('schedule') || item.title.toLowerCase().includes('meeting')) {
      if (item.dueDate) {
        events.push({
          title: item.title,
          description: item.description,
          date: item.dueDate,
          duration: item.estimatedMinutes || 30,
          relatedActionId: item.id,
        })
      }
    }

    // Create reminder events for critical items
    if (item.priority === 'critical' && item.dueDate) {
      const reminderDate = new Date(item.dueDate)
      reminderDate.setHours(reminderDate.getHours() - 2) // 2 hours before

      events.push({
        title: `Reminder: ${item.title}`,
        description: `Don't forget to ${item.description}`,
        date: reminderDate,
        duration: 15,
        relatedActionId: item.id,
      })
    }
  })

  return events
}

/**
 * Save action items to database
 * @param recordingId - Recording ID
 * @param analysis - Action items analysis
 */
async function saveActionItemsToDatabase(
  recordingId: string,
  analysis: Partial<ActionItemsAnalysis>
): Promise<void> {
  try {
    // Update the analysis result with enhanced action items
    await prisma.analysisResult.update({
      where: { recordingId },
      data: {
        actionItems: {
          items: analysis.actionItems,
          commitments: analysis.commitments,
          summary: analysis.summary,
          metrics: {
            criticalActions: analysis.criticalActions,
            overdueRisk: analysis.overdueRisk,
            completionRate: analysis.completionRate,
          },
        },
      },
    })
  } catch (error) {
    console.error('Error saving action items to database:', error)
    // Non-critical error, don't throw
  }
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate mock action items when OpenAI is not available
 * @param transcription - The conversation text
 * @returns Mock analysis result
 */
function generateMockActionItems(transcription: string): ActionItemsAnalysis {
  const mockItems: ActionItem[] = [
    {
      id: 'mock_1',
      title: 'Send pricing proposal',
      description: 'Prepare and send detailed pricing proposal based on discussion',
      category: 'sales',
      priority: 'high',
      assignedTo: 'Sales Rep',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      estimatedMinutes: 60,
      status: 'pending',
      source: 'Mock data - OpenAI not configured',
      urgencyScore: 75,
      completionLikelihood: 85,
      tags: ['sales', 'document'],
      dependencies: [],
    },
    {
      id: 'mock_2',
      title: 'Schedule follow-up call',
      description: 'Book 30-minute follow-up call for next week',
      category: 'follow-up',
      priority: 'medium',
      assignedTo: 'Sales Rep',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      estimatedMinutes: 15,
      status: 'pending',
      source: 'Mock data - OpenAI not configured',
      urgencyScore: 60,
      completionLikelihood: 90,
      tags: ['meeting'],
      dependencies: [],
    },
    {
      id: 'mock_3',
      title: 'Review technical requirements',
      description: 'Customer to review and confirm technical requirements document',
      category: 'customer',
      priority: 'high',
      assignedTo: 'Customer',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      estimatedMinutes: 30,
      status: 'pending',
      source: 'Mock data - OpenAI not configured',
      urgencyScore: 70,
      completionLikelihood: 75,
      tags: ['document'],
      dependencies: [],
    },
  ]

  const mockCommitments: Commitment[] = [
    {
      who: 'rep',
      what: 'Send pricing proposal',
      when: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      confidence: 0.9,
      source: 'Mock data - OpenAI not configured',
    },
    {
      who: 'customer',
      what: 'Review technical requirements',
      when: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      confidence: 0.8,
      source: 'Mock data - OpenAI not configured',
    },
  ]

  return {
    actionItems: mockItems,
    commitments: mockCommitments,
    summary: generateMockSummary(mockItems),
    criticalActions: 0,
    overdueRisk: 25,
    completionRate: 85,
    emailDraft: generateEmailDraft(mockItems, mockCommitments),
    calendarEvents: [],
    dependencies: new Map(),
    recommendedFollowUps: [
      'Send follow-up email summarizing discussion points',
      'Schedule next check-in meeting',
      'Prepare pricing proposal with custom options',
    ],
  }
}

/**
 * Generate mock commitments
 * @param transcription - The conversation text
 * @returns Mock commitments
 */
function generateMockCommitments(transcription: string): Commitment[] {
  return [
    {
      who: 'rep',
      what: 'Follow up with additional information',
      confidence: 0.8,
      source: 'Mock data - OpenAI not configured',
    },
  ]
}

/**
 * Generate mock summary
 * @param actionItems - Array of action items
 * @returns Mock summary
 */
function generateMockSummary(actionItems: ActionItem[]): string {
  return `Meeting Summary (Mock Data - OpenAI not configured)

The conversation covered key business points and resulted in ${actionItems.length} action items.

Key topics discussed:
- Product requirements and specifications
- Pricing and timeline considerations
- Next steps and follow-up actions

Action items have been assigned and prioritized based on urgency and importance.`
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateActionItems,
  categorizeActions,
  assignPriority,
  extractDeadlines,
  identifyOwner,
  detectCommitments,
  suggestFollowUpActions,
  generateMeetingSummary,
  createTaskList,
  categorizeAction,
}

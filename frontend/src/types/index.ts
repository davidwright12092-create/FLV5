// User & Auth Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'user'
  organizationId: string
  avatar?: string
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  industry: string
  createdAt: string
}

// Recording Types
export interface Recording {
  id: string
  title: string
  userId: string
  organizationId: string
  s3Key: string
  s3Url: string
  duration: number // in seconds
  fileSize: number
  status: 'uploaded' | 'transcribing' | 'analyzing' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

// Transcription Types
export interface Transcription {
  id: string
  recordingId: string
  text: string
  confidence: number
  language: string
  speakerSegments: SpeakerSegment[]
  createdAt: string
}

export interface SpeakerSegment {
  speaker: string
  startTime: number
  endTime: number
  text: string
  confidence: number
}

// AI Analysis Types
export interface AnalysisResult {
  id: string
  recordingId: string
  processScore: ProcessScore
  salesOpportunities: SalesOpportunity[]
  sentiment: SentimentAnalysis
  actionItems: ActionItem[]
  confidence: number
  createdAt: string
}

export interface ProcessScore {
  overallScore: number
  steps: ProcessStep[]
  adherencePercentage: number
  missedSteps: string[]
  recommendations: string[]
}

export interface ProcessStep {
  name: string
  completed: boolean
  score: number
  timestamp?: number
  reasoning: string
}

export interface SalesOpportunity {
  type: 'pricing' | 'interest' | 'objection' | 'upsell' | 'follow-up'
  description: string
  priority: number // 1-10
  timestamp: number
  recommendation: string
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral'
  score: number // -1 to 1
  emotionalIndicators: string[]
  customerSatisfaction: number // 0-100
  technicianPerformance: number // 0-100
}

export interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'follow-up' | 'training' | 'process' | 'customer' | 'revenue'
  dueDate?: string
  assignedTo?: string
  completed: boolean
}

// Process Template Types
export interface ProcessTemplate {
  id: string
  organizationId: string
  name: string
  description: string
  steps: TemplateStep[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TemplateStep {
  id: string
  name: string
  description: string
  order: number
  required: boolean
  keywords: string[]
}

// Dashboard Analytics Types
export interface DashboardMetrics {
  totalRecordings: number
  averageProcessScore: number
  averageSentiment: number
  totalOpportunities: number
  completionRate: number
  periodComparison: {
    recordings: number
    processScore: number
    sentiment: number
  }
}

export interface PerformanceChart {
  date: string
  recordings: number
  averageScore: number
  opportunities: number
}

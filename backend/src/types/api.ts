// API Response Types for Recording Management

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Recording Types
export interface RecordingResponse {
  id: string
  title: string
  duration: number
  fileSize: number
  s3Key: string
  s3Url: string
  status: RecordingStatus
  userId: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  user?: UserSummary
  transcription?: TranscriptionSummary
  analysisResult?: AnalysisResultSummary
}

export enum RecordingStatus {
  UPLOADED = 'UPLOADED',
  TRANSCRIBING = 'TRANSCRIBING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface UserSummary {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
}

export interface TranscriptionSummary {
  id: string
  confidence?: number
  language?: string
}

export interface AnalysisResultSummary {
  id: string
  confidence?: number
}

// Upload Types
export interface UploadRecordingRequest {
  title: string
  file: File
}

export interface UploadRecordingResponse extends RecordingResponse {
  message: string
}

// Create Recording Types
export interface CreateRecordingRequest {
  title: string
  duration: number
  fileSize: number
  s3Key: string
  s3Url: string
}

export interface UpdateRecordingRequest {
  title?: string
  status?: RecordingStatus
}

// Recording Stats Types
export interface RecordingStatsResponse {
  totalRecordings: number
  recordingsByStatus: StatusCount[]
  totalStorage: number
  totalDuration: number
  recordingsByDate: Record<string, number>
}

export interface StatusCount {
  status: RecordingStatus
  count: number
}

// Date Range Types
export interface DateRangeQuery {
  startDate: string
  endDate: string
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface DateRangeResponse extends PaginatedResponse<RecordingResponse> {
  dateRange: {
    startDate: string
    endDate: string
  }
}

// Transcription Types
export interface TranscriptionResponse {
  id: string
  content: string
  language?: string
  confidence?: number
  segments?: string // JSON string of segments array
  recordingId: string
  processedAt: Date
  createdAt: Date
  updatedAt: Date
  recording?: {
    id: string
    title: string
    duration: number
    createdAt: Date
  }
}

export interface CreateTranscriptionRequest {
  content: string
  language?: string
  confidence?: number
  segments?: TranscriptionSegment[]
}

export interface TranscriptionSegment {
  text: string
  startTime: number
  endTime: number
  confidence?: number
}

// Search Types
export interface SearchTranscriptionsQuery {
  query: string
  page?: number
  limit?: number
}

export interface SearchTranscriptionsResponse extends PaginatedResponse<TranscriptionSearchResult> {
  query: string
}

export interface TranscriptionSearchResult extends TranscriptionResponse {
  matches: string[]
  matchCount: number
}

// File Upload Types
export interface FileUploadMetadata {
  originalname: string
  mimetype: string
  size: number
  buffer: Buffer
}

// S3 Types
export interface S3UploadResult {
  s3Key: string
  s3Url: string
}

// Error Types
export interface ApiError {
  message: string
  statusCode: number
  isOperational: boolean
}

// Query Parameter Types
export interface PaginationQuery {
  page?: string | number
  limit?: string | number
  sortBy?: string
  order?: 'asc' | 'desc'
}

// File Validation
export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export const ALLOWED_AUDIO_MIMETYPES = [
  'audio/mpeg', // mp3
  'audio/wav', // wav
  'audio/x-wav', // wav alternative
  'audio/mp4', // m4a
  'audio/x-m4a', // m4a alternative
  'audio/ogg', // ogg
] as const

export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB in bytes

export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'm4a', 'ogg'] as const

export type AudioFormat = typeof SUPPORTED_AUDIO_FORMATS[number]

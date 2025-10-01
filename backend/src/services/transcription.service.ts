import { SpeechClient } from '@google-cloud/speech'
import { Readable } from 'stream'
import prisma from '../config/database.js'
import { NotFoundError, ValidationError, AppError } from '../utils/errors.js'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

/**
 * Type definitions for transcription service
 */

/**
 * Speaker segment with timestamps and confidence
 */
export interface SpeakerSegment {
  speaker: string // e.g., "Speaker 1", "Speaker 2"
  text: string
  startTime: number // seconds
  endTime: number // seconds
  confidence: number // 0-1
  words: WordInfo[]
}

/**
 * Word-level information with timestamps
 */
export interface WordInfo {
  word: string
  startTime: number // seconds
  endTime: number // seconds
  confidence: number // 0-1
  speakerTag?: number
}

/**
 * Full transcription result
 */
export interface TranscriptionResult {
  id: string
  recordingId: string
  text: string // Full transcription text
  confidence: number // Overall confidence score
  language: string
  speakerSegments: SpeakerSegment[]
  duration: number // Total duration in seconds
  wordCount: number
  speakerCount: number
  createdAt: Date
}

/**
 * Progress callback for long-running transcriptions
 */
export type ProgressCallback = (progress: {
  status: 'started' | 'processing' | 'completed' | 'failed'
  progress: number // 0-100
  message: string
}) => void

/**
 * Audio format configuration
 */
interface AudioConfig {
  encoding: string
  sampleRateHertz: number
  languageCode: string
  enableSpeakerDiarization: boolean
  diarizationSpeakerCount?: number
  enableAutomaticPunctuation: boolean
  enableWordTimeOffsets: boolean
  model?: string
}

/**
 * Supported audio formats and their configurations
 */
const AUDIO_FORMAT_MAP: Record<string, string> = {
  'audio/mpeg': 'MP3',
  'audio/mp3': 'MP3',
  'audio/wav': 'LINEAR16',
  'audio/wave': 'LINEAR16',
  'audio/x-wav': 'LINEAR16',
  'audio/mp4': 'MP3',
  'audio/m4a': 'MP3',
  'audio/ogg': 'OGG_OPUS',
  'audio/opus': 'OGG_OPUS',
  'audio/webm': 'WEBM_OPUS',
  'audio/flac': 'FLAC',
}

// Initialize Google Cloud Speech client with graceful handling
let speechClient: SpeechClient | null = null
let isGoogleCloudConfigured = false

try {
  // Check if Google Cloud credentials are configured
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT) {
    speechClient = new SpeechClient()
    isGoogleCloudConfigured = true
    console.log('✅ Google Cloud Speech-to-Text initialized successfully')
  } else {
    console.warn('⚠️  Google Cloud credentials not configured - using mock transcriptions')
  }
} catch (error) {
  console.error('❌ Failed to initialize Google Cloud Speech client:', error)
  console.warn('⚠️  Falling back to mock transcription service')
}

// Initialize S3 client for audio file retrieval
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  } : undefined,
})

/**
 * Main transcription function - transcribes audio buffer
 *
 * @param audioBuffer - Audio file buffer to transcribe
 * @param mimeType - MIME type of the audio file
 * @param recordingId - Recording ID to associate with transcription
 * @param options - Optional transcription options
 * @returns Transcription result
 *
 * @example
 * ```typescript
 * const result = await transcribeAudio(
 *   audioBuffer,
 *   'audio/mp3',
 *   'recording-123',
 *   { language: 'en-US', speakerCount: 2 }
 * )
 * console.log(result.text)
 * ```
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string,
  recordingId: string,
  options: {
    language?: string
    speakerCount?: number
    onProgress?: ProgressCallback
  } = {}
): Promise<TranscriptionResult> {
  const { language = 'en-US', speakerCount, onProgress } = options

  // Validate recording exists
  const recording = await prisma.recording.findUnique({
    where: { id: recordingId },
  })

  if (!recording) {
    throw new NotFoundError('Recording not found')
  }

  // Update recording status
  await prisma.recording.update({
    where: { id: recordingId },
    data: { status: 'TRANSCRIBING' },
  })

  // Notify progress
  onProgress?.({
    status: 'started',
    progress: 0,
    message: 'Transcription started',
  })

  try {
    let transcriptionResult: TranscriptionResult

    if (!isGoogleCloudConfigured || !speechClient) {
      // Use mock transcription if Google Cloud is not configured
      console.log('Using mock transcription for recording:', recordingId)
      transcriptionResult = await generateMockTranscription(recordingId, audioBuffer, language)
    } else {
      // Use Google Cloud Speech-to-Text with retry logic
      transcriptionResult = await transcribeWithRetry(
        audioBuffer,
        mimeType,
        recordingId,
        language,
        speakerCount,
        onProgress
      )
    }

    // Save transcription to database
    const savedTranscription = await prisma.transcription.create({
      data: {
        recordingId,
        text: transcriptionResult.text,
        confidence: transcriptionResult.confidence,
        language: transcriptionResult.language,
        speakerSegments: transcriptionResult.speakerSegments as any,
      },
    })

    onProgress?.({
      status: 'completed',
      progress: 100,
      message: 'Transcription completed successfully',
    })

    return {
      ...transcriptionResult,
      id: savedTranscription.id,
      createdAt: savedTranscription.createdAt,
    }
  } catch (error) {
    console.error('Transcription failed:', error)

    // Update recording status to FAILED
    await prisma.recording.update({
      where: { id: recordingId },
      data: { status: 'FAILED' },
    })

    onProgress?.({
      status: 'failed',
      progress: 0,
      message: error instanceof Error ? error.message : 'Transcription failed',
    })

    // On failure, try to save mock transcription as fallback
    try {
      const mockResult = await generateMockTranscription(recordingId, audioBuffer, language)
      const savedTranscription = await prisma.transcription.create({
        data: {
          recordingId,
          text: mockResult.text + '\n\n[Note: This is a fallback transcription]',
          confidence: 0.3,
          language: mockResult.language,
          speakerSegments: mockResult.speakerSegments as any,
        },
      })

      return {
        ...mockResult,
        id: savedTranscription.id,
        createdAt: savedTranscription.createdAt,
        confidence: 0.3,
      }
    } catch (fallbackError) {
      throw new AppError('Transcription failed and fallback also failed', 500)
    }
  }
}

/**
 * Transcribe audio directly from S3 URL
 *
 * @param s3Key - S3 object key
 * @param recordingId - Recording ID to associate with transcription
 * @param options - Optional transcription options
 * @returns Transcription result
 *
 * @example
 * ```typescript
 * const result = await transcribeFromS3(
 *   'recordings/audio-123.mp3',
 *   'recording-123'
 * )
 * ```
 */
export async function transcribeFromS3(
  s3Key: string,
  recordingId: string,
  options: {
    language?: string
    speakerCount?: number
    onProgress?: ProgressCallback
  } = {}
): Promise<TranscriptionResult> {
  const { onProgress } = options

  onProgress?.({
    status: 'processing',
    progress: 10,
    message: 'Downloading audio from S3',
  })

  try {
    // Download audio file from S3
    const bucketName = process.env.AWS_S3_BUCKET || 'fieldlink-recordings'
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    })

    const response = await s3Client.send(command)

    if (!response.Body) {
      throw new AppError('Failed to download audio from S3', 500)
    }

    // Convert stream to buffer
    const audioBuffer = await streamToBuffer(response.Body as Readable)
    const mimeType = response.ContentType || 'audio/mp3'

    onProgress?.({
      status: 'processing',
      progress: 30,
      message: 'Audio downloaded, starting transcription',
    })

    // Transcribe the audio
    return await transcribeAudio(audioBuffer, mimeType, recordingId, {
      ...options,
      onProgress: (progress) => {
        // Adjust progress to account for download step (0-30% complete)
        const adjustedProgress = Math.round(30 + (progress.progress * 0.7))
        onProgress?.({
          ...progress,
          progress: adjustedProgress,
        })
      },
    })
  } catch (error) {
    console.error('S3 transcription failed:', error)
    throw new AppError(
      `Failed to transcribe from S3: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }
}

/**
 * Stream transcription for real-time audio processing
 *
 * @param audioStream - Readable audio stream
 * @param config - Audio configuration
 * @param onTranscript - Callback for receiving transcript segments
 * @returns Promise that resolves when stream ends
 *
 * @example
 * ```typescript
 * await streamTranscription(audioStream, {
 *   mimeType: 'audio/wav',
 *   language: 'en-US'
 * }, (transcript) => {
 *   console.log('Partial:', transcript.text)
 * })
 * ```
 */
export async function streamTranscription(
  audioStream: Readable,
  config: {
    mimeType: string
    language?: string
    sampleRate?: number
  },
  onTranscript: (transcript: {
    text: string
    isFinal: boolean
    confidence: number
  }) => void
): Promise<void> {
  const { mimeType, language = 'en-US', sampleRate = 16000 } = config

  if (!isGoogleCloudConfigured || !speechClient) {
    console.warn('Google Cloud not configured - streaming transcription not available')
    throw new AppError('Streaming transcription requires Google Cloud configuration', 503)
  }

  const encoding = AUDIO_FORMAT_MAP[mimeType.toLowerCase()]
  if (!encoding) {
    throw new ValidationError(`Unsupported audio format: ${mimeType}`)
  }

  const request = {
    config: {
      encoding: encoding as any,
      sampleRateHertz: sampleRate,
      languageCode: language,
      enableAutomaticPunctuation: true,
    },
    interimResults: true,
  }

  return new Promise((resolve, reject) => {
    try {
      const recognizeStream = speechClient!.streamingRecognize(request)

      recognizeStream.on('data', (data: any) => {
        const result = data.results[0]
        if (result && result.alternatives && result.alternatives[0]) {
          const transcript = result.alternatives[0].transcript
          const confidence = result.alternatives[0].confidence || 0
          onTranscript({
            text: transcript,
            isFinal: result.isFinal,
            confidence,
          })
        }
      })

      recognizeStream.on('error', (error: Error) => {
        console.error('Streaming transcription error:', error)
        reject(error)
      })

      recognizeStream.on('end', () => {
        resolve()
      })

      // Pipe audio stream to Google Cloud Speech
      audioStream.pipe(recognizeStream)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Transcribe with retry logic and exponential backoff
 */
async function transcribeWithRetry(
  audioBuffer: Buffer,
  mimeType: string,
  recordingId: string,
  language: string,
  speakerCount?: number,
  onProgress?: ProgressCallback,
  maxRetries: number = 3
): Promise<TranscriptionResult> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      onProgress?.({
        status: 'processing',
        progress: 20 + (attempt - 1) * 10,
        message: `Transcription attempt ${attempt}/${maxRetries}`,
      })

      return await performGoogleCloudTranscription(
        audioBuffer,
        mimeType,
        recordingId,
        language,
        speakerCount,
        onProgress
      )
    } catch (error) {
      lastError = error as Error
      console.error(`Transcription attempt ${attempt} failed:`, error)

      if (attempt < maxRetries) {
        // Exponential backoff: 2^attempt seconds
        const delayMs = Math.pow(2, attempt) * 1000
        console.log(`Retrying in ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }

  throw new AppError(
    `Transcription failed after ${maxRetries} attempts: ${lastError?.message}`,
    500
  )
}

/**
 * Perform actual Google Cloud Speech-to-Text transcription
 */
async function performGoogleCloudTranscription(
  audioBuffer: Buffer,
  mimeType: string,
  recordingId: string,
  language: string,
  speakerCount?: number,
  onProgress?: ProgressCallback
): Promise<TranscriptionResult> {
  if (!speechClient) {
    throw new AppError('Google Cloud Speech client not initialized', 500)
  }

  const encoding = AUDIO_FORMAT_MAP[mimeType.toLowerCase()]
  if (!encoding) {
    throw new ValidationError(`Unsupported audio format: ${mimeType}`)
  }

  onProgress?.({
    status: 'processing',
    progress: 40,
    message: 'Sending audio to Google Cloud Speech-to-Text',
  })

  // Prepare audio configuration
  const audioConfig: any = {
    encoding,
    languageCode: language,
    enableAutomaticPunctuation: true,
    enableWordTimeOffsets: true,
    model: 'latest_long', // Use latest long-form model for better accuracy
  }

  // Add sample rate for LINEAR16 (WAV) files
  if (encoding === 'LINEAR16') {
    audioConfig.sampleRateHertz = 16000
  }

  // Configure speaker diarization
  if (speakerCount && speakerCount > 1) {
    audioConfig.diarizationConfig = {
      enableSpeakerDiarization: true,
      minSpeakerCount: 2,
      maxSpeakerCount: speakerCount || 6,
    }
  }

  // Prepare the request
  const request = {
    audio: {
      content: audioBuffer.toString('base64'),
    },
    config: audioConfig,
  }

  onProgress?.({
    status: 'processing',
    progress: 60,
    message: 'Processing audio...',
  })

  // Perform transcription
  const [response] = await speechClient.recognize(request)

  onProgress?.({
    status: 'processing',
    progress: 80,
    message: 'Processing results...',
  })

  if (!response.results || response.results.length === 0) {
    throw new AppError('No transcription results returned from Google Cloud', 500)
  }

  // Process results
  const { text, confidence, speakerSegments, words } = processGoogleCloudResults(response.results)

  // Calculate statistics
  const wordCount = words.length
  const duration = words.length > 0 ? words[words.length - 1].endTime : 0
  const speakerSet = new Set(words.filter(w => w.speakerTag).map(w => w.speakerTag))
  const speakerCountDetected = speakerSet.size

  return {
    id: '', // Will be set when saved to database
    recordingId,
    text,
    confidence,
    language,
    speakerSegments,
    duration,
    wordCount,
    speakerCount: speakerCountDetected || 1,
    createdAt: new Date(),
  }
}

/**
 * Process Google Cloud Speech-to-Text results
 */
function processGoogleCloudResults(results: any[]): {
  text: string
  confidence: number
  speakerSegments: SpeakerSegment[]
  words: WordInfo[]
} {
  const allWords: WordInfo[] = []
  let totalConfidence = 0
  let confidenceCount = 0

  // Extract all words with timestamps and speaker tags
  for (const result of results) {
    const alternative = result.alternatives[0]
    if (!alternative) continue

    totalConfidence += alternative.confidence || 0
    confidenceCount++

    if (alternative.words) {
      for (const wordInfo of alternative.words) {
        const word: WordInfo = {
          word: wordInfo.word,
          startTime: parseGoogleTime(wordInfo.startTime),
          endTime: parseGoogleTime(wordInfo.endTime),
          confidence: alternative.confidence || 0,
          speakerTag: wordInfo.speakerTag,
        }
        allWords.push(word)
      }
    }
  }

  // Calculate overall confidence
  const overallConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0

  // Group words by speaker
  const speakerSegments = groupWordsBySpeaker(allWords)

  // Build full text
  const text = speakerSegments
    .map(segment => `${segment.speaker}: ${segment.text}`)
    .join('\n\n')

  return {
    text,
    confidence: overallConfidence,
    speakerSegments,
    words: allWords,
  }
}

/**
 * Parse Google Cloud timestamp format to seconds
 */
function parseGoogleTime(time: any): number {
  if (!time) return 0
  const seconds = parseInt(time.seconds || '0', 10)
  const nanos = parseInt(time.nanos || '0', 10)
  return seconds + nanos / 1e9
}

/**
 * Group words by speaker into segments
 */
function groupWordsBySpeaker(words: WordInfo[]): SpeakerSegment[] {
  if (words.length === 0) return []

  const segments: SpeakerSegment[] = []
  let currentSpeaker: number | undefined = words[0].speakerTag
  let currentWords: WordInfo[] = []

  for (const word of words) {
    if (word.speakerTag !== currentSpeaker && currentWords.length > 0) {
      // Create segment for previous speaker
      segments.push(createSpeakerSegment(currentSpeaker || 1, currentWords))
      currentWords = []
    }
    currentSpeaker = word.speakerTag
    currentWords.push(word)
  }

  // Add final segment
  if (currentWords.length > 0) {
    segments.push(createSpeakerSegment(currentSpeaker || 1, currentWords))
  }

  return segments
}

/**
 * Create a speaker segment from words
 */
function createSpeakerSegment(speakerTag: number, words: WordInfo[]): SpeakerSegment {
  const text = words.map(w => w.word).join(' ')
  const startTime = words[0].startTime
  const endTime = words[words.length - 1].endTime
  const avgConfidence = words.reduce((sum, w) => sum + w.confidence, 0) / words.length

  return {
    speaker: `Speaker ${speakerTag}`,
    text,
    startTime,
    endTime,
    confidence: avgConfidence,
    words,
  }
}

/**
 * Generate mock transcription for testing/demo purposes
 */
async function generateMockTranscription(
  recordingId: string,
  audioBuffer: Buffer,
  language: string
): Promise<TranscriptionResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Generate mock data based on buffer size
  const durationSeconds = Math.min(Math.max(audioBuffer.length / 16000, 30), 600) // 30s to 10min
  const wordCount = Math.floor(durationSeconds * 2.5) // ~150 words per minute

  const mockWords: WordInfo[] = []
  const mockPhrases = [
    'Hello, thank you for calling.',
    'How can I help you today?',
    'I understand your concern.',
    'Let me check that for you.',
    'Yes, I can assist with that.',
    'Can you provide more details?',
    'That sounds great.',
    'I will follow up on this.',
    'Is there anything else I can help with?',
    'Thank you for your time.',
  ]

  let currentTime = 0
  let currentSpeaker = 1

  // Generate mock words and segments
  while (mockWords.length < wordCount) {
    const phrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)]
    const words = phrase.split(' ')

    for (const word of words) {
      const wordDuration = 0.3 + Math.random() * 0.3
      mockWords.push({
        word,
        startTime: currentTime,
        endTime: currentTime + wordDuration,
        confidence: 0.85 + Math.random() * 0.1,
        speakerTag: currentSpeaker,
      })
      currentTime += wordDuration
    }

    // Occasionally switch speakers
    if (Math.random() > 0.7) {
      currentSpeaker = currentSpeaker === 1 ? 2 : 1
    }

    // Add pause between phrases
    currentTime += 0.5 + Math.random() * 0.5
  }

  const speakerSegments = groupWordsBySpeaker(mockWords)
  const text = speakerSegments
    .map(segment => `${segment.speaker}: ${segment.text}`)
    .join('\n\n')

  return {
    id: '',
    recordingId,
    text: text + '\n\n[Note: Mock transcription - Google Cloud Speech-to-Text not configured]',
    confidence: 0.5,
    language,
    speakerSegments,
    duration: currentTime,
    wordCount: mockWords.length,
    speakerCount: 2,
    createdAt: new Date(),
  }
}

/**
 * Convert stream to buffer
 */
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

/**
 * Get transcription by recording ID
 *
 * @param recordingId - Recording ID
 * @returns Transcription result or null if not found
 */
export async function getTranscription(recordingId: string): Promise<TranscriptionResult | null> {
  const transcription = await prisma.transcription.findUnique({
    where: { recordingId },
  })

  if (!transcription) {
    return null
  }

  const speakerSegments = transcription.speakerSegments as unknown as SpeakerSegment[]
  const words = speakerSegments.flatMap(segment => segment.words)

  return {
    id: transcription.id,
    recordingId: transcription.recordingId,
    text: transcription.text,
    confidence: transcription.confidence,
    language: transcription.language,
    speakerSegments,
    duration: words.length > 0 ? words[words.length - 1].endTime : 0,
    wordCount: words.length,
    speakerCount: new Set(speakerSegments.map(s => s.speaker)).size,
    createdAt: transcription.createdAt,
  }
}

/**
 * Delete transcription by recording ID
 *
 * @param recordingId - Recording ID
 */
export async function deleteTranscription(recordingId: string): Promise<void> {
  await prisma.transcription.delete({
    where: { recordingId },
  })
}

/**
 * Check if Google Cloud Speech-to-Text is properly configured
 *
 * @returns True if configured and working
 */
export function isTranscriptionServiceAvailable(): boolean {
  return isGoogleCloudConfigured && speechClient !== null
}

/**
 * Get supported audio formats
 *
 * @returns Array of supported MIME types
 */
export function getSupportedFormats(): string[] {
  return Object.keys(AUDIO_FORMAT_MAP)
}

/**
 * Validate audio format
 *
 * @param mimeType - MIME type to validate
 * @returns True if supported
 */
export function isSupportedFormat(mimeType: string): boolean {
  return mimeType.toLowerCase() in AUDIO_FORMAT_MAP
}

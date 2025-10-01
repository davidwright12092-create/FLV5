import AWS from 'aws-sdk'
import { AppError } from '../utils/errors.js'

// Configure AWS S3
let s3: AWS.S3 | null = null

try {
  // Only initialize S3 if credentials are provided
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    })
  }
} catch (error) {
  console.warn('AWS S3 not configured. Upload features will not be available.')
}

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'fieldlink-recordings'
const PRESIGNED_URL_EXPIRY = 3600 // 1 hour in seconds

/**
 * Check if S3 is configured and available
 */
function checkS3Available(): void {
  if (!s3) {
    throw new AppError(
      'S3 upload service is not configured. Please set AWS credentials in environment variables.',
      503
    )
  }
}

/**
 * Upload file to S3
 * @param file - The file buffer to upload
 * @param organizationId - Organization ID for folder structure
 * @param filename - Original filename
 * @param mimetype - File mimetype
 * @returns S3 key and URL
 */
export async function uploadToS3(
  file: Buffer,
  organizationId: string,
  filename: string,
  mimetype: string
): Promise<{ s3Key: string; s3Url: string }> {
  checkS3Available()

  try {
    // Generate unique key with organization folder structure
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const s3Key = `recordings/${organizationId}/${timestamp}-${sanitizedFilename}`

    const params: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: file,
      ContentType: mimetype,
      ServerSideEncryption: 'AES256',
      Metadata: {
        organizationId,
        uploadedAt: new Date().toISOString(),
      },
    }

    const result = await s3!.upload(params).promise()

    return {
      s3Key,
      s3Url: result.Location,
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    throw new AppError('Failed to upload file to S3', 500)
  }
}

/**
 * Delete file from S3
 * @param s3Key - The S3 key of the file to delete
 */
export async function deleteFromS3(s3Key: string): Promise<void> {
  checkS3Available()

  try {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
    }

    await s3!.deleteObject(params).promise()
  } catch (error) {
    console.error('S3 delete error:', error)
    // Don't throw error on delete failures - log and continue
    console.warn(`Failed to delete file from S3: ${s3Key}`)
  }
}

/**
 * Generate presigned URL for file playback
 * @param s3Key - The S3 key of the file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Presigned URL
 */
export async function generatePresignedUrl(
  s3Key: string,
  expiresIn: number = PRESIGNED_URL_EXPIRY
): Promise<string> {
  checkS3Available()

  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Expires: expiresIn,
    }

    const url = await s3!.getSignedUrlPromise('getObject', params)
    return url
  } catch (error) {
    console.error('S3 presigned URL error:', error)
    throw new AppError('Failed to generate presigned URL', 500)
  }
}

/**
 * Validate file type for audio recordings
 * @param mimetype - File mimetype
 * @returns boolean indicating if file type is valid
 */
export function validateFileType(mimetype: string): boolean {
  const allowedTypes = [
    'audio/mpeg', // mp3
    'audio/wav', // wav
    'audio/x-wav', // wav alternative
    'audio/mp4', // m4a
    'audio/x-m4a', // m4a alternative
    'audio/ogg', // ogg
  ]

  return allowedTypes.includes(mimetype)
}

/**
 * Validate file size (max 100MB)
 * @param size - File size in bytes
 * @returns boolean indicating if file size is valid
 */
export function validateFileSize(size: number): boolean {
  const MAX_SIZE = 100 * 1024 * 1024 // 100MB in bytes
  return size <= MAX_SIZE
}

import multer from 'multer'
import { Request } from 'express'
import { ValidationError } from '../utils/errors.js'
import { validateFileType, validateFileSize } from '../services/upload.service.js'

// Configure multer to store files in memory as buffers
const storage = multer.memoryStorage()

// File filter for audio files only
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!validateFileType(file.mimetype)) {
    cb(
      new ValidationError(
        'Invalid file type. Only mp3, wav, m4a, and ogg files are allowed.'
      )
    )
    return
  }
  cb(null, true)
}

// Configure multer with limits
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 1, // Only allow 1 file per upload
  },
})

// Error handler for multer errors
export function handleMulterError(
  error: any,
  req: Request,
  res: any,
  next: any
) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new ValidationError('File size exceeds 100MB limit'))
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(new ValidationError('Only one file can be uploaded at a time'))
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ValidationError('Unexpected field in upload'))
    }
    return next(new ValidationError(`Upload error: ${error.message}`))
  }
  next(error)
}

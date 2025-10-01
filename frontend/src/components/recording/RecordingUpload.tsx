import React, { useState, useRef, DragEvent, ChangeEvent } from 'react'
import Card, { CardHeader, CardBody, CardFooter } from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import {
  Upload,
  File,
  CheckCircle,
  XCircle,
  X,
  Music,
  FileAudio,
  Loader2,
  AlertCircle,
  Tag,
  Calendar,
  User,
} from 'lucide-react'

// Types
export interface RecordingFile {
  id: string
  file: File
  name: string
  size: number
  format: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export interface RecordingMetadata {
  title: string
  customerName: string
  date: string
  tags: string
}

interface RecordingUploadProps {
  onUploadComplete?: (files: RecordingFile[], metadata: RecordingMetadata) => void
  maxFileSize?: number // in MB
  maxFiles?: number
}

// Constants
const ACCEPTED_FORMATS = ['mp3', 'wav', 'm4a', 'ogg']
const DEFAULT_MAX_FILE_SIZE = 100 // MB
const DEFAULT_MAX_FILES = 10

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
}

const validateFile = (
  file: File,
  maxFileSize: number
): { valid: boolean; error?: string } => {
  const extension = getFileExtension(file.name)

  if (!ACCEPTED_FORMATS.includes(extension)) {
    return {
      valid: false,
      error: `Invalid format. Accepted: ${ACCEPTED_FORMATS.join(', ')}`,
    }
  }

  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxFileSize) {
    return {
      valid: false,
      error: `File too large. Max size: ${maxFileSize}MB`,
    }
  }

  return { valid: true }
}

const RecordingUpload: React.FC<RecordingUploadProps> = ({
  onUploadComplete,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  maxFiles = DEFAULT_MAX_FILES,
}) => {
  const [files, setFiles] = useState<RecordingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [metadata, setMetadata] = useState<RecordingMetadata>({
    title: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
  })

  // Handle drag events
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  // Handle file input change
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      processFiles(selectedFiles)
    }
  }

  // Process and validate files
  const processFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const processedFiles: RecordingFile[] = newFiles.map((file) => {
      const validation = validateFile(file, maxFileSize)
      return {
        id: `${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        format: getFileExtension(file.name),
        status: validation.valid ? 'pending' : 'error',
        progress: 0,
        error: validation.error,
      }
    })

    setFiles((prev) => [...prev, ...processedFiles])
  }

  // Remove file from list
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  // Simulate file upload with progress
  const simulateUpload = (fileId: string): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: 'uploading',
                  progress: Math.min(Math.round(progress), 100),
                }
              : f
          )
        )

        if (progress >= 100) {
          clearInterval(interval)
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, status: 'success', progress: 100 }
                : f
            )
          )
          resolve()
        }
      }, 200)
    })
  }

  // Handle upload
  const handleUpload = async () => {
    const validFiles = files.filter((f) => f.status === 'pending')

    if (validFiles.length === 0) {
      alert('No valid files to upload')
      return
    }

    if (!metadata.title.trim()) {
      alert('Please provide a title')
      return
    }

    setIsUploading(true)
    setUploadComplete(false)

    // Upload files in batches
    for (const file of validFiles) {
      await simulateUpload(file.id)
    }

    setIsUploading(false)
    setUploadComplete(true)

    // Call completion callback
    if (onUploadComplete) {
      onUploadComplete(files, metadata)
    }
  }

  // Reset form
  const handleReset = () => {
    setFiles([])
    setMetadata({
      title: '',
      customerName: '',
      date: new Date().toISOString().split('T')[0],
      tags: '',
    })
    setUploadComplete(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Get file icon
  const getFileIcon = (format: string) => {
    switch (format) {
      case 'mp3':
        return <Music className="text-brand-purple" size={20} />
      case 'wav':
        return <FileAudio className="text-brand-blue" size={20} />
      case 'm4a':
        return <Music className="text-brand-cyan" size={20} />
      case 'ogg':
        return <FileAudio className="text-brand-orange" size={20} />
      default:
        return <File className="text-gray-400" size={20} />
    }
  }

  // Get status icon
  const getStatusIcon = (status: RecordingFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="text-brand-blue animate-spin" size={20} />
      case 'success':
        return <CheckCircle className="text-success-500" size={20} />
      case 'error':
        return <XCircle className="text-error-500" size={20} />
      default:
        return null
    }
  }

  const hasValidFiles = files.some((f) => f.status === 'pending')
  const hasUploadingFiles = files.some((f) => f.status === 'uploading')
  const allFilesUploaded =
    files.length > 0 && files.every((f) => f.status === 'success')

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card variant="elevated" padding="lg" rounded="3xl">
        <CardHeader
          title="Upload Recordings"
          subtitle="Upload audio files with customer information and metadata"
        />

        <CardBody>
          {/* Success Message */}
          {uploadComplete && allFilesUploaded && (
            <div className="mb-6 p-4 bg-gradient-to-r from-success-50 to-success-100 border-l-4 border-success-500 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-success-600 mt-0.5" size={24} />
                <div>
                  <h4 className="font-semibold text-success-900">
                    Upload Complete!
                  </h4>
                  <p className="text-sm text-success-700 mt-1">
                    {files.length} file{files.length > 1 ? 's' : ''} successfully
                    uploaded
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              isDragging
                ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-brand-cyan/10 scale-[1.02]'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".mp3,.wav,.m4a,.ogg"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <div
                className={`p-4 rounded-2xl transition-all duration-300 ${
                  isDragging
                    ? 'bg-gradient-to-br from-primary-500 to-brand-blue scale-110'
                    : 'bg-gradient-to-br from-primary-400 to-brand-cyan'
                }`}
              >
                <Upload className="text-white" size={32} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isDragging ? 'Drop files here' : 'Upload Audio Files'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop or click to browse
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  Browse Files
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Supported formats: {ACCEPTED_FORMATS.join(', ')}</span>
                <span>•</span>
                <span>Max size: {maxFileSize}MB</span>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-gray-900 mb-3">
                Files ({files.length}/{maxFiles})
              </h4>

              {files.map((file) => (
                <div
                  key={file.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    file.status === 'error'
                      ? 'bg-error-50 border-error-200'
                      : file.status === 'success'
                      ? 'bg-success-50 border-success-200'
                      : file.status === 'uploading'
                      ? 'bg-primary-50 border-primary-200'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getFileIcon(file.format)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {formatFileSize(file.size)} • {file.format.toUpperCase()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status)}
                          {file.status === 'pending' && (
                            <button
                              onClick={() => removeFile(file.id)}
                              className="text-gray-400 hover:text-error-600 transition-colors"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {file.status === 'uploading' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Uploading...</span>
                            <span>{file.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-500 to-brand-blue transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {file.status === 'error' && file.error && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-error-600">
                          <AlertCircle size={16} />
                          <span>{file.error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Metadata Form */}
          {files.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-2xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="text-brand-purple" size={20} />
                Recording Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Title"
                    placeholder="Enter recording title"
                    value={metadata.title}
                    onChange={(e) =>
                      setMetadata({ ...metadata, title: e.target.value })
                    }
                    leftIcon={<FileAudio size={18} />}
                    fullWidth
                    required
                  />
                </div>

                <Input
                  label="Customer Name"
                  placeholder="Enter customer name"
                  value={metadata.customerName}
                  onChange={(e) =>
                    setMetadata({ ...metadata, customerName: e.target.value })
                  }
                  leftIcon={<User size={18} />}
                  fullWidth
                />

                <Input
                  label="Date"
                  type="date"
                  value={metadata.date}
                  onChange={(e) =>
                    setMetadata({ ...metadata, date: e.target.value })
                  }
                  leftIcon={<Calendar size={18} />}
                  fullWidth
                />

                <div className="md:col-span-2">
                  <Input
                    label="Tags"
                    placeholder="Enter tags (comma-separated)"
                    value={metadata.tags}
                    onChange={(e) =>
                      setMetadata({ ...metadata, tags: e.target.value })
                    }
                    leftIcon={<Tag size={18} />}
                    helperText="Separate tags with commas (e.g., support, urgent, follow-up)"
                    fullWidth
                  />
                </div>
              </div>
            </div>
          )}
        </CardBody>

        {/* Footer Actions */}
        {files.length > 0 && (
          <CardFooter divider>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {hasValidFiles && (
                  <span className="flex items-center gap-1">
                    <File size={16} />
                    {files.filter((f) => f.status === 'pending').length} ready to
                    upload
                  </span>
                )}
                {allFilesUploaded && (
                  <span className="flex items-center gap-1 text-success-600">
                    <CheckCircle size={16} />
                    All files uploaded
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleReset}
                  disabled={isUploading}
                >
                  Clear All
                </Button>

                {!allFilesUploaded ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleUpload}
                    disabled={!hasValidFiles || isUploading}
                    loading={hasUploadingFiles}
                  >
                    <Upload size={16} />
                    {hasUploadingFiles
                      ? 'Uploading...'
                      : `Upload ${files.filter((f) => f.status === 'pending').length} File${files.filter((f) => f.status === 'pending').length > 1 ? 's' : ''}`}
                  </Button>
                ) : (
                  <Button variant="primary" size="md" onClick={handleReset}>
                    Upload More
                  </Button>
                )}
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

export default RecordingUpload

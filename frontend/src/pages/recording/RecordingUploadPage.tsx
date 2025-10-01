import { useState } from 'react'
import {
  Upload,
  FileAudio,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Home,
  Music,
  Clock,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  FileCheck,
  TrendingUp,
  Zap,
  Shield,
} from 'lucide-react'
import { PageLayout } from '../../components/layout'
import RecordingUpload, {
  RecordingFile,
  RecordingMetadata,
} from '../../components/recording/RecordingUpload'
import Button from '../../components/ui/Button'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'

// Types
interface UploadedRecording {
  id: string
  title: string
  fileName: string
  fileSize: number
  uploadedAt: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  estimatedTime?: string
}

interface FAQItem {
  question: string
  answer: string
  isOpen: boolean
}

const RecordingUploadPage = () => {
  // State management
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<RecordingFile[]>([])
  const [uploadedMetadata, setUploadedMetadata] = useState<RecordingMetadata | null>(null)
  const [recentUploads, setRecentUploads] = useState<UploadedRecording[]>([
    {
      id: '1',
      title: 'Customer Support Call - John Smith',
      fileName: 'support_call_001.mp3',
      fileSize: 15.2 * 1024 * 1024,
      uploadedAt: '2024-01-15T10:30:00',
      status: 'completed',
      progress: 100,
    },
    {
      id: '2',
      title: 'Field Service Assessment',
      fileName: 'field_assessment_042.wav',
      fileSize: 28.5 * 1024 * 1024,
      uploadedAt: '2024-01-15T09:15:00',
      status: 'processing',
      progress: 67,
      estimatedTime: '2 minutes',
    },
    {
      id: '3',
      title: 'Product Demo Recording',
      fileName: 'demo_recording.m4a',
      fileSize: 12.8 * 1024 * 1024,
      uploadedAt: '2024-01-15T08:45:00',
      status: 'completed',
      progress: 100,
    },
    {
      id: '4',
      title: 'Training Session Audio',
      fileName: 'training_jan_14.ogg',
      fileSize: 45.3 * 1024 * 1024,
      uploadedAt: '2024-01-14T16:20:00',
      status: 'completed',
      progress: 100,
    },
    {
      id: '5',
      title: 'Client Meeting Notes',
      fileName: 'meeting_notes_001.mp3',
      fileSize: 8.9 * 1024 * 1024,
      uploadedAt: '2024-01-14T14:10:00',
      status: 'failed',
      progress: 0,
    },
  ])

  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      question: 'What audio formats are supported?',
      answer:
        'We support MP3, WAV, M4A, and OGG formats. These cover most common audio recording formats used in professional settings. For best results, we recommend using WAV or M4A formats as they provide higher quality audio for transcription and analysis.',
      isOpen: false,
    },
    {
      question: 'How long does processing take?',
      answer:
        'Processing time depends on the file size and audio length. Generally, a 10-minute recording takes 1-2 minutes to process. You can continue working while your files are being processed, and we\'ll notify you when they\'re ready.',
      isOpen: false,
    },
    {
      question: 'Can I upload multiple files at once?',
      answer:
        'Yes! You can upload up to 10 files at once. Simply drag and drop multiple files into the upload area or select multiple files from your computer. Each file can be up to 100MB in size.',
      isOpen: false,
    },
    {
      question: 'What happens after I upload?',
      answer:
        'After uploading, your recordings are automatically transcribed and analyzed. We extract key insights, sentiment analysis, and important moments. You\'ll receive a notification when processing is complete, and you can access the full analysis from your recordings dashboard.',
      isOpen: false,
    },
  ])

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
  }

  // Handle upload completion
  const handleUploadComplete = (files: RecordingFile[], metadata: RecordingMetadata) => {
    setUploadedFiles(files)
    setUploadedMetadata(metadata)
    setUploadSuccess(true)

    // Add to recent uploads
    const newUploads: UploadedRecording[] = files
      .filter((f) => f.status === 'success')
      .map((file) => ({
        id: file.id,
        title: metadata.title,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'processing' as const,
        progress: 15,
        estimatedTime: `${Math.ceil(file.size / (1024 * 1024) / 2)} minutes`,
      }))

    setRecentUploads([...newUploads, ...recentUploads].slice(0, 5))

    // Scroll to success message
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle upload more
  const handleUploadMore = () => {
    setUploadSuccess(false)
    setUploadedFiles([])
    setUploadedMetadata(null)
  }

  // Toggle FAQ item
  const toggleFaqItem = (index: number) => {
    setFaqItems(
      faqItems.map((item, i) => ({
        ...item,
        isOpen: i === index ? !item.isOpen : item.isOpen,
      }))
    )
  }

  // Handle recent upload actions
  const handleViewRecording = (id: string) => {
    console.log('View recording:', id)
    // Navigate to recording detail page
  }

  const handleDeleteRecording = (id: string) => {
    if (confirm('Are you sure you want to delete this recording?')) {
      setRecentUploads(recentUploads.filter((r) => r.id !== id))
    }
  }

  // Get status badge
  const getStatusBadge = (status: UploadedRecording['status']) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-brand-blue/10 to-brand-cyan/10 text-brand-blue border border-brand-blue/20">
            <Clock className="w-3 h-3 animate-pulse" />
            Processing
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-success-50 to-success-100 text-success-700 border border-success-200">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-error-50 to-error-100 text-error-700 border border-error-200">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        )
    }
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Home className="w-4 h-4" />
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-brand-cyan transition-colors cursor-pointer">
            Dashboard
          </span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-brand-cyan transition-colors cursor-pointer">
            Recordings
          </span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Upload</span>
        </nav>

        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-cyan via-brand-blue to-brand-purple p-0.5">
            <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center">
              <Upload className="w-10 h-10 text-brand-blue" />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-purple bg-clip-text text-transparent">
              Upload Recordings
            </h1>
            <p className="text-gray-600 mt-2 text-lg max-w-2xl mx-auto">
              Upload your audio files for automatic transcription and analysis. Supported
              formats: <span className="font-semibold text-brand-blue">MP3, WAV, M4A, OGG</span>{' '}
              • Maximum file size: <span className="font-semibold text-brand-purple">100MB</span>
            </p>
          </div>
        </div>

        {/* Success State */}
        {uploadSuccess && uploadedFiles.length > 0 && uploadedMetadata && (
          <Card variant="elevated" padding="lg" rounded="3xl">
            <div className="text-center py-8 space-y-6">
              {/* Success Animation Icon */}
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-gradient-to-r from-success-400 to-success-600 rounded-full animate-ping opacity-30"></div>
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-success-400 to-success-600 shadow-xl">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Success Message */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Upload Successful!
                </h2>
                <p className="text-gray-600 text-lg">
                  {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded
                  successfully
                </p>
              </div>

              {/* Uploaded File Details */}
              <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-2xl border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue">
                      <FileAudio className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {uploadedMetadata.title}
                      </h3>
                      {uploadedMetadata.customerName && (
                        <p className="text-gray-600 mt-1">
                          Customer: {uploadedMetadata.customerName}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {uploadedFiles.map((file) => (
                          <span
                            key={file.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200"
                          >
                            <FileAudio className="w-3 h-3 text-brand-cyan" />
                            {file.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Processing Info */}
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-brand-blue/20">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-brand-blue/10 to-brand-cyan/10">
                      <Clock className="w-5 h-5 text-brand-blue animate-pulse" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 text-sm">Processing Started</p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        Estimated time: 2-3 minutes
                      </p>
                    </div>
                    <div className="w-16 h-16">
                      <svg className="transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          className="stroke-current text-gray-200"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          className="stroke-current text-brand-cyan"
                          strokeWidth="3"
                          strokeDasharray="100"
                          strokeDashoffset="75"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="primary" size="lg" onClick={handleUploadMore}>
                  <Upload className="w-5 h-5" />
                  Upload More Files
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => console.log('View all recordings')}
                >
                  <Music className="w-5 h-5" />
                  View All Recordings
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => console.log('View this recording')}
                >
                  <Eye className="w-5 h-5" />
                  View This Recording
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Upload Component */}
        {!uploadSuccess && (
          <div>
            <RecordingUpload onUploadComplete={handleUploadComplete} />
          </div>
        )}

        {/* Upload Guidelines */}
        <Card variant="elevated" padding="lg" rounded="3xl">
          <CardHeader
            title="Upload Guidelines"
            subtitle="Best practices for optimal results"
          />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supported Formats */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-cyan/5 to-brand-blue/5 border border-brand-cyan/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue">
                    <FileCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Supported Formats</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success-600" />
                        <span>
                          <strong>MP3</strong> - Most common, good compression
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success-600" />
                        <span>
                          <strong>WAV</strong> - Uncompressed, highest quality
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success-600" />
                        <span>
                          <strong>M4A</strong> - Apple format, excellent quality
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success-600" />
                        <span>
                          <strong>OGG</strong> - Open format, good compression
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* File Size */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-purple/5 to-brand-pink/5 border border-brand-purple/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-brand-purple to-brand-pink">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Maximum File Size</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-brand-purple" />
                        <span>Single file: Up to 100MB</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-brand-purple" />
                        <span>Multiple files: Up to 10 files at once</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-brand-purple" />
                        <span>Typical 1-hour recording: 30-60MB</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Audio Quality */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 border border-brand-blue/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Best Practices for Quality
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-brand-blue" />
                        <span>Use clear audio with minimal background noise</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-brand-blue" />
                        <span>Record at minimum 16kHz sample rate</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-brand-blue" />
                        <span>Ensure speakers are clearly audible</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-brand-blue" />
                        <span>Avoid multiple overlapping conversations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Processing Time */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-orange/5 to-brand-yellow/5 border border-brand-orange/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-brand-orange to-brand-yellow">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Processing Time Estimates
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-orange" />
                        <span>5-minute audio: ~30 seconds</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-orange" />
                        <span>15-minute audio: ~1-2 minutes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-orange" />
                        <span>30-minute audio: ~2-3 minutes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-orange" />
                        <span>1-hour audio: ~4-5 minutes</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Recent Uploads */}
        <Card variant="elevated" padding="lg" rounded="3xl">
          <CardHeader
            title="Recent Uploads"
            subtitle="Your last 5 uploaded recordings"
          />
          <CardBody>
            {recentUploads.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                  <FileAudio className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">No recent uploads</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your uploaded recordings will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUploads.map((recording) => (
                  <div
                    key={recording.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-primary-50/20 border border-gray-200 hover:border-brand-cyan/40 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center">
                          <FileAudio className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Recording Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {recording.title}
                            </h4>
                            <p className="text-sm text-gray-600 truncate">
                              {recording.fileName}
                            </p>
                          </div>
                          {getStatusBadge(recording.status)}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatFileSize(recording.fileSize)}</span>
                          <span>•</span>
                          <span>{formatDate(recording.uploadedAt)}</span>
                          {recording.estimatedTime && recording.status === 'processing' && (
                            <>
                              <span>•</span>
                              <span className="text-brand-blue font-medium">
                                {recording.estimatedTime} remaining
                              </span>
                            </>
                          )}
                        </div>

                        {/* Progress Bar for Processing */}
                        {recording.status === 'processing' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Processing...</span>
                              <span>{recording.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple transition-all duration-500"
                                style={{ width: `${recording.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {recording.status === 'completed' && (
                          <button
                            onClick={() => handleViewRecording(recording.id)}
                            className="p-2 rounded-lg text-brand-blue hover:bg-brand-blue/10 transition-colors"
                            title="View recording"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRecording(recording.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-error-600 hover:bg-error-50 transition-colors"
                          title="Delete recording"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* FAQ Section */}
        <Card variant="elevated" padding="lg" rounded="3xl">
          <CardHeader
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about uploading recordings"
          />
          <CardBody>
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:border-brand-cyan/40 hover:shadow-sm"
                >
                  <button
                    onClick={() => toggleFaqItem(index)}
                    className="w-full px-6 py-4 flex items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-primary-50/20 hover:from-brand-cyan/5 hover:to-brand-blue/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-brand-cyan/10 to-brand-blue/10">
                        <HelpCircle className="w-5 h-5 text-brand-blue" />
                      </div>
                      <span className="font-semibold text-gray-900">{item.question}</span>
                    </div>
                    {item.isOpen ? (
                      <ChevronUp className="w-5 h-5 text-brand-blue flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {item.isOpen && (
                    <div className="px-6 py-4 bg-white border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Help */}
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-brand-blue/5 via-brand-cyan/5 to-brand-purple/5 border border-brand-blue/20">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan flex-shrink-0">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Need More Help?</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    If you have questions not covered here, our support team is ready to assist
                    you with any upload or processing issues.
                  </p>
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageLayout>
  )
}

export default RecordingUploadPage

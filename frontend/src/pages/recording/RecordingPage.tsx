import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic,
  Info,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  HardDrive,
  ChevronRight,
  Clock,
  Save,
  User,
  Briefcase,
  Tag,
  FileText,
  Home,
  List,
} from 'lucide-react'
import { PageLayout } from '../../components/layout'
import AudioRecorder from '../../components/recording/AudioRecorder'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import toast from 'react-hot-toast'

// Recording category options
const CATEGORIES = [
  'Installation',
  'Repair',
  'Maintenance',
  'Consultation',
  'Emergency',
] as const

type RecordingCategory = typeof CATEGORIES[number]

interface RecordingMetadata {
  customerName: string
  projectTitle: string
  category: RecordingCategory | ''
  tags: string[]
  notes: string
}

interface RecentRecording {
  id: string
  title: string
  duration: string
  timestamp: string
}

export default function RecordingPage() {
  const navigate = useNavigate()

  // Recording state
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [recordingDuration, setRecordingDuration] = useState<number>(0)
  const [isRecordingComplete, setIsRecordingComplete] = useState(false)

  // Metadata state
  const [metadata, setMetadata] = useState<RecordingMetadata>({
    customerName: '',
    projectTitle: '',
    category: '',
    tags: [],
    notes: '',
  })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof RecordingMetadata, string>>>({})

  // System state
  const [microphoneStatus, setMicrophoneStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')
  const [storageAvailable, setStorageAvailable] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // No mock data - will fetch from API
  const [recentRecordings] = useState<RecentRecording[]>([])

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophoneStatus()
    checkStorageAvailable()
  }, [])

  const checkMicrophoneStatus = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      if (result.state === 'granted') {
        setMicrophoneStatus('available')
      } else if (result.state === 'denied') {
        setMicrophoneStatus('unavailable')
      } else {
        setMicrophoneStatus('checking')
      }
    } catch (error) {
      // Permission API might not be available
      setMicrophoneStatus('checking')
    }
  }

  const checkStorageAvailable = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        const availableGB = estimate.quota ? (estimate.quota - (estimate.usage || 0)) / (1024 ** 3) : 0
        setStorageAvailable(availableGB)
      } catch (error) {
        console.error('Failed to check storage:', error)
      }
    }
  }

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecordingBlob(blob)
    setRecordingDuration(duration)
    setIsRecordingComplete(true)
    setMicrophoneStatus('available')
    toast.success('Recording complete! Add details below.')
  }

  const handleRecordingError = (error: Error) => {
    console.error('Recording error:', error)
    setMicrophoneStatus('unavailable')
    toast.error('Recording failed. Please check microphone permissions.')
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !metadata.tags.includes(trimmedTag)) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const validateMetadata = (): boolean => {
    const newErrors: Partial<Record<keyof RecordingMetadata, string>> = {}

    if (!metadata.customerName.trim()) {
      newErrors.customerName = 'Customer name is required'
    }
    if (!metadata.projectTitle.trim()) {
      newErrors.projectTitle = 'Project/job title is required'
    }
    if (!metadata.category) {
      newErrors.category = 'Please select a category'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveAndProcess = async () => {
    if (!recordingBlob) {
      toast.error('No recording available. Please record audio first.')
      return
    }

    if (!validateMetadata()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate upload and processing
      // In production, this would upload to backend API
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create FormData for upload
      const formData = new FormData()
      formData.append('audio', recordingBlob, `recording-${Date.now()}.webm`)
      formData.append('customerName', metadata.customerName)
      formData.append('projectTitle', metadata.projectTitle)
      formData.append('category', metadata.category)
      formData.append('tags', JSON.stringify(metadata.tags))
      formData.append('notes', metadata.notes)
      formData.append('duration', recordingDuration.toString())

      // TODO: Replace with actual API call
      // const response = await fetch('/api/recordings', {
      //   method: 'POST',
      //   body: formData,
      // })

      toast.success('Recording saved and processing started!')

      // Navigate to recording detail page
      // In production, use the actual recording ID from API response
      const mockRecordingId = Date.now().toString()
      navigate(`/recordings/${mockRecordingId}`)
    } catch (error) {
      console.error('Failed to save recording:', error)
      toast.error('Failed to save recording. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header Section with Breadcrumb */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 hover:text-brand-cyan transition-colors"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={() => navigate('/recordings')}
              className="flex items-center gap-1 hover:text-brand-cyan transition-colors"
            >
              <List className="w-4 h-4" />
              Recordings
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">New Recording</span>
          </nav>

          {/* Page Title */}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent">
              New Recording
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Record customer conversations and automatically extract insights, action items, and key information
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Recording Area - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio Recorder Component */}
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              onError={handleRecordingError}
              maxDuration={3600} // 1 hour max
            />

            {/* Metadata Form */}
            {isRecordingComplete && (
              <Card variant="elevated" padding="lg" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue text-white">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Recording Details</h3>
                      <p className="text-sm text-gray-600">Add information about this recording</p>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <Input
                    label="Customer Name"
                    placeholder="Enter customer name"
                    value={metadata.customerName}
                    onChange={(e) => setMetadata(prev => ({ ...prev, customerName: e.target.value }))}
                    error={errors.customerName}
                    leftIcon={<User className="w-5 h-5" />}
                    required
                    fullWidth
                  />

                  {/* Project/Job Title */}
                  <Input
                    label="Project/Job Title"
                    placeholder="e.g., HVAC Installation, Plumbing Repair"
                    value={metadata.projectTitle}
                    onChange={(e) => setMetadata(prev => ({ ...prev, projectTitle: e.target.value }))}
                    error={errors.projectTitle}
                    leftIcon={<Briefcase className="w-5 h-5" />}
                    required
                    fullWidth
                  />

                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-error-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={metadata.category}
                        onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value as RecordingCategory }))}
                        className={`w-full px-4 py-2.5 text-base border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 appearance-none bg-white ${
                          errors.category ? 'border-error-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {CATEGORIES.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.category && (
                      <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Tags Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tags (press Enter)"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagInputKeyDown}
                          leftIcon={<Tag className="w-5 h-5" />}
                          fullWidth
                        />
                        <Button
                          variant="outline"
                          size="md"
                          onClick={handleAddTag}
                          disabled={!tagInput.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      {metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {metadata.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-100 to-info-100 text-primary-700 rounded-lg text-sm font-medium"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-error-600 transition-colors"
                                aria-label={`Remove ${tag} tag`}
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes Textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={metadata.notes}
                      onChange={(e) => setMetadata(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any additional context, observations, or important details..."
                      rows={4}
                      className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 resize-none"
                    />
                  </div>

                  {/* Save Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleSaveAndProcess}
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    className="bg-gradient-to-r from-brand-cyan to-brand-blue hover:from-brand-cyan/90 hover:to-brand-blue/90 shadow-lg"
                  >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? 'Saving & Processing...' : 'Save & Process Recording'}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Side (1 column) */}
          <div className="space-y-6">
            {/* System Status */}
            <Card variant="elevated" padding="lg">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-brand-blue" />
                  System Status
                </h3>

                {/* Microphone Status */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  {microphoneStatus === 'available' ? (
                    <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                  ) : microphoneStatus === 'unavailable' ? (
                    <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 animate-spin" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">Microphone</p>
                    <p className={`text-xs mt-0.5 ${
                      microphoneStatus === 'available' ? 'text-success-600' :
                      microphoneStatus === 'unavailable' ? 'text-error-600' :
                      'text-gray-600'
                    }`}>
                      {microphoneStatus === 'available' ? 'Detected and ready' :
                       microphoneStatus === 'unavailable' ? 'Not available or permission denied' :
                       'Checking...'}
                    </p>
                  </div>
                </div>

                {/* Storage Status */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <HardDrive className="w-5 h-5 text-brand-purple flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Storage Available</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {storageAvailable > 0 ? `${storageAvailable.toFixed(2)} GB free` : 'Checking...'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recording Tips */}
            <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-brand-yellow/10 to-brand-orange/10">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-brand-orange" />
                  Recording Tips
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />
                    <span>Position yourself in a quiet environment to minimize background noise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />
                    <span>Speak clearly and at a moderate pace for better transcription accuracy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />
                    <span>Keep your microphone 6-12 inches from your mouth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />
                    <span>Mention key details like customer names, dates, and action items explicitly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />
                    <span>Review the recording before saving to ensure quality</span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Recent Recordings Preview */}
            <Card variant="elevated" padding="lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-purple" />
                    Recent Recordings
                  </h3>
                  <button
                    onClick={() => navigate('/recordings')}
                    className="text-sm text-brand-blue hover:text-brand-blue/80 font-medium transition-colors"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-3">
                  {recentRecordings.map((recording) => (
                    <button
                      key={recording.id}
                      onClick={() => navigate(`/recordings/${recording.id}`)}
                      className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-info-50 transition-all group border border-transparent hover:border-primary-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-blue transition-colors">
                            {recording.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {recording.duration}
                            </span>
                            <span>•</span>
                            <span>{recording.timestamp}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-blue transition-colors flex-shrink-0 mt-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

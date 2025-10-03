import { useState } from 'react'
import { Mic, Upload, ListMusic, Plus, TrendingUp, CheckCircle2, Clock, BarChart3 } from 'lucide-react'
import { PageLayout } from '../../components/layout'
import AudioRecorder from '../../components/recording/AudioRecorder'
import RecordingList, { Recording } from '../../components/recording/RecordingList'
import RecordingPlayer from '../../components/recording/RecordingPlayer'
import RecordingUpload from '../../components/recording/RecordingUpload'
import MetricsCard from '../../components/dashboard/MetricsCard'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import { useRecordings } from '../../hooks/useRecordings'

type TabType = 'all' | 'record' | 'upload'

export default function RecordingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)

  // Fetch recordings from API
  const { data: recordingsResponse, isLoading, error } = useRecordings()

  // Backend returns { success: true, data: [...recordings...] }
  const backendRecordings = recordingsResponse?.data || []

  // Transform backend data to match frontend interface
  const recordings: Recording[] = backendRecordings.map((rec: any) => {
    const fileSizeMB = rec.fileSize ? (rec.fileSize / (1024 * 1024)).toFixed(2) : '0.00'
    return {
      id: rec.id,
      title: rec.title,
      customer: rec.user ? `${rec.user.firstName} ${rec.user.lastName}` : 'Unknown',
      date: new Date(rec.createdAt).toLocaleDateString(),
      dateTimestamp: new Date(rec.createdAt).getTime(),
      duration: `${Math.floor(rec.duration / 60)}:${String(rec.duration % 60).padStart(2, '0')}`,
      durationSeconds: rec.duration,
      fileSize: `${fileSizeMB} MB`,
      status: rec.status.toLowerCase() as any,
      category: 'Service Call',
    }
  })

  const statistics = {
    total: recordings.length,
    processing: recordings.filter(r => r.status === 'processing').length,
    completed: recordings.filter(r => r.status === 'completed').length,
    averageScore: 0,
  }

  // Handle recording actions
  const handlePlay = (recording: Recording) => {
    setSelectedRecording(recording)
    setShowPlayer(true)
  }

  const handleDownload = (recording: Recording) => {
    toast.success(`Downloading: ${recording.title}`)
    // Implement download logic
  }

  const handleDelete = (recording: Recording) => {
    if (confirm(`Are you sure you want to delete "${recording.title}"?`)) {
      toast.success('Recording deleted successfully')
      // Implement delete logic
    }
  }

  const handleShare = (recording: Recording) => {
    toast.success('Share link copied to clipboard')
    // Implement share logic
  }

  const handleViewDetails = (recording: Recording) => {
    setSelectedRecording(recording)
    setShowPlayer(true)
  }

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    toast.success(`Recording saved! Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`)
    // Implement save logic to backend
  }

  const handleUploadComplete = () => {
    toast.success('Files uploaded successfully!')
    setActiveTab('all')
  }

  const handleClosePlayer = () => {
    setShowPlayer(false)
    setSelectedRecording(null)
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading recordings...</div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recordings</h1>
            <p className="text-gray-600 mt-1">
              Manage and analyze all your customer conversation recordings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={activeTab === 'record' ? 'primary' : 'outline'}
              size="md"
              onClick={() => setActiveTab('record')}
            >
              <Mic className="w-5 h-5" />
              New Recording
            </Button>
            <Button
              variant={activeTab === 'upload' ? 'primary' : 'outline'}
              size="md"
              onClick={() => setActiveTab('upload')}
            >
              <Upload className="w-5 h-5" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Recordings"
            value={statistics.total.toString()}
            icon={<ListMusic className="w-6 h-6 text-brand-cyan" />}
            trend={{ value: 12.5, isPositive: true }}
            subtitle="All time"
            color="cyan"
          />
          <MetricsCard
            title="Processing"
            value={statistics.processing.toString()}
            icon={<Clock className="w-6 h-6 text-warning-600" />}
            subtitle="Currently analyzing"
            color="yellow"
          />
          <MetricsCard
            title="Completed"
            value={statistics.completed.toString()}
            icon={<CheckCircle2 className="w-6 h-6 text-success-600" />}
            trend={{ value: 8.3, isPositive: true }}
            subtitle="Ready for review"
            color="green"
          />
          <MetricsCard
            title="Average Score"
            value={`${statistics.averageScore}%`}
            icon={<BarChart3 className="w-6 h-6 text-brand-purple" />}
            trend={{ value: 4.2, isPositive: true }}
            subtitle="Quality metric"
            color="purple"
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <ListMusic className="w-5 h-5" />
              All Recordings
            </div>
          </button>
          <button
            onClick={() => setActiveTab('record')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'record'
                ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              New Recording
            </div>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Files
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'all' && (
            <RecordingList
              recordings={recordings}
              onPlay={handlePlay}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onShare={handleShare}
              onViewDetails={handleViewDetails}
            />
          )}

          {activeTab === 'record' && (
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          )}

          {activeTab === 'upload' && (
            <RecordingUpload onUploadComplete={handleUploadComplete} />
          )}
        </div>
      </div>

      {/* Recording Player Modal/Slide-over */}
      {showPlayer && selectedRecording && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={handleClosePlayer}
          />

          {/* Slide-over Panel */}
          <div className="absolute inset-y-0 right-0 max-w-4xl w-full flex">
            <div className="relative w-full bg-white shadow-2xl overflow-y-auto">
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={handleClosePlayer}
                  className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Player Content */}
              <div className="p-6">
                <RecordingPlayer
                  recording={{
                    id: selectedRecording.id,
                    title: selectedRecording.title,
                    audioUrl: '/demo-audio.mp3', // Replace with actual audio URL
                    duration: selectedRecording.durationSeconds,
                    createdAt: selectedRecording.date,
                    metadata: {
                      recordingType: selectedRecording.category,
                      location: 'Field Location',
                      participants: [selectedRecording.customer, 'Field Technician'],
                    },
                  }}
                  onShare={() => handleShare(selectedRecording)}
                  onDownload={() => handleDownload(selectedRecording)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

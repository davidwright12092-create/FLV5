import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Play,
  Download,
  Share2,
  Edit,
  Trash2,
  TrendingUp,
  MessageSquare,
  FileText,
  Award,
  Clock,
  User,
  Tag,
  ChevronRight,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Lightbulb,
  Target,
  Calendar,
  MapPin,
  Users,
  Activity,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  Search,
  ArrowLeft,
} from 'lucide-react'
import { PageLayout } from '../../components/layout'
import RecordingPlayer from '../../components/recording/RecordingPlayer'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

// TypeScript Interfaces
interface Recording {
  id: string
  title: string
  audioUrl: string
  duration: number
  createdAt: string
  customer: {
    id: string
    name: string
    company: string
  }
  status: 'completed' | 'processing' | 'failed'
  category: string
  tags: string[]
  metadata?: {
    recordingType?: string
    location?: string
    participants?: string[]
  }
}

interface AnalysisData {
  overallScore: number
  summary: string
  keyInsights: string[]
  actionItems: string[]
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  topics: string[]
  questionsAsked: number
  questionsAnswered: number
  processAdherence: {
    score: number
    strengths: string[]
    improvementAreas: string[]
  }
  coachingRecommendations: {
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
  }[]
  trainingResources: {
    title: string
    url: string
    type: string
  }[]
}

interface TimelineEvent {
  id: string
  type: 'upload' | 'process' | 'analyze' | 'share' | 'edit' | 'view'
  description: string
  timestamp: string
  user?: string
}

// Mock data
const MOCK_RECORDING: Recording = {
  id: '1',
  title: 'Site Inspection - Foundation Work Review',
  audioUrl: '/demo-audio.mp3',
  duration: 42,
  createdAt: '2025-09-29T10:30:00Z',
  customer: {
    id: 'cust-1',
    name: 'Sarah Chen',
    company: 'Downtown Construction Inc.',
  },
  status: 'completed',
  category: 'Site Inspection',
  tags: ['Foundation', 'Quality Control', 'Compliance', 'Safety'],
  metadata: {
    recordingType: 'Field Inspection',
    location: 'Downtown Construction Site - Building A',
    participants: ['Inspector Sarah Chen', 'Foreman Mike Torres'],
  },
}

const MOCK_ANALYSIS: AnalysisData = {
  overallScore: 87,
  summary:
    'Excellent site inspection with thorough documentation and clear communication between inspector and foreman. All compliance requirements were addressed, and the project is proceeding according to specifications. Minor follow-up needed on concrete delivery scheduling.',
  keyInsights: [
    'Foundation rebar placement meets all engineering specifications',
    'Pre-pour checklist completed with all items verified',
    'Clear communication established for concrete pour notification',
    'Safety protocols properly followed throughout inspection',
  ],
  actionItems: [
    'Notify inspector at least 2 hours before concrete pour begins',
    'Schedule follow-up inspection for concrete pour',
    'Document final measurements and photos',
    'Update project timeline with approved phase completion',
  ],
  sentiment: {
    positive: 75,
    neutral: 20,
    negative: 5,
  },
  topics: [
    'Foundation Work',
    'Rebar Installation',
    'Quality Control',
    'Compliance',
    'Concrete Pour Preparation',
    'Safety Protocols',
  ],
  questionsAsked: 8,
  questionsAnswered: 8,
  processAdherence: {
    score: 92,
    strengths: [
      'Comprehensive pre-pour checklist verification',
      'Detailed rebar specifications review',
      'Clear documentation requirements communicated',
      'Professional rapport maintained throughout',
    ],
    improvementAreas: [
      'Could have discussed weather contingencies for concrete pour',
      'Missed opportunity to review curing procedures in detail',
    ],
  },
  coachingRecommendations: [
    {
      title: 'Proactive Weather Planning',
      description:
        'Consider discussing weather forecasts and contingency plans during pre-pour inspections to avoid last-minute scheduling issues.',
      priority: 'medium',
    },
    {
      title: 'Detailed Curing Procedures',
      description:
        'Review concrete curing requirements and procedures with the team to ensure proper long-term quality.',
      priority: 'medium',
    },
    {
      title: 'Documentation Excellence',
      description:
        'Continue maintaining thorough photo and measurement documentation. This is a model approach for the team.',
      priority: 'low',
    },
  ],
  trainingResources: [
    {
      title: 'ACI Concrete Inspection Best Practices',
      url: '#',
      type: 'Video Course',
    },
    {
      title: 'Weather Impact on Concrete Curing',
      url: '#',
      type: 'Article',
    },
    {
      title: 'Effective Communication in Field Inspections',
      url: '#',
      type: 'Interactive Module',
    },
  ],
}

const MOCK_TIMELINE: TimelineEvent[] = [
  {
    id: '1',
    type: 'upload',
    description: 'Recording uploaded from mobile device',
    timestamp: '2025-09-29T10:30:00Z',
    user: 'Sarah Chen',
  },
  {
    id: '2',
    type: 'process',
    description: 'Audio transcription completed',
    timestamp: '2025-09-29T10:32:15Z',
  },
  {
    id: '3',
    type: 'analyze',
    description: 'AI analysis and scoring completed',
    timestamp: '2025-09-29T10:33:45Z',
  },
  {
    id: '4',
    type: 'view',
    description: 'Recording viewed by David Wright',
    timestamp: '2025-09-29T14:15:00Z',
    user: 'David Wright',
  },
  {
    id: '5',
    type: 'share',
    description: 'Recording shared with Project Team',
    timestamp: '2025-09-29T15:30:00Z',
    user: 'Sarah Chen',
  },
]

const MOCK_RELATED_RECORDINGS = [
  {
    id: '2',
    title: 'Previous Site Visit - Excavation Review',
    date: '2025-09-22T09:00:00Z',
    score: 82,
  },
  {
    id: '3',
    title: 'Safety Meeting - October Schedule',
    date: '2025-09-20T14:00:00Z',
    score: 90,
  },
  {
    id: '4',
    title: 'Client Walkthrough - Progress Update',
    date: '2025-09-18T10:30:00Z',
    score: 85,
  },
]

// Badge Component
interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
  size?: 'sm' | 'md' | 'lg'
}

const Badge = ({ children, variant = 'default', size = 'md' }: BadgeProps) => {
  const variants = {
    success: 'bg-success-100 text-success-700 border-success-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200',
    error: 'bg-error-100 text-error-700 border-error-200',
    info: 'bg-primary-100 text-primary-700 border-primary-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base font-semibold',
  }

  return (
    <span
      className={`inline-flex items-center border rounded-full ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  )
}

// CircularProgress Component
interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
}

const CircularProgress = ({
  value,
  size = 120,
  strokeWidth = 8,
  color = 'brand-cyan',
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`text-${color} transition-all duration-1000`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-600">Score</span>
      </div>
    </div>
  )
}

export default function RecordingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<
    'overview' | 'analysis' | 'transcript' | 'coaching' | 'activity'
  >('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Simulate loading
  // In real app, fetch data based on id
  const recording = MOCK_RECORDING
  const analysis = MOCK_ANALYSIS

  const handleDownload = () => {
    toast.success('Download started')
    // Implement download logic
  }

  const handleShare = () => {
    toast.success('Share link copied to clipboard')
    // Implement share logic
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this recording?')) {
      toast.success('Recording deleted successfully')
      navigate('/recording/history')
    }
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </PageLayout>
    )
  }

  if (!recording) {
    return (
      <PageLayout>
        <Card variant="elevated" className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recording Not Found</h2>
          <p className="text-gray-600 mb-6">
            The recording you're looking for doesn't exist or has been deleted.
          </p>
          <Link to="/recordings">
            <Button variant="primary">
              <ArrowLeft size={16} />
              Back to Recordings
            </Button>
          </Link>
        </Card>
      </PageLayout>
    )
  }

  const getStatusBadge = (status: Recording['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" size="lg">
            <CheckCircle2 size={16} className="mr-1" />
            Completed
          </Badge>
        )
      case 'processing':
        return (
          <Badge variant="warning" size="lg">
            <Clock size={16} className="mr-1 animate-spin" />
            Processing
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="error" size="lg">
            <AlertCircle size={16} className="mr-1" />
            Failed
          </Badge>
        )
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Play },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'transcript', label: 'Transcript', icon: FileText },
    { id: 'coaching', label: 'Coaching', icon: Award },
    { id: 'activity', label: 'Activity', icon: Activity },
  ] as const

  const getTimelineIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'upload':
        return <Download className="w-4 h-4" />
      case 'process':
        return <Activity className="w-4 h-4" />
      case 'analyze':
        return <BarChart3 className="w-4 h-4" />
      case 'share':
        return <Share2 className="w-4 h-4" />
      case 'edit':
        return <Edit className="w-4 h-4" />
      case 'view':
        return <Play className="w-4 h-4" />
    }
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/dashboard" className="hover:text-brand-blue transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={16} />
          <Link to="/recordings" className="hover:text-brand-blue transition-colors">
            Recordings
          </Link>
          <ChevronRight size={16} />
          <span className="text-gray-900 font-medium">{recording.title}</span>
        </nav>

        {/* Header Section */}
        <Card variant="elevated" className="bg-gradient-to-br from-brand-cyan via-brand-blue to-brand-purple text-white">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{recording.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-white/90">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{recording.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>
                        {new Date(recording.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    {recording.metadata?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{recording.metadata.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                  {getStatusBadge(recording.status)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="info">
                  <Tag size={14} className="mr-1" />
                  {recording.category}
                </Badge>
                {recording.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Edit size={16} />
                Edit
              </Button>
              <Button
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={handleDownload}
              >
                <Download size={16} />
                Download
              </Button>
              <Button
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={handleShare}
              >
                <Share2 size={16} />
                Share
              </Button>
              <Button
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <Card variant="elevated" padding="none" className="overflow-hidden">
              <div className="flex overflow-x-auto bg-gray-50 border-b border-gray-200">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-white text-brand-blue border-b-2 border-brand-blue'
                          : 'text-gray-600 hover:bg-white hover:text-gray-900'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <RecordingPlayer
                      recording={recording}
                      onShare={handleShare}
                      onDownload={handleDownload}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Metadata */}
                      <Card variant="bordered">
                        <CardHeader title="Recording Details" />
                        <CardBody>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration</span>
                              <span className="font-medium text-gray-900">
                                {formatDuration(recording.duration)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Customer</span>
                              <span className="font-medium text-gray-900">
                                {recording.customer.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Company</span>
                              <span className="font-medium text-gray-900">
                                {recording.customer.company}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Category</span>
                              <Badge variant="info">{recording.category}</Badge>
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      {/* Overall Score */}
                      <Card variant="bordered">
                        <CardHeader title="Overall Score" />
                        <CardBody>
                          <div className="flex flex-col items-center justify-center py-4">
                            <CircularProgress value={analysis.overallScore} />
                            <p className="mt-4 text-center text-sm text-gray-600">
                              {analysis.overallScore >= 80 && 'Excellent performance'}
                              {analysis.overallScore >= 60 &&
                                analysis.overallScore < 80 &&
                                'Good performance'}
                              {analysis.overallScore < 60 && 'Needs improvement'}
                            </p>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Analysis Tab */}
                {activeTab === 'analysis' && (
                  <div className="space-y-6">
                    {/* AI Summary */}
                    <Card variant="bordered">
                      <CardHeader title="AI-Generated Summary" />
                      <CardBody>
                        <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                      </CardBody>
                    </Card>

                    {/* Key Insights */}
                    <Card variant="bordered">
                      <CardHeader title="Key Insights" />
                      <CardBody>
                        <div className="space-y-3">
                          {analysis.keyInsights.map((insight, idx) => (
                            <div key={idx} className="flex gap-3">
                              <Lightbulb className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                              <p className="text-gray-700">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>

                    {/* Action Items */}
                    <Card variant="bordered">
                      <CardHeader title="Action Items" />
                      <CardBody>
                        <div className="space-y-3">
                          {analysis.actionItems.map((item, idx) => (
                            <div key={idx} className="flex gap-3">
                              <Target className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                              <p className="text-gray-700">{item}</p>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>

                    {/* Sentiment Analysis */}
                    <Card variant="bordered">
                      <CardHeader title="Sentiment Analysis" />
                      <CardBody>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <ThumbsUp className="w-4 h-4 text-success-600" />
                                <span className="text-sm text-gray-700">Positive</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {analysis.sentiment.positive}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-success-500 rounded-full"
                                style={{ width: `${analysis.sentiment.positive}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Minus className="w-4 h-4 text-warning-600" />
                                <span className="text-sm text-gray-700">Neutral</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {analysis.sentiment.neutral}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-warning-500 rounded-full"
                                style={{ width: `${analysis.sentiment.neutral}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <ThumbsDown className="w-4 h-4 text-error-600" />
                                <span className="text-sm text-gray-700">Negative</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {analysis.sentiment.negative}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-error-500 rounded-full"
                                style={{ width: `${analysis.sentiment.negative}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Topics Discussed */}
                    <Card variant="bordered">
                      <CardHeader title="Topics Discussed" />
                      <CardBody>
                        <div className="flex flex-wrap gap-2">
                          {analysis.topics.map((topic) => (
                            <Badge key={topic} variant="default">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </CardBody>
                    </Card>

                    {/* Questions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card variant="bordered">
                        <CardHeader title="Questions Asked" />
                        <CardBody>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-brand-blue mb-2">
                              {analysis.questionsAsked}
                            </div>
                            <p className="text-sm text-gray-600">
                              Total questions raised during conversation
                            </p>
                          </div>
                        </CardBody>
                      </Card>

                      <Card variant="bordered">
                        <CardHeader title="Questions Answered" />
                        <CardBody>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-success-600 mb-2">
                              {analysis.questionsAnswered}
                            </div>
                            <p className="text-sm text-gray-600">
                              Questions successfully addressed
                            </p>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Transcript Tab */}
                {activeTab === 'transcript' && (
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search transcript..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Full transcript with speaker identification
                      </p>
                      <Button variant="outline" size="sm">
                        <Download size={16} />
                        Export Transcript
                      </Button>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4 max-h-[600px] overflow-y-auto">
                      {/* Transcript content would be rendered from RecordingPlayer transcript data */}
                      <p className="text-gray-600">
                        Full transcript is displayed in the RecordingPlayer component in the
                        Overview tab. This section can show an enhanced, searchable version with
                        additional features.
                      </p>
                    </div>
                  </div>
                )}

                {/* Coaching Tab */}
                {activeTab === 'coaching' && (
                  <div className="space-y-6">
                    {/* Process Adherence Score */}
                    <Card variant="bordered">
                      <CardHeader title="Process Adherence Score" />
                      <CardBody>
                        <div className="flex items-center justify-center py-4">
                          <CircularProgress
                            value={analysis.processAdherence.score}
                            color="brand-purple"
                          />
                        </div>
                      </CardBody>
                    </Card>

                    {/* Strengths */}
                    <Card variant="bordered">
                      <CardHeader title="Strengths" />
                      <CardBody>
                        <div className="space-y-3">
                          {analysis.processAdherence.strengths.map((strength, idx) => (
                            <div key={idx} className="flex gap-3">
                              <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                              <p className="text-gray-700">{strength}</p>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>

                    {/* Improvement Areas */}
                    <Card variant="bordered">
                      <CardHeader title="Areas for Improvement" />
                      <CardBody>
                        <div className="space-y-3">
                          {analysis.processAdherence.improvementAreas.map((area, idx) => (
                            <div key={idx} className="flex gap-3">
                              <TrendingUp className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                              <p className="text-gray-700">{area}</p>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>

                    {/* Coaching Recommendations */}
                    <Card variant="bordered">
                      <CardHeader title="Coaching Recommendations" />
                      <CardBody>
                        <div className="space-y-4">
                          {analysis.coachingRecommendations.map((rec, idx) => (
                            <div
                              key={idx}
                              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                                <Badge
                                  variant={
                                    rec.priority === 'high'
                                      ? 'error'
                                      : rec.priority === 'medium'
                                      ? 'warning'
                                      : 'default'
                                  }
                                  size="sm"
                                >
                                  {rec.priority}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm">{rec.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>

                    {/* Training Resources */}
                    <Card variant="bordered">
                      <CardHeader title="Training Resources" />
                      <CardBody>
                        <div className="space-y-3">
                          {analysis.trainingResources.map((resource, idx) => (
                            <a
                              key={idx}
                              href={resource.url}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-brand-blue transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-lg flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 group-hover:text-brand-blue">
                                    {resource.title}
                                  </p>
                                  <p className="text-sm text-gray-600">{resource.type}</p>
                                </div>
                              </div>
                              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-brand-blue" />
                            </a>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <Card variant="bordered">
                      <CardHeader title="Recording Timeline" />
                      <CardBody>
                        <div className="space-y-4">
                          {MOCK_TIMELINE.map((event, idx) => (
                            <div key={event.id} className="flex gap-4">
                              <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-full flex items-center justify-center text-white">
                                  {getTimelineIcon(event.type)}
                                </div>
                                {idx < MOCK_TIMELINE.length - 1 && (
                                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-200" />
                                )}
                              </div>
                              <div className="flex-1 pb-8">
                                <p className="font-medium text-gray-900">{event.description}</p>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                  <Clock size={14} />
                                  <span>
                                    {new Date(event.timestamp).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  {event.user && (
                                    <>
                                      <span>•</span>
                                      <User size={14} />
                                      <span>{event.user}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card variant="elevated">
              <CardHeader title="Quick Stats" />
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={18} />
                      <span className="text-sm">Duration</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatDuration(recording.duration)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp size={18} />
                      <span className="text-sm">Score</span>
                    </div>
                    <span className="font-semibold text-gray-900">{analysis.overallScore}/100</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={18} />
                      <span className="text-sm">Speakers</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {recording.metadata?.participants?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageSquare size={18} />
                      <span className="text-sm">Word Count</span>
                    </div>
                    <span className="font-semibold text-gray-900">~450</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Related Recordings */}
            <Card variant="elevated">
              <CardHeader title="Related Recordings" />
              <CardBody>
                <div className="space-y-3">
                  {MOCK_RELATED_RECORDINGS.map((rec) => (
                    <Link
                      key={rec.id}
                      to={`/recordings/${rec.id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-brand-blue transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm group-hover:text-brand-blue line-clamp-2">
                          {rec.title}
                        </h4>
                        <Badge variant="info" size="sm">
                          {rec.score}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {new Date(rec.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Customer History Link */}
            <Card variant="bordered" className="bg-gradient-to-br from-brand-cyan/10 to-brand-blue/10 border-brand-blue/20">
              <CardBody>
                <div className="text-center">
                  <User className="w-12 h-12 text-brand-blue mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Customer History</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    View all recordings for {recording.customer.name}
                  </p>
                  <Link to={`/customers/${recording.customer.id}`}>
                    <Button variant="primary" size="sm" fullWidth>
                      View Customer Profile
                      <ExternalLink size={14} />
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

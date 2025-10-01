import { useState, useMemo } from 'react'
import {
  Play,
  Download,
  Trash2,
  Share2,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'

// TypeScript interfaces
export interface Recording {
  id: string
  title: string
  customer: string
  date: string
  dateTimestamp: number
  duration: string
  durationSeconds: number
  status: 'recording' | 'processing' | 'completed' | 'failed'
  score?: number
  category?: string
  tags?: string[]
}

interface RecordingListProps {
  recordings?: Recording[]
  onPlay?: (recording: Recording) => void
  onDownload?: (recording: Recording) => void
  onDelete?: (recording: Recording) => void
  onShare?: (recording: Recording) => void
  onViewDetails?: (recording: Recording) => void
}

// No mock data - will fetch from API
const mockRecordings: Recording[] = []

export default function RecordingList({
  recordings = mockRecordings,
  onPlay,
  onDownload,
  onDelete,
  onShare,
  onViewDetails,
}: RecordingListProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Recording['status'] | 'all'>('all')
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null)
  const itemsPerPage = 10

  // Filter and search logic
  const filteredRecordings = useMemo(() => {
    return recordings.filter((recording) => {
      // Search filter
      const matchesSearch =
        recording.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recording.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recording.category?.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' || recording.status === statusFilter

      // Score filter
      let matchesScore = true
      if (scoreFilter !== 'all' && recording.score !== undefined) {
        if (scoreFilter === 'high') matchesScore = recording.score >= 90
        if (scoreFilter === 'medium') matchesScore = recording.score >= 70 && recording.score < 90
        if (scoreFilter === 'low') matchesScore = recording.score < 70
      }

      return matchesSearch && matchesStatus && matchesScore
    })
  }, [recordings, searchQuery, statusFilter, scoreFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredRecordings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRecordings = filteredRecordings.slice(startIndex, startIndex + itemsPerPage)

  // Helper functions
  const getStatusBadge = (status: Recording['status']) => {
    const variants = {
      recording: {
        bg: 'bg-info-100',
        text: 'text-info-700',
        icon: <Video className="w-3 h-3" />,
        label: 'Recording',
      },
      processing: {
        bg: 'bg-warning-100',
        text: 'text-warning-700',
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
        label: 'Processing',
      },
      completed: {
        bg: 'bg-success-100',
        text: 'text-success-700',
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: 'Completed',
      },
      failed: {
        bg: 'bg-error-100',
        text: 'text-error-700',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Failed',
      },
    }

    const variant = variants[status]

    return (
      <span
        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${variant.bg} ${variant.text}`}
      >
        {variant.icon}
        <span>{variant.label}</span>
      </span>
    )
  }

  const getScoreBadge = (score: number) => {
    let colorClasses = ''
    if (score >= 90) colorClasses = 'text-success-700 bg-success-50 ring-success-600/20'
    else if (score >= 70) colorClasses = 'text-warning-700 bg-warning-50 ring-warning-600/20'
    else colorClasses = 'text-error-700 bg-error-50 ring-error-600/20'

    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${colorClasses}`}>
        {score}%
      </div>
    )
  }

  const formatRelativeDate = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
  }

  // Action handlers
  const handleAction = (action: string, recording: Recording) => {
    setExpandedDropdown(null)
    switch (action) {
      case 'play':
        onPlay?.(recording)
        break
      case 'download':
        onDownload?.(recording)
        break
      case 'delete':
        onDelete?.(recording)
        break
      case 'share':
        onShare?.(recording)
        break
      case 'details':
        onViewDetails?.(recording)
        break
    }
  }

  // Empty state
  if (recordings.length === 0) {
    return (
      <Card variant="elevated" rounded="3xl">
        <CardBody>
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-brand-cyan/20 rounded-3xl flex items-center justify-center mb-6">
              <Video className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No recordings yet</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              Start recording customer conversations to analyze performance and improve service quality.
            </p>
            <Button variant="primary" size="lg">
              <Video className="w-5 h-5" />
              Start Recording
            </Button>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card variant="elevated" rounded="3xl">
      <CardHeader
        title="Recordings"
        subtitle={`${filteredRecordings.length} total recording${filteredRecordings.length !== 1 ? 's' : ''}`}
      />
      <CardBody>
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search recordings, customers, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                fullWidth
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="recording">Recording</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value as any)}
                className="px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="all">All Scores</option>
                <option value="high">High (90+)</option>
                <option value="medium">Medium (70-89)</option>
                <option value="low">Low (&lt;70)</option>
              </select>
            </div>
          </div>
        </div>

        {/* No results state */}
        {filteredRecordings.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recordings found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedRecordings.map((recording) => (
                    <tr
                      key={recording.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-xl flex items-center justify-center flex-shrink-0">
                            <Play className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{recording.title}</div>
                            <div className="text-sm text-gray-600">{recording.customer}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatRelativeDate(recording.dateTimestamp)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{recording.duration}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(recording.status)}</td>
                      <td className="py-4 px-4">
                        {recording.score !== undefined ? getScoreBadge(recording.score) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          {recording.status === 'completed' && (
                            <>
                              <button
                                onClick={() => handleAction('play', recording)}
                                className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors"
                                title="Play"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction('download', recording)}
                                className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setExpandedDropdown(expandedDropdown === recording.id ? null : recording.id)
                              }
                              className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {expandedDropdown === recording.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setExpandedDropdown(null)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                                  <button
                                    onClick={() => handleAction('details', recording)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>View Details</span>
                                  </button>
                                  {recording.status === 'completed' && (
                                    <>
                                      <button
                                        onClick={() => handleAction('play', recording)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                      >
                                        <Play className="w-4 h-4" />
                                        <span>Play</span>
                                      </button>
                                      <button
                                        onClick={() => handleAction('download', recording)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                      >
                                        <Download className="w-4 h-4" />
                                        <span>Download</span>
                                      </button>
                                      <button
                                        onClick={() => handleAction('share', recording)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                      >
                                        <Share2 className="w-4 h-4" />
                                        <span>Share</span>
                                      </button>
                                    </>
                                  )}
                                  <hr className="my-2 border-gray-200" />
                                  <button
                                    onClick={() => handleAction('delete', recording)}
                                    className="w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-error-50 flex items-center space-x-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {paginatedRecordings.map((recording) => (
                <div
                  key={recording.id}
                  className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-xl flex items-center justify-center flex-shrink-0">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{recording.title}</h4>
                        <p className="text-sm text-gray-600">{recording.customer}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setExpandedDropdown(expandedDropdown === recording.id ? null : recording.id)
                        }
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      {expandedDropdown === recording.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setExpandedDropdown(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                            <button
                              onClick={() => handleAction('details', recording)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                            {recording.status === 'completed' && (
                              <>
                                <button
                                  onClick={() => handleAction('play', recording)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Play className="w-4 h-4" />
                                  <span>Play</span>
                                </button>
                                <button
                                  onClick={() => handleAction('download', recording)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>Download</span>
                                </button>
                                <button
                                  onClick={() => handleAction('share', recording)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Share2 className="w-4 h-4" />
                                  <span>Share</span>
                                </button>
                              </>
                            )}
                            <hr className="my-2 border-gray-200" />
                            <button
                              onClick={() => handleAction('delete', recording)}
                              className="w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-error-50 flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatRelativeDate(recording.dateTimestamp)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{recording.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {getStatusBadge(recording.status)}
                    {recording.score !== undefined && getScoreBadge(recording.score)}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRecordings.length)} of{' '}
                  {filteredRecordings.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first, last, current, and adjacent pages
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        )
                      })
                      .map((page, index, array) => {
                        // Add ellipsis
                        const showEllipsisBefore = index > 0 && page - array[index - 1] > 1
                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsisBefore && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-primary-600 text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        )
                      })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  )
}

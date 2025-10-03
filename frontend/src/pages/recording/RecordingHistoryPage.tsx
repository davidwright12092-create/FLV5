import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Plus,
  Upload,
  Download,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  Grid3x3,
  List,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
  X,
  RefreshCw,
  Trash2,
  Share2,
  FileDown,
  CheckSquare,
  Square,
  AlertCircle,
  BarChart3,
} from 'lucide-react'
import PageLayout from '../../components/layout/PageLayout'
import RecordingList, { Recording } from '../../components/recording/RecordingList'
import RecordingPlayer from '../../components/recording/RecordingPlayer'
import MetricsCard from '../../components/dashboard/MetricsCard'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Card, CardBody } from '../../components/ui/Card'
import toast from 'react-hot-toast'

type ViewMode = 'grid' | 'list'
type SortBy = 'date-desc' | 'date-asc' | 'duration-desc' | 'duration-asc' | 'score-desc' | 'score-asc' | 'title'
type DateRange = 'week' | 'month' | '3months' | 'custom' | 'all'
type StatusFilterType = 'all' | 'recording' | 'processing' | 'completed' | 'failed'

// No mock data - will fetch from API
const mockRecordings: Recording[] = []

export default function RecordingHistoryPage() {
  const navigate = useNavigate()

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortBy, setSortBy] = useState<SortBy>('date-desc')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [scoreMin, setScoreMin] = useState<number>(0)
  const [scoreMax, setScoreMax] = useState<number>(100)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRecordings, setSelectedRecordings] = useState<Set<string>>(new Set())
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = mockRecordings.length
    const thisWeek = mockRecordings.filter(
      (r) => Date.now() - r.dateTimestamp < 7 * 24 * 60 * 60 * 1000
    ).length
    const processing = mockRecordings.filter((r) => r.status === 'processing').length
    const completedRecordings = mockRecordings.filter(
      (r) => r.status === 'completed' && r.score !== undefined
    )
    const averageScore = completedRecordings.length
      ? Math.round(
          completedRecordings.reduce((sum, r) => sum + (r.score || 0), 0) / completedRecordings.length
        )
      : 0

    return { total, thisWeek, processing, averageScore }
  }, [])

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(mockRecordings.map((r) => r.category).filter(Boolean))
    return Array.from(uniqueCategories) as string[]
  }, [])

  // Filter recordings
  const filteredRecordings = useMemo(() => {
    let filtered = [...mockRecordings]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = Date.now()
      const ranges = {
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        '3months': 90 * 24 * 60 * 60 * 1000,
      }
      if (dateRange !== 'custom') {
        filtered = filtered.filter((r) => now - r.dateTimestamp < ranges[dateRange])
      }
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((r) => r.category === categoryFilter)
    }

    // Score filter
    filtered = filtered.filter(
      (r) => r.score === undefined || (r.score >= scoreMin && r.score <= scoreMax)
    )

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.dateTimestamp - a.dateTimestamp
        case 'date-asc':
          return a.dateTimestamp - b.dateTimestamp
        case 'duration-desc':
          return b.durationSeconds - a.durationSeconds
        case 'duration-asc':
          return a.durationSeconds - b.durationSeconds
        case 'score-desc':
          return (b.score || 0) - (a.score || 0)
        case 'score-asc':
          return (a.score || 0) - (b.score || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, dateRange, statusFilter, categoryFilter, scoreMin, scoreMax, sortBy])

  // Handlers
  const handlePlay = (recording: Recording) => {
    setSelectedRecording(recording)
    setShowPlayer(true)
  }

  const handleDownload = (recording: Recording) => {
    toast.success(`Downloading: ${recording.title}`)
  }

  const handleDelete = (recording: Recording) => {
    if (confirm(`Are you sure you want to delete "${recording.title}"?`)) {
      toast.success('Recording deleted successfully')
      setSelectedRecordings((prev) => {
        const next = new Set(prev)
        next.delete(recording.id)
        return next
      })
    }
  }

  const handleShare = (recording: Recording) => {
    toast.success('Share link copied to clipboard')
  }

  const handleViewDetails = (recording: Recording) => {
    navigate(`/recording/${recording.id}`)
  }

  const handleClosePlayer = () => {
    setShowPlayer(false)
    setSelectedRecording(null)
  }

  const toggleSelectRecording = (id: string) => {
    setSelectedRecordings((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedRecordings.size === filteredRecordings.length) {
      setSelectedRecordings(new Set())
    } else {
      setSelectedRecordings(new Set(filteredRecordings.map((r) => r.id)))
    }
  }

  const handleBulkDelete = () => {
    if (selectedRecordings.size === 0) return
    if (confirm(`Delete ${selectedRecordings.size} selected recordings?`)) {
      toast.success(`${selectedRecordings.size} recordings deleted`)
      setSelectedRecordings(new Set())
    }
  }

  const handleBulkDownload = () => {
    if (selectedRecordings.size === 0) return
    toast.success(`Downloading ${selectedRecordings.size} recordings`)
  }

  const handleBulkExport = () => {
    if (selectedRecordings.size === 0) return
    toast.success(`Exporting ${selectedRecordings.size} recordings`)
  }

  const handleExportData = () => {
    toast.success('Exporting all recording data...')
  }

  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Data refreshed successfully')
    }, 1000)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setDateRange('all')
    setStatusFilter('all')
    setCategoryFilter('all')
    setScoreMin(0)
    setScoreMax(100)
  }

  const hasActiveFilters =
    searchQuery !== '' ||
    dateRange !== 'all' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    scoreMin !== 0 ||
    scoreMax !== 100

  // Error state
  if (error && !isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card variant="elevated" rounded="3xl" padding="lg">
            <CardBody>
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-error-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Recordings</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button variant="primary" size="lg" onClick={handleRetry}>
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent mb-2">
              Recording History
            </h1>
            <p className="text-gray-600 text-lg">
              Complete archive of all customer conversation recordings with advanced analytics
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="md" onClick={handleExportData}>
              <FileDown className="w-5 h-5" />
              Export Data
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate('/recording/upload')}>
              <Upload className="w-5 h-5" />
              Upload Files
            </Button>
            <Button variant="primary" size="md" onClick={() => navigate('/recording/new')}>
              <Plus className="w-5 h-5" />
              New Recording
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Recordings"
            value={statistics.total}
            icon={<Video className="w-6 h-6 text-brand-cyan" />}
            trend={{ value: 12.5, isPositive: true }}
            subtitle="All time"
            color="cyan"
          />
          <MetricsCard
            title="This Week"
            value={statistics.thisWeek}
            icon={<Calendar className="w-6 h-6 text-brand-blue" />}
            trend={{ value: 8.3, isPositive: true }}
            subtitle="Last 7 days"
            color="blue"
          />
          <MetricsCard
            title="Processing"
            value={statistics.processing}
            icon={<Clock className="w-6 h-6 text-warning-600" />}
            subtitle="Currently analyzing"
            color="yellow"
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

        {/* Search and Filter Section */}
        <Card variant="elevated" rounded="3xl" padding="lg">
          <CardBody>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search by customer name, title, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                    fullWidth
                  />
                </div>
                <Button
                  variant={showFilters ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 px-2 py-0.5 bg-white text-primary-600 rounded-full text-xs font-bold">
                      {[
                        searchQuery !== '',
                        dateRange !== 'all',
                        statusFilter !== 'all',
                        categoryFilter !== 'all',
                        scoreMin !== 0 || scoreMax !== 100,
                      ].filter(Boolean).length}
                    </span>
                  )}
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Range
                      </label>
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as DateRange)}
                        className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                      >
                        <option value="all">All Time</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
                        className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                      >
                        <option value="all">All Status</option>
                        <option value="recording">Recording</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Score Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Score Range: {scoreMin}% - {scoreMax}%
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={scoreMin}
                          onChange={(e) => setScoreMin(Number(e.target.value))}
                          className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Min"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={scoreMax}
                          onChange={(e) => setScoreMax(Number(e.target.value))}
                          className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="w-4 h-4" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Sort and View Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="duration-desc">Duration (Longest)</option>
                <option value="duration-asc">Duration (Shortest)</option>
                <option value="score-desc">Score (Highest)</option>
                <option value="score-asc">Score (Lowest)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredRecordings.length} {filteredRecordings.length === 1 ? 'recording' : 'recordings'}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Bulk Actions */}
            {selectedRecordings.size > 0 && (
              <div className="flex items-center space-x-2 mr-4">
                <span className="text-sm font-medium text-gray-700">
                  {selectedRecordings.size} selected
                </span>
                <Button variant="ghost" size="sm" onClick={handleBulkDownload}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleBulkExport}>
                  <FileDown className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 text-error-600" />
                </Button>
              </div>
            )}

            {/* View Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card variant="elevated" rounded="3xl" padding="lg">
            <CardBody>
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading recordings...</p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && filteredRecordings.length === 0 && (
          <Card variant="elevated" rounded="3xl" padding="lg">
            <CardBody>
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-brand-cyan/20 rounded-3xl flex items-center justify-center mb-6">
                  <Video className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {mockRecordings.length === 0 ? 'No recordings yet' : 'No recordings found'}
                </h3>
                <p className="text-gray-600 text-center max-w-md mb-6">
                  {mockRecordings.length === 0
                    ? 'Start recording customer conversations to analyze performance and improve service quality.'
                    : 'Try adjusting your search or filters to find what you are looking for.'}
                </p>
                {mockRecordings.length === 0 ? (
                  <Button variant="primary" size="lg" onClick={() => navigate('/recording/new')}>
                    <Video className="w-5 h-5" />
                    Start Recording
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" onClick={clearFilters}>
                    <X className="w-5 h-5" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Recordings List/Grid */}
        {!isLoading && filteredRecordings.length > 0 && (
          <>
            {viewMode === 'list' ? (
              <RecordingList
                recordings={filteredRecordings}
                onPlay={handlePlay}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onShare={handleShare}
                onViewDetails={handleViewDetails}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecordings.map((recording) => (
                  <Card
                    key={recording.id}
                    variant="elevated"
                    rounded="3xl"
                    padding="none"
                    className="hover:shadow-2xl transition-shadow cursor-pointer"
                  >
                    <CardBody>
                      <div className="p-6">
                        {/* Checkbox for selection */}
                        <div className="flex items-start justify-between mb-4">
                          <button
                            onClick={() => toggleSelectRecording(recording.id)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {selectedRecordings.has(recording.id) ? (
                              <CheckSquare className="w-5 h-5 text-primary-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1 mx-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <Video className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <div>
                            {recording.status === 'completed' && (
                              <CheckCircle2 className="w-5 h-5 text-success-600" />
                            )}
                            {recording.status === 'processing' && (
                              <Clock className="w-5 h-5 text-warning-600" />
                            )}
                            {recording.status === 'failed' && (
                              <AlertCircle className="w-5 h-5 text-error-600" />
                            )}
                            {recording.status === 'recording' && (
                              <div className="w-5 h-5 bg-info-600 rounded-full animate-pulse" />
                            )}
                          </div>
                        </div>

                        <h3
                          className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors"
                          onClick={() => handleViewDetails(recording)}
                        >
                          {recording.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">{recording.customer}</p>

                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{recording.duration}</span>
                          </div>
                          {recording.score !== undefined && (
                            <div
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                recording.score >= 90
                                  ? 'bg-success-100 text-success-700'
                                  : recording.score >= 70
                                  ? 'bg-warning-100 text-warning-700'
                                  : 'bg-error-100 text-error-700'
                              }`}
                            >
                              {recording.score}%
                            </div>
                          )}
                        </div>

                        {recording.category && (
                          <div className="mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {recording.category}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => handlePlay(recording)}
                            disabled={recording.status !== 'completed'}
                          >
                            <Video className="w-4 h-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(recording)}
                            disabled={recording.status !== 'completed'}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare(recording)}
                            disabled={recording.status !== 'completed'}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Recording Player Modal */}
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
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              {/* Player Content */}
              <div className="p-6">
                <RecordingPlayer
                  recording={{
                    id: selectedRecording.id,
                    title: selectedRecording.title,
                    audioUrl: '/demo-audio.mp3',
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

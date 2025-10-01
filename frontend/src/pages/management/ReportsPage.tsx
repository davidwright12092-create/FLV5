import { useState } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ReportsGenerator from '../../components/management/ReportsGenerator'
import {
  FileText,
  Download,
  Eye,
  Copy,
  Trash2,
  Calendar,
  Filter,
  Clock,
  Play,
  Pause,
  Edit,
  FileSpreadsheet,
  FileBarChart,
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
} from 'lucide-react'

// TypeScript Interfaces
interface SavedReport {
  id: string
  name: string
  type: string
  category: 'performance' | 'sales' | 'team' | 'custom'
  dateRange: string
  dateGenerated: string
  format: 'PDF' | 'Excel' | 'CSV' | 'PowerPoint'
  size: string
  status: 'ready' | 'processing' | 'error'
}

interface ScheduledReport {
  id: string
  name: string
  type: string
  frequency: 'daily' | 'weekly' | 'monthly'
  nextRun: string
  lastRun: string
  status: 'active' | 'paused'
  recipients: string[]
}

interface QuickTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'performance' | 'sales' | 'team' | 'custom'
  color: string
}

// No mock data - will fetch from API
const mockSavedReports: SavedReport[] = []

// No mock data - will fetch from API
const mockScheduledReports: ScheduledReport[] = []

const quickTemplates: QuickTemplate[] = [
  {
    id: 'performance-snapshot',
    name: 'Performance Snapshot',
    description: 'Quick overview of key performance metrics',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'performance',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'sales-summary',
    name: 'Sales Summary',
    description: 'Current sales pipeline and opportunities',
    icon: <DollarSign className="w-6 h-6" />,
    category: 'sales',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'team-activity',
    name: 'Team Activity',
    description: 'Team member activities and engagement',
    icon: <Users className="w-6 h-6" />,
    category: 'team',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'conversation-insights',
    name: 'Conversation Insights',
    description: 'Recent conversation analytics and trends',
    icon: <MessageSquare className="w-6 h-6" />,
    category: 'custom',
    color: 'from-orange-500 to-red-500',
  },
]

type FilterType = 'all' | 'performance' | 'sales' | 'team' | 'custom'

export default function ReportsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Filter reports based on active filter
  const filteredReports = mockSavedReports.filter(
    (report) => activeFilter === 'all' || report.category === activeFilter
  )

  const handleViewReport = (report: SavedReport) => {
    setSelectedReport(report)
    setShowPreview(true)
  }

  const handleDownloadReport = (report: SavedReport) => {
    console.log('Downloading report:', report.name)
    // Implement download logic
  }

  const handleDuplicateReport = (report: SavedReport) => {
    console.log('Duplicating report:', report.name)
    // Implement duplicate logic
  }

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      console.log('Deleting report:', reportId)
      // Implement delete logic
    }
  }

  const handleEditSchedule = (scheduleId: string) => {
    console.log('Editing schedule:', scheduleId)
    // Implement edit schedule logic
  }

  const handleToggleSchedule = (scheduleId: string) => {
    console.log('Toggling schedule:', scheduleId)
    // Implement toggle schedule logic
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    if (confirm('Are you sure you want to delete this scheduled report?')) {
      console.log('Deleting schedule:', scheduleId)
      // Implement delete schedule logic
    }
  }

  const handleQuickReport = (templateId: string) => {
    console.log('Generating quick report:', templateId)
    // Implement quick report generation
  }

  const getFormatIcon = (format: SavedReport['format']) => {
    switch (format) {
      case 'Excel':
        return <FileSpreadsheet className="w-4 h-4" />
      case 'PowerPoint':
        return <FileBarChart className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: SavedReport['status']) => {
    switch (status) {
      case 'ready':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg font-medium">
            Ready
          </span>
        )
      case 'processing':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Processing
          </span>
        )
      case 'error':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        )
    }
  }

  // Create Report Modal Component
  const CreateReportModal = () => {
    if (!showCreateModal) return null

    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowCreateModal(false)}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-7xl my-8">
            <div className="relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute -top-4 -right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <ReportsGenerator />
            </div>
          </div>
        </div>
      </>
    )
  }

  // Report Preview Sidebar
  const ReportPreviewSidebar = () => {
    if (!showPreview || !selectedReport) return null

    return (
      <>
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setShowPreview(false)}
        />
        <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Report Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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

            <div className="space-y-6">
              {/* Report Header */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-xl text-white">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {selectedReport.name}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedReport.type}</p>
                  </div>
                </div>
                {getStatusBadge(selectedReport.status)}
              </div>

              {/* Report Details */}
              <Card variant="bordered" padding="md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date Range</span>
                    <span className="font-medium text-gray-900">{selectedReport.dateRange}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Generated</span>
                    <span className="font-medium text-gray-900">{selectedReport.dateGenerated}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Format</span>
                    <span className="font-medium text-gray-900 flex items-center gap-1">
                      {getFormatIcon(selectedReport.format)}
                      {selectedReport.format}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">File Size</span>
                    <span className="font-medium text-gray-900">{selectedReport.size}</span>
                  </div>
                </div>
              </Card>

              {/* Sample Preview */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview</h4>
                <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-2xl inline-flex mb-4">
                      <BarChart3 className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-gray-600 text-sm">
                      Report preview will be displayed here
                    </p>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Export As</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium text-sm">PDF</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="font-medium text-sm">Excel</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium text-sm">CSV</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-colors">
                    <FileBarChart className="w-4 h-4" />
                    <span className="font-medium text-sm">PPT</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleDownloadReport(selectedReport)}
                >
                  <Download className="w-5 h-5" />
                  Download Report
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleDuplicateReport(selectedReport)}
                >
                  <Copy className="w-5 h-5" />
                  Duplicate Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-2xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              Reports
            </h1>
            <p className="text-gray-600 mt-2">
              Generate, view, and manage comprehensive business intelligence reports
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5" />
            Create Report
          </Button>
        </div>

        {/* Quick Report Templates */}
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Quick Report Templates"
            subtitle="Generate reports instantly with one click"
          />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleQuickReport(template.id)}
                  className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-transparent hover:shadow-lg transition-all text-left bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50"
                >
                  <div
                    className={`inline-flex p-3 rounded-xl mb-4 bg-gradient-to-br ${template.color} text-white`}
                  >
                    {template.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Filters */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All Reports' },
                { value: 'performance', label: 'Performance' },
                { value: 'sales', label: 'Sales' },
                { value: 'team', label: 'Team' },
                { value: 'custom', label: 'Custom' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value as FilterType)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    activeFilter === filter.value
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Saved Reports Section */}
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Saved Reports"
            subtitle={`${filteredReports.length} reports available`}
          />
          <CardBody>
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all bg-white group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-3 rounded-xl group-hover:from-purple-500 group-hover:to-blue-500 transition-colors">
                      <FileText className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.name}
                        </h3>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {report.dateRange}
                        </span>
                        <span className="flex items-center gap-1">
                          {getFormatIcon(report.format)}
                          {report.format}
                        </span>
                        <span>{report.size}</span>
                        <span className="text-gray-400">•</span>
                        <span>Generated {report.dateGenerated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewReport(report)}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadReport(report)}
                      disabled={report.status !== 'ready'}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateReport(report)}
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Scheduled Reports Section */}
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Scheduled Reports"
            subtitle="Recurring reports sent automatically"
          />
          <CardBody>
            <div className="space-y-3">
              {mockScheduledReports.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all bg-white group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-3 rounded-xl group-hover:from-blue-500 group-hover:to-cyan-500 transition-colors">
                      <Calendar className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {schedule.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-lg font-medium ${
                            schedule.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {schedule.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="capitalize font-medium">{schedule.frequency}</span>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Next: {schedule.nextRun}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{schedule.recipients.length} recipients</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSchedule(schedule.id)}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleSchedule(schedule.id)}
                    >
                      {schedule.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Resume
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Modals */}
      <CreateReportModal />
      <ReportPreviewSidebar />
    </PageLayout>
  )
}

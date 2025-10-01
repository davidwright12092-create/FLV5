import { useState } from 'react'
import { Card, CardHeader, CardBody, CardFooter } from '../ui/Card'
import {
  FileText,
  Calendar,
  Filter,
  Download,
  Mail,
  BarChart,
  PieChart,
  Save,
  LineChart,
  Users,
  TrendingUp,
  MessageSquare,
  Heart,
  DollarSign,
  Clock,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronLeft,
  Eye,
  RefreshCw,
} from 'lucide-react'

// TypeScript Types
export interface ReportMetric {
  id: string
  name: string
  description: string
  category: 'performance' | 'engagement' | 'quality' | 'outcomes'
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  metrics: string[]
}

export interface Report {
  id: string
  name: string
  type: string
  dateRange: string
  format: string
  createdAt: string
  size: string
}

export interface ReportConfig {
  type: string
  dateRange: {
    preset: string
    customStart?: string
    customEnd?: string
  }
  filters: {
    teamMembers: string[]
    categories: string[]
    scoreRange: { min: number; max: number }
    customerSegments: string[]
  }
  metrics: string[]
  visualization: {
    includeCharts: boolean
    chartTypes: string[]
    tableFormat: 'summary' | 'detailed'
  }
  format: string
  delivery: {
    email: boolean
    recipients: string[]
    schedule?: {
      frequency: 'daily' | 'weekly' | 'monthly'
      dayOfWeek?: number
      dayOfMonth?: number
    }
  }
  name: string
  description: string
}

// Mock Data
const reportTemplates: ReportTemplate[] = [
  {
    id: 'conversation-summary',
    name: 'Conversation Summary',
    description: 'Overview of all conversations with key metrics and sentiment analysis',
    icon: <MessageSquare className="w-6 h-6" />,
    metrics: ['total-conversations', 'avg-duration', 'sentiment-score', 'resolution-rate'],
  },
  {
    id: 'team-performance',
    name: 'Team Performance',
    description: 'Individual and team performance metrics across all activities',
    icon: <Users className="w-6 h-6" />,
    metrics: ['conversations-per-member', 'avg-response-time', 'customer-satisfaction', 'completion-rate'],
  },
  {
    id: 'sales-pipeline',
    name: 'Sales Pipeline',
    description: 'Sales opportunities, conversion rates, and revenue forecasting',
    icon: <DollarSign className="w-6 h-6" />,
    metrics: ['pipeline-value', 'conversion-rate', 'avg-deal-size', 'sales-velocity'],
  },
  {
    id: 'customer-sentiment',
    name: 'Customer Sentiment',
    description: 'Detailed sentiment analysis and customer satisfaction trends',
    icon: <Heart className="w-6 h-6" />,
    metrics: ['sentiment-distribution', 'satisfaction-score', 'nps-score', 'feedback-trends'],
  },
]

const availableMetrics: ReportMetric[] = [
  // Performance
  { id: 'total-conversations', name: 'Total Conversations', description: 'Total number of conversations in the period', category: 'performance' },
  { id: 'conversations-per-member', name: 'Conversations per Team Member', description: 'Average conversations handled by each team member', category: 'performance' },
  { id: 'avg-response-time', name: 'Average Response Time', description: 'Mean time to first response', category: 'performance' },
  { id: 'completion-rate', name: 'Completion Rate', description: 'Percentage of conversations completed', category: 'performance' },

  // Engagement
  { id: 'avg-duration', name: 'Average Duration', description: 'Mean conversation duration', category: 'engagement' },
  { id: 'interaction-count', name: 'Interaction Count', description: 'Total number of customer interactions', category: 'engagement' },
  { id: 'follow-up-rate', name: 'Follow-up Rate', description: 'Percentage of conversations with follow-ups', category: 'engagement' },
  { id: 'engagement-score', name: 'Engagement Score', description: 'Overall customer engagement metric', category: 'engagement' },

  // Quality
  { id: 'sentiment-score', name: 'Sentiment Score', description: 'Average sentiment across conversations', category: 'quality' },
  { id: 'customer-satisfaction', name: 'Customer Satisfaction', description: 'CSAT score from customer feedback', category: 'quality' },
  { id: 'nps-score', name: 'NPS Score', description: 'Net Promoter Score', category: 'quality' },
  { id: 'quality-score', name: 'Quality Score', description: 'Internal quality assessment score', category: 'quality' },

  // Outcomes
  { id: 'resolution-rate', name: 'Resolution Rate', description: 'Percentage of issues resolved', category: 'outcomes' },
  { id: 'conversion-rate', name: 'Conversion Rate', description: 'Percentage of conversations leading to conversion', category: 'outcomes' },
  { id: 'pipeline-value', name: 'Pipeline Value', description: 'Total value of opportunities in pipeline', category: 'outcomes' },
  { id: 'sales-velocity', name: 'Sales Velocity', description: 'Rate of deals moving through pipeline', category: 'outcomes' },
]

const recentReports: Report[] = [
  {
    id: '1',
    name: 'Q1 Performance Report',
    type: 'Team Performance',
    dateRange: 'Jan 1 - Mar 31, 2025',
    format: 'PDF',
    createdAt: '2025-09-28',
    size: '2.4 MB',
  },
  {
    id: '2',
    name: 'Weekly Sentiment Analysis',
    type: 'Customer Sentiment',
    dateRange: 'Sep 23 - Sep 29, 2025',
    format: 'Excel',
    createdAt: '2025-09-27',
    size: '1.8 MB',
  },
  {
    id: '3',
    name: 'Monthly Sales Pipeline',
    type: 'Sales Pipeline',
    dateRange: 'September 2025',
    format: 'PowerPoint',
    createdAt: '2025-09-25',
    size: '3.2 MB',
  },
]

const ReportsGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState<ReportConfig>({
    type: '',
    dateRange: {
      preset: 'this-week',
    },
    filters: {
      teamMembers: [],
      categories: [],
      scoreRange: { min: 0, max: 100 },
      customerSegments: [],
    },
    metrics: [],
    visualization: {
      includeCharts: true,
      chartTypes: ['bar', 'line'],
      tableFormat: 'summary',
    },
    format: 'pdf',
    delivery: {
      email: false,
      recipients: [],
    },
    name: '',
    description: '',
  })

  const handleTemplateSelect = (template: ReportTemplate) => {
    setConfig({
      ...config,
      type: template.id,
      name: template.name,
      metrics: template.metrics,
    })
  }

  const handleMetricToggle = (metricId: string) => {
    setConfig({
      ...config,
      metrics: config.metrics.includes(metricId)
        ? config.metrics.filter(id => id !== metricId)
        : [...config.metrics, metricId],
    })
  }

  const handleSelectAllMetrics = (category?: string) => {
    const metricsToSelect = category
      ? availableMetrics.filter(m => m.category === category).map(m => m.id)
      : availableMetrics.map(m => m.id)

    setConfig({
      ...config,
      metrics: [...new Set([...config.metrics, ...metricsToSelect])],
    })
  }

  const handleDeselectAllMetrics = (category?: string) => {
    if (category) {
      const categoryMetricIds = availableMetrics.filter(m => m.category === category).map(m => m.id)
      setConfig({
        ...config,
        metrics: config.metrics.filter(id => !categoryMetricIds.includes(id)),
      })
    } else {
      setConfig({ ...config, metrics: [] })
    }
  }

  const totalSteps = 5

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-2xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            Reports Generator
          </h1>
          <p className="text-gray-600 text-lg">Create custom reports to analyze your business performance</p>
        </div>

        {/* Progress Steps - Desktop */}
        <Card variant="elevated" padding="md" className="mb-8 hidden md:block">
          <div className="flex items-center justify-between">
            {[
              { number: 1, label: 'Report Type' },
              { number: 2, label: 'Data & Filters' },
              { number: 3, label: 'Metrics' },
              { number: 4, label: 'Format & Delivery' },
              { number: 5, label: 'Preview' },
            ].map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      currentStep === step.number
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg scale-110'
                        : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      currentStep === step.number ? 'text-purple-600' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-all ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Mobile Step Indicator */}
        <Card variant="elevated" padding="md" className="mb-8 md:hidden">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Step {currentStep} of {totalSteps}
            </div>
            <div className="flex gap-1 justify-center">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded ${
                    index + 1 <= currentStep ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Report Type Selection */}
            {currentStep === 1 && (
              <Card variant="elevated" padding="lg">
                <CardHeader title="Select Report Type" subtitle="Choose a pre-built template or create a custom report" />
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {reportTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`p-6 rounded-2xl border-2 transition-all text-left hover:shadow-lg ${
                          config.type === template.id
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div
                          className={`inline-flex p-3 rounded-xl mb-4 ${
                            config.type === template.id
                              ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                              : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                          }`}
                        >
                          {template.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="p-6 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/50">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-xl text-white">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Report Builder</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Build a custom report by selecting your own metrics and configuration
                        </p>
                        <button
                          onClick={() => setConfig({ ...config, type: 'custom' })}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            config.type === 'custom'
                              ? 'bg-purple-500 text-white'
                              : 'bg-white text-purple-600 border border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          {config.type === 'custom' ? 'Selected' : 'Select Custom'}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Step 2: Data Range & Filters */}
            {currentStep === 2 && (
              <Card variant="elevated" padding="lg">
                <CardHeader title="Data Range & Filters" subtitle="Define the scope and filters for your report" />
                <CardBody>
                  {/* Date Range */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      Date Range
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { value: 'this-week', label: 'This Week' },
                        { value: 'last-month', label: 'Last Month' },
                        { value: 'quarter', label: 'This Quarter' },
                        { value: 'year', label: 'This Year' },
                        { value: 'custom', label: 'Custom Range' },
                      ].map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => setConfig({ ...config, dateRange: { preset: preset.value } })}
                          className={`px-4 py-3 rounded-xl font-medium transition-all ${
                            config.dateRange.preset === preset.value
                              ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md'
                              : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-300'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    {config.dateRange.preset === 'custom' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                          <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                dateRange: { ...config.dateRange, customStart: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                          <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                dateRange: { ...config.dateRange, customEnd: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Users className="w-4 h-4 text-blue-500" />
                        Team Members
                      </label>
                      <select
                        multiple
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setConfig({ ...config, filters: { ...config.filters, teamMembers: selected } })
                        }}
                      >
                        <option value="all">All Team Members</option>
                        <option value="member-1">John Smith</option>
                        <option value="member-2">Sarah Johnson</option>
                        <option value="member-3">Mike Davis</option>
                        <option value="member-4">Emily Chen</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Filter className="w-4 h-4 text-green-500" />
                        Categories
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Sales', 'Support', 'Onboarding', 'Retention', 'General'].map((category) => (
                          <button
                            key={category}
                            onClick={() => {
                              const categories = config.filters.categories.includes(category)
                                ? config.filters.categories.filter(c => c !== category)
                                : [...config.filters.categories, category]
                              setConfig({ ...config, filters: { ...config.filters, categories } })
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              config.filters.categories.includes(category)
                                ? 'bg-green-500 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:border-green-300'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        Score Range
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={config.filters.scoreRange.min}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              filters: {
                                ...config.filters,
                                scoreRange: { ...config.filters.scoreRange, min: parseInt(e.target.value) },
                              },
                            })
                          }
                          className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-gray-600">to</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={config.filters.scoreRange.max}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              filters: {
                                ...config.filters,
                                scoreRange: { ...config.filters.scoreRange, max: parseInt(e.target.value) },
                              },
                            })
                          }
                          className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Heart className="w-4 h-4 text-pink-500" />
                        Customer Segments
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Enterprise', 'SMB', 'Startup', 'Individual'].map((segment) => (
                          <button
                            key={segment}
                            onClick={() => {
                              const segments = config.filters.customerSegments.includes(segment)
                                ? config.filters.customerSegments.filter(s => s !== segment)
                                : [...config.filters.customerSegments, segment]
                              setConfig({ ...config, filters: { ...config.filters, customerSegments: segments } })
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              config.filters.customerSegments.includes(segment)
                                ? 'bg-pink-500 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:border-pink-300'
                            }`}
                          >
                            {segment}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Step 3: Metrics Selection */}
            {currentStep === 3 && (
              <Card variant="elevated" padding="lg">
                <CardHeader
                  title="Select Metrics"
                  subtitle="Choose the metrics to include in your report"
                  action={
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectAllMetrics()}
                        className="px-3 py-1 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => handleDeselectAllMetrics()}
                        className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  }
                />
                <CardBody>
                  {['performance', 'engagement', 'quality', 'outcomes'].map((category) => (
                    <div key={category} className="mb-6 last:mb-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">{category}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSelectAllMetrics(category)}
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                          >
                            Select All
                          </button>
                          <span className="text-gray-400">|</span>
                          <button
                            onClick={() => handleDeselectAllMetrics(category)}
                            className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableMetrics
                          .filter((m) => m.category === category)
                          .map((metric) => (
                            <button
                              key={metric.id}
                              onClick={() => handleMetricToggle(metric.id)}
                              className={`group p-4 rounded-xl border-2 transition-all text-left ${
                                config.metrics.includes(metric.id)
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 bg-white hover:border-purple-300'
                              }`}
                              title={metric.description}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  {config.metrics.includes(metric.id) ? (
                                    <CheckSquare className="w-5 h-5 text-purple-500" />
                                  ) : (
                                    <Square className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{metric.name}</div>
                                  <div className="text-xs text-gray-600 mt-1">{metric.description}</div>
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            )}

            {/* Step 4: Format & Delivery Options */}
            {currentStep === 4 && (
              <Card variant="elevated" padding="lg">
                <CardHeader title="Format & Delivery" subtitle="Configure how your report will be generated and delivered" />
                <CardBody>
                  {/* Visualization Options */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualization Options</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl cursor-pointer hover:border-purple-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={config.visualization.includeCharts}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              visualization: { ...config.visualization, includeCharts: e.target.checked },
                            })
                          }
                          className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Include Charts</div>
                          <div className="text-sm text-gray-600">Add visual charts and graphs to your report</div>
                        </div>
                      </label>

                      {config.visualization.includeCharts && (
                        <div className="pl-8 space-y-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chart Types</label>
                          <div className="flex flex-wrap gap-3">
                            {[
                              { value: 'bar', label: 'Bar Chart', icon: <BarChart className="w-4 h-4" /> },
                              { value: 'line', label: 'Line Chart', icon: <LineChart className="w-4 h-4" /> },
                              { value: 'pie', label: 'Pie Chart', icon: <PieChart className="w-4 h-4" /> },
                            ].map((chartType) => (
                              <button
                                key={chartType.value}
                                onClick={() => {
                                  const types = config.visualization.chartTypes.includes(chartType.value)
                                    ? config.visualization.chartTypes.filter(t => t !== chartType.value)
                                    : [...config.visualization.chartTypes, chartType.value]
                                  setConfig({
                                    ...config,
                                    visualization: { ...config.visualization, chartTypes: types },
                                  })
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                  config.visualization.chartTypes.includes(chartType.value)
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-300'
                                }`}
                              >
                                {chartType.icon}
                                {chartType.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Table Format</label>
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              setConfig({
                                ...config,
                                visualization: { ...config.visualization, tableFormat: 'summary' },
                              })
                            }
                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                              config.visualization.tableFormat === 'summary'
                                ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md'
                                : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-300'
                            }`}
                          >
                            Summary View
                          </button>
                          <button
                            onClick={() =>
                              setConfig({
                                ...config,
                                visualization: { ...config.visualization, tableFormat: 'detailed' },
                              })
                            }
                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                              config.visualization.tableFormat === 'detailed'
                                ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md'
                                : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-300'
                            }`}
                          >
                            Detailed View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Export Format */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'pdf', label: 'PDF', icon: <FileText className="w-5 h-5" /> },
                        { value: 'excel', label: 'Excel', icon: <FileText className="w-5 h-5" /> },
                        { value: 'csv', label: 'CSV', icon: <FileText className="w-5 h-5" /> },
                        { value: 'pptx', label: 'PowerPoint', icon: <FileText className="w-5 h-5" /> },
                      ].map((format) => (
                        <button
                          key={format.value}
                          onClick={() => setConfig({ ...config, format: format.value })}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                            config.format === format.value
                              ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md'
                              : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-300'
                          }`}
                        >
                          {format.icon}
                          {format.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Options */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Options</h3>
                    <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl cursor-pointer hover:border-purple-300 transition-colors mb-4">
                      <input
                        type="checkbox"
                        checked={config.delivery.email}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            delivery: { ...config.delivery, email: e.target.checked },
                          })
                        }
                        className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <Mail className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="font-medium text-gray-900">Email Report</div>
                        <div className="text-sm text-gray-600">Send this report via email</div>
                      </div>
                    </label>

                    {config.delivery.email && (
                      <div className="pl-8 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Recipients</label>
                          <input
                            type="text"
                            placeholder="Enter email addresses (comma-separated)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                delivery: { ...config.delivery, recipients: e.target.value.split(',').map(s => s.trim()) },
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Recurring Report</label>
                          <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onChange={(e) => {
                              const frequency = e.target.value as 'daily' | 'weekly' | 'monthly' | undefined
                              setConfig({
                                ...config,
                                delivery: {
                                  ...config.delivery,
                                  schedule: frequency ? { frequency } : undefined,
                                },
                              })
                            }}
                          >
                            <option value="">One-time report</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Report Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                        <input
                          type="text"
                          value={config.name}
                          onChange={(e) => setConfig({ ...config, name: e.target.value })}
                          placeholder="e.g., Q1 Performance Report"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                        <textarea
                          value={config.description}
                          onChange={(e) => setConfig({ ...config, description: e.target.value })}
                          placeholder="Add notes about this report..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Step 5: Preview */}
            {currentStep === 5 && (
              <Card variant="elevated" padding="lg">
                <CardHeader title="Preview Report" subtitle="Review your report configuration before generating" />
                <CardBody>
                  <div className="space-y-6">
                    {/* Preview Card */}
                    <div className="border-2 border-purple-300 rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-blue-50">
                      <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-6 h-6 text-purple-500" />
                        <h3 className="text-xl font-bold text-gray-900">{config.name || 'Untitled Report'}</h3>
                      </div>
                      {config.description && (
                        <p className="text-gray-600 mb-4">{config.description}</p>
                      )}

                      {/* Mock Preview Content */}
                      <div className="bg-white rounded-xl p-6 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b">
                          <div>
                            <div className="text-sm text-gray-600">Report Type</div>
                            <div className="font-semibold text-gray-900">
                              {reportTemplates.find(t => t.id === config.type)?.name || 'Custom Report'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Date Range</div>
                            <div className="font-semibold text-gray-900 capitalize">
                              {config.dateRange.preset.replace('-', ' ')}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Format</div>
                            <div className="font-semibold text-gray-900 uppercase">{config.format}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-2">Selected Metrics ({config.metrics.length})</div>
                          <div className="flex flex-wrap gap-2">
                            {config.metrics.slice(0, 6).map((metricId) => {
                              const metric = availableMetrics.find(m => m.id === metricId)
                              return metric ? (
                                <span key={metricId} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                                  {metric.name}
                                </span>
                              ) : null
                            })}
                            {config.metrics.length > 6 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                +{config.metrics.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sample Chart Preview */}
                        {config.visualization.includeCharts && (
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-3">Sample Visualization</div>
                            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-6 flex items-center justify-center">
                              <div className="text-center">
                                <BarChart className="w-16 h-16 text-purple-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Charts will be generated with actual data</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sample Table Preview */}
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-3">Sample Data Table</div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="px-4 py-2 text-left font-semibold">Metric</th>
                                  <th className="px-4 py-2 text-left font-semibold">Value</th>
                                  <th className="px-4 py-2 text-left font-semibold">Change</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t">
                                  <td className="px-4 py-2">Total Conversations</td>
                                  <td className="px-4 py-2 font-semibold">1,248</td>
                                  <td className="px-4 py-2 text-green-600">+12.5%</td>
                                </tr>
                                <tr className="border-t">
                                  <td className="px-4 py-2">Avg Response Time</td>
                                  <td className="px-4 py-2 font-semibold">2.3 min</td>
                                  <td className="px-4 py-2 text-green-600">-8.2%</td>
                                </tr>
                                <tr className="border-t">
                                  <td className="px-4 py-2">Customer Satisfaction</td>
                                  <td className="px-4 py-2 font-semibold">94.2%</td>
                                  <td className="px-4 py-2 text-green-600">+3.1%</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Download Sample Button */}
                    <button className="w-full py-3 px-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      Download Sample Report
                    </button>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Navigation Buttons */}
            <Card variant="elevated" padding="md">
              <div className="flex justify-between gap-4">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    currentStep === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-300'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="flex gap-3">
                  {currentStep === 5 ? (
                    <>
                      <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 transition-all">
                        <Save className="w-5 h-5" />
                        Save as Template
                      </button>
                      <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg">
                        <Download className="w-5 h-5" />
                        Generate Report
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Recent Reports */}
          <div className="lg:col-span-1">
            <Card variant="elevated" padding="lg" className="sticky top-8">
              <CardHeader title="Recent Reports" subtitle="Previously generated reports" />
              <CardBody>
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all bg-white"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{report.name}</h4>
                          <p className="text-xs text-gray-600">{report.type}</p>
                        </div>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg font-medium">
                          {report.format}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        <div>{report.dateRange}</div>
                        <div>Created: {report.createdAt}</div>
                        <div>Size: {report.size}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-xs font-medium hover:bg-purple-600 transition-colors">
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                        <button className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                          <RefreshCw className="w-3 h-3" />
                          Re-generate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
              <CardFooter divider>
                <button className="w-full text-center text-sm text-purple-600 font-medium hover:text-purple-700">
                  View All Reports
                </button>
              </CardFooter>
            </Card>

            {/* Help Card */}
            <Card variant="elevated" padding="lg" className="mt-6">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Learn how to create powerful reports to analyze your business data
                </p>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
                  View Documentation
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsGenerator

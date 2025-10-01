import { useState, useMemo } from 'react'
import PageLayout from '../components/layout/PageLayout'
import SentimentChart from '../components/analytics/SentimentChart'
import ProcessScore from '../components/analytics/ProcessScore'
import OpportunityList from '../components/analytics/OpportunityList'
import ActionItems from '../components/analytics/ActionItems'
import { Card } from '../components/ui/Card'
import {
  TrendingUp,
  MessageCircle,
  Target,
  CheckCircle2,
  DollarSign,
  BarChart3,
  Download,
  Calendar,
  Sparkles,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  ChevronRight,
  Brain
} from 'lucide-react'

// TypeScript Interfaces
interface KPICardProps {
  title: string
  value: string | number
  change: number
  changeLabel: string
  icon: React.ReactNode
  gradient: string
  loading?: boolean
}

interface TimePeriod {
  value: string
  label: string
}

const TIME_PERIODS: TimePeriod[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'Last 3 Months' },
  { value: 'custom', label: 'Custom' }
]

// KPI Card Component
const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  gradient,
  loading = false
}) => {
  const isPositive = change >= 0

  if (loading) {
    return (
      <Card variant="elevated" padding="lg" className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </Card>
    )
  }

  return (
    <Card
      variant="elevated"
      padding="lg"
      className="relative overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer"
    >
      {/* Background Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>

      <div className="relative">
        {/* Icon and Title */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
            {icon}
          </div>
        </div>

        {/* Value */}
        <div className="mb-3">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>

        {/* Change Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              isPositive
                ? 'bg-success-50 text-success-700'
                : 'bg-error-50 text-error-700'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(change)}%
          </div>
          <span className="text-xs text-gray-500">{changeLabel}</span>
        </div>
      </div>
    </Card>
  )
}

// Section Header Component
const SectionHeader: React.FC<{
  icon: React.ReactNode
  title: string
  subtitle?: string
}> = ({ icon, title, subtitle }) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue shadow-md">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

// Quick Insights Component
const QuickInsights: React.FC<{ loading?: boolean }> = ({ loading = false }) => {
  const insights = [
    {
      type: 'positive',
      title: 'Sales Momentum Strong',
      description: 'Opportunity pipeline up 23% with 8 high-value deals in progress',
      icon: <TrendingUp className="w-5 h-5 text-success-600" />
    },
    {
      type: 'warning',
      title: 'Action Items Pending',
      description: '12 high-priority tasks due within 48 hours requiring immediate attention',
      icon: <AlertCircle className="w-5 h-5 text-warning-600" />
    },
    {
      type: 'info',
      title: 'Customer Sentiment Improving',
      description: 'Positive sentiment increased by 8.5% with consistent upward trend',
      icon: <Sparkles className="w-5 h-5 text-brand-purple" />
    },
    {
      type: 'positive',
      title: 'Process Adherence Excellent',
      description: 'Team maintaining 82% adherence score across all sales stages',
      icon: <CheckCircle2 className="w-5 h-5 text-success-600" />
    }
  ]

  if (loading) {
    return (
      <Card variant="elevated" padding="lg" className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-brand-purple/5 via-white to-brand-cyan/5">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-brand-purple" />
        <h3 className="text-lg font-semibold text-gray-900">Quick Insights</h3>
        <span className="ml-auto text-xs text-gray-500 bg-brand-purple/10 px-2 py-1 rounded-full font-medium">
          AI-Powered
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-brand-cyan/30 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className={`p-2 rounded-lg ${
              insight.type === 'positive' ? 'bg-success-50' :
              insight.type === 'warning' ? 'bg-warning-50' : 'bg-brand-purple/10'
            }`}>
              {insight.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm mb-1">{insight.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-cyan transition-colors mt-1" />
          </div>
        ))}
      </div>
    </Card>
  )
}

// Main AnalyticsPage Component
export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month')
  const [isLoading, setIsLoading] = useState(false)
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)

  // No mock data - will fetch from API
  const kpiData = useMemo(() => ({
    totalConversations: {
      value: 0,
      change: 0,
      changeLabel: 'vs last period'
    },
    avgSentiment: {
      value: '0/10',
      change: 0,
      changeLabel: 'vs last period'
    },
    opportunities: {
      value: 0,
      change: 0,
      changeLabel: 'vs last period'
    },
    actionItems: {
      value: 0,
      change: 0,
      changeLabel: 'vs last period'
    },
    processScore: {
      value: 0,
      change: 0,
      changeLabel: 'vs last period'
    },
    revenue: {
      value: '$0',
      change: 0,
      changeLabel: 'vs last period'
    }
  }), [])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (period === 'custom') {
      setShowCustomDatePicker(true)
    } else {
      setShowCustomDatePicker(false)
      // In real app, trigger API call here
    }
  }

  const handleExport = () => {
    // In real app, trigger export functionality
    console.log('Exporting analytics data...')
  }

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Analytics</span>
        </div>

        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Analytics & Insights
            </h1>
            <p className="text-gray-600">
              Comprehensive analytics and AI-powered insights from your customer conversations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time Period Selector */}
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 shadow-sm p-1">
              {TIME_PERIODS.map(period => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === period.value
                      ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Custom Date Picker (shown when Custom is selected) */}
        {showCustomDatePicker && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
                placeholder="Start Date"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
                placeholder="End Date"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg text-sm font-medium hover:shadow-md transition-shadow">
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KPICard
          title="Total Conversations"
          value={kpiData.totalConversations.value.toLocaleString()}
          change={kpiData.totalConversations.change}
          changeLabel={kpiData.totalConversations.changeLabel}
          icon={<MessageCircle className="w-6 h-6 text-white" />}
          gradient="from-brand-cyan to-brand-blue"
          loading={isLoading}
        />

        <KPICard
          title="Average Sentiment Score"
          value={kpiData.avgSentiment.value}
          change={kpiData.avgSentiment.change}
          changeLabel={kpiData.avgSentiment.changeLabel}
          icon={<Sparkles className="w-6 h-6 text-white" />}
          gradient="from-brand-purple to-brand-pink"
          loading={isLoading}
        />

        <KPICard
          title="Sales Opportunities"
          value={kpiData.opportunities.value}
          change={kpiData.opportunities.change}
          changeLabel={kpiData.opportunities.changeLabel}
          icon={<Target className="w-6 h-6 text-white" />}
          gradient="from-brand-orange to-brand-yellow"
          loading={isLoading}
        />

        <KPICard
          title="Action Items Pending"
          value={kpiData.actionItems.value}
          change={kpiData.actionItems.change}
          changeLabel={kpiData.actionItems.changeLabel}
          icon={<CheckCircle2 className="w-6 h-6 text-white" />}
          gradient="from-success-500 to-success-600"
          loading={isLoading}
        />

        <KPICard
          title="Average Process Score"
          value={kpiData.processScore.value}
          change={kpiData.processScore.change}
          changeLabel={kpiData.processScore.changeLabel}
          icon={<BarChart3 className="w-6 h-6 text-white" />}
          gradient="from-brand-blue to-brand-purple"
          loading={isLoading}
        />

        <KPICard
          title="Revenue Potential"
          value={kpiData.revenue.value}
          change={kpiData.revenue.change}
          changeLabel={kpiData.revenue.changeLabel}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          gradient="from-brand-cyan to-brand-blue"
          loading={isLoading}
        />
      </div>

      {/* Quick Insights Section */}
      <div className="mb-8">
        <QuickInsights loading={isLoading} />
      </div>

      {/* Sentiment Analysis & Process Score Section */}
      <div className="mb-8">
        <SectionHeader
          icon={<Sparkles className="w-5 h-5 text-white" />}
          title="Sentiment & Performance"
          subtitle="Customer sentiment trends and sales process adherence"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sentiment Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SentimentChart />
          </div>

          {/* Process Score - Takes 1 column */}
          <div className="lg:col-span-1">
            <ProcessScore />
          </div>
        </div>
      </div>

      {/* Opportunities & Action Items Section */}
      <div className="mb-8">
        <SectionHeader
          icon={<Target className="w-5 h-5 text-white" />}
          title="Opportunities & Actions"
          subtitle="Sales opportunities and pending action items"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Opportunities List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <OpportunityList />
          </div>

          {/* Action Items - Takes 1 column */}
          <div className="lg:col-span-1">
            <ActionItems />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <Card variant="bordered" padding="md" className="bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Last updated: {new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-brand-cyan hover:text-brand-blue font-medium transition-colors">
              Schedule Report
            </button>
            <button className="text-brand-cyan hover:text-brand-blue font-medium transition-colors">
              Configure Widgets
            </button>
            <button className="text-brand-cyan hover:text-brand-blue font-medium transition-colors">
              View Historical Data
            </button>
          </div>
        </div>
      </Card>
    </PageLayout>
  )
}

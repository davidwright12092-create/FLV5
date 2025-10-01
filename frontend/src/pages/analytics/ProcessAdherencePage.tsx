import { useState } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import ProcessScore from '../../components/analytics/ProcessScore'
import {
  CheckCircle,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  Calendar,
  Users,
  Download,
  AlertTriangle,
  Star,
  Clock,
  BarChart3,
  Activity,
  ChevronRight,
  PlayCircle,
  FileText,
  Zap,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

// TypeScript Interfaces
interface ProcessStage {
  id: string
  name: string
  score: number
  completionRate: number
  averageDuration: number // in seconds
  impact: number // correlation with success (0-100)
  previousScore: number
  previousCompletionRate: number
}

interface TeamMemberPerformance {
  id: string
  name: string
  avatar: string
  overallScore: number
  conversationsAnalyzed: number
  perfectScores: number
  improvementTrend: number // percentage change
  stageScores: { [stageId: string]: number }
}

interface TimeSeriesData {
  date: string
  introduction: number
  discovery: number
  presentation: number
  objections: number
  closing: number
}

interface BestPractice {
  stage: string
  title: string
  description: string
  scriptExample: string
  conversationId?: string
}

interface StageAnalysis {
  stageId: string
  stageName: string
  score: number
  completionRate: number
  averageDuration: number
  impact: number
  trend: number
}

interface ImprovementMetric {
  metric: string
  current: number
  previous: number
  change: number
  changePercent: number
  unit: string
}

// No mock data - will fetch from API
const mockOverallMetrics = {
  overallScore: 0,
  previousScore: 0,
  conversationsAnalyzed: 0,
  previousConversations: 0,
  perfectScores: 0,
  previousPerfectScores: 0,
  needsImprovement: 0,
  previousNeedsImprovement: 0,
  topPerformingAgent: {
    name: '',
    score: 0,
    avatar: '',
  },
  mostSkippedStep: {
    name: '',
    skipRate: 0,
  },
}

// No mock data - will fetch from API
const mockProcessStages: ProcessStage[] = []

// No mock data - will fetch from API
const mockTeamPerformance: TeamMemberPerformance[] = []

// No mock data - will fetch from API
const mockTimeSeriesData: TimeSeriesData[] = []

// No mock data - will fetch from API
const mockBestPractices: BestPractice[] = []

// No mock data - will fetch from API
const mockImprovementMetrics: ImprovementMetric[] = []

// Helper Functions
const getScoreColor = (score: number): string => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'error'
}

const getScoreClasses = (score: number) => {
  if (score >= 90) {
    return {
      bg: 'bg-success-50',
      text: 'text-success-700',
      border: 'border-success-200',
      gradient: 'from-success-500 to-success-600',
    }
  }
  if (score >= 70) {
    return {
      bg: 'bg-warning-50',
      text: 'text-warning-700',
      border: 'border-warning-200',
      gradient: 'from-warning-500 to-warning-600',
    }
  }
  return {
    bg: 'bg-error-50',
    text: 'text-error-700',
    border: 'border-error-200',
    gradient: 'from-error-500 to-error-600',
  }
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

// Components
const Breadcrumb = () => {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">
        Dashboard
      </a>
      <ChevronRight className="w-4 h-4 text-gray-400" />
      <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">
        Analytics
      </a>
      <ChevronRight className="w-4 h-4 text-gray-400" />
      <span className="text-gray-900 font-medium">Process Adherence</span>
    </nav>
  )
}

const MetricCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  gradient,
}: {
  icon: any
  label: string
  value: string | number
  subtitle?: string
  trend?: number
  gradient: string
}) => {
  return (
    <Card variant="elevated" rounded="2xl" className="hover:shadow-xl transition-shadow">
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-3`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-gray-600 font-medium mb-1">{label}</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
          </div>
          {trend !== undefined && trend !== 0 && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                trend > 0 ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

const StageDetailCard = ({ stage }: { stage: ProcessStage }) => {
  const classes = getScoreClasses(stage.score)
  const scoreTrend = stage.score - stage.previousScore
  const completionTrend = stage.completionRate - stage.previousCompletionRate

  return (
    <Card variant="elevated" rounded="2xl" className="hover:shadow-xl transition-all">
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">{stage.name}</h4>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Score</span>
              </div>
              <div className={`text-2xl font-bold ${classes.text}`}>{stage.score}%</div>
              {scoreTrend !== 0 && (
                <div
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    scoreTrend > 0 ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
                  }`}
                >
                  {scoreTrend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(scoreTrend)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Completion Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{stage.completionRate}%</span>
              {completionTrend !== 0 && (
                <span className={`text-xs ${completionTrend > 0 ? 'text-success-700' : 'text-error-700'}`}>
                  ({completionTrend > 0 ? '+' : ''}
                  {completionTrend}%)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Average Duration</span>
            </div>
            <span className="font-semibold text-gray-900">{formatDuration(stage.averageDuration)}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Impact on Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-cyan to-brand-blue rounded-full"
                  style={{ width: `${stage.impact}%` }}
                />
              </div>
              <span className="font-semibold text-gray-900">{stage.impact}%</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

const BestPracticeCard = ({ practice }: { practice: BestPractice }) => {
  return (
    <Card variant="bordered" rounded="xl" className="hover:shadow-lg transition-all">
      <CardBody>
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-purple-600 font-semibold uppercase mb-1">{practice.stage}</div>
            <h4 className="font-semibold text-gray-900">{practice.title}</h4>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-3">{practice.description}</p>
        <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200 mb-3">
          <div className="flex items-start gap-2 mb-2">
            <FileText className="w-4 h-4 text-cyan-600 mt-0.5" />
            <span className="text-xs font-semibold text-cyan-700 uppercase">Script Example</span>
          </div>
          <p className="text-sm text-gray-700 italic leading-relaxed">{practice.scriptExample}</p>
        </div>
        {practice.conversationId && (
          <button className="flex items-center gap-2 text-sm text-brand-blue hover:text-brand-purple transition-colors font-medium">
            <PlayCircle className="w-4 h-4" />
            Listen to Example Conversation
          </button>
        )}
      </CardBody>
    </Card>
  )
}

// Main Component
export default function ProcessAdherencePage() {
  const [dateRange, setDateRange] = useState('last30days')
  const [teamFilter, setTeamFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'score' | 'completion' | 'impact'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedStages = [...mockProcessStages].sort((a, b) => {
    const aValue = sortBy === 'score' ? a.score : sortBy === 'completion' ? a.completionRate : a.impact
    const bValue = sortBy === 'score' ? b.score : sortBy === 'completion' ? b.completionRate : b.impact
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
  })

  const teamChartData = mockTeamPerformance.map((member) => ({
    name: member.name.split(' ')[0],
    score: member.overallScore,
  }))

  // Prepare correlation heatmap data
  const correlationData = mockProcessStages.map((stage) => ({
    stage: stage.name.split('/')[0],
    impact: stage.impact,
  }))

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        <Breadcrumb />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Sales Process Adherence</h1>
              <p className="text-gray-600">
                Track and improve your team's adherence to sales process best practices
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                >
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Users className="w-4 h-4 text-gray-500" />
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                >
                  <option value="all">All Team Members</option>
                  <option value="team1">Sales Team A</option>
                  <option value="team2">Sales Team B</option>
                  <option value="individual">Individual</option>
                </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Process Score Component */}
        <div className="mb-8">
          <ProcessScore />
        </div>

        {/* Overall Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <MetricCard
            icon={Target}
            label="Overall Adherence Score"
            value={`${mockOverallMetrics.overallScore}%`}
            trend={
              ((mockOverallMetrics.overallScore - mockOverallMetrics.previousScore) /
                mockOverallMetrics.previousScore) *
              100
            }
            gradient="from-brand-cyan to-brand-blue"
          />
          <MetricCard
            icon={Activity}
            label="Conversations Analyzed"
            value={mockOverallMetrics.conversationsAnalyzed}
            subtitle={`+${mockOverallMetrics.conversationsAnalyzed - mockOverallMetrics.previousConversations} from last period`}
            gradient="from-purple-500 to-pink-500"
          />
          <MetricCard
            icon={CheckCircle}
            label="Perfect Scores (100%)"
            value={mockOverallMetrics.perfectScores}
            trend={
              ((mockOverallMetrics.perfectScores - mockOverallMetrics.previousPerfectScores) /
                mockOverallMetrics.previousPerfectScores) *
              100
            }
            gradient="from-success-500 to-success-600"
          />
          <MetricCard
            icon={AlertTriangle}
            label="Needs Improvement (<70%)"
            value={mockOverallMetrics.needsImprovement}
            trend={
              ((mockOverallMetrics.needsImprovement - mockOverallMetrics.previousNeedsImprovement) /
                mockOverallMetrics.previousNeedsImprovement) *
              -100
            }
            gradient="from-warning-500 to-warning-600"
          />
          <MetricCard
            icon={Award}
            label="Top Performing Agent"
            value={mockOverallMetrics.topPerformingAgent.name.split(' ')[0]}
            subtitle={`${mockOverallMetrics.topPerformingAgent.score}% score`}
            gradient="from-yellow-500 to-orange-500"
          />
          <MetricCard
            icon={BarChart3}
            label="Most Skipped Step"
            value={mockOverallMetrics.mostSkippedStep.name.split(' ')[0]}
            subtitle={`${mockOverallMetrics.mostSkippedStep.skipRate}% skip rate`}
            gradient="from-red-500 to-pink-500"
          />
        </div>

        {/* Detailed Process Breakdown */}
        <div className="mb-8">
          <Card variant="elevated" rounded="3xl">
            <CardHeader
              title="Detailed Process Stage Breakdown"
              subtitle="Comprehensive analysis of each sales process stage"
              action={
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white font-medium"
                  >
                    <option value="score">Sort by Score</option>
                    <option value="completion">Sort by Completion</option>
                    <option value="impact">Sort by Impact</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {sortOrder === 'desc' ? (
                      <TrendingDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              }
            />
            <CardBody>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedStages.map((stage) => (
                  <StageDetailCard key={stage.id} stage={stage} />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Comparison Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Team Member Comparison */}
          <Card variant="elevated" rounded="3xl">
            <CardHeader
              title="Team Member Comparison"
              subtitle="Overall adherence scores by team member"
            />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {teamChartData.map((entry, index) => {
                      const color =
                        entry.score >= 90 ? '#10B981' : entry.score >= 70 ? '#F59E0B' : '#EF4444'
                      return <Cell key={`cell-${index}`} fill={color} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Stage Completion Over Time */}
          <Card variant="elevated" rounded="3xl">
            <CardHeader title="Stage Completion Trends" subtitle="Weekly progress across all stages" />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} domain={[60, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="introduction"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    dot={{ fill: '#06B6D4', r: 4 }}
                    name="Introduction"
                  />
                  <Line
                    type="monotone"
                    dataKey="discovery"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    name="Discovery"
                  />
                  <Line
                    type="monotone"
                    dataKey="presentation"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 4 }}
                    name="Presentation"
                  />
                  <Line
                    type="monotone"
                    dataKey="objections"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', r: 4 }}
                    name="Objections"
                  />
                  <Line
                    type="monotone"
                    dataKey="closing"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    name="Closing"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Stage Correlation Heatmap */}
        <div className="mb-8">
          <Card variant="elevated" rounded="3xl">
            <CardHeader
              title="Stage Impact Analysis"
              subtitle="Correlation between stage completion and overall success"
            />
            <CardBody>
              <div className="space-y-4">
                {correlationData.map((stage, index) => {
                  const impactColor =
                    stage.impact >= 90
                      ? 'from-success-500 to-success-600'
                      : stage.impact >= 80
                      ? 'from-brand-blue to-brand-purple'
                      : stage.impact >= 70
                      ? 'from-warning-500 to-warning-600'
                      : 'from-error-500 to-error-600'

                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-48 text-sm font-medium text-gray-700">{stage.stage}</div>
                      <div className="flex-1 h-10 bg-gray-100 rounded-xl overflow-hidden relative">
                        <div
                          className={`h-full bg-gradient-to-r ${impactColor} transition-all duration-1000 flex items-center justify-end pr-4`}
                          style={{ width: `${stage.impact}%` }}
                        >
                          <span className="text-white font-semibold text-sm">{stage.impact}%</span>
                        </div>
                      </div>
                      <div className="w-32 text-sm text-gray-600">
                        {stage.impact >= 90
                          ? 'Critical Impact'
                          : stage.impact >= 80
                          ? 'High Impact'
                          : stage.impact >= 70
                          ? 'Moderate Impact'
                          : 'Low Impact'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Best Practices Section */}
        <div className="mb-8">
          <Card variant="elevated" rounded="3xl">
            <CardHeader
              title="Best Practices & Training Resources"
              subtitle="Scripts, templates, and examples for underperforming stages"
            />
            <CardBody>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {mockBestPractices.map((practice, index) => (
                  <BestPracticeCard key={index} practice={practice} />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Improvement Tracking */}
        <div className="mb-8">
          <Card variant="elevated" rounded="3xl">
            <CardHeader
              title="Week-over-Week Improvement Tracking"
              subtitle="Monitor progress and identify trends"
            />
            <CardBody>
              <div className="space-y-4">
                {mockImprovementMetrics.map((metric, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="flex-1 mb-3 md:mb-0">
                      <h4 className="font-semibold text-gray-900 mb-1">{metric.metric}</h4>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          Previous: <span className="font-medium">{metric.previous}{metric.unit}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Current: <span className="font-medium">{metric.current}{metric.unit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                          metric.change > 0
                            ? 'bg-success-50 border border-success-200'
                            : metric.change < 0
                            ? 'bg-error-50 border border-error-200'
                            : 'bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {metric.change > 0 ? (
                          <TrendingUp className="w-5 h-5 text-success-600" />
                        ) : metric.change < 0 ? (
                          <TrendingDown className="w-5 h-5 text-error-600" />
                        ) : null}
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              metric.change > 0
                                ? 'text-success-700'
                                : metric.change < 0
                                ? 'text-error-700'
                                : 'text-gray-700'
                            }`}
                          >
                            {metric.change > 0 ? '+' : ''}
                            {metric.change}
                            {metric.unit}
                          </div>
                          <div
                            className={`text-xs font-medium ${
                              metric.change > 0
                                ? 'text-success-600'
                                : metric.change < 0
                                ? 'text-error-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {metric.changePercent > 0 ? '+' : ''}
                            {metric.changePercent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Agent Progress Tracking */}
        <div className="mb-8">
          <Card variant="elevated" rounded="3xl">
            <CardHeader
              title="Individual Agent Progress"
              subtitle="Track performance and improvement trends for each team member"
            />
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Agent</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Overall Score
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Conversations
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Perfect Scores
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Trend</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTeamPerformance.map((member) => {
                      const scoreClasses = getScoreClasses(member.overallScore)
                      return (
                        <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center text-white font-semibold text-sm">
                                {member.avatar}
                              </div>
                              <span className="font-medium text-gray-900">{member.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`text-lg font-bold ${scoreClasses.text}`}>
                              {member.overallScore}%
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-gray-700">{member.conversationsAnalyzed}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-gray-700 font-medium">{member.perfectScores}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                                member.improvementTrend > 0
                                  ? 'bg-success-50 text-success-700'
                                  : member.improvementTrend < 0
                                  ? 'bg-error-50 text-error-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {member.improvementTrend > 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : member.improvementTrend < 0 ? (
                                <TrendingDown className="w-4 h-4" />
                              ) : null}
                              <span className="font-semibold text-sm">
                                {member.improvementTrend > 0 ? '+' : ''}
                                {member.improvementTrend}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button className="text-sm text-brand-blue hover:text-brand-purple font-medium transition-colors">
                              View Details
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Stage Analysis Table */}
        <div className="mb-8">
          <Card variant="elevated" rounded="3xl">
            <CardHeader
              title="Comprehensive Stage Analysis"
              subtitle="Sortable and filterable view of all process stages"
            />
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stage</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Score</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Completion Rate
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Avg Duration
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Impact on Success
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStages.map((stage) => {
                      const scoreClasses = getScoreClasses(stage.score)
                      const scoreTrend = stage.score - stage.previousScore
                      return (
                        <tr key={stage.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">{stage.name}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`text-lg font-bold ${scoreClasses.text}`}>{stage.score}%</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-gray-700">{stage.completionRate}%</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-gray-700">{formatDuration(stage.averageDuration)}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-brand-cyan to-brand-blue"
                                  style={{ width: `${stage.impact}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-700">{stage.impact}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                                scoreTrend > 0
                                  ? 'bg-success-50 text-success-700'
                                  : scoreTrend < 0
                                  ? 'bg-error-50 text-error-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {scoreTrend > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : scoreTrend < 0 ? (
                                <TrendingDown className="w-3 h-3" />
                              ) : null}
                              <span className="text-xs font-semibold">
                                {scoreTrend > 0 ? '+' : ''}
                                {scoreTrend}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}

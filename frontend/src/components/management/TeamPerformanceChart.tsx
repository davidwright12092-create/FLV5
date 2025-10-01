import { useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardBody } from '../ui/Card'
import {
  Users,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Award,
  Download,
  Share2,
  MessageCircle,
  UserPlus,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react'

// Types
export interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
  status: 'online' | 'offline' | 'busy' | 'away'
  metrics: {
    conversations: number
    averageScore: number
    opportunities: number
    satisfaction: number
    goalsCompleted: number
    totalGoals: number
  }
  performanceTrend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export interface PerformanceDataPoint {
  date: string
  [key: string]: number | string // Dynamic keys for each team member
}

export interface TeamPerformanceChartProps {
  className?: string
}

type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year'
type SortOption = 'name' | 'score' | 'conversations'
type MetricType = 'conversations' | 'averageScore' | 'opportunities' | 'satisfaction'

// Brand colors for FieldLink
const BRAND_COLORS = {
  cyan: '#06D6A0',
  blue: '#118AB2',
  purple: '#8B5CF6',
  orange: '#F77F00',
  pink: '#EF476F',
  teal: '#06B6D4',
  indigo: '#6366F1',
  amber: '#F59E0B',
}

const MEMBER_COLORS = [
  BRAND_COLORS.cyan,
  BRAND_COLORS.blue,
  BRAND_COLORS.purple,
  BRAND_COLORS.orange,
  BRAND_COLORS.pink,
  BRAND_COLORS.teal,
  BRAND_COLORS.indigo,
  BRAND_COLORS.amber,
]

// Performance tier colors
const TIER_COLORS = {
  excellent: '#10B981',
  good: '#06D6A0',
  average: '#F59E0B',
  needsImprovement: '#EF4444',
}

// Mock data for 8 team members
const generateMockTeamMembers = (): TeamMember[] => [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'SJ',
    role: 'Senior Sales Rep',
    status: 'online',
    metrics: {
      conversations: 145,
      averageScore: 92,
      opportunities: 38,
      satisfaction: 4.8,
      goalsCompleted: 8,
      totalGoals: 10,
    },
    performanceTrend: 'up',
    trendPercentage: 12,
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'MC',
    role: 'Sales Rep',
    status: 'online',
    metrics: {
      conversations: 132,
      averageScore: 88,
      opportunities: 34,
      satisfaction: 4.6,
      goalsCompleted: 7,
      totalGoals: 10,
    },
    performanceTrend: 'up',
    trendPercentage: 8,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: 'ER',
    role: 'Sales Rep',
    status: 'busy',
    metrics: {
      conversations: 128,
      averageScore: 85,
      opportunities: 31,
      satisfaction: 4.5,
      goalsCompleted: 6,
      totalGoals: 10,
    },
    performanceTrend: 'stable',
    trendPercentage: 2,
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'DK',
    role: 'Sales Rep',
    status: 'online',
    metrics: {
      conversations: 118,
      averageScore: 82,
      opportunities: 28,
      satisfaction: 4.3,
      goalsCompleted: 6,
      totalGoals: 10,
    },
    performanceTrend: 'up',
    trendPercentage: 5,
  },
  {
    id: '5',
    name: 'Jessica Martinez',
    avatar: 'JM',
    role: 'Junior Sales Rep',
    status: 'away',
    metrics: {
      conversations: 95,
      averageScore: 78,
      opportunities: 22,
      satisfaction: 4.2,
      goalsCompleted: 5,
      totalGoals: 10,
    },
    performanceTrend: 'down',
    trendPercentage: -3,
  },
  {
    id: '6',
    name: 'Robert Taylor',
    avatar: 'RT',
    role: 'Sales Rep',
    status: 'online',
    metrics: {
      conversations: 110,
      averageScore: 86,
      opportunities: 29,
      satisfaction: 4.4,
      goalsCompleted: 7,
      totalGoals: 10,
    },
    performanceTrend: 'up',
    trendPercentage: 6,
  },
  {
    id: '7',
    name: 'Amanda Foster',
    avatar: 'AF',
    role: 'Senior Sales Rep',
    status: 'online',
    metrics: {
      conversations: 138,
      averageScore: 90,
      opportunities: 36,
      satisfaction: 4.7,
      goalsCompleted: 8,
      totalGoals: 10,
    },
    performanceTrend: 'up',
    trendPercentage: 10,
  },
  {
    id: '8',
    name: 'Christopher Lee',
    avatar: 'CL',
    role: 'Junior Sales Rep',
    status: 'offline',
    metrics: {
      conversations: 88,
      averageScore: 75,
      opportunities: 19,
      satisfaction: 4.0,
      goalsCompleted: 4,
      totalGoals: 10,
    },
    performanceTrend: 'down',
    trendPercentage: -5,
  },
]

// Generate performance trend data for line chart
const generateTrendData = (members: TeamMember[]): PerformanceDataPoint[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day) => {
    const dataPoint: PerformanceDataPoint = { date: day }
    members.forEach((member) => {
      // Generate realistic fluctuating scores
      const baseScore = member.metrics.averageScore
      const variation = (Math.random() - 0.5) * 10
      dataPoint[member.name] = Math.max(60, Math.min(100, baseScore + variation))
    })
    return dataPoint
  })
}

// Calculate team statistics
const calculateTeamStats = (members: TeamMember[]) => {
  const totalMembers = members.length
  const averageScore =
    members.reduce((sum, m) => sum + m.metrics.averageScore, 0) / totalMembers
  const totalConversations = members.reduce((sum, m) => sum + m.metrics.conversations, 0)

  // Calculate trend based on member trends
  const upTrend = members.filter((m) => m.performanceTrend === 'up').length
  const downTrend = members.filter((m) => m.performanceTrend === 'down').length
  const teamTrend = upTrend > downTrend ? 'up' : downTrend > upTrend ? 'down' : 'stable'

  return {
    totalMembers,
    averageScore: Math.round(averageScore * 10) / 10,
    totalConversations,
    teamTrend,
  }
}

// Calculate performance distribution
const calculatePerformanceDistribution = (members: TeamMember[]) => {
  const distribution = {
    excellent: 0,
    good: 0,
    average: 0,
    needsImprovement: 0,
  }

  members.forEach((member) => {
    const score = member.metrics.averageScore
    if (score >= 90) distribution.excellent++
    else if (score >= 80) distribution.good++
    else if (score >= 70) distribution.average++
    else distribution.needsImprovement++
  })

  return [
    { name: 'Excellent (90-100)', value: distribution.excellent, color: TIER_COLORS.excellent },
    { name: 'Good (80-89)', value: distribution.good, color: TIER_COLORS.good },
    { name: 'Average (70-79)', value: distribution.average, color: TIER_COLORS.average },
    {
      name: 'Needs Improvement (<70)',
      value: distribution.needsImprovement,
      color: TIER_COLORS.needsImprovement,
    },
  ]
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const TeamPerformanceChart: React.FC<TeamPerformanceChartProps> = ({
  className = '',
}) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week')
  const [sortBy, setSortBy] = useState<SortOption>('score')
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('conversations')
  const [teamMembers] = useState<TeamMember[]>(generateMockTeamMembers())
  const [trendData] = useState<PerformanceDataPoint[]>(generateTrendData(teamMembers))

  const teamStats = calculateTeamStats(teamMembers)
  const performanceDistribution = calculatePerformanceDistribution(teamMembers)

  // Sort team members
  const sortedMembers = [...teamMembers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'score':
        return b.metrics.averageScore - a.metrics.averageScore
      case 'conversations':
        return b.metrics.conversations - a.metrics.conversations
      default:
        return 0
    }
  })

  // Get top performers
  const topPerformers = [...teamMembers]
    .sort((a, b) => b.metrics.averageScore - a.metrics.averageScore)
    .slice(0, 3)

  // Time periods
  const timePeriods: { value: TimePeriod; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
  ]

  // Metrics for toggle
  const metrics: { key: MetricType; label: string }[] = [
    { key: 'conversations', label: 'Conversations' },
    { key: 'averageScore', label: 'Score' },
    { key: 'opportunities', label: 'Opportunities' },
    { key: 'satisfaction', label: 'Satisfaction' },
  ]

  // Export handlers
  const handleDownloadChart = () => {
    console.log('Downloading chart as image...')
    // Implementation would use html2canvas or similar
  }

  const handleExportExcel = () => {
    console.log('Exporting to Excel...')
    // Implementation would use xlsx library
  }

  const handleShareEmail = () => {
    console.log('Sharing via email...')
    // Implementation would open email client or modal
  }

  // Status indicator colors
  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'offline':
        return 'bg-gray-400'
      case 'busy':
        return 'bg-red-500'
      case 'away':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-400'
    }
  }

  // Trend icon component
  const TrendIcon = ({ trend, percentage }: { trend: string; percentage: number }) => {
    if (trend === 'up') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ArrowUp className="w-4 h-4" />
          <span className="text-xs font-medium">+{percentage}%</span>
        </div>
      )
    }
    if (trend === 'down') {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <ArrowDown className="w-4 h-4" />
          <span className="text-xs font-medium">{percentage}%</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-gray-600">
        <Minus className="w-4 h-4" />
        <span className="text-xs font-medium">{percentage}%</span>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Time Period Selector and Export Options */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-brand-cyan to-brand-blue bg-clip-text text-transparent">
            Team Performance Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your team's performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Period Selector */}
          <div className="flex gap-2">
            {timePeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  timePeriod === period.value
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Export Options */}
          <div className="flex gap-2">
            <button
              onClick={handleDownloadChart}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Download as image"
            >
              <Download className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleExportExcel}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Export to Excel"
            >
              <Award className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleShareEmail}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Share via email"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Team Overview Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated" className="bg-gradient-to-br from-cyan-50 to-cyan-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Team Members</p>
              <p className="text-3xl font-bold text-gray-900">{teamStats.totalMembers}</p>
              <p className="text-xs text-gray-500 mt-2">Active members</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-brand-cyan" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Average Team Score</p>
              <p className="text-3xl font-bold text-gray-900">{teamStats.averageScore}</p>
              <p className="text-xs text-gray-500 mt-2">Out of 100</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
              <Trophy className="w-6 h-6 text-brand-blue" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Conversations</p>
              <p className="text-3xl font-bold text-gray-900">
                {teamStats.totalConversations}
              </p>
              <p className="text-xs text-gray-500 mt-2">This {timePeriod}</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Team Performance</p>
              <div className="flex items-center gap-2 mt-1">
                {teamStats.teamTrend === 'up' && (
                  <>
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">Trending Up</span>
                  </>
                )}
                {teamStats.teamTrend === 'down' && (
                  <>
                    <TrendingDown className="w-6 h-6 text-red-600" />
                    <span className="text-2xl font-bold text-red-600">Needs Focus</span>
                  </>
                )}
                {teamStats.teamTrend === 'stable' && (
                  <>
                    <Minus className="w-6 h-6 text-gray-600" />
                    <span className="text-2xl font-bold text-gray-600">Stable</span>
                  </>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Individual Performance Comparison - Bar Chart */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between w-full">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Individual Performance Comparison
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Compare team members across key metrics
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="score">Sort by Score</option>
                  <option value="conversations">Sort by Conversations</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="mb-4 flex flex-wrap gap-2">
              {metrics.map((metric) => (
                <button
                  key={metric.key}
                  onClick={() => setSelectedMetric(metric.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    selectedMetric === metric.key
                      ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metric.label}
                </button>
              ))}
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedMembers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey={`metrics.${selectedMetric}`}
                    radius={[8, 8, 0, 0]}
                    animationDuration={500}
                  >
                    {sortedMembers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MEMBER_COLORS[index % MEMBER_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Leaderboard Section */}
        <Card variant="elevated">
          <CardHeader>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Top Performers</h3>
              <p className="text-sm text-gray-600 mt-1">Highest scoring team members</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {topPerformers.map((member, index) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-xl border-2 ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300'
                      : index === 1
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
                      : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                          ? 'bg-gray-400'
                          : 'bg-orange-500'
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-full flex items-center justify-center text-white font-semibold">
                        {member.avatar}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(
                          member.status
                        )}`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.role}</p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {member.metrics.averageScore}
                      </p>
                      <TrendIcon
                        trend={member.performanceTrend}
                        percentage={member.trendPercentage}
                      />
                    </div>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-300">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Calls</p>
                      <p className="text-sm font-bold text-gray-900">
                        {member.metrics.conversations}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Opportunities</p>
                      <p className="text-sm font-bold text-gray-900">
                        {member.metrics.opportunities}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Performance Trends Over Time - Line Chart */}
      <Card variant="elevated">
        <CardHeader>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Performance Trends Over Time</h3>
            <p className="text-sm text-gray-600 mt-1">
              Track individual and team average performance
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[60, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={40}
                  iconType="line"
                  wrapperStyle={{ fontSize: '12px' }}
                />
                {teamMembers.slice(0, 6).map((member, index) => (
                  <Line
                    key={member.id}
                    type="monotone"
                    dataKey={member.name}
                    stroke={MEMBER_COLORS[index]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1000}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Distribution - Pie Chart */}
        <Card variant="elevated">
          <CardHeader>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Performance Distribution</h3>
              <p className="text-sm text-gray-600 mt-1">Team members by performance tier</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-2 mt-4">
              {performanceDistribution.map((tier) => (
                <div key={tier.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                    <span className="text-sm text-gray-700">{tier.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{tier.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Goals Tracking */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Team Goals Progress</h3>
              <p className="text-sm text-gray-600 mt-1">
                Individual goal completion and team targets
              </p>
            </div>
          </CardHeader>
          <CardBody>
            {/* Team Goal */}
            <div className="mb-6 p-4 bg-gradient-to-r from-brand-cyan/10 to-brand-blue/10 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-brand-blue" />
                  <span className="font-semibold text-gray-900">Team Goal: 80% Average</span>
                </div>
                <span className="text-2xl font-bold text-brand-blue">
                  {teamStats.averageScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-brand-cyan to-brand-blue h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((teamStats.averageScore / 80) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {teamStats.averageScore >= 80
                  ? 'Team goal exceeded!'
                  : `${(80 - teamStats.averageScore).toFixed(1)} points to goal`}
              </p>
            </div>

            {/* Individual Goals */}
            <div className="space-y-3">
              {teamMembers.slice(0, 5).map((member) => {
                const completionPercentage =
                  (member.metrics.goalsCompleted / member.metrics.totalGoals) * 100
                return (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </span>
                        <span className="text-xs text-gray-600">
                          {member.metrics.goalsCompleted}/{member.metrics.totalGoals}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            completionPercentage >= 80
                              ? 'bg-gradient-to-r from-green-400 to-green-600'
                              : completionPercentage >= 60
                              ? 'bg-gradient-to-r from-brand-cyan to-brand-blue'
                              : 'bg-gradient-to-r from-orange-400 to-orange-600'
                          }`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Team Member Detail Cards */}
      <Card variant="elevated">
        <CardHeader>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Team Member Details</h3>
            <p className="text-sm text-gray-600 mt-1">
              Detailed performance metrics and quick actions
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50"
              >
                {/* Avatar and Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {member.avatar}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(
                        member.status
                      )}`}
                    />
                  </div>
                  <TrendIcon
                    trend={member.performanceTrend}
                    percentage={member.trendPercentage}
                  />
                </div>

                {/* Name and Role */}
                <h4 className="font-semibold text-gray-900 truncate">{member.name}</h4>
                <p className="text-xs text-gray-600 mb-3">{member.role}</p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-600">Calls</p>
                    <p className="text-lg font-bold text-gray-900">
                      {member.metrics.conversations}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-600">Score</p>
                    <p className="text-lg font-bold text-gray-900">
                      {member.metrics.averageScore}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-600">Opps</p>
                    <p className="text-lg font-bold text-gray-900">
                      {member.metrics.opportunities}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-600">Rating</p>
                    <p className="text-lg font-bold text-gray-900">
                      {member.metrics.satisfaction}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-1 pt-3 border-t border-gray-200">
                  <button
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-brand-blue bg-brand-cyan/10 rounded-lg hover:bg-brand-cyan/20 transition-colors flex items-center justify-center gap-1"
                    title="View Details"
                  >
                    <Eye className="w-3 h-3" />
                    <span className="hidden sm:inline">View</span>
                  </button>
                  <button
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-1"
                    title="Message"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span className="hidden sm:inline">Message</span>
                  </button>
                  <button
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-orange-600 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors flex items-center justify-center gap-1"
                    title="Assign"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span className="hidden sm:inline">Assign</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default TeamPerformanceChart

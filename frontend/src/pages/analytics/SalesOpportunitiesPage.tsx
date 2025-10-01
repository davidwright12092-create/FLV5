import { useState, useMemo } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import { Card, CardHeader } from '../../components/ui/Card'
import OpportunityList, { Opportunity, OpportunityType, OpportunityStatus } from '../../components/analytics/OpportunityList'
import {
  DollarSign,
  TrendingUp,
  Target,
  Trophy,
  AlertTriangle,
  Calendar,
  Download,
  Plus,
  Bell,
  Share2,
  Users,
  MapPin,
  Clock,
  Sparkles,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts'

// TypeScript interfaces
interface OpportunityMetrics {
  totalPipelineValue: number
  numberOfOpportunities: number
  averageOpportunityValue: number
  conversionRate: number
  winRate: number
  totalWonValue: number
}

interface FunnelStage {
  name: string
  value: number
  fill: string
}

interface ValueByType {
  name: string
  value: number
  count: number
  fill: string
}

interface WinLossData {
  name: string
  won: number
  lost: number
}

interface ConfidenceDistribution {
  range: string
  count: number
  fill: string
}

interface TimelineData {
  date: string
  opportunities: number
  value: number
}

interface TopType {
  type: string
  count: number
  value: number
  winRate: number
}

interface TopAgent {
  name: string
  opportunities: number
  value: number
  winRate: number
}

interface SourceAnalysis {
  source: string
  count: number
  value: number
  fill: string
}

interface CustomerSegment {
  segment: string
  count: number
  value: number
  fill: string
}

interface SeasonalTrend {
  month: string
  opportunities: number
  value: number
}

// No mock data - will fetch from API
const mockOpportunities: Opportunity[] = []

export default function SalesOpportunitiesPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | 'All'>('All')
  const [sortBy, setSortBy] = useState<'value' | 'confidence' | 'date'>('value')

  // Calculate metrics
  const metrics: OpportunityMetrics = useMemo(() => {
    const activeOpportunities = mockOpportunities.filter(opp => opp.status !== 'Lost')
    const wonOpportunities = mockOpportunities.filter(opp => opp.status === 'Won')
    const lostOpportunities = mockOpportunities.filter(opp => opp.status === 'Lost')
    const closedOpportunities = [...wonOpportunities, ...lostOpportunities]

    return {
      totalPipelineValue: activeOpportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0),
      numberOfOpportunities: mockOpportunities.length,
      averageOpportunityValue: mockOpportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0) / mockOpportunities.length,
      conversionRate: closedOpportunities.length > 0 ? (wonOpportunities.length / closedOpportunities.length) * 100 : 0,
      winRate: closedOpportunities.length > 0 ? (wonOpportunities.length / closedOpportunities.length) * 100 : 0,
      totalWonValue: wonOpportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0)
    }
  }, [])

  // Sales funnel data
  const funnelData: FunnelStage[] = useMemo(() => {
    const newCount = mockOpportunities.filter(o => o.status === 'New').length
    const inProgressCount = mockOpportunities.filter(o => o.status === 'In Progress').length
    const wonCount = mockOpportunities.filter(o => o.status === 'Won').length

    return [
      { name: 'New Opportunities', value: newCount, fill: '#06b6d4' },
      { name: 'In Progress', value: inProgressCount, fill: '#8b5cf6' },
      { name: 'Won', value: wonCount, fill: '#10b981' }
    ]
  }, [])

  // Opportunity value by type
  const valueByTypeData: ValueByType[] = useMemo(() => {
    const types: { [key: string]: { value: number; count: number; color: string } } = {
      'Upsell': { value: 0, count: 0, color: '#06b6d4' },
      'Cross-sell': { value: 0, count: 0, color: '#8b5cf6' },
      'Service Upgrade': { value: 0, count: 0, color: '#f59e0b' },
      'Maintenance Plan': { value: 0, count: 0, color: '#ec4899' }
    }

    mockOpportunities.forEach(opp => {
      if (opp.status !== 'Lost') {
        types[opp.type].value += opp.estimatedValue
        types[opp.type].count += 1
      }
    })

    return Object.entries(types).map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count,
      fill: data.color
    }))
  }, [])

  // Win/Loss analysis
  const winLossData: WinLossData[] = useMemo(() => {
    const types: { [key: string]: { won: number; lost: number } } = {
      'Upsell': { won: 0, lost: 0 },
      'Cross-sell': { won: 0, lost: 0 },
      'Service Upgrade': { won: 0, lost: 0 },
      'Maintenance Plan': { won: 0, lost: 0 }
    }

    mockOpportunities.forEach(opp => {
      if (opp.status === 'Won') {
        types[opp.type].won += 1
      } else if (opp.status === 'Lost') {
        types[opp.type].lost += 1
      }
    })

    return Object.entries(types).map(([name, data]) => ({
      name,
      won: data.won,
      lost: data.lost
    }))
  }, [])

  // Confidence score distribution
  const confidenceDistribution: ConfidenceDistribution[] = useMemo(() => {
    const ranges = {
      '90-100%': { count: 0, color: '#10b981' },
      '80-89%': { count: 0, color: '#06b6d4' },
      '70-79%': { count: 0, color: '#f59e0b' },
      '60-69%': { count: 0, color: '#ef4444' }
    }

    mockOpportunities.forEach(opp => {
      if (opp.confidenceScore >= 90) ranges['90-100%'].count++
      else if (opp.confidenceScore >= 80) ranges['80-89%'].count++
      else if (opp.confidenceScore >= 70) ranges['70-79%'].count++
      else ranges['60-69%'].count++
    })

    return Object.entries(ranges).map(([range, data]) => ({
      range,
      count: data.count,
      fill: data.color
    }))
  }, [])

  // Timeline data
  const timelineData: TimelineData[] = useMemo(() => {
    const timeline: { [key: string]: { count: number; value: number } } = {}

    mockOpportunities.forEach(opp => {
      const date = new Date(opp.dateDetected)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!timeline[monthKey]) {
        timeline[monthKey] = { count: 0, value: 0 }
      }

      timeline[monthKey].count += 1
      timeline[monthKey].value += opp.estimatedValue
    })

    return Object.entries(timeline)
      .map(([date, data]) => ({
        date,
        opportunities: data.count,
        value: data.value
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [])

  // Top opportunity types
  const topTypes: TopType[] = useMemo(() => {
    const types: { [key: string]: { count: number; value: number; won: number; total: number } } = {}

    mockOpportunities.forEach(opp => {
      if (!types[opp.type]) {
        types[opp.type] = { count: 0, value: 0, won: 0, total: 0 }
      }
      types[opp.type].count += 1
      types[opp.type].value += opp.estimatedValue

      if (opp.status === 'Won' || opp.status === 'Lost') {
        types[opp.type].total += 1
        if (opp.status === 'Won') types[opp.type].won += 1
      }
    })

    return Object.entries(types)
      .map(([type, data]) => ({
        type,
        count: data.count,
        value: data.value,
        winRate: data.total > 0 ? (data.won / data.total) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
  }, [])

  // No mock data - will fetch from API
  const topAgents: TopAgent[] = []

  // No mock data - will fetch from API
  const sourceData: SourceAnalysis[] = []

  // No mock data - will fetch from API
  const segmentData: CustomerSegment[] = []

  // No mock data - will fetch from API
  const seasonalData: SeasonalTrend[] = []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <PageLayout>
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <a href="/dashboard" className="hover:text-brand-cyan transition-colors">Dashboard</a>
        <span>/</span>
        <a href="/analytics" className="hover:text-brand-cyan transition-colors">Analytics</a>
        <span>/</span>
        <span className="text-gray-900 font-medium">Sales Opportunities</span>
      </nav>

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent mb-2">
              Sales Opportunities
            </h1>
            <p className="text-gray-600">AI-powered sales pipeline insights and analytics</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Filter */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
                className="text-sm font-medium text-gray-700 focus:outline-none bg-transparent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OpportunityStatus | 'All')}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'value' | 'confidence' | 'date')}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
            >
              <option value="value">Sort by Value</option>
              <option value="confidence">Sort by Confidence</option>
              <option value="date">Sort by Date</option>
            </select>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {/* Total Pipeline Value */}
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-cyan-500 to-blue-600">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-white/80 text-sm font-medium mb-1">Total Pipeline Value</div>
          <div className="text-white text-2xl font-bold">{formatCurrency(metrics.totalPipelineValue)}</div>
        </Card>

        {/* Number of Opportunities */}
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-purple-500 to-pink-600">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-white/80 text-sm font-medium mb-1">Total Opportunities</div>
          <div className="text-white text-2xl font-bold">{metrics.numberOfOpportunities}</div>
        </Card>

        {/* Average Opportunity Value */}
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-orange-500 to-red-600">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-white/80 text-sm font-medium mb-1">Avg Opportunity</div>
          <div className="text-white text-2xl font-bold">{formatCurrency(metrics.averageOpportunityValue)}</div>
        </Card>

        {/* Conversion Rate */}
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-green-500 to-emerald-600">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-white/80 text-sm font-medium mb-1">Conversion Rate</div>
          <div className="text-white text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
        </Card>

        {/* Win Rate */}
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-yellow-500 to-orange-600">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-white/80 text-sm font-medium mb-1">Win Rate</div>
          <div className="text-white text-2xl font-bold">{metrics.winRate.toFixed(1)}%</div>
        </Card>

        {/* Total Won Value */}
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-indigo-500 to-purple-600">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-white/80 text-sm font-medium mb-1">Total Won (Period)</div>
          <div className="text-white text-2xl font-bold">{formatCurrency(metrics.totalWonValue)}</div>
        </Card>
      </div>

      {/* Pipeline Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Funnel Chart */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="Sales Funnel" subtitle="Conversion at each stage" />
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip
                formatter={(value: number) => `${value} opportunities`}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </Card>

        {/* Opportunity Value by Type */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="Value by Type" subtitle="Pipeline distribution by opportunity type" />
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={valueByTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {valueByTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
            </RechartsPie>
          </ResponsiveContainer>
        </Card>

        {/* Win/Loss Analysis */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="Win/Loss Analysis" subtitle="Performance by opportunity type" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={winLossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="won" fill="#10b981" name="Won" radius={[8, 8, 0, 0]} />
              <Bar dataKey="lost" fill="#ef4444" name="Lost" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Confidence Score Distribution */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="Confidence Distribution" subtitle="Opportunities by confidence score" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="count" name="Opportunities" radius={[8, 8, 0, 0]}>
                {confidenceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card variant="elevated" padding="lg" className="mb-8">
        <CardHeader title="Opportunity Timeline" subtitle="Creation trends over time" />
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="colorOpportunities" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'value') return formatCurrency(value)
                return value
              }}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="opportunities"
              stroke="#06b6d4"
              fillOpacity={1}
              fill="url(#colorOpportunities)"
              name="Opportunities"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorValue)"
              name="Value"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Opportunity Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Opportunity Types */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="Top Opportunity Types" subtitle="Performance by type" />
          <div className="space-y-4">
            {topTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{type.type}</div>
                  <div className="text-sm text-gray-600">
                    {type.count} opportunities • {formatCurrency(type.value)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Win Rate</div>
                  <div className="text-lg font-bold text-green-600">{type.winRate.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Agents */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="Top Performing Agents" subtitle="Most successful at identifying opportunities" />
          <div className="space-y-4">
            {topAgents.map((agent, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{agent.name}</div>
                  <div className="text-sm text-gray-600">
                    {agent.opportunities} opps • {formatCurrency(agent.value)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{agent.winRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">win rate</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Average Time to Close */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Avg Time to Close</div>
              <div className="text-2xl font-bold text-gray-900">18 days</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Upsell</span>
              <span className="font-semibold">15 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Upgrade</span>
              <span className="font-semibold">22 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Maintenance Plan</span>
              <span className="font-semibold">12 days</span>
            </div>
          </div>
        </Card>

        {/* Factors Influencing Win/Loss */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Win Factors</div>
              <div className="text-lg font-bold text-gray-900">Key Insights</div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Quick Response</span>
                <span className="font-semibold text-green-600">+35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">High Confidence</span>
                <span className="font-semibold text-green-600">+28%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Personal Follow-up</span>
                <span className="font-semibold text-green-600">+22%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Geographic Distribution */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Geographic Distribution</div>
              <div className="text-lg font-bold text-gray-900">By Region</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-700">Metro Area</span>
              </div>
              <span className="font-semibold">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-700">Suburban</span>
              </div>
              <span className="font-semibold">35%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-700">Rural</span>
              </div>
              <span className="font-semibold">20%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Opportunity Source Analysis */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="Opportunity Sources" subtitle="Where opportunities originate" />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sourceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" />
              <YAxis dataKey="source" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'value') return formatCurrency(value)
                  return value
                }}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="count" name="Count" radius={[0, 8, 8, 0]}>
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Customer Segment Breakdown */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="Customer Segments" subtitle="Opportunities by industry segment" />
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPie>
              <Pie
                data={segmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ segment, percent }) => `${segment} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {segmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
            </RechartsPie>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Seasonal Trends */}
      <Card variant="elevated" padding="lg" className="mb-8">
        <CardHeader title="Seasonal Trends" subtitle="Opportunity patterns throughout the year" />
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={seasonalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'Value') return formatCurrency(value)
                return value
              }}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="opportunities"
              stroke="#06b6d4"
              strokeWidth={3}
              name="Opportunities"
              dot={{ fill: '#06b6d4', r: 5 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={3}
              name="Value"
              dot={{ fill: '#8b5cf6', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* AI Insights Card */}
      <Card variant="elevated" padding="lg" className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Insights</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Predicted Opportunities */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <h4 className="font-semibold text-gray-900">Next Period Forecast</h4>
                </div>
                <p className="text-2xl font-bold text-purple-600 mb-1">12-15</p>
                <p className="text-sm text-gray-600">Expected new opportunities</p>
                <p className="text-sm text-gray-500 mt-2">Est. value: {formatCurrency(420000)}</p>
              </div>

              {/* Recommended Actions */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-gray-900">Top Recommendations</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Follow up on 5 high-value opportunities within 48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Focus on Maintenance Plans - highest win rate</span>
                  </li>
                </ul>
              </div>

              {/* Risk Factors */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h4 className="font-semibold text-gray-900">Risk Alerts</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>3 high-value opportunities stalled for 2+ weeks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Service Upgrade opportunities show lower conversion</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Smart Insights</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Your team has a <span className="font-bold text-green-600">75% win rate</span> when responding to opportunities within 24 hours.
                Opportunities detected through service calls have <span className="font-bold text-blue-600">30% higher value</span> on average.
                Consider prioritizing Maintenance Plan opportunities - they show the <span className="font-bold text-purple-600">fastest close time (12 days)</span> and highest conversion rate.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions Panel */}
      <Card variant="elevated" padding="lg" className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Create Manual Opportunity */}
          <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 rounded-xl border border-cyan-200 transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Create Opportunity</div>
              <div className="text-xs text-gray-600">Add manually</div>
            </div>
          </button>

          {/* Schedule Follow-up */}
          <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border border-purple-200 transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Set Reminder</div>
              <div className="text-xs text-gray-600">Schedule follow-up</div>
            </div>
          </button>

          {/* Export Report */}
          <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-xl border border-orange-200 transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Export Report</div>
              <div className="text-xs text-gray-600">Download data</div>
            </div>
          </button>

          {/* Share with Team */}
          <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl border border-green-200 transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Share Insights</div>
              <div className="text-xs text-gray-600">With team</div>
            </div>
          </button>
        </div>
      </Card>

      {/* Opportunity List Component */}
      <OpportunityList />
    </PageLayout>
  )
}

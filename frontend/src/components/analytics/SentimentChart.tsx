import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardBody } from '../ui/Card'
import { TrendingUp, TrendingDown, Smile, Frown, Meh } from 'lucide-react'

// Types
export interface SentimentDataPoint {
  timestamp: string
  date: string
  positive: number
  neutral: number
  negative: number
}

export interface SentimentChartProps {
  data?: SentimentDataPoint[]
  timePeriod?: 'week' | 'month' | 'quarter' | 'year'
  onTimePeriodChange?: (period: 'week' | 'month' | 'quarter' | 'year') => void
  className?: string
}

// No mock data - will fetch from API
const generateMockData = (): SentimentDataPoint[] => {
  const data: SentimentDataPoint[] = []
  const now = new Date()

  for (let i = 14; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    data.push({
      timestamp: date.toISOString(),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      positive: 0,
      neutral: 0,
      negative: 0,
    })
  }

  return data
}

const MOCK_DATA = generateMockData()

// Custom tooltip component
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
              <span className="text-sm text-gray-600 capitalize">{entry.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {entry.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Calculate sentiment statistics
const calculateStats = (data: SentimentDataPoint[]) => {
  if (!data || data.length === 0) {
    return {
      avgPositive: 0,
      avgNeutral: 0,
      avgNegative: 0,
      trend: 0,
      overallSentiment: 'neutral' as 'positive' | 'neutral' | 'negative',
    }
  }

  const totals = data.reduce(
    (acc, point) => ({
      positive: acc.positive + point.positive,
      neutral: acc.neutral + point.neutral,
      negative: acc.negative + point.negative,
    }),
    { positive: 0, neutral: 0, negative: 0 }
  )

  const avgPositive = totals.positive / data.length
  const avgNeutral = totals.neutral / data.length
  const avgNegative = totals.negative / data.length

  // Calculate trend (comparing first half to second half)
  const midpoint = Math.floor(data.length / 2)
  const firstHalf = data.slice(0, midpoint)
  const secondHalf = data.slice(midpoint)

  const firstHalfAvg =
    firstHalf.reduce((acc, p) => acc + (p.positive - p.negative), 0) / firstHalf.length
  const secondHalfAvg =
    secondHalf.reduce((acc, p) => acc + (p.positive - p.negative), 0) / secondHalf.length

  const trend = secondHalfAvg - firstHalfAvg

  // Determine overall sentiment
  let overallSentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  if (avgPositive > avgNegative + 15) {
    overallSentiment = 'positive'
  } else if (avgNegative > avgPositive + 10) {
    overallSentiment = 'negative'
  }

  return {
    avgPositive: Math.round(avgPositive * 10) / 10,
    avgNeutral: Math.round(avgNeutral * 10) / 10,
    avgNegative: Math.round(avgNegative * 10) / 10,
    trend: Math.round(trend * 10) / 10,
    overallSentiment,
  }
}

export const SentimentChart: React.FC<SentimentChartProps> = ({
  data = MOCK_DATA,
  timePeriod = 'week',
  onTimePeriodChange,
  className = '',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>(
    timePeriod
  )

  const stats = calculateStats(data)

  const handlePeriodChange = (period: 'week' | 'month' | 'quarter' | 'year') => {
    setSelectedPeriod(period)
    onTimePeriodChange?.(period)
  }

  const periods = [
    { value: 'week', label: '7 Days' },
    { value: 'month', label: '30 Days' },
    { value: 'quarter', label: '90 Days' },
    { value: 'year', label: '1 Year' },
  ] as const

  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <div className="flex items-start justify-between w-full">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Sentiment Analysis</h3>
            <p className="text-sm text-gray-600">
              Customer sentiment trends over time
            </p>
          </div>

          {/* Time period selector */}
          <div className="flex gap-2">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => handlePeriodChange(period.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  selectedPeriod === period.value
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardBody>
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Overall Sentiment */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {stats.overallSentiment === 'positive' && (
                <Smile className="w-5 h-5 text-success-600" />
              )}
              {stats.overallSentiment === 'neutral' && (
                <Meh className="w-5 h-5 text-info-600" />
              )}
              {stats.overallSentiment === 'negative' && (
                <Frown className="w-5 h-5 text-error-600" />
              )}
              <span className="text-sm font-medium text-gray-600">Overall</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {stats.overallSentiment}
            </p>
          </div>

          {/* Positive */}
          <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-success-600" />
              <span className="text-sm font-medium text-gray-600">Positive</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgPositive}%</p>
          </div>

          {/* Neutral */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-sm font-medium text-gray-600">Neutral</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgNeutral}%</p>
          </div>

          {/* Negative */}
          <div className="bg-gradient-to-br from-error-50 to-error-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-error-600" />
              <span className="text-sm font-medium text-gray-600">Negative</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgNegative}%</p>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="mb-6">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              stats.trend > 0
                ? 'bg-success-50 text-success-700'
                : stats.trend < 0
                ? 'bg-error-50 text-error-700'
                : 'bg-gray-50 text-gray-700'
            }`}
          >
            {stats.trend > 0 ? (
              <>
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Sentiment improving by {Math.abs(stats.trend).toFixed(1)}%
                </span>
              </>
            ) : stats.trend < 0 ? (
              <>
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Sentiment declining by {Math.abs(stats.trend).toFixed(1)}%
                </span>
              </>
            ) : (
              <span className="text-sm font-medium">Sentiment stable</span>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B7280" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6B7280" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />

              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-gray-700 capitalize">{value}</span>
                )}
              />

              <Area
                type="monotone"
                dataKey="positive"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#colorPositive)"
                name="positive"
                animationDuration={1000}
              />

              <Area
                type="monotone"
                dataKey="neutral"
                stroke="#6B7280"
                strokeWidth={2.5}
                fill="url(#colorNeutral)"
                name="neutral"
                animationDuration={1000}
              />

              <Area
                type="monotone"
                dataKey="negative"
                stroke="#EF4444"
                strokeWidth={2.5}
                fill="url(#colorNegative)"
                name="negative"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Description */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
                <Smile className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Positive</p>
                <p className="text-gray-600 text-xs mt-0.5">
                  Satisfied customers with positive feedback
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Meh className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Neutral</p>
                <p className="text-gray-600 text-xs mt-0.5">
                  Mixed or moderate sentiment responses
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-error-100 flex items-center justify-center flex-shrink-0">
                <Frown className="w-5 h-5 text-error-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Negative</p>
                <p className="text-gray-600 text-xs mt-0.5">
                  Dissatisfied customers requiring attention
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default SentimentChart

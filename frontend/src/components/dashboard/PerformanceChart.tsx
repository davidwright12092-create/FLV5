import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardBody } from '../ui/Card'
import { useState } from 'react'

// No mock data - will fetch from API
const mockData = [
  { date: 'Mon', score: 0, recordings: 0, satisfaction: 0 },
  { date: 'Tue', score: 0, recordings: 0, satisfaction: 0 },
  { date: 'Wed', score: 0, recordings: 0, satisfaction: 0 },
  { date: 'Thu', score: 0, recordings: 0, satisfaction: 0 },
  { date: 'Fri', score: 0, recordings: 0, satisfaction: 0 },
  { date: 'Sat', score: 0, recordings: 0, satisfaction: 0 },
  { date: 'Sun', score: 0, recordings: 0, satisfaction: 0 },
]

type MetricType = 'score' | 'recordings' | 'satisfaction'

export default function PerformanceChart() {
  const [activeMetric, setActiveMetric] = useState<MetricType>('score')

  const metrics = [
    { key: 'score' as MetricType, label: 'Process Score', color: '#06D6A0', unit: '%' },
    { key: 'recordings' as MetricType, label: 'Recordings', color: '#118AB2', unit: '' },
    { key: 'satisfaction' as MetricType, label: 'Satisfaction', color: '#8B5CF6', unit: '/5' },
  ]

  const activeMetricData = metrics.find((m) => m.key === activeMetric)!

  return (
    <Card variant="elevated" rounded="3xl">
      <CardHeader
        title="Performance Trends"
        subtitle="Last 7 days"
        action={
          <div className="flex items-center space-x-2">
            {metrics.map((metric) => (
              <button
                key={metric.key}
                onClick={() => setActiveMetric(metric.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeMetric === metric.key
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        }
      />
      <CardBody>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeMetricData.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={activeMetricData.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: '#111827', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={activeMetricData.color}
                strokeWidth={3}
                fill="url(#colorGradient)"
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          {metrics.map((metric) => {
            const values = mockData.map((d) => d[metric.key] as number)
            const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
            const max = Math.max(...values)
            const min = Math.min(...values)

            return (
              <div key={metric.key} className="text-center">
                <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avg}
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {min}{metric.unit} - {max}{metric.unit}
                </p>
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}

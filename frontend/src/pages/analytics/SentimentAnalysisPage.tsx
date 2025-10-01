import { useState } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { SentimentChart } from '../../components/analytics/SentimentChart'
import {
  Smile,
  Frown,
  Meh,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Download,
  ChevronRight,
  Home,
  BarChart3,
  Users,
  Clock,
  Target,
  MessageSquare,
  Award,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
  Calendar,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  PieChart,
  Pie,
} from 'recharts'

// Types
interface TimePeriod {
  value: string
  label: string
}

interface SentimentOverview {
  overallScore: number
  positivePercentage: number
  neutralPercentage: number
  negativePercentage: number
  trend: 'improving' | 'declining' | 'stable'
  trendPercentage: number
  customerSatisfactionScore: number
}

interface CategorySentiment {
  category: string
  positive: number
  neutral: number
  negative: number
  score: number
}

interface AgentSentiment {
  agent: string
  avatar: string
  score: number
  positive: number
  neutral: number
  negative: number
  totalInteractions: number
}

interface TimeOfDaySentiment {
  hour: string
  score: number
  interactions: number
}

interface ConversationSample {
  id: string
  customer: string
  agent: string
  timestamp: string
  excerpt: string
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number
  category: string
}

interface SentimentDriver {
  factor: string
  impact: number
  trend: 'up' | 'down' | 'stable'
  frequency: number
}

interface Recommendation {
  id: string
  type: 'coaching' | 'process' | 'training'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImpact: string
  affectedAgents?: string[]
}

interface KeywordData {
  text: string
  value: number
  sentiment: 'positive' | 'negative'
}

// Mock Data
const timePeriods: TimePeriod[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom' },
]

const sentimentOverview: SentimentOverview = {
  overallScore: 7.8,
  positivePercentage: 64.5,
  neutralPercentage: 23.8,
  negativePercentage: 11.7,
  trend: 'improving',
  trendPercentage: 8.3,
  customerSatisfactionScore: 8.2,
}

const categorySentimentData: CategorySentiment[] = [
  {
    category: 'Product Quality',
    positive: 72,
    neutral: 18,
    negative: 10,
    score: 8.1,
  },
  {
    category: 'Customer Service',
    positive: 68,
    neutral: 22,
    negative: 10,
    score: 7.9,
  },
  {
    category: 'Delivery Speed',
    positive: 55,
    neutral: 30,
    negative: 15,
    score: 7.0,
  },
  {
    category: 'Pricing',
    positive: 48,
    neutral: 35,
    negative: 17,
    score: 6.5,
  },
  {
    category: 'Technical Support',
    positive: 75,
    neutral: 15,
    negative: 10,
    score: 8.3,
  },
  {
    category: 'Return Process',
    positive: 42,
    neutral: 28,
    negative: 30,
    score: 5.6,
  },
]

const agentSentimentData: AgentSentiment[] = [
  {
    agent: 'Sarah Johnson',
    avatar: 'SJ',
    score: 8.7,
    positive: 78,
    neutral: 15,
    negative: 7,
    totalInteractions: 245,
  },
  {
    agent: 'Mike Chen',
    avatar: 'MC',
    score: 8.4,
    positive: 72,
    neutral: 20,
    negative: 8,
    totalInteractions: 198,
  },
  {
    agent: 'Emily Rodriguez',
    avatar: 'ER',
    score: 8.1,
    positive: 70,
    neutral: 22,
    negative: 8,
    totalInteractions: 312,
  },
  {
    agent: 'David Kim',
    avatar: 'DK',
    score: 7.8,
    positive: 65,
    neutral: 25,
    negative: 10,
    totalInteractions: 176,
  },
  {
    agent: 'Lisa Thompson',
    avatar: 'LT',
    score: 7.5,
    positive: 62,
    neutral: 26,
    negative: 12,
    totalInteractions: 203,
  },
  {
    agent: 'James Wilson',
    avatar: 'JW',
    score: 7.2,
    positive: 58,
    neutral: 28,
    negative: 14,
    totalInteractions: 189,
  },
]

const timeOfDayData: TimeOfDaySentiment[] = [
  { hour: '9 AM', score: 7.2, interactions: 45 },
  { hour: '10 AM', score: 7.8, interactions: 89 },
  { hour: '11 AM', score: 8.1, interactions: 112 },
  { hour: '12 PM', score: 7.5, interactions: 78 },
  { hour: '1 PM', score: 7.3, interactions: 65 },
  { hour: '2 PM', score: 7.9, interactions: 98 },
  { hour: '3 PM', score: 8.2, interactions: 134 },
  { hour: '4 PM', score: 7.8, interactions: 102 },
  { hour: '5 PM', score: 7.4, interactions: 87 },
  { hour: '6 PM', score: 6.9, interactions: 56 },
]

const positiveConversations: ConversationSample[] = [
  {
    id: '1',
    customer: 'Jennifer Williams',
    agent: 'Sarah Johnson',
    timestamp: '2025-09-28 14:32',
    excerpt:
      '"Thank you so much! Sarah was incredibly helpful and patient. She resolved my issue quickly and even followed up to make sure everything was working perfectly. Best customer service experience I\'ve had!"',
    sentiment: 'positive',
    score: 9.5,
    category: 'Customer Service',
  },
  {
    id: '2',
    customer: 'Robert Martinez',
    agent: 'Mike Chen',
    timestamp: '2025-09-29 10:15',
    excerpt:
      '"The product quality exceeded my expectations! Mike helped me choose the perfect solution for my needs. Very knowledgeable and friendly. Will definitely recommend to others."',
    sentiment: 'positive',
    score: 9.2,
    category: 'Product Quality',
  },
  {
    id: '3',
    customer: 'Amanda Green',
    agent: 'Emily Rodriguez',
    timestamp: '2025-09-30 09:45',
    excerpt:
      '"Emily was amazing! She went above and beyond to help me understand all the features. The technical support team really knows their stuff. I\'m very satisfied with the service."',
    sentiment: 'positive',
    score: 9.0,
    category: 'Technical Support',
  },
]

const negativeConversations: ConversationSample[] = [
  {
    id: '4',
    customer: 'Michael Brown',
    agent: 'James Wilson',
    timestamp: '2025-09-27 16:20',
    excerpt:
      '"Very disappointed with the return process. It took way too long to get a response, and the instructions were confusing. Expected better from your company."',
    sentiment: 'negative',
    score: 3.2,
    category: 'Return Process',
  },
  {
    id: '5',
    customer: 'Patricia Davis',
    agent: 'David Kim',
    timestamp: '2025-09-28 11:30',
    excerpt:
      '"The delivery was much slower than promised. I needed this urgently and had to make other arrangements. Communication about the delay could have been better."',
    sentiment: 'negative',
    score: 4.1,
    category: 'Delivery Speed',
  },
]

const improvedConversation = {
  before: {
    id: '6',
    customer: 'Susan Anderson',
    agent: 'Lisa Thompson',
    timestamp: '2025-09-25 14:00',
    excerpt:
      '"I\'m frustrated with this product. It\'s not working as advertised and I\'ve wasted so much time trying to figure it out."',
    sentiment: 'negative' as const,
    score: 3.8,
    category: 'Technical Support',
  },
  after: {
    id: '6-after',
    customer: 'Susan Anderson',
    agent: 'Lisa Thompson',
    timestamp: '2025-09-25 14:45',
    excerpt:
      '"Thank you Lisa for taking the time to walk me through everything step by step. Now I understand how it works and I\'m actually really impressed with all the features!"',
    sentiment: 'positive' as const,
    score: 8.5,
    category: 'Technical Support',
  },
}

const positiveSentimentDrivers: SentimentDriver[] = [
  {
    factor: 'Quick Response Time',
    impact: 92,
    trend: 'up',
    frequency: 847,
  },
  {
    factor: 'Agent Knowledge & Expertise',
    impact: 88,
    trend: 'up',
    frequency: 723,
  },
  {
    factor: 'Problem Resolution',
    impact: 85,
    trend: 'stable',
    frequency: 689,
  },
  {
    factor: 'Friendly & Professional Tone',
    impact: 82,
    trend: 'up',
    frequency: 812,
  },
  {
    factor: 'Follow-up & Proactive Care',
    impact: 78,
    trend: 'up',
    frequency: 456,
  },
]

const negativeSentimentDrivers: SentimentDriver[] = [
  {
    factor: 'Long Wait Times',
    impact: 85,
    trend: 'down',
    frequency: 234,
  },
  {
    factor: 'Unclear Return Policy',
    impact: 78,
    trend: 'stable',
    frequency: 189,
  },
  {
    factor: 'Delivery Delays',
    impact: 72,
    trend: 'down',
    frequency: 156,
  },
  {
    factor: 'Pricing Concerns',
    impact: 68,
    trend: 'stable',
    frequency: 198,
  },
  {
    factor: 'Technical Issues',
    impact: 65,
    trend: 'down',
    frequency: 143,
  },
]

const positiveKeywords: KeywordData[] = [
  { text: 'Excellent', value: 95, sentiment: 'positive' },
  { text: 'Helpful', value: 88, sentiment: 'positive' },
  { text: 'Quick', value: 82, sentiment: 'positive' },
  { text: 'Professional', value: 78, sentiment: 'positive' },
  { text: 'Amazing', value: 75, sentiment: 'positive' },
  { text: 'Patient', value: 72, sentiment: 'positive' },
  { text: 'Knowledgeable', value: 70, sentiment: 'positive' },
  { text: 'Friendly', value: 68, sentiment: 'positive' },
  { text: 'Efficient', value: 65, sentiment: 'positive' },
  { text: 'Satisfied', value: 62, sentiment: 'positive' },
]

const negativeKeywords: KeywordData[] = [
  { text: 'Disappointed', value: 45, sentiment: 'negative' },
  { text: 'Slow', value: 42, sentiment: 'negative' },
  { text: 'Frustrated', value: 38, sentiment: 'negative' },
  { text: 'Confused', value: 35, sentiment: 'negative' },
  { text: 'Delayed', value: 32, sentiment: 'negative' },
  { text: 'Complicated', value: 28, sentiment: 'negative' },
  { text: 'Unhappy', value: 25, sentiment: 'negative' },
  { text: 'Issue', value: 23, sentiment: 'negative' },
]

const recommendations: Recommendation[] = [
  {
    id: '1',
    type: 'coaching',
    priority: 'high',
    title: 'Improve Response Time During Peak Hours',
    description:
      'Analysis shows sentiment drops during 12-2 PM and 6-7 PM. Consider adding additional support staff during these high-traffic periods to maintain service quality.',
    expectedImpact: '+12% positive sentiment increase',
    affectedAgents: ['All Team Members'],
  },
  {
    id: '2',
    type: 'process',
    priority: 'high',
    title: 'Streamline Return Process',
    description:
      'Return process is the lowest-rated category (5.6/10). Implement clearer instructions, automated status updates, and faster processing times.',
    expectedImpact: '+15% satisfaction in returns',
  },
  {
    id: '3',
    type: 'coaching',
    priority: 'medium',
    title: 'Coaching Opportunity: James Wilson & David Kim',
    description:
      'These agents show potential for improvement. Pair them with top performers (Sarah Johnson, Mike Chen) for mentoring sessions focused on empathy and problem-solving.',
    expectedImpact: '+8% team performance',
    affectedAgents: ['James Wilson', 'David Kim'],
  },
  {
    id: '4',
    type: 'training',
    priority: 'medium',
    title: 'Delivery Expectations Management Training',
    description:
      'Train team to proactively communicate delivery timelines and set realistic expectations upfront to reduce disappointment.',
    expectedImpact: '+10% delivery satisfaction',
  },
  {
    id: '5',
    type: 'process',
    priority: 'low',
    title: 'Implement Pricing Transparency Initiative',
    description:
      'Create better pricing documentation and empower agents to explain value proposition more effectively.',
    expectedImpact: '+6% pricing satisfaction',
  },
]

// Helper Components
const SentimentIcon = ({ sentiment }: { sentiment: 'positive' | 'neutral' | 'negative' }) => {
  if (sentiment === 'positive')
    return <Smile className="w-5 h-5 text-success-600" />
  if (sentiment === 'negative')
    return <Frown className="w-5 h-5 text-error-600" />
  return <Meh className="w-5 h-5 text-gray-600" />
}

const TrendIndicator = ({ trend, value }: { trend: 'up' | 'down' | 'stable'; value?: number }) => {
  if (trend === 'up')
    return (
      <div className="flex items-center gap-1 text-success-600">
        <TrendingUp className="w-4 h-4" />
        {value && <span className="text-xs font-medium">+{value}%</span>}
      </div>
    )
  if (trend === 'down')
    return (
      <div className="flex items-center gap-1 text-error-600">
        <TrendingDown className="w-4 h-4" />
        {value && <span className="text-xs font-medium">-{value}%</span>}
      </div>
    )
  return (
    <div className="flex items-center gap-1 text-gray-600">
      <Minus className="w-4 h-4" />
      {value && <span className="text-xs font-medium">{value}%</span>}
    </div>
  )
}

export default function SentimentAnalysisPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [compareEnabled, setCompareEnabled] = useState(false)

  const handleExport = () => {
    console.log('Exporting sentiment analysis data...')
  }

  return (
    <PageLayout>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-4 h-4" />
        <BarChart3 className="w-4 h-4" />
        <span>Analytics</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Sentiment Analysis</span>
      </div>

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sentiment Analysis</h1>
            <p className="text-gray-600">
              Deep insights into customer sentiment trends and actionable recommendations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time Period Selector */}
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              {timePeriods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    selectedPeriod === period.value
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* Compare Toggle */}
            <button
              onClick={() => setCompareEnabled(!compareEnabled)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                compareEnabled
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Compare Period</span>
            </button>

            {/* Export Button */}
            <Button variant="outline" size="md" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Sentiment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {/* Overall Sentiment Score */}
        <Card variant="elevated" className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            {sentimentOverview.trend === 'improving' && (
              <TrendIndicator trend="up" value={sentimentOverview.trendPercentage} />
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Overall Score</h3>
          <p className="text-3xl font-bold text-gray-900">
            {sentimentOverview.overallScore}
            <span className="text-lg text-gray-500">/10</span>
          </p>
        </Card>

        {/* Positive Percentage */}
        <Card variant="elevated" className="bg-gradient-to-br from-success-50 to-success-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-success-500 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Positive</h3>
          <p className="text-3xl font-bold text-gray-900">
            {sentimentOverview.positivePercentage}%
          </p>
        </Card>

        {/* Neutral Percentage */}
        <Card variant="elevated" className="bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-500 flex items-center justify-center">
              <Minus className="w-5 h-5 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Neutral</h3>
          <p className="text-3xl font-bold text-gray-900">
            {sentimentOverview.neutralPercentage}%
          </p>
        </Card>

        {/* Negative Percentage */}
        <Card variant="elevated" className="bg-gradient-to-br from-error-50 to-error-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-error-500 flex items-center justify-center">
              <ThumbsDown className="w-5 h-5 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Negative</h3>
          <p className="text-3xl font-bold text-gray-900">
            {sentimentOverview.negativePercentage}%
          </p>
        </Card>

        {/* Sentiment Trend */}
        <Card variant="elevated" className="bg-gradient-to-br from-cyan-50 to-cyan-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Trend</h3>
          <p className="text-2xl font-bold text-gray-900 capitalize">
            {sentimentOverview.trend}
          </p>
          <p className="text-xs text-gray-600 mt-1">+{sentimentOverview.trendPercentage}% vs previous</p>
        </Card>

        {/* Customer Satisfaction Score */}
        <Card variant="elevated" className="bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">CSAT Score</h3>
          <p className="text-3xl font-bold text-gray-900">
            {sentimentOverview.customerSatisfactionScore}
            <span className="text-lg text-gray-500">/10</span>
          </p>
        </Card>
      </div>

      {/* Main Sentiment Chart */}
      <div className="mb-8">
        <SentimentChart />
      </div>

      {/* Sentiment by Category */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Sentiment by Category
            </h3>
            <p className="text-sm text-gray-600">
              How customers feel about different aspects of your service
            </p>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categorySentimentData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    stroke="#6B7280"
                    fontSize={12}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="positive" stackId="a" fill="#10B981" name="Positive" />
                  <Bar dataKey="neutral" stackId="a" fill="#6B7280" name="Neutral" />
                  <Bar dataKey="negative" stackId="a" fill="#EF4444" name="Negative" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Sentiment by Agent */}
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Team Performance</h3>
            <p className="text-sm text-gray-600">
              Sentiment scores across team members
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {agentSentimentData.map((agent, index) => (
                <div
                  key={agent.agent}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        index === 0
                          ? 'bg-amber-500'
                          : index === 1
                          ? 'bg-gray-400'
                          : index === 2
                          ? 'bg-orange-600'
                          : 'bg-primary-500'
                      }`}
                    >
                      {agent.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{agent.agent}</p>
                      <p className="text-xs text-gray-600">
                        {agent.totalInteractions} interactions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-8 rounded-full bg-success-500"
                          style={{ height: `${(agent.positive / 100) * 32}px` }}
                        />
                        <div
                          className="w-2 h-8 rounded-full bg-gray-400"
                          style={{ height: `${(agent.neutral / 100) * 32}px` }}
                        />
                        <div
                          className="w-2 h-8 rounded-full bg-error-500"
                          style={{ height: `${(agent.negative / 100) * 32}px` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{agent.score}</p>
                      <p className="text-xs text-gray-600">score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Sentiment by Time of Day */}
      <div className="mb-8">
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-start justify-between w-full">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Sentiment by Time of Day
                </h3>
                <p className="text-sm text-gray-600">
                  Identify peak performance hours and opportunities for improvement
                </p>
              </div>
              <Clock className="w-6 h-6 text-primary-500" />
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeOfDayData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    fill="url(#scoreGradient)"
                    name="Sentiment Score"
                    dot={{ fill: '#8B5CF6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="interactions"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Interactions"
                    dot={{ fill: '#10B981', r: 4 }}
                    yAxisId="right"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10B981"
                    fontSize={12}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Top Positive & Negative Moments */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Top Positive Moments */}
        <Card variant="elevated" className="border-l-4 border-l-success-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center">
                <Smile className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Top Positive Moments</h3>
                <p className="text-sm text-gray-600">
                  Exceptional customer experiences worth celebrating
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {positiveConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="p-4 bg-gradient-to-br from-success-50 to-white rounded-xl border border-success-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-success-600" />
                      <span className="font-medium text-gray-900">{conv.customer}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-success-100 px-3 py-1 rounded-full">
                      <Smile className="w-4 h-4 text-success-600" />
                      <span className="text-sm font-semibold text-success-700">
                        {conv.score}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 italic mb-3 leading-relaxed">
                    {conv.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Agent: {conv.agent}</span>
                    <span>{conv.timestamp}</span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-success-100 text-success-700 text-xs font-medium rounded">
                      {conv.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Top Concerns */}
        <Card variant="elevated" className="border-l-4 border-l-error-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-error-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-error-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Top Concerns & Areas to Improve
                </h3>
                <p className="text-sm text-gray-600">
                  Critical feedback requiring immediate attention
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {negativeConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="p-4 bg-gradient-to-br from-error-50 to-white rounded-xl border border-error-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-error-600" />
                      <span className="font-medium text-gray-900">{conv.customer}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-error-100 px-3 py-1 rounded-full">
                      <Frown className="w-4 h-4 text-error-600" />
                      <span className="text-sm font-semibold text-error-700">
                        {conv.score}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 italic mb-3 leading-relaxed">
                    {conv.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Agent: {conv.agent}</span>
                    <span>{conv.timestamp}</span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-error-100 text-error-700 text-xs font-medium rounded">
                      {conv.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Improved Sentiment Conversation */}
      <div className="mb-8">
        <Card variant="elevated" className="border-l-4 border-l-cyan-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Sentiment Turnaround Story</h3>
                <p className="text-sm text-gray-600">
                  Example of excellent service recovery transforming a negative experience
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="relative">
                <div className="absolute -top-3 left-4 px-3 py-1 bg-error-500 text-white text-xs font-bold rounded-full">
                  BEFORE
                </div>
                <div className="p-4 bg-gradient-to-br from-error-50 to-white rounded-xl border border-error-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-error-600" />
                      <span className="font-medium text-gray-900">
                        {improvedConversation.before.customer}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-error-100 px-3 py-1 rounded-full">
                      <Frown className="w-4 h-4 text-error-600" />
                      <span className="text-sm font-semibold text-error-700">
                        {improvedConversation.before.score}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 italic mb-3 leading-relaxed">
                    {improvedConversation.before.excerpt}
                  </p>
                  <div className="text-xs text-gray-600">
                    <p>Agent: {improvedConversation.before.agent}</p>
                    <p className="mt-1">{improvedConversation.before.timestamp}</p>
                  </div>
                </div>
              </div>

              {/* After */}
              <div className="relative">
                <div className="absolute -top-3 left-4 px-3 py-1 bg-success-500 text-white text-xs font-bold rounded-full">
                  AFTER
                </div>
                <div className="p-4 bg-gradient-to-br from-success-50 to-white rounded-xl border border-success-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-success-600" />
                      <span className="font-medium text-gray-900">
                        {improvedConversation.after.customer}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-success-100 px-3 py-1 rounded-full">
                      <Smile className="w-4 h-4 text-success-600" />
                      <span className="text-sm font-semibold text-success-700">
                        {improvedConversation.after.score}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 italic mb-3 leading-relaxed">
                    {improvedConversation.after.excerpt}
                  </p>
                  <div className="text-xs text-gray-600">
                    <p>Agent: {improvedConversation.after.agent}</p>
                    <p className="mt-1">{improvedConversation.after.timestamp}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">Key Turnaround Factor</p>
                  <p className="text-sm text-gray-700">
                    Lisa took the time to provide personalized, step-by-step guidance and showed
                    genuine patience. This transformed frustration into appreciation and
                    demonstrated the power of empathetic customer service.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Sentiment Drivers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Positive Drivers */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Positive Sentiment Drivers
                </h3>
                <p className="text-sm text-gray-600">What makes customers happy</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {positiveSentimentDrivers.map((driver, index) => (
                <div key={driver.factor} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {index + 1}. {driver.factor}
                      </span>
                      <TrendIndicator trend={driver.trend} />
                    </div>
                    <span className="text-sm font-semibold text-success-600">
                      {driver.impact}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-success-500 to-success-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${driver.impact}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-20 text-right">
                      {driver.frequency} mentions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Negative Drivers */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-error-100 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-error-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Negative Sentiment Drivers
                </h3>
                <p className="text-sm text-gray-600">Areas needing improvement</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {negativeSentimentDrivers.map((driver, index) => (
                <div key={driver.factor} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {index + 1}. {driver.factor}
                      </span>
                      <TrendIndicator trend={driver.trend} />
                    </div>
                    <span className="text-sm font-semibold text-error-600">
                      {driver.impact}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-error-500 to-error-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${driver.impact}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-20 text-right">
                      {driver.frequency} mentions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Keyword Cloud */}
      <div className="mb-8">
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Sentiment Keywords Analysis
            </h3>
            <p className="text-sm text-gray-600">
              Most frequent words associated with customer sentiment
            </p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Positive Keywords */}
              <div>
                <h4 className="text-sm font-semibold text-success-700 mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  Positive Keywords
                </h4>
                <div className="flex flex-wrap gap-3">
                  {positiveKeywords.map((keyword) => (
                    <div
                      key={keyword.text}
                      className="px-4 py-2 bg-gradient-to-r from-success-100 to-success-50 border border-success-300 rounded-full hover:shadow-md transition-all duration-200 cursor-default"
                      style={{
                        fontSize: `${Math.max(12, keyword.value / 8)}px`,
                      }}
                    >
                      <span className="font-medium text-success-700">{keyword.text}</span>
                      <span className="ml-2 text-xs text-success-600">({keyword.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Negative Keywords */}
              <div>
                <h4 className="text-sm font-semibold text-error-700 mb-4 flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4" />
                  Negative Keywords
                </h4>
                <div className="flex flex-wrap gap-3">
                  {negativeKeywords.map((keyword) => (
                    <div
                      key={keyword.text}
                      className="px-4 py-2 bg-gradient-to-r from-error-100 to-error-50 border border-error-300 rounded-full hover:shadow-md transition-all duration-200 cursor-default"
                      style={{
                        fontSize: `${Math.max(12, keyword.value / 4)}px`,
                      }}
                    >
                      <span className="font-medium text-error-700">{keyword.text}</span>
                      <span className="ml-2 text-xs text-error-600">({keyword.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* AI-Generated Recommendations */}
      <div>
        <Card variant="elevated" className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">AI-Powered Recommendations</h3>
                <p className="text-sm text-gray-700">
                  Actionable insights to improve customer sentiment and team performance
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {rec.type === 'coaching' && (
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      {rec.type === 'process' && (
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Target className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      {rec.type === 'training' && (
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                          <Award className="w-5 h-5 text-cyan-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                              rec.priority === 'high'
                                ? 'bg-error-100 text-error-700'
                                : rec.priority === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {rec.priority.toUpperCase()} PRIORITY
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary-100 text-primary-700 capitalize">
                            {rec.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-1">Expected Impact</p>
                      <p className="text-sm font-semibold text-success-600">
                        {rec.expectedImpact}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {rec.description}
                  </p>

                  {rec.affectedAgents && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-600">
                        Affected: {rec.affectedAgents.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl border border-purple-300">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Implementing these recommendations could lead to:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                      Up to 20% improvement in overall customer sentiment
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                      Reduced negative feedback by 25-30%
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                      Enhanced team performance across all metrics
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageLayout>
  )
}

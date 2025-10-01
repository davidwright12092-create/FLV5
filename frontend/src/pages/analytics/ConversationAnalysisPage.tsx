import { useState } from 'react'
import {
  MessageSquare,
  Clock,
  TrendingUp,
  Users,
  Trophy,
  Tag,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  Search,
  Eye,
  Share2,
  FileDown,
  X,
  ChevronRight,
  BarChart3,
  Smile,
  Meh,
  Frown,
} from 'lucide-react'
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
import PageLayout from '../../components/layout/PageLayout'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

// TypeScript interfaces
interface Conversation {
  id: string
  customerName: string
  customerAvatar: string
  date: string
  duration: number // in minutes
  score: number // 0-100
  sentiment: 'positive' | 'neutral' | 'negative'
  category: string
  topics: string[]
  agentName: string
  agentAvatar: string
}

interface StatCard {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: React.ReactNode
  color: string
}

interface ChartData {
  name: string
  value: number
}

// No mock data - will fetch from API
const mockConversations: Conversation[] = []

// Chart data - No mock data - will fetch from API
const conversationFrequencyData: ChartData[] = []

const scoreDistributionData: ChartData[] = []

const sentimentData: ChartData[] = []

const COLORS = {
  positive: '#10B981',
  neutral: '#F59E0B',
  negative: '#EF4444',
  primary: '#06D6A0',
  secondary: '#118AB2',
  tertiary: '#8B5CF6',
}

export default function ConversationAnalysisPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Calculate statistics
  const totalConversations = mockConversations.length
  const averageDuration =
    mockConversations.reduce((sum, conv) => sum + conv.duration, 0) / totalConversations
  const averageScore =
    mockConversations.reduce((sum, conv) => sum + conv.score, 0) / totalConversations
  const sentimentCounts = mockConversations.reduce(
    (acc, conv) => {
      acc[conv.sentiment]++
      return acc
    },
    { positive: 0, neutral: 0, negative: 0 }
  )
  const dominantSentiment =
    sentimentCounts.positive > sentimentCounts.neutral && sentimentCounts.positive > sentimentCounts.negative
      ? 'Positive'
      : sentimentCounts.negative > sentimentCounts.neutral
      ? 'Negative'
      : 'Neutral'

  // Get top performing agent
  const agentScores = mockConversations.reduce((acc, conv) => {
    if (!acc[conv.agentName]) {
      acc[conv.agentName] = { total: 0, count: 0 }
    }
    acc[conv.agentName].total += conv.score
    acc[conv.agentName].count++
    return acc
  }, {} as Record<string, { total: number; count: number }>)

  const topAgent = Object.entries(agentScores).reduce((top, [name, data]) => {
    const avg = data.total / data.count
    return avg > (top.score || 0) ? { name, score: avg } : top
  }, {} as { name?: string; score?: number })

  // Get trending topics
  const topicCounts = mockConversations.reduce((acc, conv) => {
    conv.topics.forEach((topic) => {
      acc[topic] = (acc[topic] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const trendingTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic)

  // Statistics cards
  const statsCards: StatCard[] = [
    {
      title: 'Total Conversations',
      value: totalConversations.toString(),
      change: '+12.5%',
      isPositive: true,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'cyan',
    },
    {
      title: 'Average Duration',
      value: `${averageDuration.toFixed(1)} min`,
      change: '+3.2%',
      isPositive: true,
      icon: <Clock className="w-6 h-6" />,
      color: 'blue',
    },
    {
      title: 'Average Score',
      value: `${averageScore.toFixed(1)}%`,
      change: '+5.8%',
      isPositive: true,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'purple',
    },
    {
      title: 'Average Sentiment',
      value: dominantSentiment,
      change: '+8.4%',
      isPositive: true,
      icon: <Smile className="w-6 h-6" />,
      color: 'green',
    },
    {
      title: 'Top Performing Agent',
      value: topAgent.name || 'N/A',
      change: `${topAgent.score?.toFixed(1)}% avg`,
      isPositive: true,
      icon: <Trophy className="w-6 h-6" />,
      color: 'yellow',
    },
    {
      title: 'Trending Topics',
      value: trendingTopics[0] || 'N/A',
      change: `+${trendingTopics.length - 1} more`,
      isPositive: true,
      icon: <Tag className="w-6 h-6" />,
      color: 'pink',
    },
  ]

  // Filter conversations
  const filteredConversations = mockConversations.filter((conv) => {
    const matchesSearch =
      conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.topics.some((topic) => topic.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesSentiment = selectedSentiment === 'all' || conv.sentiment === selectedSentiment
    const matchesCategory = selectedCategory === 'all' || conv.category === selectedCategory

    return matchesSearch && matchesSentiment && matchesCategory
  })

  // Get sentiment icon and color
  const getSentimentDisplay = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return {
          icon: <Smile className="w-4 h-4" />,
          color: 'bg-green-100 text-green-700',
          label: 'Positive',
        }
      case 'neutral':
        return {
          icon: <Meh className="w-4 h-4" />,
          color: 'bg-yellow-100 text-yellow-700',
          label: 'Neutral',
        }
      case 'negative':
        return {
          icon: <Frown className="w-4 h-4" />,
          color: 'bg-red-100 text-red-700',
          label: 'Negative',
        }
      default:
        return {
          icon: <Meh className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-700',
          label: 'Unknown',
        }
    }
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    if (score >= 60) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="hover:text-primary-600 cursor-pointer transition-colors">Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-primary-600 cursor-pointer transition-colors">Analytics</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Conversation Analysis</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-brand-cyan to-brand-blue bg-clip-text text-transparent">
              Conversation Analysis
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Analyze conversation quality, sentiment trends, and agent performance with AI-powered insights.
              Track key metrics and identify areas for improvement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Picker */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:border-primary-500 transition-colors cursor-pointer">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Last 7 days</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>

            {/* Filter Button */}
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5" />
              Filters
            </Button>

            {/* Export Button */}
            <div className="relative">
              <Button variant="secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
                <Download className="w-5 h-5" />
                Export
                <ChevronDown className="w-4 h-4" />
              </Button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <FileDown className="w-4 h-4" />
                    Export as PDF
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <FileDown className="w-4 h-4" />
                    Export as CSV
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <FileDown className="w-4 h-4" />
                    Export as Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card variant="bordered" className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <Input
                    type="date"
                    placeholder="Start date"
                    className="mb-2"
                  />
                  <Input type="date" placeholder="End date" />
                </div>

                {/* Customer Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer
                  </label>
                  <Input
                    type="text"
                    placeholder="Search customer..."
                    leftIcon={<Search className="w-5 h-5" />}
                  />
                </div>

                {/* Agent Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent/Team Member
                  </label>
                  <select className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500">
                    <option>All Agents</option>
                    <option>Mike Chen</option>
                    <option>Lisa Anderson</option>
                    <option>Tom Rodriguez</option>
                  </select>
                </div>

                {/* Score Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="0"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Sentiment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sentiment
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSentiment('all')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSentiment === 'all'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedSentiment('positive')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSentiment === 'positive'
                          ? 'bg-green-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Smile className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setSelectedSentiment('neutral')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSentiment === 'neutral'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Meh className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setSelectedSentiment('negative')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSentiment === 'negative'
                          ? 'bg-red-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Frown className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Installation">Installation</option>
                    <option value="Repair">Repair</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Complaint">Complaint</option>
                  </select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Min" className="flex-1" />
                    <Input type="number" placeholder="Max" className="flex-1" />
                  </div>
                </div>

                {/* Reset Button */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => {
                      setSelectedSentiment('all')
                      setSelectedCategory('all')
                      setSearchTerm('')
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} variant="elevated" className="hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span
                      className={`text-sm font-medium ${
                        stat.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">from last period</span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-xl ${
                    stat.color === 'cyan'
                      ? 'bg-cyan-100 text-brand-cyan'
                      : stat.color === 'blue'
                      ? 'bg-blue-100 text-brand-blue'
                      : stat.color === 'purple'
                      ? 'bg-purple-100 text-brand-purple'
                      : stat.color === 'green'
                      ? 'bg-green-100 text-green-600'
                      : stat.color === 'yellow'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-pink-100 text-brand-pink'
                  }`}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation Frequency */}
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader title="Conversation Frequency" subtitle="Daily conversation volume over time" />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversationFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Sentiment Breakdown */}
          <Card variant="elevated">
            <CardHeader title="Sentiment Breakdown" subtitle="Overall conversation sentiment" />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === 'Positive'
                            ? COLORS.positive
                            : entry.name === 'Neutral'
                            ? COLORS.neutral
                            : COLORS.negative
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Score Distribution */}
          <Card variant="elevated" className="lg:col-span-3">
            <CardHeader
              title="Score Distribution"
              subtitle="Distribution of conversation quality scores"
            />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Bar dataKey="value" fill={COLORS.secondary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Conversation List */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Conversations ({filteredConversations.length})
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Detailed analysis of recent conversations
                </p>
              </div>
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="sm:w-80"
              />
            </div>
          </CardHeader>
          <CardBody>
            {filteredConversations.length === 0 ? (
              // Empty State
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConversations.map((conversation) => {
                  const sentimentDisplay = getSentimentDisplay(conversation.sentiment)
                  return (
                    <div
                      key={conversation.id}
                      className="p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Customer Info */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center text-white font-semibold">
                            {conversation.customerAvatar}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {conversation.customerName}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(conversation.date).toLocaleDateString()}</span>
                              <span className="text-gray-400">•</span>
                              <Clock className="w-4 h-4" />
                              <span>{conversation.duration.toFixed(1)} min</span>
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Score:</span>
                          <div
                            className={`px-3 py-1.5 rounded-lg font-semibold ${getScoreColor(
                              conversation.score
                            )}`}
                          >
                            {conversation.score}%
                          </div>
                        </div>

                        {/* Sentiment */}
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${sentimentDisplay.color}`}
                        >
                          {sentimentDisplay.icon}
                          <span className="text-sm font-medium">{sentimentDisplay.label}</span>
                        </div>

                        {/* Category */}
                        <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                          {conversation.category}
                        </div>

                        {/* Topics */}
                        <div className="flex-1 hidden xl:flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <div className="flex gap-1 flex-wrap">
                            {conversation.topics.slice(0, 2).map((topic, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {topic}
                              </span>
                            ))}
                            {conversation.topics.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                +{conversation.topics.length - 2}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                            <FileDown className="w-5 h-5" />
                          </button>
                          <button className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors">
                            <Share2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Agent Info */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Agent:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-xs font-semibold">
                            {conversation.agentAvatar}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {conversation.agentName}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </PageLayout>
  )
}

import { ThumbsUp, ThumbsDown, Minus, Lightbulb, Target } from 'lucide-react'
import Card, { CardHeader, CardBody } from '../ui/Card'

interface AnalyticsData {
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  summary: string
  topics: string[]
  actionItems: string[]
}

interface AnalyticsSidebarProps {
  analytics: AnalyticsData
}

const AnalyticsSidebar = ({ analytics }: AnalyticsSidebarProps) => {
  const getSentimentColor = () => {
    const { positive, negative, neutral } = analytics.sentiment
    if (positive > negative && positive > neutral) return 'text-success-600'
    if (negative > positive && negative > neutral) return 'text-error-600'
    return 'text-warning-600'
  }

  const getSentimentLabel = () => {
    const { positive, negative, neutral } = analytics.sentiment
    if (positive > negative && positive > neutral) return 'Positive'
    if (negative > positive && negative > neutral) return 'Negative'
    return 'Neutral'
  }

  const getSentimentIcon = () => {
    const { positive, negative, neutral } = analytics.sentiment
    if (positive > negative && positive > neutral)
      return <ThumbsUp className="w-6 h-6" />
    if (negative > positive && negative > neutral)
      return <ThumbsDown className="w-6 h-6" />
    return <Minus className="w-6 h-6" />
  }

  return (
    <div className="space-y-4">
      {/* Sentiment Card */}
      <Card variant="bordered">
        <CardBody>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`${getSentimentColor()}`}>{getSentimentIcon()}</div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Sentiment</h3>
            <p className={`text-2xl font-bold ${getSentimentColor()}`}>
              {getSentimentLabel()}
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Positive</span>
                <span className="font-medium text-success-600">
                  {analytics.sentiment.positive}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-success-500 rounded-full"
                  style={{ width: `${analytics.sentiment.positive}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Neutral</span>
                <span className="font-medium text-warning-600">
                  {analytics.sentiment.neutral}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning-500 rounded-full"
                  style={{ width: `${analytics.sentiment.neutral}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Negative</span>
                <span className="font-medium text-error-600">
                  {analytics.sentiment.negative}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-error-500 rounded-full"
                  style={{ width: `${analytics.sentiment.negative}%` }}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary Card */}
      <Card variant="bordered">
        <CardHeader title="Summary" />
        <CardBody>
          <p className="text-sm text-gray-700 leading-relaxed">{analytics.summary}</p>
        </CardBody>
      </Card>

      {/* Key Topics Card */}
      <Card variant="bordered">
        <CardHeader title="Key Topics" />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {analytics.topics.map((topic, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 bg-primary-50 text-primary-700 border border-primary-200 text-xs rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Action Items Card */}
      <Card variant="bordered">
        <CardHeader title="Action Items" />
        <CardBody>
          <div className="space-y-3">
            {analytics.actionItems.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <Target className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default AnalyticsSidebar

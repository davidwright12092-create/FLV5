import { useState } from 'react'
import { Card, CardHeader, CardBody, CardFooter } from '../ui/Card'
import { CheckCircle, AlertCircle, Target, TrendingUp, TrendingDown, Lightbulb, ChevronRight } from 'lucide-react'

// TypeScript Interfaces
interface ProcessStage {
  id: string
  name: string
  score: number
  previousScore: number
  description: string
  maxScore: number
}

interface ProcessScoreData {
  overallScore: number
  previousOverallScore: number
  stages: ProcessStage[]
  period: string
  recommendations: Recommendation[]
}

interface Recommendation {
  stage: string
  priority: 'high' | 'medium' | 'low'
  tip: string
  impact: string
}

// No mock data - will fetch from API
const mockProcessData: ProcessScoreData = {
  overallScore: 0,
  previousOverallScore: 0,
  period: 'Last 30 days',
  stages: [],
  recommendations: [],
}

// Helper function to get score color
const getScoreColor = (score: number): string => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'error'
}

// Helper function to get score classes
const getScoreClasses = (score: number) => {
  if (score >= 90) {
    return {
      bg: 'bg-success-50',
      text: 'text-success-700',
      border: 'border-success-200',
      gradient: 'from-success-500 to-success-600',
      ring: 'ring-success-500',
    }
  }
  if (score >= 70) {
    return {
      bg: 'bg-warning-50',
      text: 'text-warning-700',
      border: 'border-warning-200',
      gradient: 'from-warning-500 to-warning-600',
      ring: 'ring-warning-500',
    }
  }
  return {
    bg: 'bg-error-50',
    text: 'text-error-700',
    border: 'border-error-200',
    gradient: 'from-error-500 to-error-600',
    ring: 'ring-error-500',
  }
}

// Circular Progress Component
interface CircularProgressProps {
  score: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  score,
  size = 200,
  strokeWidth = 12,
  showLabel = true,
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = ((100 - score) / 100) * circumference
  const scoreColor = getScoreColor(score)

  const colorMap = {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle with gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap[scoreColor]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-gray-900">{score}</div>
          <div className="text-sm text-gray-500 font-medium">Overall Score</div>
        </div>
      )}
    </div>
  )
}

// Stage Progress Bar Component
interface StageProgressBarProps {
  stage: ProcessStage
}

const StageProgressBar: React.FC<StageProgressBarProps> = ({ stage }) => {
  const scoreChange = stage.score - stage.previousScore
  const classes = getScoreClasses(stage.score)

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{stage.name}</h4>
            {scoreChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  scoreChange > 0
                    ? 'bg-success-50 text-success-700'
                    : 'bg-error-50 text-error-700'
                }`}
              >
                {scoreChange > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(scoreChange)}%
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{stage.description}</p>
        </div>
        <div className={`text-2xl font-bold ${classes.text} ml-4`}>{stage.score}%</div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${classes.gradient} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${stage.score}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

// Mini Circular Progress for stage cards
interface MiniCircularProgressProps {
  score: number
  size?: number
}

const MiniCircularProgress: React.FC<MiniCircularProgressProps> = ({ score, size = 60 }) => {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = ((100 - score) / 100) * circumference
  const scoreColor = getScoreColor(score)

  const colorMap = {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap[scoreColor]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-sm font-bold text-gray-900">{score}</div>
      </div>
    </div>
  )
}

// Main ProcessScore Component
export default function ProcessScore() {
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed')
  const [data] = useState<ProcessScoreData>(mockProcessData)

  const overallScoreChange = data.overallScore - data.previousOverallScore
  const classes = getScoreClasses(data.overallScore)

  return (
    <Card variant="elevated" rounded="3xl" className="overflow-hidden">
      <CardHeader
        title="Sales Process Adherence"
        subtitle={data.period}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'detailed'
                  ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'compact'
                  ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Compact
            </button>
          </div>
        }
      />

      <CardBody>
        {/* Overall Score Section */}
        <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
          {/* Circular Progress */}
          <div className="flex-shrink-0">
            <CircularProgress score={data.overallScore} size={200} strokeWidth={16} />
          </div>

          {/* Score Details */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${classes.gradient}`}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Process Adherence Score
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">
                    vs. previous period
                  </span>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
                      overallScoreChange > 0
                        ? 'bg-success-50 text-success-700'
                        : overallScoreChange < 0
                        ? 'bg-error-50 text-error-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {overallScoreChange > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : overallScoreChange < 0 ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : null}
                    {overallScoreChange > 0 ? '+' : ''}
                    {overallScoreChange}%
                  </div>
                </div>
              </div>
            </div>

            {/* Score Description */}
            <div className={`p-4 rounded-xl ${classes.bg} border ${classes.border}`}>
              <div className="flex items-start gap-3">
                {data.overallScore >= 90 ? (
                  <CheckCircle className={`w-5 h-5 ${classes.text} flex-shrink-0 mt-0.5`} />
                ) : (
                  <AlertCircle className={`w-5 h-5 ${classes.text} flex-shrink-0 mt-0.5`} />
                )}
                <div>
                  <p className={`font-semibold ${classes.text}`}>
                    {data.overallScore >= 90
                      ? 'Excellent Process Adherence'
                      : data.overallScore >= 70
                      ? 'Good Process Adherence - Room for Improvement'
                      : 'Process Adherence Needs Attention'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {data.overallScore >= 90
                      ? 'Your team is consistently following best practices across all sales stages.'
                      : data.overallScore >= 70
                      ? 'Your team is following most best practices. Focus on the areas below to optimize performance.'
                      : 'Several key process steps need improvement. Review the recommendations below.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Breakdown */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Process Stage Breakdown
            <span className="text-sm font-normal text-gray-500">
              ({data.stages.length} stages tracked)
            </span>
          </h4>

          {viewMode === 'detailed' ? (
            <div className="space-y-6">
              {data.stages.map((stage) => (
                <StageProgressBar key={stage.id} stage={stage} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {data.stages.map((stage) => {
                const classes = getScoreClasses(stage.score)
                const scoreChange = stage.score - stage.previousScore

                return (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-xl border ${classes.border} ${classes.bg} hover:shadow-lg transition-shadow cursor-pointer`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <MiniCircularProgress score={stage.score} />
                      <h5 className="font-semibold text-gray-900 mt-3 text-sm">
                        {stage.name}
                      </h5>
                      {scoreChange !== 0 && (
                        <div
                          className={`flex items-center gap-1 text-xs font-medium mt-2 ${
                            scoreChange > 0 ? 'text-success-700' : 'text-error-700'
                          }`}
                        >
                          {scoreChange > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(scoreChange)}%
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-brand-purple to-brand-blue">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">
              Recommendations for Improvement
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.recommendations.map((rec, index) => {
              const priorityClasses = {
                high: 'bg-error-50 border-error-200 text-error-700',
                medium: 'bg-warning-50 border-warning-200 text-warning-700',
                low: 'bg-info-50 border-info-200 text-info-700',
              }

              return (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white border-2 border-gray-100 hover:border-primary-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {rec.stage}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full border ${priorityClasses[rec.priority]}`}
                    >
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">{rec.tip}</p>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-primary-50 border border-primary-100">
                    <Target className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-primary-700 font-medium">{rec.impact}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardBody>

      <CardFooter divider>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-blue text-white font-medium text-sm hover:shadow-lg transition-shadow">
            View Detailed Report
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </CardFooter>
    </Card>
  )
}

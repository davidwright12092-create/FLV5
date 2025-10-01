import { Play, MoreVertical, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'

interface Recording {
  id: string
  title: string
  customer: string
  duration: string
  status: 'completed' | 'processing' | 'failed'
  score?: number
  date: string
}

// No mock data - will fetch from API
const mockRecordings: Recording[] = []

export default function RecentRecordingsList() {
  const getStatusBadge = (status: Recording['status']) => {
    const variants = {
      completed: {
        bg: 'bg-success-100',
        text: 'text-success-700',
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: 'Completed',
      },
      processing: {
        bg: 'bg-warning-100',
        text: 'text-warning-700',
        icon: <Clock className="w-3 h-3" />,
        label: 'Processing',
      },
      failed: {
        bg: 'bg-error-100',
        text: 'text-error-700',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Failed',
      },
    }

    const variant = variants[status]

    return (
      <span
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${variant.bg} ${variant.text}`}
      >
        {variant.icon}
        <span>{variant.label}</span>
      </span>
    )
  }

  return (
    <Card variant="elevated" rounded="3xl">
      <CardHeader title="Recent Recordings" subtitle="Latest customer conversations" />
      <CardBody>
        <div className="space-y-3">
          {mockRecordings.map((recording) => (
            <div
              key={recording.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-xl flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {recording.title}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-gray-600">{recording.customer}</span>
                    <span className="text-xs text-gray-400">"</span>
                    <span className="text-xs text-gray-600">{recording.duration}</span>
                    <span className="text-xs text-gray-400">"</span>
                    <span className="text-xs text-gray-500">{recording.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {recording.score && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{recording.score}%</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                )}

                {getStatusBadge(recording.status)}

                <button className="p-2 hover:bg-gray-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-2.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors">
          View All Recordings
        </button>
      </CardBody>
    </Card>
  )
}

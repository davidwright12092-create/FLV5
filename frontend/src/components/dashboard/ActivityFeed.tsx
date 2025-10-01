import { CheckCircle2, TrendingUp, UserPlus, FileText, AlertCircle, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'

interface Activity {
  id: string
  type: 'recording' | 'insight' | 'team' | 'report' | 'alert' | 'revenue'
  message: string
  time: string
  icon: React.ReactNode
  iconColor: string
  iconBg: string
}

// No mock data - will fetch from API
const mockActivities: Activity[] = []

export default function ActivityFeed() {
  return (
    <Card variant="elevated" rounded="3xl">
      <CardHeader title="Recent Activity" subtitle="Latest updates and notifications" />
      <CardBody>
        <div className="space-y-4">
          {mockActivities.map((activity, index) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-xl ${activity.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <span className={activity.iconColor}>{activity.icon}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
              </div>

              {index < mockActivities.length - 1 && (
                <div className="absolute left-[19px] mt-10 w-px h-8 bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-2.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors">
          View All Activity
        </button>
      </CardBody>
    </Card>
  )
}

import { Mic, DollarSign, Heart, TrendingUp } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { PageLayout } from '../../components/layout'
import MetricsCard from '../../components/dashboard/MetricsCard'
import RecentRecordingsList from '../../components/dashboard/RecentRecordingsList'
import PerformanceChart from '../../components/dashboard/PerformanceChart'
import QuickActions from '../../components/dashboard/QuickActions'
import ActivityFeed from '../../components/dashboard/ActivityFeed'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your conversations today
            </p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Recordings"
            value="0"
            icon={<Mic className="w-6 h-6 text-brand-cyan" />}
            trend={{ value: 0, isPositive: true }}
            subtitle="This month"
            color="cyan"
          />
          <MetricsCard
            title="Conversion Rate"
            value="0%"
            icon={<TrendingUp className="w-6 h-6 text-brand-blue" />}
            trend={{ value: 0, isPositive: true }}
            subtitle="No data yet"
            color="blue"
          />
          <MetricsCard
            title="Customer Satisfaction"
            value="0"
            icon={<Heart className="w-6 h-6 text-brand-pink" />}
            trend={{ value: 0, isPositive: true }}
            subtitle="Out of 5.0"
            color="pink"
          />
          <MetricsCard
            title="Revenue Impact"
            value="$0"
            icon={<DollarSign className="w-6 h-6 text-success-600" />}
            trend={{ value: 0, isPositive: true }}
            subtitle="Tracked opportunities"
            color="green"
          />
        </div>

        {/* Performance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>

        {/* Recent Recordings and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentRecordingsList />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

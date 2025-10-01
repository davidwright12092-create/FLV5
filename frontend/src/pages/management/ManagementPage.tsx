import { Link } from 'react-router-dom'
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  Activity,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Zap,
  Shield,
  Database,
  ArrowRight,
  UserCheck,
  FileCheck,
  Building2,
  Bell,
  Server,
} from 'lucide-react'
import PageLayout from '../../components/layout/PageLayout'
import MetricsCard from '../../components/dashboard/MetricsCard'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'

interface QuickAccessCard {
  title: string
  description: string
  icon: React.ReactNode
  iconColor: string
  iconBg: string
  href: string
  badge?: string
  badgeColor?: string
}

interface ActivityItem {
  id: string
  type: 'user' | 'process' | 'report' | 'alert' | 'system'
  message: string
  user?: string
  time: string
  icon: React.ReactNode
  iconColor: string
  iconBg: string
}

interface SystemStatus {
  name: string
  status: 'operational' | 'degraded' | 'down'
  uptime: string
  icon: React.ReactNode
}

const quickAccessCards: QuickAccessCard[] = [
  {
    title: 'Process Templates',
    description: 'Create and manage process templates for your team',
    icon: <FileText className="w-6 h-6" />,
    iconColor: 'text-brand-cyan',
    iconBg: 'bg-gradient-to-br from-brand-cyan to-brand-blue',
    href: '/management/processes',
    badge: '12 active',
    badgeColor: 'bg-brand-cyan/10 text-brand-cyan',
  },
  {
    title: 'User Management',
    description: 'Add, edit, and manage user permissions',
    icon: <Users className="w-6 h-6" />,
    iconColor: 'text-brand-blue',
    iconBg: 'bg-gradient-to-br from-brand-blue to-brand-purple',
    href: '/management/users',
    badge: '48 users',
    badgeColor: 'bg-brand-blue/10 text-brand-blue',
  },
  {
    title: 'Reports',
    description: 'Generate and view comprehensive analytics reports',
    icon: <BarChart3 className="w-6 h-6" />,
    iconColor: 'text-brand-purple',
    iconBg: 'bg-gradient-to-br from-brand-purple to-brand-pink',
    href: '/management/reports',
    badge: 'New insights',
    badgeColor: 'bg-brand-purple/10 text-brand-purple',
  },
  {
    title: 'Settings',
    description: 'Configure system settings and preferences',
    icon: <Settings className="w-6 h-6" />,
    iconColor: 'text-brand-orange',
    iconBg: 'bg-gradient-to-br from-brand-orange to-brand-yellow',
    href: '/management/settings',
  },
]

const recentActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'user',
    message: 'added a new team member',
    user: 'John Smith',
    time: '5 minutes ago',
    icon: <UserCheck className="w-4 h-4" />,
    iconColor: 'text-brand-blue',
    iconBg: 'bg-brand-blue/10',
  },
  {
    id: '2',
    type: 'process',
    message: 'updated the Sales Process template',
    user: 'Sarah Johnson',
    time: '15 minutes ago',
    icon: <FileCheck className="w-4 h-4" />,
    iconColor: 'text-brand-cyan',
    iconBg: 'bg-brand-cyan/10',
  },
  {
    id: '3',
    type: 'report',
    message: 'generated Monthly Performance Report',
    user: 'System',
    time: '1 hour ago',
    icon: <FileText className="w-4 h-4" />,
    iconColor: 'text-brand-purple',
    iconBg: 'bg-brand-purple/10',
  },
  {
    id: '4',
    type: 'alert',
    message: 'Process adherence below threshold for Team C',
    user: 'System Alert',
    time: '2 hours ago',
    icon: <AlertCircle className="w-4 h-4" />,
    iconColor: 'text-error-600',
    iconBg: 'bg-error-100',
  },
  {
    id: '5',
    type: 'user',
    message: 'changed permissions for Marketing Team',
    user: 'Michael Chen',
    time: '3 hours ago',
    icon: <Shield className="w-4 h-4" />,
    iconColor: 'text-brand-orange',
    iconBg: 'bg-brand-orange/10',
  },
  {
    id: '6',
    type: 'system',
    message: 'Database backup completed successfully',
    user: 'System',
    time: '5 hours ago',
    icon: <Database className="w-4 h-4" />,
    iconColor: 'text-success-600',
    iconBg: 'bg-success-100',
  },
  {
    id: '7',
    type: 'process',
    message: 'created new Installation Process template',
    user: 'Emily Rodriguez',
    time: 'Yesterday',
    icon: <FileCheck className="w-4 h-4" />,
    iconColor: 'text-brand-cyan',
    iconBg: 'bg-brand-cyan/10',
  },
  {
    id: '8',
    type: 'user',
    message: 'deactivated user account for ex-employee',
    user: 'John Smith',
    time: 'Yesterday',
    icon: <Users className="w-4 h-4" />,
    iconColor: 'text-gray-600',
    iconBg: 'bg-gray-100',
  },
]

const systemStatus: SystemStatus[] = [
  {
    name: 'API Services',
    status: 'operational',
    uptime: '99.9%',
    icon: <Server className="w-5 h-5" />,
  },
  {
    name: 'Database',
    status: 'operational',
    uptime: '99.8%',
    icon: <Database className="w-5 h-5" />,
  },
  {
    name: 'AI Processing',
    status: 'operational',
    uptime: '99.7%',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    name: 'Notifications',
    status: 'operational',
    uptime: '100%',
    icon: <Bell className="w-5 h-5" />,
  },
]

export default function ManagementPage() {
  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'text-success-600 bg-success-100'
      case 'degraded':
        return 'text-warning-600 bg-warning-100'
      case 'down':
        return 'text-error-600 bg-error-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusDot = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-success-500'
      case 'degraded':
        return 'bg-warning-500'
      case 'down':
        return 'bg-error-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent">
              Management Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Complete overview and control center for your FieldLink platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="md">
              <Activity className="w-4 h-4" />
              View Logs
            </Button>
            <Button variant="primary" size="md">
              <TrendingUp className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Users"
            value="48"
            icon={<Users className="w-6 h-6 text-brand-blue" />}
            trend={{ value: 12.5, isPositive: true }}
            subtitle="8 added this month"
            color="blue"
          />
          <MetricsCard
            title="Active Processes"
            value="12"
            icon={<FileText className="w-6 h-6 text-brand-cyan" />}
            trend={{ value: 8.3, isPositive: true }}
            subtitle="2 created recently"
            color="cyan"
          />
          <MetricsCard
            title="Reports Generated"
            value="156"
            icon={<BarChart3 className="w-6 h-6 text-brand-purple" />}
            trend={{ value: 23.1, isPositive: true }}
            subtitle="This quarter"
            color="purple"
          />
          <MetricsCard
            title="System Health"
            value="99.8%"
            icon={<Activity className="w-6 h-6 text-success-600" />}
            trend={{ value: 0.3, isPositive: true }}
            subtitle="All systems operational"
            color="green"
          />
        </div>

        {/* Quick Access Cards */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
            <p className="text-sm text-gray-600">Jump to frequently used features</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickAccessCards.map((card) => (
              <Link key={card.title} to={card.href} className="group">
                <Card
                  variant="elevated"
                  rounded="3xl"
                  className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardBody className="flex flex-col h-full">
                    <div
                      className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <span className="text-white">{card.icon}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 flex-1">{card.description}</p>

                    <div className="flex items-center justify-between">
                      {card.badge && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                          {card.badge}
                        </span>
                      )}
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all ml-auto" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2">
            <Card variant="elevated" rounded="3xl">
              <CardHeader
                title="Recent Activity"
                subtitle="Latest actions across your organization"
                action={
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                }
              />
              <CardBody>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={activity.id} className="flex items-start space-x-3 relative">
                      <div
                        className={`w-10 h-10 rounded-xl ${activity.iconBg} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className={activity.iconColor}>{activity.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{activity.user}</span>{' '}
                          <span className="text-gray-700">{activity.message}</span>
                        </p>
                        <div className="flex items-center mt-1">
                          <Clock className="w-3 h-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>

                      {index < recentActivities.length - 1 && (
                        <div className="absolute left-5 top-12 w-px h-8 bg-gray-200"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* System Status */}
          <div>
            <Card variant="elevated" rounded="3xl">
              <CardHeader title="System Status" subtitle="Real-time health monitoring" />
              <CardBody>
                <div className="space-y-4">
                  {systemStatus.map((system) => (
                    <div key={system.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-600">{system.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{system.name}</p>
                          <p className="text-xs text-gray-500">Uptime: {system.uptime}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusDot(system.status)} animate-pulse`}></span>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                            system.status
                          )}`}
                        >
                          {system.status === 'operational' ? 'Operational' : system.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-success-50 to-brand-cyan/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-success-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">All Systems Operational</p>
                        <p className="text-xs text-gray-600">Last checked: 2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Management Insights */}
        <Card variant="elevated" rounded="3xl">
          <CardHeader
            title="Management Insights"
            subtitle="AI-powered recommendations for your business"
          />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-cyan/5 to-brand-blue/5 border border-brand-cyan/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <h4 className="font-bold text-gray-900">Performance Up</h4>
                </div>
                <p className="text-sm text-gray-700">
                  Team performance increased by 23% this month. Consider rewarding top performers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-purple/5 to-brand-pink/5 border border-brand-purple/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-brand-purple" />
                  </div>
                  <h4 className="font-bold text-gray-900">Process Update Needed</h4>
                </div>
                <p className="text-sm text-gray-700">
                  3 process templates haven't been reviewed in 90+ days. Update recommended.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-orange/5 to-brand-yellow/5 border border-brand-orange/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-brand-orange" />
                  </div>
                  <h4 className="font-bold text-gray-900">Expansion Ready</h4>
                </div>
                <p className="text-sm text-gray-700">
                  Your team is growing! Consider upgrading to Enterprise plan for more features.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageLayout>
  )
}

import { Mic, BarChart3, Users, FileText, Settings, Calendar } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  action: () => void
}

const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Start Recording',
    description: 'Begin a new customer conversation',
    icon: <Mic className="w-6 h-6" />,
    color: 'text-brand-cyan',
    bgColor: 'bg-brand-cyan/10 group-hover:bg-brand-cyan/20',
    action: () => console.log('Start recording'),
  },
  {
    id: '2',
    title: 'View Analytics',
    description: 'Detailed performance insights',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'text-brand-blue',
    bgColor: 'bg-brand-blue/10 group-hover:bg-brand-blue/20',
    action: () => console.log('View analytics'),
  },
  {
    id: '3',
    title: 'Manage Team',
    description: 'Add or update team members',
    icon: <Users className="w-6 h-6" />,
    color: 'text-brand-purple',
    bgColor: 'bg-brand-purple/10 group-hover:bg-brand-purple/20',
    action: () => console.log('Manage team'),
  },
  {
    id: '4',
    title: 'Generate Report',
    description: 'Create performance summary',
    icon: <FileText className="w-6 h-6" />,
    color: 'text-brand-orange',
    bgColor: 'bg-brand-orange/10 group-hover:bg-brand-orange/20',
    action: () => console.log('Generate report'),
  },
  {
    id: '5',
    title: 'Schedule Training',
    description: 'Book team coaching session',
    icon: <Calendar className="w-6 h-6" />,
    color: 'text-brand-pink',
    bgColor: 'bg-brand-pink/10 group-hover:bg-brand-pink/20',
    action: () => console.log('Schedule training'),
  },
  {
    id: '6',
    title: 'Settings',
    description: 'Configure your preferences',
    icon: <Settings className="w-6 h-6" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 group-hover:bg-gray-200',
    action: () => console.log('Settings'),
  },
]

export default function QuickActions() {
  return (
    <Card variant="elevated" rounded="3xl">
      <CardHeader title="Quick Actions" subtitle="Frequently used features" />
      <CardBody>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="group flex flex-col items-center text-center p-4 rounded-2xl hover:shadow-md transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl ${action.bgColor} flex items-center justify-center mb-3 transition-colors`}>
                <span className={action.color}>{action.icon}</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{action.title}</h4>
              <p className="text-xs text-gray-500">{action.description}</p>
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

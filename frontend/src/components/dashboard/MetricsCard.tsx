import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  color?: 'cyan' | 'blue' | 'purple' | 'yellow' | 'orange' | 'pink' | 'green'
}

export default function MetricsCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'cyan'
}: MetricsCardProps) {
  const colorVariants = {
    cyan: 'from-brand-cyan to-brand-blue',
    blue: 'from-brand-blue to-brand-cyan',
    purple: 'from-brand-purple to-brand-pink',
    yellow: 'from-brand-yellow to-brand-orange',
    orange: 'from-brand-orange to-brand-pink',
    pink: 'from-brand-pink to-brand-purple',
    green: 'from-success-500 to-success-600',
  }

  const iconBgVariants = {
    cyan: 'bg-brand-cyan/10',
    blue: 'bg-brand-blue/10',
    purple: 'bg-brand-purple/10',
    yellow: 'bg-brand-yellow/10',
    orange: 'bg-brand-orange/10',
    pink: 'bg-brand-pink/10',
    green: 'bg-success-100',
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${iconBgVariants[color]} flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend.isPositive
                ? 'bg-success-100 text-success-700'
                : 'bg-error-100 text-error-700'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className={`text-3xl font-bold bg-gradient-to-r ${colorVariants[color]} bg-clip-text text-transparent mb-1`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  )
}

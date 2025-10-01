import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Mic,
  BarChart3,
  Users,
  Settings,
  Calendar,
  FileText,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Plus,
  History,
  Upload,
  LayoutGrid,
  MessageSquare,
  Smile,
  Target,
  DollarSign,
  Briefcase,
  GitBranch,
  UserCog
} from 'lucide-react'

interface SubNavItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavItem {
  name: string
  path?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  subItems?: SubNavItem[]
}

const mainNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Recordings',
    icon: Mic,
    badge: 12,
    subItems: [
      { name: 'Overview', path: '/recordings', icon: LayoutGrid },
      { name: 'New Recording', path: '/recording/new', icon: Plus },
      { name: 'History', path: '/recording/history', icon: History },
      { name: 'Upload', path: '/recording/upload', icon: Upload },
    ]
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    subItems: [
      { name: 'Overview', path: '/analytics', icon: LayoutGrid },
      { name: 'Conversation Analysis', path: '/analytics/conversations', icon: MessageSquare },
      { name: 'Sentiment Analysis', path: '/analytics/sentiment', icon: Smile },
      { name: 'Process Adherence', path: '/analytics/process', icon: Target },
      { name: 'Sales Opportunities', path: '/analytics/opportunities', icon: DollarSign },
    ]
  },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
]

const managementNavItems: NavItem[] = [
  {
    name: 'Management',
    icon: Briefcase,
    subItems: [
      { name: 'Overview', path: '/management', icon: LayoutGrid },
      { name: 'Process Templates', path: '/management/processes', icon: GitBranch },
      { name: 'User Management', path: '/management/users', icon: UserCog },
      { name: 'Reports', path: '/management/reports', icon: FileText },
      { name: 'Settings', path: '/management/settings', icon: Settings },
    ]
  },
  { name: 'Performance', path: '/performance', icon: TrendingUp },
]

export default function Sidebar() {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Recordings', 'Analytics', 'Management'])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isPathActive = (path: string) => location.pathname === path
  const isItemActive = (item: NavItem) => {
    if (item.path) {
      return isPathActive(item.path)
    }
    if (item.subItems) {
      return item.subItems.some(subItem => isPathActive(subItem.path))
    }
    return false
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <div className="mb-6">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main
          </h3>
          {mainNavItems.map((item) => (
            <div key={item.name}>
              {item.subItems ? (
                // Expandable item with sub-navigation
                <>
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isItemActive(item)
                        ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isItemActive(item)
                              ? 'bg-white/20 text-white'
                              : 'bg-primary-100 text-primary-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {expandedItems.includes(item.name) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                  {expandedItems.includes(item.name) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? 'bg-brand-cyan/10 text-brand-cyan'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                          }
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Regular nav item
                <NavLink
                  to={item.path!}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-primary-100 text-primary-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Management
          </h3>
          {managementNavItems.map((item) => (
            <div key={item.name}>
              {item.subItems ? (
                // Expandable item with sub-navigation
                <>
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isItemActive(item)
                        ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isItemActive(item)
                              ? 'bg-white/20 text-white'
                              : 'bg-primary-100 text-primary-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {expandedItems.includes(item.name) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                  {expandedItems.includes(item.name) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? 'bg-brand-cyan/10 text-brand-cyan'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                          }
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Regular nav item
                <NavLink
                  to={item.path!}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-primary-100 text-primary-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom: Quick Stats */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-brand-cyan/10 to-brand-blue/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">This Week</span>
            <TrendingUp className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Recordings</span>
              <span className="text-sm font-bold text-gray-900">47</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Avg Score</span>
              <span className="text-sm font-bold text-success-600">92%</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

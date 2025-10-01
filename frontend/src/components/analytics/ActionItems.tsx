import { useState, useMemo } from 'react'
import {
  CheckSquare,
  Clock,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Filter,
  CheckCircle2,
  Circle,
  Send,
  FileText,
  Bell,
  BellOff
} from 'lucide-react'
import { Card } from '../ui/Card'

// TypeScript interfaces
export type ActionPriority = 'High' | 'Medium' | 'Low'
export type ActionStatus = 'Pending' | 'In Progress' | 'Completed'
export type ActionCategory =
  | 'Follow-up Call'
  | 'Send Quote'
  | 'Schedule Appointment'
  | 'Send Email'
  | 'Review Documentation'
  | 'Customer Check-in'
  | 'Service Follow-up'

export interface ActionItem {
  id: string
  description: string
  priority: ActionPriority
  dueDate: string
  customerName: string
  recordingId?: string
  category: ActionCategory
  status: ActionStatus
  detailedNotes: string
  estimatedDuration?: string
  assignedTo?: string
}

// No mock data - will fetch from API
const mockActionItems: ActionItem[] = []

export default function ActionItems() {
  const [actionItems, setActionItems] = useState<ActionItem[]>(mockActionItems)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'All'>('All')
  const [priorityFilter, setPriorityFilter] = useState<ActionPriority | 'All'>('All')
  const [categoryFilter, setCategoryFilter] = useState<ActionCategory | 'All'>('All')
  const [groupBy, setGroupBy] = useState<'priority' | 'category' | 'none'>('priority')

  // Toggle item expansion
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Toggle action item completion
  const toggleComplete = (itemId: string) => {
    setActionItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            status: item.status === 'Completed' ? 'Pending' : 'Completed'
          }
        }
        return item
      })
    )
  }

  // Filter action items
  const filteredItems = useMemo(() => {
    let filtered = actionItems

    if (statusFilter !== 'All') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    if (priorityFilter !== 'All') {
      filtered = filtered.filter(item => item.priority === priorityFilter)
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    // Sort by priority (High > Medium > Low) then by due date
    return filtered.sort((a, b) => {
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]

      if (priorityDiff !== 0) return priorityDiff

      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  }, [actionItems, statusFilter, priorityFilter, categoryFilter])

  // Group items if needed
  const groupedItems = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Items': filteredItems }
    }

    const groups: Record<string, ActionItem[]> = {}

    filteredItems.forEach(item => {
      const key = groupBy === 'priority' ? item.priority : item.category
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
    })

    // Sort groups
    if (groupBy === 'priority') {
      const sortedGroups: Record<string, ActionItem[]> = {}
      const order: ActionPriority[] = ['High', 'Medium', 'Low']
      order.forEach(priority => {
        if (groups[priority]) {
          sortedGroups[priority] = groups[priority]
        }
      })
      return sortedGroups
    }

    return groups
  }, [filteredItems, groupBy])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = actionItems.length
    const completed = actionItems.filter(item => item.status === 'Completed').length
    const pending = actionItems.filter(item => item.status === 'Pending').length
    const inProgress = actionItems.filter(item => item.status === 'In Progress').length
    const highPriority = actionItems.filter(item => item.priority === 'High' && item.status !== 'Completed').length

    return { total, completed, pending, inProgress, highPriority }
  }, [actionItems])

  // Helper functions
  const getPriorityStyles = (priority: ActionPriority) => {
    switch (priority) {
      case 'High':
        return {
          bg: 'bg-error-100',
          text: 'text-error-700',
          border: 'border-error-200',
          dot: 'bg-error-500'
        }
      case 'Medium':
        return {
          bg: 'bg-warning-100',
          text: 'text-warning-700',
          border: 'border-warning-200',
          dot: 'bg-warning-500'
        }
      case 'Low':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          dot: 'bg-gray-500'
        }
    }
  }

  const getCategoryIcon = (category: ActionCategory) => {
    switch (category) {
      case 'Follow-up Call':
        return <Phone className="w-4 h-4" />
      case 'Send Quote':
        return <FileText className="w-4 h-4" />
      case 'Schedule Appointment':
        return <Calendar className="w-4 h-4" />
      case 'Send Email':
        return <Mail className="w-4 h-4" />
      case 'Review Documentation':
        return <FileText className="w-4 h-4" />
      case 'Customer Check-in':
        return <User className="w-4 h-4" />
      case 'Service Follow-up':
        return <CheckCircle2 className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: ActionCategory) => {
    switch (category) {
      case 'Follow-up Call':
        return 'text-brand-blue'
      case 'Send Quote':
        return 'text-brand-purple'
      case 'Schedule Appointment':
        return 'text-brand-cyan'
      case 'Send Email':
        return 'text-brand-orange'
      case 'Review Documentation':
        return 'text-brand-pink'
      case 'Customer Check-in':
        return 'text-brand-yellow'
      case 'Service Follow-up':
        return 'text-success-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return { text: 'Today', isUrgent: true }
    }

    // Check if date is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return { text: 'Tomorrow', isUrgent: true }
    }

    // Check if date is in the past
    if (date < today) {
      return { text: 'Overdue', isUrgent: true }
    }

    // Otherwise format normally
    const formatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date)

    return { text: formatted, isUrgent: false }
  }

  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-5 h-5 text-success-600" />
      case 'In Progress':
        return <Circle className="w-5 h-5 text-brand-purple" />
      case 'Pending':
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Statistics */}
      <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-brand-purple via-brand-pink to-brand-orange">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">Action Items</h2>
            <p className="text-white/90 text-sm">AI-generated follow-ups and recommendations</p>
          </div>
          <div className="flex gap-6 text-white">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.completed}</p>
              <p className="text-xs text-white/80">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.inProgress}</p>
              <p className="text-xs text-white/80">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.pending}</p>
              <p className="text-xs text-white/80">Pending</p>
            </div>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-white text-sm mb-2">
            <span>Overall Progress</span>
            <span className="font-bold">
              {stats.completed} of {stats.total} completed ({Math.round((stats.completed / stats.total) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
        </div>

        {/* High Priority Alert */}
        {stats.highPriority > 0 && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-white" />
            <span className="text-white font-medium">
              {stats.highPriority} high-priority {stats.highPriority === 1 ? 'item' : 'items'} {stats.highPriority === 1 ? 'requires' : 'require'} immediate attention
            </span>
          </div>
        )}
      </Card>

      {/* Filters and Controls */}
      <Card variant="bordered" padding="md">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ActionStatus | 'All')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as ActionPriority | 'All')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="All">All Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ActionCategory | 'All')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="All">All Categories</option>
                <option value="Follow-up Call">Follow-up Call</option>
                <option value="Send Quote">Send Quote</option>
                <option value="Schedule Appointment">Schedule Appointment</option>
                <option value="Send Email">Send Email</option>
                <option value="Review Documentation">Review Documentation</option>
                <option value="Customer Check-in">Customer Check-in</option>
                <option value="Service Follow-up">Service Follow-up</option>
              </select>
            </div>

            {/* Group By */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Group by:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'priority' | 'category' | 'none')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="none">None</option>
                <option value="priority">Priority</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Items List */}
      {filteredItems.length === 0 ? (
        // Empty State
        <Card variant="bordered" padding="lg" className="text-center">
          <div className="py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-brand-pink rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {stats.completed === stats.total ? 'All Actions Completed!' : 'No Action Items Found'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {stats.completed === stats.total
                ? 'Excellent work! All action items have been completed. New AI-generated recommendations will appear here as they are detected.'
                : 'No action items match your current filters. Try adjusting your filter criteria or check back later for new AI-generated action items.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName} className="space-y-3">
              {/* Group Header (only show if grouped) */}
              {groupBy !== 'none' && (
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900">{groupName}</h3>
                  <span className="text-sm text-gray-500">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                </div>
              )}

              {/* Action Items in Group */}
              <div className="space-y-3">
                {items.map((item) => {
                  const isExpanded = expandedItems.has(item.id)
                  const priorityStyles = getPriorityStyles(item.priority)
                  const dueDate = formatDate(item.dueDate)
                  const isCompleted = item.status === 'Completed'

                  return (
                    <Card
                      key={item.id}
                      variant="bordered"
                      padding="none"
                      className={`overflow-hidden hover:shadow-lg transition-all ${
                        isCompleted ? 'bg-gray-50 opacity-75' : 'bg-white'
                      }`}
                    >
                      <div className="p-5">
                        {/* Main Content Row */}
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleComplete(item.id)}
                            className={`mt-1 flex-shrink-0 ${
                              isCompleted ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
                            }`}
                          >
                            {getStatusIcon(item.status)}
                          </button>

                          {/* Main Content */}
                          <div className="flex-1 min-w-0">
                            {/* Priority Badge and Category */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${priorityStyles.bg} ${priorityStyles.text} ${priorityStyles.border}`}>
                                <span className={`w-2 h-2 rounded-full ${priorityStyles.dot}`} />
                                {item.priority}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200`}>
                                <span className={getCategoryColor(item.category)}>
                                  {getCategoryIcon(item.category)}
                                </span>
                                {item.category}
                              </span>
                              {dueDate.isUrgent && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-error-50 text-error-700 border border-error-200">
                                  <Clock className="w-3 h-3" />
                                  {dueDate.text}
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            <h4 className={`text-base font-semibold mb-2 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.description}
                            </h4>

                            {/* Customer and Details */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                <span className="font-medium">{item.customerName}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>Due: {dueDate.text}</span>
                              </div>
                              {item.estimatedDuration && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-gray-400">~{item.estimatedDuration}</span>
                                </div>
                              )}
                              {item.assignedTo && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-gray-400">Assigned to {item.assignedTo}</span>
                                </div>
                              )}
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h5 className="text-sm font-semibold text-gray-900 mb-2">Detailed Notes:</h5>
                                <p className="text-sm text-gray-600 leading-relaxed">{item.detailedNotes}</p>
                                {item.recordingId && (
                                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/5 border border-brand-blue/20 rounded-lg text-xs text-brand-blue">
                                    <FileText className="w-3 h-3" />
                                    <span>From recording: {item.recordingId}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Quick Actions */}
                            {!isCompleted && (
                              <div className="flex flex-wrap gap-2 mt-4">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg text-xs font-medium hover:shadow-md transition-shadow">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Schedule
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                                  <User className="w-3.5 h-3.5" />
                                  Assign
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                                  <BellOff className="w-3.5 h-3.5" />
                                  Snooze
                                </button>
                                {item.category === 'Send Email' && (
                                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-purple text-white rounded-lg text-xs font-medium hover:bg-brand-purple/90 transition-colors">
                                    <Send className="w-3.5 h-3.5" />
                                    Send Now
                                  </button>
                                )}
                                {item.category === 'Follow-up Call' && (
                                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange text-white rounded-lg text-xs font-medium hover:bg-brand-orange/90 transition-colors">
                                    <Phone className="w-3.5 h-3.5" />
                                    Call Now
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Expand/Collapse Button */}
                          <button
                            onClick={() => toggleExpanded(item.id)}
                            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {filteredItems.length > 0 && (
        <Card variant="bordered" padding="md" className="bg-gradient-to-r from-brand-purple/5 to-brand-pink/5">
          <div className="flex flex-wrap gap-6 items-center justify-between text-sm">
            <div className="flex gap-6">
              <div>
                <span className="text-gray-600">Showing: </span>
                <span className="font-bold text-gray-900">{filteredItems.length} of {stats.total}</span>
              </div>
              <div>
                <span className="text-gray-600">Pending: </span>
                <span className="font-bold text-brand-blue">{filteredItems.filter(i => i.status === 'Pending').length}</span>
              </div>
              <div>
                <span className="text-gray-600">In Progress: </span>
                <span className="font-bold text-brand-purple">{filteredItems.filter(i => i.status === 'In Progress').length}</span>
              </div>
              <div>
                <span className="text-gray-600">Completed: </span>
                <span className="font-bold text-success-600">{filteredItems.filter(i => i.status === 'Completed').length}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-600">High Priority: </span>
              <span className="font-bold text-error-600">
                {filteredItems.filter(i => i.priority === 'High' && i.status !== 'Completed').length}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

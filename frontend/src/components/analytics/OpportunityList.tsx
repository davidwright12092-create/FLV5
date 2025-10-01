import { useState, useMemo } from 'react'
import { DollarSign, TrendingUp, Target, Star, Phone, Eye, Filter, ArrowUpDown } from 'lucide-react'
import { Card } from '../ui/Card'

// TypeScript interfaces
export type OpportunityType = 'Upsell' | 'Cross-sell' | 'Service Upgrade' | 'Maintenance Plan'
export type OpportunityStatus = 'New' | 'In Progress' | 'Won' | 'Lost'
export type OpportunityPriority = 'High' | 'Medium' | 'Low'

export interface Opportunity {
  id: string
  type: OpportunityType
  customerName: string
  estimatedValue: number
  confidenceScore: number
  status: OpportunityStatus
  priority: OpportunityPriority
  dateDetected: string
  description: string
}

// No mock data - will fetch from API
const mockOpportunities: Opportunity[] = []

export default function OpportunityList() {
  const [opportunities] = useState<Opportunity[]>(mockOpportunities)
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | 'All'>('All')
  const [priorityFilter, setPriorityFilter] = useState<OpportunityPriority | 'All'>('All')
  const [sortBy, setSortBy] = useState<'value' | 'confidence' | 'date'>('value')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and sort opportunities
  const filteredAndSortedOpportunities = useMemo(() => {
    let filtered = opportunities

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(opp => opp.status === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(opp => opp.priority === priorityFilter)
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'value':
          comparison = a.estimatedValue - b.estimatedValue
          break
        case 'confidence':
          comparison = a.confidenceScore - b.confidenceScore
          break
        case 'date':
          comparison = new Date(a.dateDetected).getTime() - new Date(b.dateDetected).getTime()
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [opportunities, statusFilter, priorityFilter, sortBy, sortOrder])

  // Calculate total opportunity value
  const totalValue = useMemo(() => {
    return filteredAndSortedOpportunities
      .filter(opp => opp.status !== 'Lost')
      .reduce((sum, opp) => sum + opp.estimatedValue, 0)
  }, [filteredAndSortedOpportunities])

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  // Color and styling helpers
  const getPriorityStyles = (priority: OpportunityPriority) => {
    switch (priority) {
      case 'High':
        return {
          bg: 'bg-error-100',
          text: 'text-error-700',
          border: 'border-error-200',
          gradient: 'from-error-500/10 to-error-600/10'
        }
      case 'Medium':
        return {
          bg: 'bg-warning-100',
          text: 'text-warning-700',
          border: 'border-warning-200',
          gradient: 'from-warning-500/10 to-warning-600/10'
        }
      case 'Low':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          gradient: 'from-gray-500/10 to-gray-600/10'
        }
    }
  }

  const getStatusStyles = (status: OpportunityStatus) => {
    switch (status) {
      case 'New':
        return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'
      case 'In Progress':
        return 'bg-brand-purple/10 text-brand-purple border-brand-purple/20'
      case 'Won':
        return 'bg-success-100 text-success-700 border-success-200'
      case 'Lost':
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getTypeIcon = (type: OpportunityType) => {
    switch (type) {
      case 'Upsell':
        return <TrendingUp className="w-5 h-5 text-brand-cyan" />
      case 'Cross-sell':
        return <Target className="w-5 h-5 text-brand-purple" />
      case 'Service Upgrade':
        return <Star className="w-5 h-5 text-brand-yellow" />
      case 'Maintenance Plan':
        return <DollarSign className="w-5 h-5 text-brand-orange" />
    }
  }

  const getTypeGradient = (type: OpportunityType) => {
    switch (type) {
      case 'Upsell':
        return 'from-brand-cyan/5 to-brand-blue/5'
      case 'Cross-sell':
        return 'from-brand-purple/5 to-brand-pink/5'
      case 'Service Upgrade':
        return 'from-brand-yellow/5 to-brand-orange/5'
      case 'Maintenance Plan':
        return 'from-brand-orange/5 to-brand-pink/5'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Total Value */}
      <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-brand-cyan to-brand-blue">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">Sales Opportunities</h2>
            <p className="text-white/80 text-sm">AI-detected opportunities from customer conversations</p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm mb-1">Total Pipeline Value</p>
            <p className="text-white text-4xl font-bold">{formatCurrency(totalValue)}</p>
            <p className="text-white/80 text-xs mt-1">{filteredAndSortedOpportunities.filter(o => o.status !== 'Lost').length} active opportunities</p>
          </div>
        </div>
      </Card>

      {/* Filters and Sorting */}
      <Card variant="bordered" padding="md">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OpportunityStatus | 'All')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as OpportunityPriority | 'All')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
            >
              <option value="All">All Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'value' | 'confidence' | 'date')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent"
            >
              <option value="value">Value</option>
              <option value="confidence">Confidence</option>
              <option value="date">Date</option>
            </select>

            {/* Sort Order Toggle */}
            <button
              onClick={toggleSortOrder}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'desc' ? '↓ High to Low' : '↑ Low to High'}
            </button>
          </div>
        </div>
      </Card>

      {/* Opportunities Grid */}
      {filteredAndSortedOpportunities.length === 0 ? (
        // Empty State
        <Card variant="bordered" padding="lg" className="text-center">
          <div className="py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Opportunities Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No sales opportunities match your current filters. Try adjusting your filter criteria or check back later for new AI-detected opportunities.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAndSortedOpportunities.map((opportunity) => {
            const priorityStyles = getPriorityStyles(opportunity.priority)

            return (
              <Card
                key={opportunity.id}
                variant="bordered"
                padding="none"
                className={`overflow-hidden hover:shadow-xl transition-shadow bg-gradient-to-br ${getTypeGradient(opportunity.type)}`}
              >
                <div className="p-6">
                  {/* Header with Type and Priority */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        {getTypeIcon(opportunity.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{opportunity.type}</h3>
                        <p className="text-xs text-gray-500">{opportunity.id}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${priorityStyles.bg} ${priorityStyles.text} ${priorityStyles.border}`}>
                      {opportunity.priority} Priority
                    </div>
                  </div>

                  {/* Customer Name */}
                  <h4 className="text-lg font-bold text-gray-900 mb-3">{opportunity.customerName}</h4>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{opportunity.description}</p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {/* Estimated Value */}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">Est. Value</p>
                      <p className="text-lg font-bold text-brand-cyan">{formatCurrency(opportunity.estimatedValue)}</p>
                    </div>

                    {/* Confidence Score */}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">Confidence</p>
                      <p className="text-lg font-bold text-brand-purple">{opportunity.confidenceScore}%</p>
                    </div>

                    {/* Date Detected */}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">Detected</p>
                      <p className="text-xs font-semibold text-gray-700">{formatDate(opportunity.dateDetected)}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(opportunity.status)}`}>
                      {opportunity.status}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg text-sm font-medium hover:shadow-lg transition-shadow">
                      <Phone className="w-4 h-4" />
                      <span>Contact</span>
                    </button>
                  </div>

                  {/* Quick Actions for Won/Lost */}
                  {opportunity.status !== 'Won' && opportunity.status !== 'Lost' && (
                    <div className="flex gap-2 mt-2">
                      <button className="flex-1 px-3 py-1.5 bg-success-50 border border-success-200 rounded-lg text-xs font-medium text-success-700 hover:bg-success-100 transition-colors">
                        Mark as Won
                      </button>
                      <button className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                        Mark as Lost
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary Footer */}
      {filteredAndSortedOpportunities.length > 0 && (
        <Card variant="bordered" padding="md" className="bg-gray-50">
          <div className="flex flex-wrap gap-6 items-center justify-between text-sm">
            <div className="flex gap-6">
              <div>
                <span className="text-gray-600">Total Opportunities: </span>
                <span className="font-bold text-gray-900">{filteredAndSortedOpportunities.length}</span>
              </div>
              <div>
                <span className="text-gray-600">New: </span>
                <span className="font-bold text-brand-blue">{filteredAndSortedOpportunities.filter(o => o.status === 'New').length}</span>
              </div>
              <div>
                <span className="text-gray-600">In Progress: </span>
                <span className="font-bold text-brand-purple">{filteredAndSortedOpportunities.filter(o => o.status === 'In Progress').length}</span>
              </div>
              <div>
                <span className="text-gray-600">Won: </span>
                <span className="font-bold text-success-600">{filteredAndSortedOpportunities.filter(o => o.status === 'Won').length}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-600">Avg. Confidence: </span>
              <span className="font-bold text-gray-900">
                {Math.round(filteredAndSortedOpportunities.reduce((sum, o) => sum + o.confidenceScore, 0) / filteredAndSortedOpportunities.length)}%
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

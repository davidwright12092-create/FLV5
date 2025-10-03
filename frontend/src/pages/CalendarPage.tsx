import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Mic,
  Play,
} from 'lucide-react'
import PageLayout from '../components/layout/PageLayout'
import { Card, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useRecordings } from '../hooks/useRecordings'

// Helper to get start of week (Sunday)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

// Helper to format date
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Helper to format time
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

// Helper to check if dates are same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()))

  // Fetch recordings
  const { data: recordingsResponse } = useRecordings()
  const recordings = recordingsResponse?.data || []

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart)
    date.setDate(currentWeekStart.getDate() + i)
    return date
  })

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  // Navigate to next week
  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  // Go to today
  const goToToday = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()))
  }

  // Get recordings for a specific day
  const getRecordingsForDay = (date: Date) => {
    return recordings.filter((recording: any) => {
      const recordingDate = new Date(recording.createdAt)
      return isSameDay(recordingDate, date)
    })
  }

  const today = new Date()

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent mb-2">
              Recording Calendar
            </h1>
            <p className="text-gray-600 text-lg">
              View and access your recordings by date
            </p>
          </div>
          <Button variant="primary" size="md" onClick={goToToday}>
            <CalendarIcon className="w-5 h-5" />
            Today
          </Button>
        </div>

        {/* Week Navigation */}
        <Card variant="elevated" rounded="3xl" padding="lg">
          <CardBody>
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" size="md" onClick={goToPreviousWeek}>
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Week of {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
              </div>

              <Button variant="outline" size="md" onClick={goToNextWeek}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((date, index) => {
                const dayRecordings = getRecordingsForDay(date)
                const isToday = isSameDay(date, today)
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isToday
                        ? 'bg-gradient-to-br from-brand-cyan/10 to-brand-blue/10 border-brand-cyan'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {/* Day Header */}
                    <div className="text-center mb-3 pb-3 border-b border-gray-200">
                      <div className="text-xs font-semibold text-gray-600 uppercase">
                        {dayName}
                      </div>
                      <div
                        className={`text-2xl font-bold mt-1 ${
                          isToday ? 'text-brand-cyan' : 'text-gray-900'
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    </div>

                    {/* Recordings for this day */}
                    <div className="space-y-2">
                      {dayRecordings.length > 0 ? (
                        dayRecordings.map((recording: any) => (
                          <button
                            key={recording.id}
                            onClick={() => navigate(`/recording/${recording.id}`)}
                            className="w-full p-3 rounded-xl bg-white border border-gray-200 hover:border-brand-cyan hover:shadow-md transition-all text-left group"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <Mic className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-cyan transition-colors">
                                  {recording.title}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(new Date(recording.createdAt))}
                                </div>
                              </div>
                            </div>
                            {recording.status === 'completed' && (
                              <div className="flex items-center justify-center mt-2 pt-2 border-t border-gray-100">
                                <Play className="w-3 h-3 text-brand-blue" />
                                <span className="text-xs text-brand-blue ml-1">Play</span>
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-xs text-gray-400">No recordings</div>
                        </div>
                      )}
                    </div>

                    {/* Recording count badge */}
                    {dayRecordings.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-cyan/10 text-brand-cyan">
                          {dayRecordings.length} recording{dayRecordings.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="elevated" rounded="2xl" padding="md">
            <CardBody>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {weekDays.reduce((sum, day) => sum + getRecordingsForDay(day).length, 0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Recordings This Week</div>
              </div>
            </CardBody>
          </Card>

          <Card variant="elevated" rounded="2xl" padding="md">
            <CardBody>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {getRecordingsForDay(today).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Recordings Today</div>
              </div>
            </CardBody>
          </Card>

          <Card variant="elevated" rounded="2xl" padding="md">
            <CardBody>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {recordings.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Recordings</div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}

import { useState } from 'react'
import { Search, Download, Clock } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

export interface ConversationSegment {
  id: string
  startTime: number
  endTime: number
  text: string
  speaker?: string
  speakerRole?: 'technician' | 'customer' | 'other'
  confidence?: number
}

interface ConversationViewProps {
  segments: ConversationSegment[]
  currentTime?: number
  onSegmentClick?: (startTime: number) => void
  onExport?: () => void
}

const ConversationView = ({
  segments,
  currentTime = 0,
  onSegmentClick,
  onExport,
}: ConversationViewProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter segments based on search query
  const filteredSegments = segments.filter(
    (segment) =>
      segment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      segment.speaker?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Determine if a segment is currently active
  const isSegmentActive = (segment: ConversationSegment) => {
    return currentTime >= segment.startTime && currentTime <= segment.endTime
  }

  // Format time display
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get speaker styling based on role
  const getSpeakerStyle = (role?: 'technician' | 'customer' | 'other') => {
    switch (role) {
      case 'technician':
        return {
          avatar: 'bg-brand-blue',
          name: 'text-brand-blue',
          border: 'border-brand-blue/20',
          bg: 'bg-brand-blue/5',
        }
      case 'customer':
        return {
          avatar: 'bg-brand-cyan',
          name: 'text-brand-cyan',
          border: 'border-brand-cyan/20',
          bg: 'bg-brand-cyan/5',
        }
      default:
        return {
          avatar: 'bg-gray-500',
          name: 'text-gray-700',
          border: 'border-gray-200',
          bg: 'bg-gray-50',
        }
    }
  }

  // Get speaker initials
  const getSpeakerInitials = (speaker?: string): string => {
    if (!speaker) return '?'
    return speaker
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Auto-detect speaker role from name if not provided
  const detectSpeakerRole = (
    speaker?: string,
    role?: 'technician' | 'customer' | 'other'
  ): 'technician' | 'customer' | 'other' => {
    if (role) return role
    if (!speaker) return 'other'

    const lowerSpeaker = speaker.toLowerCase()
    if (
      lowerSpeaker.includes('inspector') ||
      lowerSpeaker.includes('technician') ||
      lowerSpeaker.includes('foreman')
    ) {
      return 'technician'
    }
    if (lowerSpeaker.includes('customer') || lowerSpeaker.includes('client')) {
      return 'customer'
    }
    return 'other'
  }

  if (segments.length === 0) {
    return (
      <Card variant="bordered">
        <div className="text-center py-12">
          <p className="text-gray-500">No conversation data available</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Export Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download size={16} />
            Export
          </Button>
        )}
      </div>

      {/* Conversation Segments */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {filteredSegments.map((segment) => {
          const isActive = isSegmentActive(segment)
          const speakerRole = detectSpeakerRole(segment.speaker, segment.speakerRole)
          const style = getSpeakerStyle(speakerRole)

          return (
            <div
              key={segment.id}
              onClick={() => onSegmentClick?.(segment.startTime)}
              className={`p-4 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-br from-primary-50 to-brand-cyan/10 border-2 border-brand-cyan shadow-md scale-[1.01]'
                  : `bg-white border ${style.border} hover:border-brand-cyan hover:shadow-sm`
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Speaker Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 ${style.avatar} rounded-full flex items-center justify-center text-white font-semibold text-sm`}
                >
                  {getSpeakerInitials(segment.speaker)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Speaker name and timestamp */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {segment.speaker && (
                        <span className={`font-semibold text-sm ${style.name}`}>
                          {segment.speaker}
                        </span>
                      )}
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Clock size={12} />
                        <span>{formatTime(segment.startTime)}</span>
                      </div>
                    </div>
                    {segment.confidence && (
                      <span className="text-xs text-gray-400">
                        {Math.round(segment.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Conversation text */}
                  <p
                    className={`text-gray-700 leading-relaxed ${
                      isActive ? 'font-medium text-gray-900' : ''
                    }`}
                  >
                    {segment.text}
                  </p>
                </div>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse" />
                  <span className="text-brand-blue font-medium">Currently playing</span>
                </div>
              )}
            </div>
          )
        })}

        {filteredSegments.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <p className="text-gray-500">No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationView

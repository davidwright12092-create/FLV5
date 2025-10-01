import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Share2,
  SkipBack,
  SkipForward,
  Loader2,
} from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

// TypeScript Interfaces
export interface TranscriptSegment {
  id: string
  startTime: number
  endTime: number
  text: string
  speaker?: string
  confidence?: number
}

export interface Recording {
  id: string
  title: string
  audioUrl: string
  duration: number
  createdAt: string
  transcript?: TranscriptSegment[]
  metadata?: {
    recordingType?: string
    location?: string
    participants?: string[]
  }
}

interface RecordingPlayerProps {
  recording: Recording
  onShare?: () => void
  onDownload?: () => void
}

// Mock transcript data for demonstration
const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  {
    id: '1',
    startTime: 0,
    endTime: 4.5,
    text: 'Welcome to today\'s field inspection. We\'re here at the construction site to review progress on the foundation work.',
    speaker: 'Inspector Sarah Chen',
    confidence: 0.95,
  },
  {
    id: '2',
    startTime: 4.5,
    endTime: 9.2,
    text: 'Thank you for meeting with us. As you can see, we\'ve completed the excavation and are ready to begin pouring concrete.',
    speaker: 'Foreman Mike Torres',
    confidence: 0.92,
  },
  {
    id: '3',
    startTime: 9.2,
    endTime: 14.8,
    text: 'Excellent. I need to verify the rebar placement meets specifications. Can you walk me through the grid layout?',
    speaker: 'Inspector Sarah Chen',
    confidence: 0.94,
  },
  {
    id: '4',
    startTime: 14.8,
    endTime: 22.1,
    text: 'Absolutely. We\'re using number five rebar with twelve-inch spacing in both directions. The vertical bars are tied at all intersections per the engineering drawings.',
    speaker: 'Foreman Mike Torres',
    confidence: 0.91,
  },
  {
    id: '5',
    startTime: 22.1,
    endTime: 27.3,
    text: 'Good. I\'ll need to take measurements and photos for documentation. Have you completed the pre-pour checklist?',
    speaker: 'Inspector Sarah Chen',
    confidence: 0.96,
  },
  {
    id: '6',
    startTime: 27.3,
    endTime: 33.5,
    text: 'Yes, all items are checked off. The forms are secure, rebar is properly positioned, and we have the concrete delivery scheduled for tomorrow morning.',
    speaker: 'Foreman Mike Torres',
    confidence: 0.93,
  },
  {
    id: '7',
    startTime: 33.5,
    endTime: 38.9,
    text: 'Perfect. I\'m approving this phase. Make sure to notify me before the concrete pour begins so I can be present for the inspection.',
    speaker: 'Inspector Sarah Chen',
    confidence: 0.97,
  },
  {
    id: '8',
    startTime: 38.9,
    endTime: 42.0,
    text: 'Will do. We\'ll give you at least two hours notice. Thanks for your time today.',
    speaker: 'Foreman Mike Torres',
    confidence: 0.94,
  },
]

const RecordingPlayer = ({ recording, onShare, onDownload }: RecordingPlayerProps) => {
  // State management
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(recording.duration || 0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Use mock transcript if not provided
  const transcript = recording.transcript || MOCK_TRANSCRIPT

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      updateActiveSegment(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    const handleLoadStart = () => {
      setIsLoading(true)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadstart', handleLoadStart)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadstart', handleLoadStart)
    }
  }, [])

  // Update active transcript segment
  const updateActiveSegment = (time: number) => {
    const segment = transcript.find(
      (seg) => time >= seg.startTime && time <= seg.endTime
    )
    setActiveSegmentId(segment?.id || null)
  }

  // Playback controls
  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressBarRef.current
    if (!audio || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    audio.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume === 0 ? 1 : volume
      setVolume(volume === 0 ? 1 : volume)
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const changePlaybackSpeed = (speed: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.playbackRate = speed
    setPlaybackSpeed(speed)
  }

  const skipTime = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const jumpToSegment = (startTime: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = startTime
    setCurrentTime(startTime)
    if (!isPlaying) {
      audio.play()
      setIsPlaying(true)
    }
  }

  // Utility functions
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSpeakerColor = (speaker?: string): string => {
    if (!speaker) return 'bg-gray-500'
    const colors = [
      'bg-brand-cyan',
      'bg-brand-blue',
      'bg-brand-purple',
      'bg-brand-orange',
      'bg-brand-pink',
    ]
    const hash = speaker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={recording.audioUrl || '/demo-audio.mp3'}
        preload="metadata"
      />

      {/* Header Section */}
      <div className="bg-gradient-to-br from-brand-cyan via-brand-blue to-brand-purple p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{recording.title}</h2>
            <p className="text-white/80 text-sm">
              {new Date(recording.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {recording.metadata?.location && (
              <p className="text-white/70 text-sm mt-1">
                Location: {recording.metadata.location}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Download size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Share2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="relative h-24 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Waveform bars */}
        <div className="absolute inset-0 flex items-center justify-around px-4">
          {Array.from({ length: 100 }).map((_, i) => {
            const height = Math.abs(Math.sin((i * Math.PI) / 20) * 60) + 20
            const isPast = (i / 100) * 100 < progressPercentage
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPast
                    ? 'bg-gradient-to-t from-brand-cyan to-brand-blue'
                    : 'bg-gray-300'
                }`}
                style={{ height: `${height}%` }}
              />
            )
          })}
        </div>

        {/* Progress overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-brand-cyan/10 to-brand-blue/10"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <div
          ref={progressBarRef}
          className="relative h-2 bg-gray-200 rounded-full cursor-pointer group"
          onClick={handleSeek}
        >
          <div
            className="absolute h-full bg-gradient-to-r from-brand-cyan to-brand-blue rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-brand-blue rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercentage}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        {/* Time Display */}
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Skip Back */}
          <button
            onClick={() => skipTime(-10)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Skip back 10 seconds"
          >
            <SkipBack size={20} className="text-gray-700" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="p-4 rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={24} fill="white" />
            ) : (
              <Play size={24} fill="white" className="ml-0.5" />
            )}
          </button>

          {/* Skip Forward */}
          <button
            onClick={() => skipTime(10)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Skip forward 10 seconds"
          >
            <SkipForward size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={20} className="text-gray-700" />
            ) : (
              <Volume2 size={20} className="text-gray-700" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-blue"
          />
        </div>

        {/* Playback Speed */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">Speed:</span>
          {[0.5, 1, 1.5, 2].map((speed) => (
            <button
              key={speed}
              onClick={() => changePlaybackSpeed(speed)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                playbackSpeed === speed
                  ? 'bg-gradient-to-br from-brand-cyan to-brand-blue text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Transcript Section */}
      <div className="border-t border-gray-200">
        <div className="px-6 py-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Transcript</h3>
          <p className="text-sm text-gray-600">
            Click on any segment to jump to that timestamp
          </p>
        </div>

        <div className="px-6 py-4 max-h-96 overflow-y-auto space-y-4">
          {transcript.map((segment) => {
            const isActive = activeSegmentId === segment.id
            const speakerColor = getSpeakerColor(segment.speaker)

            return (
              <div
                key={segment.id}
                onClick={() => jumpToSegment(segment.startTime)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-primary-50 to-brand-cyan/10 border-2 border-brand-cyan shadow-md scale-[1.02]'
                    : 'bg-white border border-gray-200 hover:border-brand-cyan hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Speaker Avatar */}
                  {segment.speaker && (
                    <div
                      className={`flex-shrink-0 w-10 h-10 ${speakerColor} rounded-full flex items-center justify-center text-white font-semibold text-sm`}
                    >
                      {segment.speaker.split(' ').map((n) => n[0]).join('')}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Speaker name and timestamp */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        {segment.speaker && (
                          <span className="font-semibold text-gray-900 text-sm">
                            {segment.speaker}
                          </span>
                        )}
                        <span className="text-gray-500 text-xs ml-2">
                          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                        </span>
                      </div>
                      {segment.confidence && (
                        <span className="text-xs text-gray-500">
                          {Math.round(segment.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>

                    {/* Transcript text */}
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
        </div>
      </div>

      {/* Footer with metadata */}
      {recording.metadata?.participants && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Participants:</span>
            <div className="flex flex-wrap gap-2">
              {recording.metadata.participants.map((participant, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-700"
                >
                  {participant}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default RecordingPlayer

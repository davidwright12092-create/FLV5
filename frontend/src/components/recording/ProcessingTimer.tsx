import React, { useState, useEffect } from 'react'
import { Loader2, Clock } from 'lucide-react'

interface ProcessingTimerProps {
  estimatedSeconds: number
  onComplete?: () => void
  status?: 'uploading' | 'transcribing' | 'analyzing' | 'completed'
}

const ProcessingTimer: React.FC<ProcessingTimerProps> = ({
  estimatedSeconds,
  onComplete,
  status = 'uploading',
}) => {
  const [timeRemaining, setTimeRemaining] = useState(estimatedSeconds)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setTimeRemaining(estimatedSeconds)
    setProgress(0)
  }, [estimatedSeconds])

  useEffect(() => {
    if (timeRemaining <= 0 || status === 'completed') {
      setProgress(100)
      if (onComplete) {
        onComplete()
      }
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1)
        const newProgress = ((estimatedSeconds - newTime) / estimatedSeconds) * 100
        setProgress(newProgress)
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, estimatedSeconds, onComplete, status])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusMessage = (): string => {
    switch (status) {
      case 'uploading':
        return 'Uploading to cloud storage...'
      case 'transcribing':
        return 'Transcribing audio with AI...'
      case 'analyzing':
        return 'Analyzing conversation...'
      case 'completed':
        return 'Processing complete!'
      default:
        return 'Processing...'
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Status Message */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {status !== 'completed' ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          ) : (
            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <span className="text-sm font-medium text-gray-700">{getStatusMessage()}</span>
        </div>

        {status !== 'completed' && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-1000 ease-linear ${
            status === 'completed' ? 'bg-green-500' : 'bg-blue-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress Percentage */}
      <div className="text-right text-xs text-gray-500">
        {Math.round(progress)}% complete
      </div>
    </div>
  )
}

export default ProcessingTimer

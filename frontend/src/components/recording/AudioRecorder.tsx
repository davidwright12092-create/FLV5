import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Square, Play, Pause, Upload, AlertCircle, CheckCircle2, Settings } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'

export type RecordingQuality = 'low' | 'medium' | 'high'

export type RecordingStatus = 'idle' | 'recording' | 'stopped' | 'processing' | 'error'

export interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void
  onError?: (error: Error) => void
  maxDuration?: number // in seconds
  className?: string
}

interface AudioData {
  blob: Blob
  duration: number
  url: string
}

const QUALITY_SETTINGS: Record<RecordingQuality, { bitrate: number; sampleRate: number; label: string }> = {
  low: { bitrate: 64000, sampleRate: 22050, label: 'Low (64kbps)' },
  medium: { bitrate: 128000, sampleRate: 44100, label: 'Medium (128kbps)' },
  high: { bitrate: 256000, sampleRate: 48000, label: 'High (256kbps)' },
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onError,
  maxDuration = 300, // 5 minutes default
  className = '',
}) => {
  // State management
  const [status, setStatus] = useState<RecordingStatus>('idle')
  const [quality, setQuality] = useState<RecordingQuality>('medium')
  const [duration, setDuration] = useState(0)
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [audioData, setAudioData] = useState<AudioData | null>(null)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const timerIntervalRef = useRef<number | null>(null)

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      setErrorMessage('')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })
      streamRef.current = stream
      setPermissionGranted(true)

      // Setup audio context for visualization
      setupAudioContext(stream)

      return stream
    } catch (error) {
      setPermissionGranted(false)
      const errorMsg = error instanceof Error ? error.message : 'Failed to access microphone'
      setErrorMessage(
        errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')
          ? 'Microphone access denied. Please allow microphone access in your browser settings.'
          : errorMsg.includes('NotFoundError')
          ? 'No microphone found. Please connect a microphone and try again.'
          : `Microphone error: ${errorMsg}`
      )
      setStatus('error')
      onError?.(error instanceof Error ? error : new Error(errorMsg))
      return null
    }
  }, [onError])

  // Setup audio context for waveform visualization
  const setupAudioContext = (stream: MediaStream) => {
    try {
      const qualitySettings = QUALITY_SETTINGS[quality]
      const audioContext = new AudioContext({ sampleRate: qualitySettings.sampleRate })
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      dataArrayRef.current = dataArray
    } catch (error) {
      console.error('Failed to setup audio context:', error)
    }
  }

  // Visualize waveform
  const visualize = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return

    const canvas = canvasRef.current
    const canvasCtx = canvas.getContext('2d')
    if (!canvasCtx) return

    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current
    const bufferLength = analyser.frequencyBinCount

    const draw = () => {
      if (status !== 'recording') {
        // Draw idle/stopped state
        canvasCtx.fillStyle = 'rgb(243, 244, 246)' // gray-100
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw center line
        canvasCtx.strokeStyle = 'rgb(209, 213, 219)' // gray-300
        canvasCtx.lineWidth = 2
        canvasCtx.beginPath()
        canvasCtx.moveTo(0, canvas.height / 2)
        canvasCtx.lineTo(canvas.width, canvas.height / 2)
        canvasCtx.stroke()
        return
      }

      animationFrameRef.current = requestAnimationFrame(draw)

      analyser.getByteTimeDomainData(dataArray)

      // Create gradient background
      const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, 'rgb(240, 253, 250)') // primary-50
      gradient.addColorStop(1, 'rgb(204, 251, 241)') // primary-100
      canvasCtx.fillStyle = gradient
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw waveform
      canvasCtx.lineWidth = 3
      canvasCtx.strokeStyle = 'rgb(6, 214, 160)' // brand.cyan
      canvasCtx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2

        if (i === 0) {
          canvasCtx.moveTo(x, y)
        } else {
          canvasCtx.lineTo(x, y)
        }

        x += sliceWidth
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2)
      canvasCtx.stroke()
    }

    draw()
  }, [status])

  // Start recording
  const startRecording = async () => {
    try {
      setErrorMessage('')
      let stream = streamRef.current

      if (!stream || !stream.active) {
        stream = await requestPermission()
        if (!stream) return
      }

      const qualitySettings = QUALITY_SETTINGS[quality]
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: qualitySettings.bitrate,
      })

      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        const recordingDuration = duration

        setAudioData({ blob, duration: recordingDuration, url })
        setStatus('stopped')

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
          timerIntervalRef.current = null
        }

        onRecordingComplete?.(blob, recordingDuration)
      }

      mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${event}`)
        setErrorMessage('Recording failed. Please try again.')
        setStatus('error')
        onError?.(error)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100) // Collect data every 100ms

      // Start timer
      startTimeRef.current = Date.now()
      setDuration(0)
      timerIntervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setDuration(elapsed)

        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          stopRecording()
        }
      }, 100)

      setStatus('recording')
      visualize()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start recording'
      setErrorMessage(errorMsg)
      setStatus('error')
      onError?.(error instanceof Error ? error : new Error(errorMsg))
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setStatus('processing')
      mediaRecorderRef.current.stop()

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (audioData?.url) {
        URL.revokeObjectURL(audioData.url)
      }
    }
  }, [audioData?.url])

  // Update visualization when status changes
  useEffect(() => {
    visualize()
  }, [status, visualize])

  return (
    <Card variant="elevated" padding="lg" className={`${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              status === 'recording'
                ? 'bg-gradient-to-br from-brand-cyan to-brand-blue text-white'
                : status === 'error'
                ? 'bg-error-100 text-error-600'
                : status === 'stopped'
                ? 'bg-success-100 text-success-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {status === 'recording' ? (
                <Mic className="w-6 h-6 animate-pulse" />
              ) : status === 'error' ? (
                <AlertCircle className="w-6 h-6" />
              ) : status === 'stopped' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Audio Recorder</h3>
              <p className="text-sm text-gray-600">
                {status === 'idle' && 'Ready to record'}
                {status === 'recording' && 'Recording in progress...'}
                {status === 'stopped' && 'Recording complete'}
                {status === 'processing' && 'Processing...'}
                {status === 'error' && 'Error occurred'}
              </p>
            </div>
          </div>

          {/* Recording Timer */}
          {(status === 'recording' || status === 'stopped') && (
            <div className="flex items-center gap-2">
              <div className={`px-4 py-2 rounded-xl font-mono text-lg font-semibold ${
                status === 'recording'
                  ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-lg'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {formatDuration(duration)}
              </div>
              {status === 'recording' && (
                <div className="w-3 h-3 bg-error-500 rounded-full animate-pulse" />
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <div className="flex items-start gap-3 p-4 bg-error-50 border-l-4 border-error-500 rounded-lg">
            <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-error-900">Recording Error</p>
              <p className="text-sm text-error-700 mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Waveform Visualization */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="w-full h-48 rounded-xl border-2 border-gray-200 bg-gray-50"
            style={{ maxWidth: '100%' }}
          />
          {status === 'idle' && permissionGranted === null && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
              <div className="text-center">
                <Mic className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click Start to begin recording</p>
              </div>
            </div>
          )}
        </div>

        {/* Quality Selector */}
        {status === 'idle' && (
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Quality:</span>
            <div className="flex gap-2">
              {(Object.keys(QUALITY_SETTINGS) as RecordingQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    quality === q
                      ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {QUALITY_SETTINGS[q].label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          {status === 'idle' || status === 'error' ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={startRecording}
              className="bg-gradient-to-r from-brand-cyan to-brand-blue hover:from-brand-cyan/90 hover:to-brand-blue/90 shadow-lg"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </Button>
          ) : status === 'recording' ? (
            <Button
              variant="danger"
              size="lg"
              fullWidth
              onClick={stopRecording}
              className="shadow-lg"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </Button>
          ) : status === 'stopped' && audioData ? (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setStatus('idle')
                  setDuration(0)
                  setAudioData(null)
                  if (audioData.url) {
                    URL.revokeObjectURL(audioData.url)
                  }
                }}
                className="flex-1"
              >
                <Mic className="w-5 h-5" />
                New Recording
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const audio = new Audio(audioData.url)
                  audio.play()
                }}
                className="flex-1 border-brand-blue text-brand-blue hover:bg-brand-blue/10"
              >
                <Play className="w-5 h-5" />
                Play
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              disabled
              loading
            >
              Processing...
            </Button>
          )}
        </div>

        {/* Recording Info */}
        {status === 'stopped' && audioData && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-info-50 rounded-xl border border-primary-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Recording Ready</p>
                <p className="text-xs text-gray-600">
                  Duration: {formatDuration(audioData.duration)} |
                  Size: {(audioData.blob.size / 1024).toFixed(2)} KB |
                  Quality: {QUALITY_SETTINGS[quality].label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={audioData.url}
                download={`recording-${Date.now()}.webm`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-blue hover:text-brand-blue/80 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        )}

        {/* Max Duration Info */}
        {status === 'recording' && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Recording...</span>
            <span>Max duration: {formatDuration(maxDuration)}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

export default AudioRecorder

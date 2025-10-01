import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, CACHE_TIMES } from '../lib/queryClient'

/**
 * Recordings API Hooks with Smart Caching
 *
 * These hooks automatically cache data and prevent redundant API calls.
 */

// Example API service (you'll need to create this)
const api = {
  getRecordings: async (filters?: any) => {
    const params = new URLSearchParams(filters)
    const response = await fetch(`http://localhost:5001/api/recordings?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch recordings')
    return response.json()
  },

  getRecording: async (id: string) => {
    const response = await fetch(`http://localhost:5001/api/recordings/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch recording')
    return response.json()
  },

  getTranscription: async (recordingId: string) => {
    const response = await fetch(`http://localhost:5001/api/recordings/${recordingId}/transcription`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch transcription')
    return response.json()
  },

  getAnalysis: async (recordingId: string) => {
    const response = await fetch(`http://localhost:5001/api/recordings/${recordingId}/analysis`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch analysis')
    return response.json()
  },

  createAnalysis: async (recordingId: string, forceReanalysis = false) => {
    const response = await fetch(`http://localhost:5001/api/recordings/${recordingId}/analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ forceReanalysis }),
    })
    if (!response.ok) throw new Error('Failed to create analysis')
    return response.json()
  },
}

/**
 * Fetch all recordings with caching
 * Cache for 10 minutes (standard)
 */
export function useRecordings(filters?: any) {
  return useQuery({
    queryKey: queryKeys.recordings.list(filters),
    queryFn: () => api.getRecordings(filters),
    staleTime: CACHE_TIMES.STANDARD,
  })
}

/**
 * Fetch single recording with caching
 * Cache for 10 minutes (standard)
 */
export function useRecording(id: string) {
  return useQuery({
    queryKey: queryKeys.recordings.detail(id),
    queryFn: () => api.getRecording(id),
    staleTime: CACHE_TIMES.STANDARD,
    enabled: !!id, // Only run if id exists
  })
}

/**
 * Fetch transcription with aggressive caching
 * Cache for 1 HOUR - transcriptions are expensive and rarely change
 */
export function useTranscription(recordingId: string) {
  return useQuery({
    queryKey: queryKeys.transcriptions.detail(recordingId),
    queryFn: () => api.getTranscription(recordingId),
    staleTime: CACHE_TIMES.ANALYSIS, // 1 hour
    gcTime: CACHE_TIMES.STATIC, // Keep for 24 hours
    enabled: !!recordingId,
    // CRITICAL: This prevents re-fetching on component remount
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

/**
 * Fetch analysis with aggressive caching
 * Cache for 1 HOUR - AI analysis is VERY expensive and rarely changes
 */
export function useAnalysis(recordingId: string) {
  return useQuery({
    queryKey: queryKeys.analysis.detail(recordingId),
    queryFn: () => api.getAnalysis(recordingId),
    staleTime: CACHE_TIMES.ANALYSIS, // 1 hour
    gcTime: CACHE_TIMES.STATIC, // Keep for 24 hours
    enabled: !!recordingId,
    // CRITICAL: Prevents expensive re-analysis
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

/**
 * Create/trigger analysis mutation
 * Invalidates cache after successful analysis
 */
export function useCreateAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recordingId, forceReanalysis }: {
      recordingId: string
      forceReanalysis?: boolean
    }) => api.createAnalysis(recordingId, forceReanalysis),

    onSuccess: (data, variables) => {
      // Invalidate the analysis cache for this recording
      queryClient.invalidateQueries({
        queryKey: queryKeys.analysis.detail(variables.recordingId),
      })

      // Also invalidate dashboard and analytics caches
      queryClient.invalidateQueries({
        queryKey: queryKeys.analysis.dashboard(),
      })
    },
  })
}

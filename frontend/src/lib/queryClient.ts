import { QueryClient } from '@tanstack/react-query'

/**
 * React Query Client Configuration
 *
 * This configures aggressive caching to prevent redundant API calls
 * and minimize OpenAI API costs.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 10 minutes by default
      staleTime: 1000 * 60 * 10, // 10 minutes

      // Keep unused data in cache for 30 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)

      // Retry failed requests (but not for 4xx errors)
      retry: (failureCount, error: any) => {
        // Don't retry 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        return failureCount < 2
      },

      // Don't refetch on window focus by default
      // (prevents unnecessary API calls when switching tabs)
      refetchOnWindowFocus: false,

      // Don't refetch on reconnect by default
      refetchOnReconnect: false,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
})

/**
 * Custom cache times for different data types
 */
export const CACHE_TIMES = {
  // Short-lived data (1 minute)
  REALTIME: 1000 * 60 * 1,

  // Medium-lived data (10 minutes) - DEFAULT
  STANDARD: 1000 * 60 * 10,

  // Long-lived data (1 hour) - for analysis results, transcriptions
  ANALYSIS: 1000 * 60 * 60,

  // Very long-lived data (24 hours) - for user settings, templates
  STATIC: 1000 * 60 * 60 * 24,

  // Infinite - for data that never changes
  INFINITE: Infinity,
}

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
  },

  // Recordings
  recordings: {
    all: ['recordings'] as const,
    list: (filters?: any) => ['recordings', 'list', filters] as const,
    detail: (id: string) => ['recordings', 'detail', id] as const,
    stats: () => ['recordings', 'stats'] as const,
  },

  // Transcriptions (EXPENSIVE - cache aggressively)
  transcriptions: {
    detail: (recordingId: string) => ['transcriptions', 'detail', recordingId] as const,
  },

  // Analysis (VERY EXPENSIVE - cache aggressively)
  analysis: {
    detail: (recordingId: string) => ['analysis', 'detail', recordingId] as const,
    dashboard: (filters?: any) => ['analysis', 'dashboard', filters] as const,
    sentiment: (filters?: any) => ['analysis', 'sentiment', filters] as const,
    opportunities: (filters?: any) => ['analysis', 'opportunities', filters] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    list: (filters?: any) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },

  // Process Templates (rarely change)
  templates: {
    all: ['templates'] as const,
    list: () => ['templates', 'list'] as const,
    detail: (id: string) => ['templates', 'detail', id] as const,
  },

  // Organization (rarely changes)
  organization: {
    detail: () => ['organization', 'detail'] as const,
    settings: () => ['organization', 'settings'] as const,
  },
}

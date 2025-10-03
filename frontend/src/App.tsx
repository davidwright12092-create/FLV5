import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { queryClient } from './lib/queryClient'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage'
import ComingSoonPage from './pages/ComingSoonPage'
import AnalyticsPage from './pages/AnalyticsPage'
import CalendarPage from './pages/CalendarPage'

// Recording Pages
import RecordingsPage from './pages/recording/RecordingsPage'
import RecordingPage from './pages/recording/RecordingPage'
import RecordingHistoryPage from './pages/recording/RecordingHistoryPage'
import RecordingDetailPage from './pages/recording/RecordingDetailPage'
import RecordingUploadPage from './pages/recording/RecordingUploadPage'

// Analytics Pages
import ConversationAnalysisPage from './pages/analytics/ConversationAnalysisPage'
import SentimentAnalysisPage from './pages/analytics/SentimentAnalysisPage'
import ProcessAdherencePage from './pages/analytics/ProcessAdherencePage'
import SalesOpportunitiesPage from './pages/analytics/SalesOpportunitiesPage'

// Management Pages
import ManagementPage from './pages/management/ManagementPage'
import ProcessTemplatesPage from './pages/management/ProcessTemplatesPage'
import UserManagementPage from './pages/management/UserManagementPage'
import SettingsPage from './pages/management/SettingsPage'
import ReportsPage from './pages/management/ReportsPage'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Toaster position="top-right" />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recordings"
            element={
              <ProtectedRoute>
                <RecordingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recording/new"
            element={
              <ProtectedRoute>
                <RecordingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recording/history"
            element={
              <ProtectedRoute>
                <RecordingHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recording/upload"
            element={
              <ProtectedRoute>
                <RecordingUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recording/:id"
            element={
              <ProtectedRoute>
                <RecordingDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/conversations"
            element={
              <ProtectedRoute>
                <ConversationAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/sentiment"
            element={
              <ProtectedRoute>
                <SentimentAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/process"
            element={
              <ProtectedRoute>
                <ProcessAdherencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/opportunities"
            element={
              <ProtectedRoute>
                <SalesOpportunitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management"
            element={
              <ProtectedRoute>
                <ManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/processes"
            element={
              <ProtectedRoute>
                <ProcessTemplatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/users"
            element={
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <ProtectedRoute>
                <ComingSoonPage title="Performance" description="Track and analyze team performance metrics." />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to dashboard if authenticated, otherwise login */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
    </QueryClientProvider>
  )
}

export default App
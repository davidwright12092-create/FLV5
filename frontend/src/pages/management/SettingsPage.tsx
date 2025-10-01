import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import SettingsForm from '../../components/management/SettingsForm'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import {
  Settings,
  Save,
  Search,
  Crown,
  Zap,
  TrendingUp,
  AlertCircle,
  Check,
  ArrowRight,
  X
} from 'lucide-react'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  // Mock plan data
  const planData = {
    name: 'Professional',
    tier: 'pro',
    price: 99,
    interval: 'monthly',
    features: [
      'Unlimited recordings',
      '10 GB storage',
      '5,000 transcription minutes',
      'Advanced analytics & insights',
      'Priority support',
      'Custom integrations'
    ],
    usage: {
      recordings: 145,
      storage: {
        used: 6.5,
        total: 10
      },
      transcriptionMinutes: {
        used: 2400,
        total: 5000
      }
    },
    nextBillingDate: '2025-11-01'
  }

  // Handle browser back/forward and page navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path)
      setShowLeaveConfirmation(true)
    } else {
      navigate(path)
    }
  }

  const confirmLeave = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation)
    }
    setShowLeaveConfirmation(false)
    setPendingNavigation(null)
  }

  const cancelLeave = () => {
    setShowLeaveConfirmation(false)
    setPendingNavigation(null)
  }

  // Calculate usage percentages
  const storagePercentage = (planData.usage.storage.used / planData.usage.storage.total) * 100
  const transcriptionPercentage = (planData.usage.transcriptionMinutes.used / planData.usage.transcriptionMinutes.total) * 100

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-cyan via-brand-blue to-brand-purple flex items-center justify-center shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your FieldLink account and preferences
              </p>
            </div>
          </div>

          <Button
            size="lg"
            disabled={!hasUnsavedChanges}
            className="shadow-lg"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-md border border-gray-200">
          <div className="relative">
            <Input
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              fullWidth
              className="pr-20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings Form - Takes 2 columns */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <SettingsForm />
          </div>

          {/* Sidebar - Plan Information and Quick Actions */}
          <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
            {/* Current Plan Card */}
            <Card className="border border-gray-200 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple" />

              <div className="p-6">
                <CardHeader className="mb-0 pb-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {planData.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ${planData.price}/{planData.interval}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardBody className="pt-4 space-y-4">
                  {/* Features */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2.5">
                      Plan Features
                    </h4>
                    <div className="space-y-2">
                      {planData.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Usage Statistics */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-brand-blue" />
                      Usage This Month
                    </h4>

                    <div className="space-y-4">
                      {/* Storage Usage */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-600">Storage</span>
                          <span className="text-xs font-bold text-gray-900">
                            {planData.usage.storage.used} GB / {planData.usage.storage.total} GB
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-purple to-brand-pink rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {storagePercentage.toFixed(0)}% used
                        </p>
                      </div>

                      {/* Transcription Minutes */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-600">Transcription</span>
                          <span className="text-xs font-bold text-gray-900">
                            {planData.usage.transcriptionMinutes.used.toLocaleString()} / {planData.usage.transcriptionMinutes.total.toLocaleString()} min
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-orange to-brand-yellow rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(transcriptionPercentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {transcriptionPercentage.toFixed(0)}% used
                        </p>
                      </div>

                      {/* Recordings */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Total Recordings</span>
                          <span className="text-sm font-bold text-gray-900">
                            {planData.usage.recordings}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Billing Date */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Next billing</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(planData.nextBillingDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Upgrade Button */}
                  <Button
                    variant="primary"
                    fullWidth
                    className="mt-4 bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple hover:opacity-90 shadow-lg"
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade Plan
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </CardBody>
              </div>
            </Card>

            {/* Quick Tips Card */}
            <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md">
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Settings Tips
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-brand-blue mt-0.5">•</span>
                        <span>Enable 2FA for enhanced security</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-cyan mt-0.5">•</span>
                        <span>Connect your CRM for automatic data sync</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-purple mt-0.5">•</span>
                        <span>Set up webhooks for real-time updates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-blue mt-0.5">•</span>
                        <span>Configure notification preferences</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Storage Warning (if near limit) */}
            {storagePercentage > 80 && (
              <Card className="border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md">
                <CardBody>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">
                        Storage Alert
                      </h4>
                      <p className="text-sm text-amber-800 mb-3">
                        You're using {storagePercentage.toFixed(0)}% of your storage. Consider upgrading your plan or removing old recordings.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        Manage Storage
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>

        {/* Unsaved Changes Confirmation Modal */}
        {showLeaveConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full shadow-2xl animate-scale-in">
              <CardBody className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Unsaved Changes
                    </h3>
                    <p className="text-gray-600">
                      You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={cancelLeave}
                  >
                    Stay on Page
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={confirmLeave}
                  >
                    Leave Without Saving
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

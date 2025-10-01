import { useState, useEffect } from 'react'
import {
  Building2,
  Bell,
  Mic,
  Zap,
  CreditCard,
  Shield,
  Save,
  AlertCircle,
  Upload,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Clock,
  Download,
  Trash2,
  Key,
  Link2,
  Check,
  X,
  ChevronsUpDown,
  Calendar,
  DollarSign,
  FileText,
  Lock,
  LogOut,
  Eye
} from 'lucide-react'
import Card, { CardHeader, CardBody } from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'

// Type definitions
interface CompanySettings {
  name: string
  industry: string
  size: string
  logo: File | null
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  website: string
}

interface NotificationSettings {
  email: {
    newRecordings: boolean
    analysisComplete: boolean
    opportunities: boolean
    weeklyReport: boolean
    systemUpdates: boolean
  }
  sms: {
    criticalAlerts: boolean
    opportunities: boolean
  }
  inApp: {
    allNotifications: boolean
  }
  frequency: 'immediate' | 'daily' | 'weekly'
  recipients: string[]
}

interface RecordingSettings {
  autoStart: boolean
  quality: 'standard' | 'high' | 'ultra'
  language: string
  autoDeleteDays: number
  storageLocation: 'cloud' | 'local' | 'hybrid'
}

interface IntegrationSettings {
  crm: {
    provider: 'none' | 'salesforce' | 'hubspot' | 'pipedrive'
    connected: boolean
    apiKey: string
  }
  calendar: {
    provider: 'none' | 'google' | 'outlook' | 'apple'
    connected: boolean
  }
  apiKeys: Array<{
    id: string
    name: string
    key: string
    createdAt: string
  }>
  webhooks: Array<{
    id: string
    url: string
    events: string[]
  }>
}

interface BillingSettings {
  plan: {
    name: string
    price: number
    interval: 'monthly' | 'annual'
    features: string[]
  }
  usage: {
    recordings: number
    storage: number
    transcriptionMinutes: number
    limits: {
      recordings: number
      storage: number
      transcriptionMinutes: number
    }
  }
  paymentMethod: {
    type: string
    last4: string
    expiry: string
  }
  billingHistory: Array<{
    id: string
    date: string
    amount: number
    status: 'paid' | 'pending' | 'failed'
    invoice: string
  }>
}

interface SecuritySettings {
  twoFactorAuth: boolean
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireNumbers: boolean
    requireSymbols: boolean
  }
  sessionTimeout: number
  ipWhitelist: string[]
}

type TabType = 'company' | 'notifications' | 'recording' | 'integrations' | 'billing' | 'security'

interface TabConfig {
  id: TabType
  label: string
  icon: React.ReactNode
  gradient: string
}

export default function SettingsForm() {
  const [activeTab, setActiveTab] = useState<TabType>('company')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Settings state
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'My Company',
    industry: 'Technology',
    size: '10-50',
    logo: null,
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States',
    phone: '(555) 123-4567',
    website: 'https://example.com'
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      newRecordings: true,
      analysisComplete: true,
      opportunities: true,
      weeklyReport: true,
      systemUpdates: false
    },
    sms: {
      criticalAlerts: true,
      opportunities: false
    },
    inApp: {
      allNotifications: true
    },
    frequency: 'immediate',
    recipients: ['admin@example.com']
  })

  const [recordingSettings, setRecordingSettings] = useState<RecordingSettings>({
    autoStart: false,
    quality: 'high',
    language: 'en-US',
    autoDeleteDays: 90,
    storageLocation: 'cloud'
  })

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    crm: {
      provider: 'none',
      connected: false,
      apiKey: ''
    },
    calendar: {
      provider: 'none',
      connected: false
    },
    apiKeys: [],
    webhooks: []
  })

  const [billingSettings, setBillingSettings] = useState<BillingSettings>({
    plan: {
      name: 'Professional',
      price: 99,
      interval: 'monthly',
      features: [
        'Unlimited recordings',
        '10 GB storage',
        'Advanced analytics',
        'Priority support'
      ]
    },
    usage: {
      recordings: 145,
      storage: 6.5,
      transcriptionMinutes: 2400,
      limits: {
        recordings: 999999,
        storage: 10,
        transcriptionMinutes: 5000
      }
    },
    paymentMethod: {
      type: 'Visa',
      last4: '4242',
      expiry: '12/25'
    },
    billingHistory: [
      {
        id: '1',
        date: '2025-09-01',
        amount: 99,
        status: 'paid',
        invoice: 'INV-2025-09'
      },
      {
        id: '2',
        date: '2025-08-01',
        amount: 99,
        status: 'paid',
        invoice: 'INV-2025-08'
      }
    ]
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false
    },
    sessionTimeout: 30,
    ipWhitelist: []
  })

  const [newRecipient, setNewRecipient] = useState('')
  const [newIpAddress, setNewIpAddress] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  const tabs: TabConfig[] = [
    {
      id: 'company',
      label: 'Company Information',
      icon: <Building2 className="w-5 h-5" />,
      gradient: 'from-brand-cyan to-brand-blue'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      gradient: 'from-brand-purple to-brand-pink'
    },
    {
      id: 'recording',
      label: 'Recording',
      icon: <Mic className="w-5 h-5" />,
      gradient: 'from-brand-orange to-brand-yellow'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Zap className="w-5 h-5" />,
      gradient: 'from-brand-blue to-brand-purple'
    },
    {
      id: 'billing',
      label: 'Billing & Subscription',
      icon: <CreditCard className="w-5 h-5" />,
      gradient: 'from-success-500 to-success-600'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-5 h-5" />,
      gradient: 'from-error-500 to-error-600'
    }
  ]

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // In a real app, you would save to backend here
      setHasUnsavedChanges(false)
      showNotification('success', 'Settings saved successfully!')
    } catch (error) {
      showNotification('error', 'Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [companySettings, notificationSettings, recordingSettings, integrationSettings, securitySettings])

  // Toggle component
  const Toggle = ({
    checked,
    onChange,
    label
  }: {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
  }) => (
    <label className="flex items-center justify-between py-3 cursor-pointer group">
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          checked ? 'bg-primary-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  )

  // Select component
  const Select = ({
    value,
    onChange,
    options,
    label
  }: {
    value: string
    onChange: (value: string) => void
    options: Array<{ value: string; label: string }>
    label: string
  }) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )

  // Render Company Information tab
  const renderCompanyTab = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center text-white text-4xl font-bold shadow-lg">
            {companySettings.name.charAt(0)}
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full">
            <Upload className="w-4 h-4" />
            Upload Logo
          </Button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            value={companySettings.name}
            onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
            leftIcon={<Building2 className="w-5 h-5" />}
            fullWidth
          />

          <Select
            label="Industry"
            value={companySettings.industry}
            onChange={(value) => setCompanySettings({ ...companySettings, industry: value })}
            options={[
              { value: 'Technology', label: 'Technology' },
              { value: 'Healthcare', label: 'Healthcare' },
              { value: 'Finance', label: 'Finance' },
              { value: 'Retail', label: 'Retail' },
              { value: 'Manufacturing', label: 'Manufacturing' },
              { value: 'Other', label: 'Other' }
            ]}
          />

          <Select
            label="Company Size"
            value={companySettings.size}
            onChange={(value) => setCompanySettings({ ...companySettings, size: value })}
            options={[
              { value: '1-10', label: '1-10 employees' },
              { value: '10-50', label: '10-50 employees' },
              { value: '50-200', label: '50-200 employees' },
              { value: '200-1000', label: '200-1000 employees' },
              { value: '1000+', label: '1000+ employees' }
            ]}
          />

          <Input
            label="Phone Number"
            value={companySettings.phone}
            onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
            leftIcon={<Phone className="w-5 h-5" />}
            fullWidth
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Street Address"
              value={companySettings.address}
              onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
              leftIcon={<MapPin className="w-5 h-5" />}
              fullWidth
            />
          </div>

          <Input
            label="City"
            value={companySettings.city}
            onChange={(e) => setCompanySettings({ ...companySettings, city: e.target.value })}
            fullWidth
          />

          <Input
            label="State/Province"
            value={companySettings.state}
            onChange={(e) => setCompanySettings({ ...companySettings, state: e.target.value })}
            fullWidth
          />

          <Input
            label="Zip/Postal Code"
            value={companySettings.zipCode}
            onChange={(e) => setCompanySettings({ ...companySettings, zipCode: e.target.value })}
            fullWidth
          />

          <Input
            label="Country"
            value={companySettings.country}
            onChange={(e) => setCompanySettings({ ...companySettings, country: e.target.value })}
            fullWidth
          />

          <div className="md:col-span-2">
            <Input
              label="Website"
              value={companySettings.website}
              onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
              leftIcon={<Globe className="w-5 h-5" />}
              fullWidth
            />
          </div>
        </div>
      </div>
    </div>
  )

  // Render Notification Settings tab
  const renderNotificationsTab = () => (
    <div className="space-y-8">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-brand-purple" />
          Email Notifications
        </h4>
        <div className="space-y-1 bg-gray-50 rounded-xl p-4">
          <Toggle
            checked={notificationSettings.email.newRecordings}
            onChange={(checked) => setNotificationSettings({
              ...notificationSettings,
              email: { ...notificationSettings.email, newRecordings: checked }
            })}
            label="New recordings uploaded"
          />
          <Toggle
            checked={notificationSettings.email.analysisComplete}
            onChange={(checked) => setNotificationSettings({
              ...notificationSettings,
              email: { ...notificationSettings.email, analysisComplete: checked }
            })}
            label="Analysis complete"
          />
          <Toggle
            checked={notificationSettings.email.opportunities}
            onChange={(checked) => setNotificationSettings({
              ...notificationSettings,
              email: { ...notificationSettings.email, opportunities: checked }
            })}
            label="New opportunities detected"
          />
          <Toggle
            checked={notificationSettings.email.weeklyReport}
            onChange={(checked) => setNotificationSettings({
              ...notificationSettings,
              email: { ...notificationSettings.email, weeklyReport: checked }
            })}
            label="Weekly performance report"
          />
          <Toggle
            checked={notificationSettings.email.systemUpdates}
            onChange={(checked) => setNotificationSettings({
              ...notificationSettings,
              email: { ...notificationSettings.email, systemUpdates: checked }
            })}
            label="System updates and announcements"
          />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-brand-orange" />
          SMS Notifications
        </h4>
        <div className="space-y-1 bg-gray-50 rounded-xl p-4">
          <Toggle
            checked={notificationSettings.sms.criticalAlerts}
            onChange={(checked) => setNotificationSettings({
              ...notificationSettings,
              sms: { ...notificationSettings.sms, criticalAlerts: checked }
            })}
            label="Critical alerts only"
          />
          <Toggle
            checked={notificationSettings.sms.opportunities}
            onChange={(checked) => setNotificationSettings({
              ...notificationSettings,
              sms: { ...notificationSettings.sms, opportunities: checked }
            })}
            label="High-priority opportunities"
          />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-cyan" />
          In-App Notifications
        </h4>
        <div className="space-y-1 bg-gray-50 rounded-xl p-4">
          <Toggle
            checked={notificationSettings.inApp.allNotifications}
            onChange={(checked) => setNotificationSettings({
              ...notificationSettings,
              inApp: { ...notificationSettings.inApp, allNotifications: checked }
            })}
            label="Enable all in-app notifications"
          />
        </div>
      </div>

      <div>
        <Select
          label="Notification Frequency"
          value={notificationSettings.frequency}
          onChange={(value) => setNotificationSettings({
            ...notificationSettings,
            frequency: value as 'immediate' | 'daily' | 'weekly'
          })}
          options={[
            { value: 'immediate', label: 'Immediate (real-time)' },
            { value: 'daily', label: 'Daily Digest' },
            { value: 'weekly', label: 'Weekly Summary' }
          ]}
        />
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Notification Recipients</h4>
        <div className="space-y-3">
          {notificationSettings.recipients.map((email, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="flex-1 text-sm font-medium text-gray-700">{email}</span>
              <button
                onClick={() => {
                  const newRecipients = notificationSettings.recipients.filter((_, i) => i !== index)
                  setNotificationSettings({ ...notificationSettings, recipients: newRecipients })
                }}
                className="text-error-600 hover:text-error-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <Input
              placeholder="email@example.com"
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              fullWidth
            />
            <Button
              variant="outline"
              onClick={() => {
                if (newRecipient && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipient)) {
                  setNotificationSettings({
                    ...notificationSettings,
                    recipients: [...notificationSettings.recipients, newRecipient]
                  })
                  setNewRecipient('')
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  // Render Recording Settings tab
  const renderRecordingTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-brand-orange/10 to-brand-yellow/10 rounded-2xl p-6 border border-brand-orange/20">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recording Behavior</h4>
        <div className="space-y-1">
          <Toggle
            checked={recordingSettings.autoStart}
            onChange={(checked) => setRecordingSettings({ ...recordingSettings, autoStart: checked })}
            label="Auto-start recording on call connect"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Recording Quality"
          value={recordingSettings.quality}
          onChange={(value) => setRecordingSettings({
            ...recordingSettings,
            quality: value as 'standard' | 'high' | 'ultra'
          })}
          options={[
            { value: 'standard', label: 'Standard (64 kbps)' },
            { value: 'high', label: 'High (128 kbps)' },
            { value: 'ultra', label: 'Ultra (256 kbps)' }
          ]}
        />

        <Select
          label="Transcription Language"
          value={recordingSettings.language}
          onChange={(value) => setRecordingSettings({ ...recordingSettings, language: value })}
          options={[
            { value: 'en-US', label: 'English (US)' },
            { value: 'en-GB', label: 'English (UK)' },
            { value: 'es-ES', label: 'Spanish' },
            { value: 'fr-FR', label: 'French' },
            { value: 'de-DE', label: 'German' },
            { value: 'it-IT', label: 'Italian' },
            { value: 'pt-BR', label: 'Portuguese (Brazil)' }
          ]}
        />

        <Select
          label="Storage Location"
          value={recordingSettings.storageLocation}
          onChange={(value) => setRecordingSettings({
            ...recordingSettings,
            storageLocation: value as 'cloud' | 'local' | 'hybrid'
          })}
          options={[
            { value: 'cloud', label: 'Cloud Storage' },
            { value: 'local', label: 'Local Storage' },
            { value: 'hybrid', label: 'Hybrid (Cloud + Local)' }
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Auto-delete recordings after
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={recordingSettings.autoDeleteDays}
              onChange={(e) => setRecordingSettings({
                ...recordingSettings,
                autoDeleteDays: parseInt(e.target.value) || 0
              })}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">days</span>
          </div>
          <p className="mt-1.5 text-sm text-gray-500">
            Set to 0 to keep recordings indefinitely
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-amber-900 mb-1">Storage Considerations</h5>
          <p className="text-sm text-amber-800">
            Higher quality recordings consume more storage space. Monitor your storage usage in the Billing tab.
          </p>
        </div>
      </div>
    </div>
  )

  // Render Integration Settings tab
  const renderIntegrationsTab = () => (
    <div className="space-y-8">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-brand-blue" />
          CRM Integration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="CRM Provider"
            value={integrationSettings.crm.provider}
            onChange={(value) => setIntegrationSettings({
              ...integrationSettings,
              crm: { ...integrationSettings.crm, provider: value as any }
            })}
            options={[
              { value: 'none', label: 'None' },
              { value: 'salesforce', label: 'Salesforce' },
              { value: 'hubspot', label: 'HubSpot' },
              { value: 'pipedrive', label: 'Pipedrive' }
            ]}
          />

          {integrationSettings.crm.provider !== 'none' && (
            <div className="flex items-end">
              {integrationSettings.crm.connected ? (
                <Button variant="outline" className="w-full" size="lg">
                  <Check className="w-4 h-4 text-success-600" />
                  Connected
                </Button>
              ) : (
                <Button variant="primary" className="w-full" size="lg">
                  <Link2 className="w-4 h-4" />
                  Connect
                </Button>
              )}
            </div>
          )}
        </div>

        {integrationSettings.crm.provider !== 'none' && (
          <div className="mt-4">
            <Input
              label="API Key"
              type={showApiKey ? "text" : "password"}
              value={integrationSettings.crm.apiKey}
              onChange={(e) => setIntegrationSettings({
                ...integrationSettings,
                crm: { ...integrationSettings.crm, apiKey: e.target.value }
              })}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="hover:text-gray-600 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
              }
              fullWidth
            />
          </div>
        )}
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-purple" />
          Calendar Sync
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Calendar Provider"
            value={integrationSettings.calendar.provider}
            onChange={(value) => setIntegrationSettings({
              ...integrationSettings,
              calendar: { ...integrationSettings.calendar, provider: value as any }
            })}
            options={[
              { value: 'none', label: 'None' },
              { value: 'google', label: 'Google Calendar' },
              { value: 'outlook', label: 'Microsoft Outlook' },
              { value: 'apple', label: 'Apple Calendar' }
            ]}
          />

          {integrationSettings.calendar.provider !== 'none' && (
            <div className="flex items-end">
              {integrationSettings.calendar.connected ? (
                <Button variant="outline" className="w-full" size="lg">
                  <Check className="w-4 h-4 text-success-600" />
                  Connected
                </Button>
              ) : (
                <Button variant="primary" className="w-full" size="lg">
                  <Link2 className="w-4 h-4" />
                  Connect
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-brand-orange" />
          API Keys
        </h4>
        <div className="space-y-3">
          {integrationSettings.apiKeys.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <Key className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No API keys created yet</p>
            </div>
          ) : (
            integrationSettings.apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{apiKey.name}</p>
                  <p className="text-sm text-gray-500">Created {apiKey.createdAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-error-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
          <Button variant="outline" className="w-full">
            <Key className="w-4 h-4" />
            Generate New API Key
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-yellow" />
          Webhooks
        </h4>
        <div className="space-y-3">
          {integrationSettings.webhooks.map((webhook) => (
            <div key={webhook.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
              <div className="flex-1">
                <p className="font-medium text-gray-900 break-all">{webhook.url}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Events: {webhook.events.join(', ')}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Trash2 className="w-4 h-4 text-error-600" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2">
            <Input
              placeholder="https://your-domain.com/webhook"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              fullWidth
            />
            <Button
              variant="outline"
              onClick={() => {
                if (newWebhookUrl) {
                  setIntegrationSettings({
                    ...integrationSettings,
                    webhooks: [
                      ...integrationSettings.webhooks,
                      {
                        id: Date.now().toString(),
                        url: newWebhookUrl,
                        events: ['recording.created', 'analysis.completed']
                      }
                    ]
                  })
                  setNewWebhookUrl('')
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  // Render Billing & Subscription tab
  const renderBillingTab = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-2xl p-6 border border-success-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              {billingSettings.plan.name} Plan
            </h4>
            <p className="text-3xl font-bold text-success-700">
              ${billingSettings.plan.price}
              <span className="text-base font-normal text-gray-600">
                /{billingSettings.plan.interval}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Downgrade
            </Button>
            <Button variant="primary" size="sm">
              <ChevronsUpDown className="w-4 h-4" />
              Upgrade
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {billingSettings.plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-success-600" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-brand-cyan" />
          Usage Statistics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-2">Recordings</p>
            <p className="text-2xl font-bold text-gray-900">
              {billingSettings.usage.recordings}
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-cyan to-brand-blue"
                style={{
                  width: `${Math.min((billingSettings.usage.recordings / billingSettings.usage.limits.recordings) * 100, 100)}%`
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              of {billingSettings.usage.limits.recordings.toLocaleString()} limit
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-2">Storage</p>
            <p className="text-2xl font-bold text-gray-900">
              {billingSettings.usage.storage} GB
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-purple to-brand-pink"
                style={{
                  width: `${(billingSettings.usage.storage / billingSettings.usage.limits.storage) * 100}%`
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              of {billingSettings.usage.limits.storage} GB limit
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-2">Transcription</p>
            <p className="text-2xl font-bold text-gray-900">
              {billingSettings.usage.transcriptionMinutes.toLocaleString()}
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-orange to-brand-yellow"
                style={{
                  width: `${(billingSettings.usage.transcriptionMinutes / billingSettings.usage.limits.transcriptionMinutes) * 100}%`
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              of {billingSettings.usage.limits.transcriptionMinutes.toLocaleString()} min limit
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-brand-blue" />
          Payment Method
        </h4>
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {billingSettings.paymentMethod.type} ending in {billingSettings.paymentMethod.last4}
              </p>
              <p className="text-sm text-gray-500">
                Expires {billingSettings.paymentMethod.expiry}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Update
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-purple" />
          Billing History
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Invoice</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {billingSettings.billingHistory.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {new Date(invoice.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    ${invoice.amount}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      invoice.status === 'paid'
                        ? 'bg-success-100 text-success-700'
                        : invoice.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-error-100 text-error-700'
                    }`}>
                      {invoice.status === 'paid' && <Check className="w-3 h-3" />}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {invoice.invoice}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Render Security Settings tab
  const renderSecurityTab = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-error-50 to-error-100 rounded-2xl p-6 border border-error-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-error-600" />
          Two-Factor Authentication
        </h4>
        <Toggle
          checked={securitySettings.twoFactorAuth}
          onChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
          label="Enable two-factor authentication (2FA)"
        />
        {securitySettings.twoFactorAuth && (
          <div className="mt-4 p-4 bg-white rounded-xl">
            <p className="text-sm text-gray-700 mb-3">
              Two-factor authentication is enabled. You'll need to enter a code from your authenticator app when signing in.
            </p>
            <Button variant="outline" size="sm">
              Configure 2FA
            </Button>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-blue" />
          Password Policy
        </h4>
        <div className="space-y-4 bg-gray-50 rounded-xl p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Password Length
            </label>
            <Input
              type="number"
              value={securitySettings.passwordPolicy.minLength}
              onChange={(e) => setSecuritySettings({
                ...securitySettings,
                passwordPolicy: {
                  ...securitySettings.passwordPolicy,
                  minLength: parseInt(e.target.value) || 8
                }
              })}
            />
          </div>

          <Toggle
            checked={securitySettings.passwordPolicy.requireUppercase}
            onChange={(checked) => setSecuritySettings({
              ...securitySettings,
              passwordPolicy: { ...securitySettings.passwordPolicy, requireUppercase: checked }
            })}
            label="Require uppercase letters"
          />

          <Toggle
            checked={securitySettings.passwordPolicy.requireNumbers}
            onChange={(checked) => setSecuritySettings({
              ...securitySettings,
              passwordPolicy: { ...securitySettings.passwordPolicy, requireNumbers: checked }
            })}
            label="Require numbers"
          />

          <Toggle
            checked={securitySettings.passwordPolicy.requireSymbols}
            onChange={(checked) => setSecuritySettings({
              ...securitySettings,
              passwordPolicy: { ...securitySettings.passwordPolicy, requireSymbols: checked }
            })}
            label="Require special symbols"
          />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-purple" />
          Session Timeout
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            label="Automatically log out after"
            value={securitySettings.sessionTimeout}
            onChange={(e) => setSecuritySettings({
              ...securitySettings,
              sessionTimeout: parseInt(e.target.value) || 30
            })}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 whitespace-nowrap mt-8">minutes of inactivity</span>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-brand-orange" />
          IP Whitelist
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Restrict access to your account from specific IP addresses. Leave empty to allow all IPs.
        </p>
        <div className="space-y-3">
          {securitySettings.ipWhitelist.map((ip, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="flex-1 text-sm font-medium text-gray-700">{ip}</span>
              <button
                onClick={() => {
                  const newIpList = securitySettings.ipWhitelist.filter((_, i) => i !== index)
                  setSecuritySettings({ ...securitySettings, ipWhitelist: newIpList })
                }}
                className="text-error-600 hover:text-error-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <Input
              placeholder="192.168.1.1"
              value={newIpAddress}
              onChange={(e) => setNewIpAddress(e.target.value)}
              fullWidth
            />
            <Button
              variant="outline"
              onClick={() => {
                if (newIpAddress) {
                  setSecuritySettings({
                    ...securitySettings,
                    ipWhitelist: [...securitySettings.ipWhitelist, newIpAddress]
                  })
                  setNewIpAddress('')
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-cyan" />
          Audit Log
        </h4>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <LogOut className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-4">
            View all security-related activities and login history
          </p>
          <Button variant="outline">
            View Audit Log
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Notification Banner */}
        {notification && (
          <div className={`mb-6 p-4 rounded-xl border ${
            notification.type === 'success'
              ? 'bg-success-50 border-success-200 text-success-800'
              : 'bg-error-50 border-error-200 text-error-800'
          } flex items-center gap-3 animate-slide-in`}>
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto hover:opacity-70 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && !isSaving && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="font-medium text-amber-900 flex-1">
              You have unsaved changes
            </p>
            <Button onClick={handleSave} size="sm">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <Card padding="sm" className="sticky top-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r ' + tab.gradient + ' text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tab.icon}
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card padding="lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${
                    tabs.find(t => t.id === activeTab)?.gradient
                  } flex items-center justify-center text-white`}>
                    {tabs.find(t => t.id === activeTab)?.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {tabs.find(t => t.id === activeTab)?.label}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {activeTab === 'company' && 'Update your company profile and contact information'}
                      {activeTab === 'notifications' && 'Configure how and when you receive notifications'}
                      {activeTab === 'recording' && 'Customize recording quality and storage preferences'}
                      {activeTab === 'integrations' && 'Connect with third-party services and tools'}
                      {activeTab === 'billing' && 'Manage your subscription and billing information'}
                      {activeTab === 'security' && 'Configure security settings and access controls'}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardBody>
                {activeTab === 'company' && renderCompanyTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
                {activeTab === 'recording' && renderRecordingTab()}
                {activeTab === 'integrations' && renderIntegrationsTab()}
                {activeTab === 'billing' && renderBillingTab()}
                {activeTab === 'security' && renderSecurityTab()}
              </CardBody>

              {/* Footer with Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Last saved: Never
                </p>
                <Button
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={!hasUnsavedChanges}
                  size="lg"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>
        </div>
    </>
  )
}

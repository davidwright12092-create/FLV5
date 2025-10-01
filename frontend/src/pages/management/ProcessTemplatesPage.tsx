import { useState } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ProcessTemplateForm, {
  ProcessTemplate,
  ProcessStep,
} from '../../components/management/ProcessTemplateForm'
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Copy,
  Trash2,
  Star,
  StarOff,
  MoreVertical,
  Eye,
  Calendar,
  TrendingUp,
  CheckCircle,
  Settings,
  BarChart3,
  Users,
  Clock,
  Target,
  Award,
  FileText,
  Layers,
  X,
} from 'lucide-react'

// TypeScript Interfaces
interface TemplateStats {
  id: string
  templateId: string
  usageCount: number
  successRate: number
  averageScore: number
}

interface ProcessTemplateWithStats extends ProcessTemplate {
  stats: TemplateStats
  isDefault: boolean
  isArchived: boolean
}

type FilterType = 'all' | 'active' | 'archived'

// Mock Data
const generateMockTemplates = (): ProcessTemplateWithStats[] => {
  return [
    {
      id: 'template-1',
      name: 'Standard B2B Sales Process',
      description:
        'Comprehensive sales process optimized for B2B enterprise sales with multiple stakeholders and longer sales cycles.',
      industry: 'Technology',
      isActive: true,
      steps: [
        {
          id: 'step-1',
          name: 'Initial Contact & Introduction',
          description: 'Establish rapport and set the agenda for the conversation',
          requiredScripts: 'Greeting, introduction, permission to continue',
          expectedDuration: 3,
          isRequired: true,
          validationRules: {
            keywords: ['introduce', 'purpose', 'agenda'],
            minDuration: 2,
          },
          order: 0,
        },
        {
          id: 'step-2',
          name: 'Discovery & Needs Analysis',
          description: 'Uncover pain points, challenges, and business goals',
          requiredScripts: 'Open-ended questions about current process and challenges',
          expectedDuration: 8,
          isRequired: true,
          validationRules: {
            keywords: ['challenge', 'current process', 'pain point', 'goal'],
            minDuration: 5,
          },
          order: 1,
        },
        {
          id: 'step-3',
          name: 'Solution Presentation',
          description: 'Present relevant features tied to discovered needs',
          requiredScripts: 'Feature-benefit bridges, specific use cases',
          expectedDuration: 10,
          isRequired: true,
          validationRules: {
            keywords: ['feature', 'benefit', 'solution', 'helps you'],
            minDuration: 7,
          },
          order: 2,
        },
        {
          id: 'step-4',
          name: 'Objection Handling',
          description: 'Address concerns and overcome resistance',
          requiredScripts: 'Feel-felt-found technique, social proof',
          expectedDuration: 5,
          isRequired: false,
          validationRules: {
            keywords: ['understand', 'concern', 'others found'],
            minDuration: 3,
          },
          order: 3,
        },
        {
          id: 'step-5',
          name: 'Closing & Next Steps',
          description: 'Secure commitment and schedule follow-up',
          requiredScripts: 'Trial close, calendar booking, clear next actions',
          expectedDuration: 4,
          isRequired: true,
          validationRules: {
            keywords: ['next step', 'schedule', 'commitment', 'meeting'],
            minDuration: 2,
          },
          order: 4,
        },
      ],
      successCriteria: {
        scoreThreshold: 75,
        requiredStepsPercentage: 85,
        keyPerformanceIndicators: [
          'Customer engagement score > 80%',
          'All required steps completed',
          'Positive sentiment maintained',
          'Next action scheduled',
        ],
      },
      createdAt: new Date('2024-11-15'),
      updatedAt: new Date('2024-12-20'),
      stats: {
        id: 'stats-1',
        templateId: 'template-1',
        usageCount: 347,
        successRate: 82,
        averageScore: 85.4,
      },
      isDefault: true,
      isArchived: false,
    },
    {
      id: 'template-2',
      name: 'Quick Win - Transactional Sales',
      description:
        'Streamlined process for high-velocity transactional sales with shorter sales cycles and single decision makers.',
      industry: 'Retail',
      isActive: true,
      steps: [
        {
          id: 'step-1',
          name: 'Greeting & Quick Rapport',
          description: 'Brief introduction and establish friendly tone',
          requiredScripts: 'Friendly greeting, quick icebreaker',
          expectedDuration: 2,
          isRequired: true,
          validationRules: {
            keywords: ['hello', 'how are you'],
            minDuration: 1,
          },
          order: 0,
        },
        {
          id: 'step-2',
          name: 'Fast Needs Identification',
          description: 'Quickly identify main need or interest',
          requiredScripts: '2-3 targeted questions',
          expectedDuration: 3,
          isRequired: true,
          validationRules: {
            keywords: ['looking for', 'need', 'interested'],
            minDuration: 2,
          },
          order: 1,
        },
        {
          id: 'step-3',
          name: 'Solution Pitch',
          description: 'Present solution with emphasis on key benefits',
          requiredScripts: 'Value proposition, key benefits',
          expectedDuration: 5,
          isRequired: true,
          validationRules: {
            keywords: ['benefit', 'value', 'helps'],
            minDuration: 3,
          },
          order: 2,
        },
        {
          id: 'step-4',
          name: 'Close',
          description: 'Ask for the sale and secure commitment',
          requiredScripts: 'Direct close, create urgency',
          expectedDuration: 2,
          isRequired: true,
          validationRules: {
            keywords: ['today', 'purchase', 'get started'],
            minDuration: 1,
          },
          order: 3,
        },
      ],
      successCriteria: {
        scoreThreshold: 70,
        requiredStepsPercentage: 90,
        keyPerformanceIndicators: [
          'Conversion rate > 25%',
          'Call duration under 15 minutes',
          'Positive customer sentiment',
        ],
      },
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-18'),
      stats: {
        id: 'stats-2',
        templateId: 'template-2',
        usageCount: 892,
        successRate: 76,
        averageScore: 78.2,
      },
      isDefault: false,
      isArchived: false,
    },
    {
      id: 'template-3',
      name: 'Insurance Sales Process',
      description:
        'Specialized process for insurance sales focusing on needs analysis, risk assessment, and compliance requirements.',
      industry: 'Insurance',
      isActive: true,
      steps: [
        {
          id: 'step-1',
          name: 'Introduction & Compliance',
          description: 'Introduction with required compliance disclosures',
          requiredScripts: 'Name, license info, recording notice',
          expectedDuration: 3,
          isRequired: true,
          validationRules: {
            keywords: ['licensed', 'recorded', 'consent'],
            minDuration: 2,
          },
          order: 0,
        },
        {
          id: 'step-2',
          name: 'Current Coverage Review',
          description: 'Review existing coverage and identify gaps',
          requiredScripts: 'Questions about current policies',
          expectedDuration: 7,
          isRequired: true,
          validationRules: {
            keywords: ['current coverage', 'policy', 'deductible'],
            minDuration: 5,
          },
          order: 1,
        },
        {
          id: 'step-3',
          name: 'Needs & Risk Assessment',
          description: 'Assess risks and protection needs',
          requiredScripts: 'Family situation, assets, liabilities',
          expectedDuration: 10,
          isRequired: true,
          validationRules: {
            keywords: ['protect', 'risk', 'family', 'assets'],
            minDuration: 7,
          },
          order: 2,
        },
        {
          id: 'step-4',
          name: 'Solution Recommendation',
          description: 'Present tailored insurance solutions',
          requiredScripts: 'Coverage recommendations with explanations',
          expectedDuration: 8,
          isRequired: true,
          validationRules: {
            keywords: ['recommend', 'coverage', 'premium', 'benefit'],
            minDuration: 6,
          },
          order: 3,
        },
        {
          id: 'step-5',
          name: 'Application & Next Steps',
          description: 'Complete application or schedule follow-up',
          requiredScripts: 'Application process, next steps',
          expectedDuration: 5,
          isRequired: true,
          validationRules: {
            keywords: ['application', 'next step', 'follow up'],
            minDuration: 3,
          },
          order: 4,
        },
      ],
      successCriteria: {
        scoreThreshold: 80,
        requiredStepsPercentage: 95,
        keyPerformanceIndicators: [
          'Compliance requirements met',
          'Complete needs assessment',
          'Application started or scheduled',
          'Customer education completed',
        ],
      },
      createdAt: new Date('2024-11-20'),
      updatedAt: new Date('2024-12-15'),
      stats: {
        id: 'stats-3',
        templateId: 'template-3',
        usageCount: 234,
        successRate: 88,
        averageScore: 89.7,
      },
      isDefault: false,
      isArchived: false,
    },
    {
      id: 'template-4',
      name: 'Real Estate Lead Qualification',
      description:
        'Process template for qualifying real estate leads and scheduling property showings.',
      industry: 'Real Estate',
      isActive: true,
      steps: [
        {
          id: 'step-1',
          name: 'Introduction & Rapport',
          description: 'Build trust and establish expertise',
          requiredScripts: 'Introduction, credentials, local market knowledge',
          expectedDuration: 4,
          isRequired: true,
          validationRules: {
            keywords: ['experience', 'market', 'help you'],
            minDuration: 2,
          },
          order: 0,
        },
        {
          id: 'step-2',
          name: 'Property Requirements',
          description: 'Understand desired property features',
          requiredScripts: 'Questions about size, location, features, budget',
          expectedDuration: 8,
          isRequired: true,
          validationRules: {
            keywords: ['bedroom', 'location', 'budget', 'features'],
            minDuration: 5,
          },
          order: 1,
        },
        {
          id: 'step-3',
          name: 'Buyer Qualification',
          description: 'Assess buying timeline and financing status',
          requiredScripts: 'Timeline, pre-approval status, motivation',
          expectedDuration: 5,
          isRequired: true,
          validationRules: {
            keywords: ['timeline', 'pre-approved', 'financing', 'when'],
            minDuration: 3,
          },
          order: 2,
        },
        {
          id: 'step-4',
          name: 'Property Suggestions',
          description: 'Suggest matching properties from inventory',
          requiredScripts: 'Property descriptions, benefits, availability',
          expectedDuration: 6,
          isRequired: true,
          validationRules: {
            keywords: ['property', 'listing', 'available', 'show you'],
            minDuration: 4,
          },
          order: 3,
        },
        {
          id: 'step-5',
          name: 'Schedule Showing',
          description: 'Book property viewing appointments',
          requiredScripts: 'Available times, confirmation details',
          expectedDuration: 3,
          isRequired: true,
          validationRules: {
            keywords: ['schedule', 'showing', 'appointment', 'meet'],
            minDuration: 2,
          },
          order: 4,
        },
      ],
      successCriteria: {
        scoreThreshold: 75,
        requiredStepsPercentage: 85,
        keyPerformanceIndicators: [
          'Lead qualification score > 70%',
          'Showing scheduled',
          'Property preferences documented',
          'Follow-up plan established',
        ],
      },
      createdAt: new Date('2024-12-05'),
      updatedAt: new Date('2024-12-22'),
      stats: {
        id: 'stats-4',
        templateId: 'template-4',
        usageCount: 156,
        successRate: 79,
        averageScore: 81.3,
      },
      isDefault: false,
      isArchived: false,
    },
    {
      id: 'template-5',
      name: 'Financial Services Consultation',
      description:
        'Comprehensive template for financial advisory consultations focusing on goal-based planning.',
      industry: 'Financial Services',
      isActive: true,
      steps: [
        {
          id: 'step-1',
          name: 'Compliance & Introduction',
          description: 'Required disclosures and relationship building',
          requiredScripts: 'Compliance statements, credentials, process overview',
          expectedDuration: 4,
          isRequired: true,
          validationRules: {
            keywords: ['disclosure', 'licensed', 'fiduciary', 'process'],
            minDuration: 3,
          },
          order: 0,
        },
        {
          id: 'step-2',
          name: 'Financial Goal Discovery',
          description: 'Understand short and long-term financial goals',
          requiredScripts: 'Goal-setting questions, timeline, priorities',
          expectedDuration: 10,
          isRequired: true,
          validationRules: {
            keywords: ['goals', 'retirement', 'savings', 'timeline'],
            minDuration: 7,
          },
          order: 1,
        },
        {
          id: 'step-3',
          name: 'Current Situation Analysis',
          description: 'Review current financial situation and assets',
          requiredScripts: 'Questions about income, assets, debt, investments',
          expectedDuration: 8,
          isRequired: true,
          validationRules: {
            keywords: ['income', 'assets', 'investments', 'debt'],
            minDuration: 6,
          },
          order: 2,
        },
        {
          id: 'step-4',
          name: 'Strategy Recommendation',
          description: 'Present tailored financial strategy',
          requiredScripts: 'Strategy explanation, product recommendations',
          expectedDuration: 12,
          isRequired: true,
          validationRules: {
            keywords: ['strategy', 'recommend', 'plan', 'approach'],
            minDuration: 8,
          },
          order: 3,
        },
        {
          id: 'step-5',
          name: 'Next Steps & Documentation',
          description: 'Outline implementation steps and paperwork',
          requiredScripts: 'Action items, required documents, timeline',
          expectedDuration: 6,
          isRequired: true,
          validationRules: {
            keywords: ['next steps', 'documents', 'follow up', 'meeting'],
            minDuration: 4,
          },
          order: 4,
        },
      ],
      successCriteria: {
        scoreThreshold: 85,
        requiredStepsPercentage: 95,
        keyPerformanceIndicators: [
          'Complete financial profile obtained',
          'Goals documented and prioritized',
          'Comprehensive strategy presented',
          'Compliance requirements met',
          'Next appointment scheduled',
        ],
      },
      createdAt: new Date('2024-11-25'),
      updatedAt: new Date('2024-12-21'),
      stats: {
        id: 'stats-5',
        templateId: 'template-5',
        usageCount: 189,
        successRate: 91,
        averageScore: 92.1,
      },
      isDefault: false,
      isArchived: false,
    },
    {
      id: 'template-6',
      name: 'Consultative SaaS Demo Process',
      description:
        'Product demonstration process for SaaS solutions with emphasis on use cases and ROI.',
      industry: 'Technology',
      isActive: true,
      steps: [
        {
          id: 'step-1',
          name: 'Context Setting',
          description: 'Understand attendees and agenda alignment',
          requiredScripts: 'Introductions, roles, what they want to see',
          expectedDuration: 5,
          isRequired: true,
          validationRules: {
            keywords: ['role', 'agenda', 'objectives', 'goals'],
            minDuration: 3,
          },
          order: 0,
        },
        {
          id: 'step-2',
          name: 'Current State Assessment',
          description: 'Understand current tools and processes',
          requiredScripts: 'Questions about current solution, pain points',
          expectedDuration: 7,
          isRequired: true,
          validationRules: {
            keywords: ['currently', 'process', 'challenges', 'using'],
            minDuration: 5,
          },
          order: 1,
        },
        {
          id: 'step-3',
          name: 'Customized Demo',
          description: 'Show features relevant to their use case',
          requiredScripts: 'Feature walkthroughs tied to their needs',
          expectedDuration: 15,
          isRequired: true,
          validationRules: {
            keywords: ['this allows', 'you can', 'for your team'],
            minDuration: 10,
          },
          order: 2,
        },
        {
          id: 'step-4',
          name: 'ROI & Value Discussion',
          description: 'Quantify value and return on investment',
          requiredScripts: 'ROI calculator, case studies, metrics',
          expectedDuration: 8,
          isRequired: true,
          validationRules: {
            keywords: ['ROI', 'savings', 'value', 'results'],
            minDuration: 5,
          },
          order: 3,
        },
        {
          id: 'step-5',
          name: 'Implementation & Close',
          description: 'Discuss implementation and next steps',
          requiredScripts: 'Timeline, onboarding, pricing, trial offer',
          expectedDuration: 7,
          isRequired: true,
          validationRules: {
            keywords: ['implementation', 'onboard', 'start', 'trial'],
            minDuration: 4,
          },
          order: 4,
        },
      ],
      successCriteria: {
        scoreThreshold: 80,
        requiredStepsPercentage: 90,
        keyPerformanceIndicators: [
          'Demo customized to use case',
          'ROI discussed and documented',
          'Technical questions answered',
          'Trial or next meeting scheduled',
        ],
      },
      createdAt: new Date('2024-12-08'),
      updatedAt: new Date('2024-12-19'),
      stats: {
        id: 'stats-6',
        templateId: 'template-6',
        usageCount: 128,
        successRate: 84,
        averageScore: 86.5,
      },
      isDefault: false,
      isArchived: false,
    },
    {
      id: 'template-7',
      name: 'Home Services Appointment Setting',
      description:
        'Streamlined process for scheduling home services appointments and qualifying leads.',
      industry: 'Home Services',
      isActive: false,
      steps: [
        {
          id: 'step-1',
          name: 'Service Inquiry',
          description: 'Understand the service needed',
          requiredScripts: 'What service, urgency level',
          expectedDuration: 3,
          isRequired: true,
          validationRules: {
            keywords: ['service', 'need', 'issue', 'help'],
            minDuration: 2,
          },
          order: 0,
        },
        {
          id: 'step-2',
          name: 'Property Information',
          description: 'Gather property details',
          requiredScripts: 'Address, property type, access details',
          expectedDuration: 4,
          isRequired: true,
          validationRules: {
            keywords: ['address', 'property', 'access'],
            minDuration: 2,
          },
          order: 1,
        },
        {
          id: 'step-3',
          name: 'Availability & Scheduling',
          description: 'Find mutually convenient time',
          requiredScripts: 'Available slots, time confirmation',
          expectedDuration: 4,
          isRequired: true,
          validationRules: {
            keywords: ['available', 'schedule', 'appointment', 'time'],
            minDuration: 2,
          },
          order: 2,
        },
        {
          id: 'step-4',
          name: 'Confirmation & Next Steps',
          description: 'Confirm appointment and set expectations',
          requiredScripts: 'Confirmation details, what to expect, contact info',
          expectedDuration: 3,
          isRequired: true,
          validationRules: {
            keywords: ['confirm', 'expect', 'contact', 'arrive'],
            minDuration: 2,
          },
          order: 3,
        },
      ],
      successCriteria: {
        scoreThreshold: 70,
        requiredStepsPercentage: 90,
        keyPerformanceIndicators: [
          'Appointment scheduled',
          'Property information collected',
          'Customer expectations set',
        ],
      },
      createdAt: new Date('2024-10-15'),
      updatedAt: new Date('2024-11-05'),
      stats: {
        id: 'stats-7',
        templateId: 'template-7',
        usageCount: 67,
        successRate: 72,
        averageScore: 74.8,
      },
      isDefault: false,
      isArchived: true,
    },
    {
      id: 'template-8',
      name: 'Automotive Sales Process',
      description:
        'Complete automotive sales process from initial interest to test drive scheduling.',
      industry: 'Automotive',
      isActive: true,
      steps: [
        {
          id: 'step-1',
          name: 'Welcome & Needs Assessment',
          description: 'Greet customer and understand vehicle needs',
          requiredScripts: 'Greeting, questions about needs, preferences',
          expectedDuration: 6,
          isRequired: true,
          validationRules: {
            keywords: ['looking for', 'vehicle', 'features', 'budget'],
            minDuration: 4,
          },
          order: 0,
        },
        {
          id: 'step-2',
          name: 'Inventory Selection',
          description: 'Match customer needs to available inventory',
          requiredScripts: 'Vehicle recommendations, features, availability',
          expectedDuration: 8,
          isRequired: true,
          validationRules: {
            keywords: ['recommend', 'vehicle', 'features', 'stock'],
            minDuration: 5,
          },
          order: 1,
        },
        {
          id: 'step-3',
          name: 'Vehicle Presentation',
          description: 'Present selected vehicles and highlight features',
          requiredScripts: 'Feature walkthrough, benefits, specifications',
          expectedDuration: 10,
          isRequired: true,
          validationRules: {
            keywords: ['feature', 'includes', 'equipped', 'technology'],
            minDuration: 7,
          },
          order: 2,
        },
        {
          id: 'step-4',
          name: 'Trade-In Discussion',
          description: 'Discuss trade-in vehicle if applicable',
          requiredScripts: 'Trade-in questions, value estimation',
          expectedDuration: 5,
          isRequired: false,
          validationRules: {
            keywords: ['trade-in', 'current vehicle', 'value'],
            minDuration: 3,
          },
          order: 3,
        },
        {
          id: 'step-5',
          name: 'Test Drive Scheduling',
          description: 'Schedule test drive appointment',
          requiredScripts: 'Test drive invitation, scheduling, preparation',
          expectedDuration: 4,
          isRequired: true,
          validationRules: {
            keywords: ['test drive', 'schedule', 'appointment', 'drive'],
            minDuration: 2,
          },
          order: 4,
        },
      ],
      successCriteria: {
        scoreThreshold: 75,
        requiredStepsPercentage: 85,
        keyPerformanceIndicators: [
          'Vehicle preferences identified',
          'Test drive scheduled',
          'Trade-in information collected',
          'Follow-up plan established',
        ],
      },
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-18'),
      stats: {
        id: 'stats-8',
        templateId: 'template-8',
        usageCount: 203,
        successRate: 77,
        averageScore: 79.6,
      },
      isDefault: false,
      isArchived: false,
    },
  ]
}

// Simple Modal Component
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const Modal = ({ isOpen, onClose, title, children, size = 'xl' }: ModalProps) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-7xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        {/* Modal Content */}
        <div
          className={`relative bg-white rounded-3xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

// Template Preview Sidebar Component
interface TemplatePreviewProps {
  template: ProcessTemplateWithStats
  onClose: () => void
}

const TemplatePreview = ({ template, onClose }: TemplatePreviewProps) => {
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-40 overflow-y-auto border-l border-gray-200">
      <div className="sticky top-0 bg-gradient-to-r from-brand-cyan to-brand-blue text-white p-6 z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold">Template Preview</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-cyan-50">Quick overview of template details</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Template Info */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h4>
          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
              {template.industry}
            </span>
            {template.isDefault && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <Star size={12} />
                Default
              </span>
            )}
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                template.isActive
                  ? 'bg-success-100 text-success-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {template.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-3 rounded-xl border border-cyan-200">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-brand-cyan" />
              <span className="text-xs text-gray-600 font-medium">Usage</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{template.stats.usageCount}</div>
            <div className="text-xs text-gray-500">conversations</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-brand-purple" />
              <span className="text-xs text-gray-600 font-medium">Success</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{template.stats.successRate}%</div>
            <div className="text-xs text-gray-500">success rate</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={16} className="text-success-600" />
              <span className="text-xs text-gray-600 font-medium">Avg Score</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{template.stats.averageScore}</div>
            <div className="text-xs text-gray-500">out of 100</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-3 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Layers size={16} className="text-brand-orange" />
              <span className="text-xs text-gray-600 font-medium">Steps</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{template.steps.length}</div>
            <div className="text-xs text-gray-500">process steps</div>
          </div>
        </div>

        {/* Process Steps */}
        <div>
          <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Settings size={16} className="text-primary-600" />
            Process Steps ({template.steps.length})
          </h5>
          <div className="space-y-2">
            {template.steps.map((step, index) => (
              <div key={step.id} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="flex items-start gap-2">
                  <div className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold text-xs flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h6 className="font-medium text-gray-900 text-sm truncate">{step.name}</h6>
                      {step.isRequired && (
                        <span className="text-xs bg-error-100 text-error-700 px-2 py-0.5 rounded flex-shrink-0">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{step.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {step.expectedDuration}m
                      </span>
                      {step.validationRules.keywords.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Target size={12} />
                          {step.validationRules.keywords.length} keywords
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Criteria */}
        <div>
          <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Award size={16} className="text-brand-orange" />
            Success Criteria
          </h5>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Score Threshold</span>
              <span className="font-semibold text-gray-900">
                {template.successCriteria.scoreThreshold}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Required Steps</span>
              <span className="font-semibold text-gray-900">
                {template.successCriteria.requiredStepsPercentage}%
              </span>
            </div>
            {template.successCriteria.keyPerformanceIndicators.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 font-medium mb-2 block">KPIs</span>
                <ul className="space-y-1">
                  {template.successCriteria.keyPerformanceIndicators.map((kpi, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <CheckCircle size={12} className="text-success-600 mt-0.5 flex-shrink-0" />
                      <span>{kpi}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>
                Created: {template.createdAt?.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>
                Last Updated: {template.updatedAt?.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function ProcessTemplatesPage() {
  const [templates, setTemplates] = useState<ProcessTemplateWithStats[]>(generateMockTemplates())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [previewTemplate, setPreviewTemplate] = useState<ProcessTemplateWithStats | null>(null)
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Filtered and searched templates
  const filteredTemplates = templates.filter((template) => {
    // Filter by status
    if (filterType === 'active' && (!template.isActive || template.isArchived)) return false
    if (filterType === 'archived' && !template.isArchived) return false

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.industry.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Handlers
  const handleCreateTemplate = () => {
    setSelectedTemplate(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditTemplate = (template: ProcessTemplateWithStats) => {
    setSelectedTemplate(template)
    setModalMode('edit')
    setIsModalOpen(true)
    setOpenMenuId(null)
  }

  const handleDuplicateTemplate = (template: ProcessTemplateWithStats) => {
    const duplicated: ProcessTemplateWithStats = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        ...template.stats,
        id: `stats-${Date.now()}`,
        templateId: `template-${Date.now()}`,
        usageCount: 0,
      },
    }
    setTemplates([duplicated, ...templates])
    setOpenMenuId(null)
  }

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (
      template &&
      confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)
    ) {
      setTemplates(templates.filter((t) => t.id !== templateId))
      setOpenMenuId(null)
    }
  }

  const handleSetAsDefault = (templateId: string) => {
    setTemplates(
      templates.map((t) => ({
        ...t,
        isDefault: t.id === templateId,
      }))
    )
    setOpenMenuId(null)
  }

  const handleSaveTemplate = (template: ProcessTemplate, isDraft: boolean) => {
    if (modalMode === 'create') {
      const newTemplate: ProcessTemplateWithStats = {
        ...template,
        id: `template-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          id: `stats-${Date.now()}`,
          templateId: `template-${Date.now()}`,
          usageCount: 0,
          successRate: 0,
          averageScore: 0,
        },
        isDefault: false,
        isArchived: false,
      }
      setTemplates([newTemplate, ...templates])
    } else {
      setTemplates(
        templates.map((t) =>
          t.id === template.id
            ? {
                ...t,
                ...template,
                updatedAt: new Date(),
              }
            : t
        )
      )
    }
    setIsModalOpen(false)
  }

  const handleViewPreview = (template: ProcessTemplateWithStats) => {
    setPreviewTemplate(template)
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 85) return 'text-success-700 bg-success-100'
    if (rate >= 70) return 'text-warning-700 bg-warning-100'
    return 'text-error-700 bg-error-100'
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent">
                Process Templates
              </h1>
              <p className="text-gray-600">
                Create and manage sales process templates to standardize your team's approach
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleCreateTemplate}
              className="bg-gradient-to-r from-brand-cyan to-brand-blue hover:from-brand-cyan/90 hover:to-brand-blue/90"
            >
              <Plus size={20} />
              Create Template
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card variant="elevated" rounded="2xl" className="hover:shadow-xl transition-shadow">
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Total Templates</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {templates.filter((t) => !t.isArchived).length}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card variant="elevated" rounded="2xl" className="hover:shadow-xl transition-shadow">
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-success-500 to-success-600">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Active Templates</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {templates.filter((t) => t.isActive && !t.isArchived).length}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card variant="elevated" rounded="2xl" className="hover:shadow-xl transition-shadow">
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Total Usage</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {templates.reduce((sum, t) => sum + t.stats.usageCount, 0)}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card variant="elevated" rounded="2xl" className="hover:shadow-xl transition-shadow">
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Avg Success Rate</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(
                        templates.reduce((sum, t) => sum + t.stats.successRate, 0) / templates.length
                      )}
                      %
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card variant="elevated" rounded="2xl">
            <CardBody>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search */}
                <div className="flex-1">
                  <Input
                    leftIcon={<Search size={20} />}
                    placeholder="Search templates by name, description, or industry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filterType === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Templates
                  </button>
                  <button
                    onClick={() => setFilterType('active')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filterType === 'active'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilterType('archived')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filterType === 'archived'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Archived
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredTemplates.length === 0 ? (
            <Card variant="elevated" rounded="3xl" className="col-span-2">
              <CardBody className="text-center py-16">
                <FileText size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : filterType === 'archived'
                    ? 'No archived templates yet'
                    : 'Create your first process template to get started'}
                </p>
                {!searchQuery && filterType !== 'archived' && (
                  <Button variant="primary" size="lg" onClick={handleCreateTemplate}>
                    <Plus size={20} />
                    Create Your First Template
                  </Button>
                )}
              </CardBody>
            </Card>
          ) : (
            filteredTemplates.map((template) => (
              <Card
                key={template.id}
                variant="elevated"
                rounded="2xl"
                className="hover:shadow-2xl transition-all cursor-pointer group"
                onMouseEnter={() => setHoveredTemplateId(template.id)}
                onMouseLeave={() => setHoveredTemplateId(null)}
              >
                <CardBody>
                  {/* Template Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                        {template.isDefault && (
                          <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                            <Star size={12} />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                          {template.industry}
                        </span>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            template.isActive
                              ? 'bg-success-100 text-success-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                          {template.steps.length} Steps
                        </span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === template.id ? null : template.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={20} className="text-gray-600" />
                      </button>

                      {openMenuId === template.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
                            <button
                              onClick={() => handleEditTemplate(template)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit3 size={16} />
                              Edit Template
                            </button>
                            <button
                              onClick={() => handleDuplicateTemplate(template)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Copy size={16} />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleSetAsDefault(template.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              {template.isDefault ? (
                                <>
                                  <StarOff size={16} />
                                  Remove Default
                                </>
                              ) : (
                                <>
                                  <Star size={16} />
                                  Set as Default
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleViewPreview(template)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye size={16} />
                              View Preview
                            </button>
                            <div className="border-t border-gray-200 my-2" />
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-error-50 flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-3 rounded-xl border border-cyan-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Users size={14} className="text-brand-cyan" />
                        <span className="text-xs text-gray-600 font-medium">Usage</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {template.stats.usageCount}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={14} className="text-brand-purple" />
                        <span className="text-xs text-gray-600 font-medium">Success</span>
                      </div>
                      <div
                        className={`text-lg font-bold ${getSuccessRateColor(
                          template.stats.successRate
                        )}`}
                      >
                        {template.stats.successRate}%
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 size={14} className="text-success-600" />
                        <span className="text-xs text-gray-600 font-medium">Score</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {template.stats.averageScore}
                      </div>
                    </div>
                  </div>

                  {/* Steps Preview */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-600 font-medium mb-2 flex items-center gap-2">
                      <Settings size={14} />
                      Process Steps
                    </div>
                    <div className="space-y-1.5">
                      {template.steps.slice(0, 3).map((step, index) => (
                        <div
                          key={step.id}
                          className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded-lg"
                        >
                          <div className="bg-primary-100 text-primary-700 rounded-full w-5 h-5 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-gray-700 truncate flex-1">{step.name}</span>
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {step.expectedDuration}m
                          </span>
                        </div>
                      ))}
                      {template.steps.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{template.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      className="flex-1"
                    >
                      <Edit3 size={16} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPreview(template)}
                      className="flex-1"
                    >
                      <Eye size={16} />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                      className="flex-1"
                    >
                      <Copy size={16} />
                      Copy
                    </Button>
                  </div>

                  {/* Last Updated */}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Updated {template.updatedAt?.toLocaleDateString()}
                    </span>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Template' : 'Edit Template'}
        size="full"
      >
        <ProcessTemplateForm
          initialTemplate={selectedTemplate || undefined}
          onSave={handleSaveTemplate}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Preview Sidebar */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </PageLayout>
  )
}

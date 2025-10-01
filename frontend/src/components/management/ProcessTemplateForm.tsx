import { useState } from 'react'
import Card, { CardHeader, CardBody, CardFooter } from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle,
  AlertCircle,
  Save,
  ChevronUp,
  ChevronDown,
  Eye,
  FileText,
  Award,
  Settings,
  Target,
} from 'lucide-react'

// TypeScript types
export interface ProcessStep {
  id: string
  name: string
  description: string
  requiredScripts: string
  expectedDuration: number // in minutes
  isRequired: boolean
  validationRules: {
    keywords: string[]
    minDuration: number
  }
  order: number
}

export interface SuccessCriteria {
  scoreThreshold: number
  requiredStepsPercentage: number
  keyPerformanceIndicators: string[]
}

export interface ProcessTemplate {
  id?: string
  name: string
  description: string
  industry: string
  isActive: boolean
  steps: ProcessStep[]
  successCriteria: SuccessCriteria
  createdAt?: Date
  updatedAt?: Date
}

interface ProcessTemplateFormProps {
  initialTemplate?: ProcessTemplate
  onSave?: (template: ProcessTemplate, isDraft: boolean) => void
  onCancel?: () => void
}

const INDUSTRIES = [
  'General',
  'Real Estate',
  'Insurance',
  'Financial Services',
  'Retail',
  'Healthcare',
  'Technology',
  'Automotive',
  'Home Services',
  'Other',
]

export default function ProcessTemplateForm({
  initialTemplate,
  onSave,
  onCancel,
}: ProcessTemplateFormProps) {
  // Form state
  const [template, setTemplate] = useState<ProcessTemplate>(
    initialTemplate || {
      name: '',
      description: '',
      industry: 'General',
      isActive: true,
      steps: [],
      successCriteria: {
        scoreThreshold: 70,
        requiredStepsPercentage: 80,
        keyPerformanceIndicators: [],
      },
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [newKPI, setNewKPI] = useState('')

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!template.name.trim()) {
      newErrors.name = 'Template name is required'
    }

    if (template.steps.length === 0) {
      newErrors.steps = 'At least one process step is required'
    }

    template.steps.forEach((step, index) => {
      if (!step.name.trim()) {
        newErrors[`step_${index}_name`] = 'Step name is required'
      }
      if (step.expectedDuration <= 0) {
        newErrors[`step_${index}_duration`] = 'Duration must be greater than 0'
      }
    })

    if (template.successCriteria.scoreThreshold < 0 || template.successCriteria.scoreThreshold > 100) {
      newErrors.scoreThreshold = 'Score threshold must be between 0 and 100'
    }

    if (template.successCriteria.requiredStepsPercentage < 0 || template.successCriteria.requiredStepsPercentage > 100) {
      newErrors.requiredStepsPercentage = 'Percentage must be between 0 and 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Template handlers
  const handleTemplateChange = (field: keyof ProcessTemplate, value: any) => {
    setTemplate({ ...template, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  // Step handlers
  const addStep = () => {
    const newStep: ProcessStep = {
      id: `step-${Date.now()}`,
      name: '',
      description: '',
      requiredScripts: '',
      expectedDuration: 5,
      isRequired: false,
      validationRules: {
        keywords: [],
        minDuration: 0,
      },
      order: template.steps.length,
    }
    setTemplate({ ...template, steps: [...template.steps, newStep] })
  }

  const removeStep = (stepId: string) => {
    const updatedSteps = template.steps
      .filter((step) => step.id !== stepId)
      .map((step, index) => ({ ...step, order: index }))
    setTemplate({ ...template, steps: updatedSteps })
  }

  const updateStep = (stepId: string, field: keyof ProcessStep, value: any) => {
    const updatedSteps = template.steps.map((step) =>
      step.id === stepId ? { ...step, [field]: value } : step
    )
    setTemplate({ ...template, steps: updatedSteps })

    // Clear related errors
    const stepIndex = template.steps.findIndex(s => s.id === stepId)
    if (stepIndex !== -1) {
      const errorKey = `step_${stepIndex}_${field}`
      if (errors[errorKey]) {
        setErrors({ ...errors, [errorKey]: '' })
      }
    }
  }

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const index = template.steps.findIndex((step) => step.id === stepId)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === template.steps.length - 1)
    ) {
      return
    }

    const updatedSteps = [...template.steps]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[updatedSteps[index], updatedSteps[targetIndex]] = [
      updatedSteps[targetIndex],
      updatedSteps[index],
    ]

    const reorderedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      order: idx,
    }))
    setTemplate({ ...template, steps: reorderedSteps })
  }

  const addKeywordToStep = (stepId: string, keyword: string) => {
    if (!keyword.trim()) return

    const updatedSteps = template.steps.map((step) =>
      step.id === stepId
        ? {
            ...step,
            validationRules: {
              ...step.validationRules,
              keywords: [...step.validationRules.keywords, keyword.trim()],
            },
          }
        : step
    )
    setTemplate({ ...template, steps: updatedSteps })
  }

  const removeKeywordFromStep = (stepId: string, keyword: string) => {
    const updatedSteps = template.steps.map((step) =>
      step.id === stepId
        ? {
            ...step,
            validationRules: {
              ...step.validationRules,
              keywords: step.validationRules.keywords.filter((k) => k !== keyword),
            },
          }
        : step
    )
    setTemplate({ ...template, steps: updatedSteps })
  }

  // Success criteria handlers
  const addKPI = () => {
    if (!newKPI.trim()) return

    setTemplate({
      ...template,
      successCriteria: {
        ...template.successCriteria,
        keyPerformanceIndicators: [
          ...template.successCriteria.keyPerformanceIndicators,
          newKPI.trim(),
        ],
      },
    })
    setNewKPI('')
  }

  const removeKPI = (kpi: string) => {
    setTemplate({
      ...template,
      successCriteria: {
        ...template.successCriteria,
        keyPerformanceIndicators: template.successCriteria.keyPerformanceIndicators.filter(
          (k) => k !== kpi
        ),
      },
    })
  }

  // Form submission
  const handleSave = (isDraft: boolean) => {
    if (!validateForm()) {
      return
    }

    const templateToSave = {
      ...template,
      updatedAt: new Date(),
      createdAt: template.createdAt || new Date(),
    }

    onSave?.(templateToSave, isDraft)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the form? All changes will be lost.')) {
      setTemplate(
        initialTemplate || {
          name: '',
          description: '',
          industry: 'General',
          isActive: true,
          steps: [],
          successCriteria: {
            scoreThreshold: 70,
            requiredStepsPercentage: 80,
            keyPerformanceIndicators: [],
          },
        }
      )
      setErrors({})
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <Card variant="elevated">
        <CardHeader
          title="Process Template Builder"
          subtitle="Create and customize sales process templates for your team"
        />
      </Card>

      {/* Basic Information */}
      <Card variant="elevated">
        <CardHeader title="Basic Information" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Template Name"
              placeholder="e.g., Standard Sales Process"
              value={template.name}
              onChange={(e) => handleTemplateChange('name', e.target.value)}
              error={errors.name}
              fullWidth
              required
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry/Category
              </label>
              <select
                className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                value={template.industry}
                onChange={(e) => handleTemplateChange('industry', e.target.value)}
              >
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 min-h-[100px]"
              placeholder="Describe the purpose and use case for this template..."
              value={template.description}
              onChange={(e) => handleTemplateChange('description', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleTemplateChange('isActive', !template.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                template.isActive ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  template.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <label className="text-sm font-medium text-gray-700">
              {template.isActive ? 'Active' : 'Inactive'}
            </label>
          </div>
        </CardBody>
      </Card>

      {/* Process Steps Builder */}
      <Card variant="elevated">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Settings className="text-primary-600" size={20} />
              <span>Process Steps</span>
            </div>
          }
          subtitle="Define the steps in your sales process"
          action={
            <Button variant="primary" size="sm" onClick={addStep}>
              <Plus size={16} />
              Add Step
            </Button>
          }
        />
        <CardBody className="space-y-4">
          {errors.steps && (
            <div className="flex items-center gap-2 text-error-600 bg-error-50 px-4 py-3 rounded-xl">
              <AlertCircle size={20} />
              <span className="text-sm">{errors.steps}</span>
            </div>
          )}

          {template.steps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">No steps added yet</p>
              <p className="text-sm">Click "Add Step" to create your first process step</p>
            </div>
          ) : (
            <div className="space-y-4">
              {template.steps.map((step, index) => (
                <Card key={step.id} variant="bordered" className="bg-gray-50">
                  <CardBody className="space-y-4">
                    {/* Step Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveStep(step.id, 'up')}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            onClick={() => moveStep(step.id, 'down')}
                            disabled={index === template.steps.length - 1}
                            className="text-gray-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                        <GripVertical className="text-gray-400" size={20} />
                        <div className="bg-primary-100 text-primary-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Step name"
                            value={step.name}
                            onChange={(e) => updateStep(step.id, 'name', e.target.value)}
                            error={errors[`step_${index}_name`]}
                            fullWidth
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                      >
                        <Trash2 size={16} className="text-error-600" />
                      </Button>
                    </div>

                    {/* Step Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                          placeholder="Describe what happens in this step..."
                          value={step.description}
                          onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Required Scripts/Questions
                        </label>
                        <textarea
                          className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                          placeholder="Enter key questions or talking points..."
                          value={step.requiredScripts}
                          onChange={(e) =>
                            updateStep(step.id, 'requiredScripts', e.target.value)
                          }
                          rows={3}
                        />
                      </div>

                      <div className="space-y-4">
                        <Input
                          label="Expected Duration (minutes)"
                          type="number"
                          min="1"
                          value={step.expectedDuration}
                          onChange={(e) =>
                            updateStep(step.id, 'expectedDuration', parseInt(e.target.value) || 0)
                          }
                          error={errors[`step_${index}_duration`]}
                          fullWidth
                        />

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateStep(step.id, 'isRequired', !step.isRequired)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              step.isRequired ? 'bg-primary-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                step.isRequired ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <label className="text-sm font-medium text-gray-700">
                            Required Step
                          </label>
                        </div>
                      </div>

                      {/* Validation Rules */}
                      <div className="col-span-2 bg-white p-4 rounded-xl border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <CheckCircle size={16} className="text-primary-600" />
                          Validation Rules
                        </h4>

                        <div className="space-y-3">
                          <Input
                            label="Minimum Duration (minutes)"
                            type="number"
                            min="0"
                            value={step.validationRules.minDuration}
                            onChange={(e) =>
                              updateStep(step.id, 'validationRules', {
                                ...step.validationRules,
                                minDuration: parseInt(e.target.value) || 0,
                              })
                            }
                            fullWidth
                            helperText="Minimum time required to complete this step"
                          />

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Detection Keywords
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                className="flex-1 px-4 py-2.5 text-base border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                                placeholder="Add keyword or phrase..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addKeywordToStep(step.id, (e.target as HTMLInputElement).value)
                                    ;(e.target as HTMLInputElement).value = ''
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="md"
                                onClick={(e) => {
                                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement)
                                  addKeywordToStep(step.id, input.value)
                                  input.value = ''
                                }}
                              >
                                <Plus size={16} />
                              </Button>
                            </div>
                            {step.validationRules.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {step.validationRules.keywords.map((keyword) => (
                                  <span
                                    key={keyword}
                                    className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                                  >
                                    {keyword}
                                    <button
                                      onClick={() => removeKeywordFromStep(step.id, keyword)}
                                      className="hover:text-primary-900"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Success Criteria */}
      <Card variant="elevated">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Target className="text-brand-purple" size={20} />
              <span>Success Criteria</span>
            </div>
          }
          subtitle="Define what makes a successful process completion"
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Overall Score Threshold (%)"
              type="number"
              min="0"
              max="100"
              value={template.successCriteria.scoreThreshold}
              onChange={(e) =>
                setTemplate({
                  ...template,
                  successCriteria: {
                    ...template.successCriteria,
                    scoreThreshold: parseInt(e.target.value) || 0,
                  },
                })
              }
              error={errors.scoreThreshold}
              fullWidth
              helperText="Minimum score required for a successful process"
            />

            <Input
              label="Required Steps Completion (%)"
              type="number"
              min="0"
              max="100"
              value={template.successCriteria.requiredStepsPercentage}
              onChange={(e) =>
                setTemplate({
                  ...template,
                  successCriteria: {
                    ...template.successCriteria,
                    requiredStepsPercentage: parseInt(e.target.value) || 0,
                  },
                })
              }
              error={errors.requiredStepsPercentage}
              fullWidth
              helperText="Percentage of required steps that must be completed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Award size={16} className="text-brand-orange" />
              Key Performance Indicators
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2.5 text-base border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                placeholder="e.g., Customer engagement score"
                value={newKPI}
                onChange={(e) => setNewKPI(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addKPI()
                  }
                }}
              />
              <Button variant="primary" size="md" onClick={addKPI}>
                <Plus size={16} />
                Add KPI
              </Button>
            </div>
            {template.successCriteria.keyPerformanceIndicators.length > 0 && (
              <div className="mt-3 space-y-2">
                {template.successCriteria.keyPerformanceIndicators.map((kpi, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200"
                  >
                    <span className="text-sm text-gray-700">{kpi}</span>
                    <button
                      onClick={() => removeKPI(kpi)}
                      className="text-error-600 hover:text-error-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Preview Section */}
      <Card variant="elevated">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Eye className="text-brand-blue" size={20} />
              <span>Template Preview</span>
            </div>
          }
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          }
        />
        {showPreview && (
          <CardBody className="bg-gray-50 rounded-xl">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{template.name || 'Untitled Template'}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description || 'No description'}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                    {template.industry}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    template.isActive
                      ? 'bg-success-100 text-success-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {template.steps.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Process Steps ({template.steps.length})</h4>
                  <div className="space-y-2">
                    {template.steps.map((step, index) => (
                      <div key={step.id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-gray-900 text-sm">{step.name || 'Unnamed Step'}</h5>
                              {step.isRequired && (
                                <span className="text-xs bg-error-100 text-error-700 px-2 py-0.5 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span>Duration: {step.expectedDuration} min</span>
                              {step.validationRules.keywords.length > 0 && (
                                <span>Keywords: {step.validationRules.keywords.length}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-300 pt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Success Criteria</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-gray-600">Score Threshold</p>
                    <p className="text-lg font-semibold text-gray-900">{template.successCriteria.scoreThreshold}%</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-gray-600">Required Steps</p>
                    <p className="text-lg font-semibold text-gray-900">{template.successCriteria.requiredStepsPercentage}%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        )}
      </Card>

      {/* Action Buttons */}
      <Card variant="elevated">
        <CardFooter>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="ghost"
              size="lg"
              onClick={onCancel || handleReset}
              className="flex-1 sm:flex-initial"
            >
              {onCancel ? 'Cancel' : 'Reset'}
            </Button>
            <div className="flex gap-3 flex-1 sm:ml-auto">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleSave(true)}
                className="flex-1"
              >
                <Save size={20} />
                Save as Draft
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleSave(false)}
                className="flex-1"
              >
                <CheckCircle size={20} />
                Publish Template
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

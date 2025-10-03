import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Building2, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const { signup } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true)
      setApiError(null)

      await signup({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })
    } catch (error) {
      setApiError('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-purple to-brand-pink text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-brand-purple" />
            </div>
            <span className="text-3xl font-bold">FieldLink v5</span>
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Start Your Free 14-Day Trial
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Join thousands of field service businesses using AI to improve customer conversations.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold mb-1">No credit card required</h3>
                <p className="text-white/70 text-sm">Start with our full feature set completely free</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold mb-1">5-minute setup</h3>
                <p className="text-white/70 text-sm">Get up and running in minutes, not days</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold mb-1">Dedicated support</h3>
                <p className="text-white/70 text-sm">Our team is here to help you succeed</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-white/60">
          <p>© 2025 FieldLink. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-6 lg:hidden">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-pink rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">FieldLink v5</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Start transforming your customer conversations</p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error-700">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      type="text"
                      placeholder="John"
                      leftIcon={<User className="w-5 h-5" />}
                      error={errors.firstName?.message}
                      fullWidth
                      {...register('firstName')}
                    />

                    <Input
                      label="Last Name"
                      type="text"
                      placeholder="Doe"
                      leftIcon={<User className="w-5 h-5" />}
                      error={errors.lastName?.message}
                      fullWidth
                      {...register('lastName')}
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@company.com"
                    leftIcon={<Mail className="w-5 h-5" />}
                    error={errors.email?.message}
                    fullWidth
                    {...register('email')}
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="Min. 8 characters"
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={errors.password?.message}
                    helperText="Must contain uppercase, number"
                    fullWidth
                    {...register('password')}
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter password"
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={errors.confirmPassword?.message}
                    fullWidth
                    {...register('confirmPassword')}
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                    {...register('agreeToTerms')}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1.5 text-sm text-error-600">{errors.agreeToTerms.message}</p>
                )}
              </div>

              <Button type="submit" variant="primary" size="lg" loading={isLoading} fullWidth>
                Create Account
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/" className="font-medium text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

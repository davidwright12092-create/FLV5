import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Shield, Mail, Lock, AlertCircle, Zap } from 'lucide-react'
import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, bypassAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setApiError(null)

      // Call the actual login function from AuthContext
      await login(data.email, data.password)

      // Navigation happens inside login() function
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-cyan to-brand-blue text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-brand-cyan" />
            </div>
            <span className="text-3xl font-bold">FieldLink v5</span>
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            AI-Powered Conversation Intelligence for Field Services
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Transform customer conversations into actionable insights with enterprise-grade AI analysis.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold mb-1">Real-Time Transcription</h3>
                <p className="text-white/70 text-sm">Accurate speech-to-text powered by Google Cloud</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold mb-1">AI Analysis</h3>
                <p className="text-white/70 text-sm">Advanced insights using OpenAI GPT-4</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold mb-1">Enterprise Security</h3>
                <p className="text-white/70 text-sm">Bank-level encryption and compliance</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-white/60">
          <p>© 2025 FieldLink. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-6 lg:hidden">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">FieldLink v5</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your account to continue</p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error-700">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                placeholder="Enter your password"
                leftIcon={<Lock className="w-5 h-5" />}
                error={errors.password?.message}
                fullWidth
                {...register('password')}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    {...register('rememberMe')}
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="primary" size="lg" loading={isLoading} fullWidth>
                Sign In
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Development</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={bypassAuth}
                className="border-2 border-brand-cyan text-brand-cyan hover:bg-brand-cyan/5"
              >
                <Zap className="w-5 h-5 mr-2" />
                Skip Login (Dev Mode)
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Secure Login</span>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

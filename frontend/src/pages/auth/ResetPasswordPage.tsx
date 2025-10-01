import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Building2, Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true)
      setApiError(null)

      if (!token) {
        setApiError('Invalid or expired reset token. Please request a new password reset.')
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // TODO: Replace with actual API call
      console.log('Reset password with token:', token)
      console.log('New password:', data.password)

      setIsSuccess(true)
    } catch (error) {
      setApiError('Failed to reset password. Please try again or request a new reset link.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-success-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successfully</h2>
            <p className="text-gray-600 mb-6">
              Your password has been updated. You can now sign in with your new password.
            </p>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-orange to-brand-pink text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-brand-orange" />
            </div>
            <span className="text-3xl font-bold">FieldLink v5</span>
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Create a New Password
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Choose a strong password to keep your account secure.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold mb-1">Strong & Secure</h3>
                <p className="text-white/70 text-sm">Use at least 8 characters with uppercase and numbers</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold mb-1">Encrypted Storage</h3>
                <p className="text-white/70 text-sm">Your password is encrypted with industry-standard security</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold mb-1">Instant Access</h3>
                <p className="text-white/70 text-sm">Login immediately after resetting your password</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-white/60">
          <p>© 2025 FieldLink. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-6 lg:hidden">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-orange to-brand-pink rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">FieldLink v5</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h2>
              <p className="text-gray-600">Enter your new password below</p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error-700">{apiError}</p>
              </div>
            )}

            {!token && (
              <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-warning-700">
                  No reset token found. Please use the link from your email.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="New Password"
                type="password"
                placeholder="Min. 8 characters"
                leftIcon={<Lock className="w-5 h-5" />}
                error={errors.password?.message}
                helperText="Must contain uppercase, number"
                fullWidth
                {...register('password')}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter password"
                leftIcon={<Lock className="w-5 h-5" />}
                error={errors.confirmPassword?.message}
                fullWidth
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                fullWidth
                disabled={!token}
              >
                Reset Password
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/" className="font-medium text-primary-600 hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error
    const hasSuccess = !!success

    const containerWidth = fullWidth ? 'w-full' : ''

    const baseInputStyles = 'px-4 py-2.5 text-base border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100'

    const stateStyles = hasError
      ? 'border-error-500 focus:border-error-500 focus:ring-error-200'
      : hasSuccess
      ? 'border-success-500 focus:border-success-500 focus:ring-success-200'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'

    const paddingStyles = leftIcon ? 'pl-11' : rightIcon ? 'pr-11' : ''

    return (
      <div className={containerWidth}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`${baseInputStyles} ${stateStyles} ${paddingStyles} ${className}`}
            disabled={disabled}
            {...props}
          />

          {rightIcon && !hasError && !hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}

          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error-500">
              <AlertCircle size={20} />
            </div>
          )}

          {hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500">
              <CheckCircle2 size={20} />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-1.5 text-sm text-success-600 flex items-center gap-1">
            {success}
          </p>
        )}

        {helperText && !error && !success && (
          <p className="mt-1.5 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

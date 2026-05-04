import { type InputHTMLAttributes, type SelectHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-text-2">{label}</label>}
      <input ref={ref} className={`input ${error ? 'border-status-error' : ''} ${className}`} {...props} />
      {error && <span className="text-xs text-status-error">{error}</span>}
    </div>
  )
)

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ label, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-text-2">{label}</label>}
      <select className={`input ${className}`} {...props}>{children}</select>
    </div>
  )
}

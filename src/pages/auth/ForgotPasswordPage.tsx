import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/ui/Button'

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuthStore()

  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await forgotPassword(email)
    setLoading(false)
    if (err) { setError(err); return }
    setSent(true)
  }

  return (
    <AuthLayout>
      {sent ? (
        // Success state
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="w-14 h-14 rounded-full bg-status-successBg flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-status-success" />
          </div>
          <div>
            <h2 className="font-display text-lg text-text-1 mb-1">Check your email</h2>
            <p className="text-xs text-text-2">
              We sent a password reset link to{' '}
              <span className="font-medium text-text-1">{email}</span>.
              Check your inbox and follow the instructions.
            </p>
          </div>
          <p className="text-xs text-text-3">
            Didn't receive it?{' '}
            <button
              onClick={() => setSent(false)}
              className="text-accent hover:underline bg-transparent border-none cursor-pointer"
            >
              Try again
            </button>
          </p>
          <Link to="/login" className="text-xs text-accent hover:underline mt-1">
            Back to sign in
          </Link>
        </div>
      ) : (
        // Form state
        <>
          <div className="mb-6">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs text-text-2 hover:text-text-1 mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
            <h1 className="font-display text-xl text-text-1 mb-1">Forgot password?</h1>
            <p className="text-xs text-text-2">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-2">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <p className="text-xs text-status-error bg-status-errorBg border border-status-error/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Send Reset Link
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  )
}
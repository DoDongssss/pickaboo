import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
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

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-5 text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-100
          flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-2">
            Check your email
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            We sent a reset link to{' '}
            <span className="font-semibold text-gray-700">{email}</span>.
            <br />Follow the instructions in the email.
          </p>
        </div>
        <p className="text-xs text-gray-400">
          Didn't receive it?{' '}
          <button
            onClick={() => setSent(false)}
            className="text-[#F24E1E] hover:underline font-medium
              bg-transparent border-none cursor-pointer"
          >
            Try again
          </button>
        </p>
        <Link
          to="/auth/login"
          className="flex items-center gap-1.5 text-sm text-gray-500
            hover:text-gray-700 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Back link */}
      <Link
        to="/auth/login"
        className="flex items-center gap-1.5 text-sm text-gray-500
          hover:text-gray-700 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>

      {/* Heading */}
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
          Forgot password?
        </h2>
        <p className="text-sm text-gray-500">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2
              w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              className="input pl-9"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-600
            bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <span className="mt-0.5 flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold"
        >
          Send Reset Link
        </Button>
      </form>
    </div>
  )
}
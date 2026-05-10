import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export function ResetPasswordPage() {
  const navigate   = useNavigate()

  const [password,  setPassword]  = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)

  /**
   * When Supabase is connected, replace this with:
   *   const { error } = await supabase.auth.updateUser({ password })
   * Supabase handles token validation from the URL automatically.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPw) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setDone(true)
  }

  if (done) {
    return (
      <>
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="w-14 h-14 rounded-full bg-status-successBg flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-status-success" />
          </div>
          <div>
            <h2 className="font-display text-xl text-text-1 mb-1">Password updated!</h2>
            <p className="text-xs text-text-2">Your password has been changed successfully.</p>
          </div>
          <Button onClick={() => navigate('/auth/login')} className="w-full">
            Back to Sign In
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-xl text-text-1 mb-1">Set new password</h1>
        <p className="text-xs text-text-2">Enter a new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* New password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-2">New Password</label>
          <div className="relative">
            <input
              className="input pr-10"
              type={showPw ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-2">Confirm New Password</label>
          <input
            className="input"
            type={showPw ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        {/* Password strength hint */}
        {password.length > 0 && (
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  password.length >= i * 3
                    ? password.length >= 12 ? 'bg-status-success'
                    : password.length >= 8  ? 'bg-status-warning'
                    :                         'bg-status-error'
                    : 'bg-border'
                }`}
              />
            ))}
            <span className="text-[10px] text-text-3 ml-1">
              {password.length < 8 ? 'Too short' : password.length < 12 ? 'OK' : 'Strong'}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-status-error bg-status-errorBg border border-status-error/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full mt-1">
          Update Password
        </Button>
      </form>
    </>
  )
}
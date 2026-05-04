import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import type { User } from '../../types'
import { useAuthStore } from '../../store/authStore'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/ui/Button'

const SKILL_OPTIONS: { value: User['skill_level']; label: string; desc: string }[] = [
  { value: 'beginner',     label: 'Beginner',     desc: 'New to pickleball'          },
  { value: 'intermediate', label: 'Intermediate', desc: 'Play regularly'              },
  { value: 'advanced',     label: 'Advanced',     desc: 'Competitive / tournament'   },
]

export function RegisterPage() {
  const navigate  = useNavigate()
  const { signUp } = useAuthStore()

  const [name,       setName]       = useState('')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [confirmPw,  setConfirmPw]  = useState('')
  const [skillLevel, setSkillLevel] = useState<User['skill_level']>('beginner')
  const [showPw,     setShowPw]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPw) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const err = await signUp(name, email, password, skillLevel)
    setLoading(false)

    if (err) { setError(err); return }
    navigate('/verify-email')
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h1 className="font-display text-xl text-text-1 mb-1">Create account</h1>
        <p className="text-xs text-text-2">Join the Pickleball platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-2">Full Name</label>
          <input
            className="input"
            placeholder="Juan dela Cruz"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-2">Password</label>
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
          <label className="text-xs font-medium text-text-2">Confirm Password</label>
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

        {/* Skill level */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-2">Skill Level</label>
          <div className="grid grid-cols-3 gap-2">
            {SKILL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSkillLevel(opt.value)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer
                  ${skillLevel === opt.value
                    ? 'border-accent bg-accent-soft'
                    : 'border-border bg-bg-surface hover:border-border-strong'}`}
              >
                <p className={`text-xs font-medium ${skillLevel === opt.value ? 'text-accent' : 'text-text-1'}`}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-text-3 mt-0.5 leading-tight">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-status-error bg-status-errorBg border border-status-error/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full mt-1">
          Create Account
        </Button>
      </form>

      <p className="text-xs text-text-2 text-center mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-accent font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
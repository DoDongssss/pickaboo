import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import type { User as UserType } from '../../types/database.types'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'

const SKILL_OPTIONS: {
  value: UserType['skill_level']
  label: string
  desc:  string
  emoji: string
}[] = [
  { value: 'beginner',     label: 'Beginner',     desc: 'New to pickleball',       emoji: '🌱' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Play regularly',           emoji: '⚡' },
  { value: 'advanced',     label: 'Advanced',     desc: 'Competitive / tournament', emoji: '🏆' },
]

export function RegisterPage() {
  const navigate   = useNavigate()
  const { signUp } = useAuthStore()

  const [name,       setName]       = useState('')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [confirmPw,  setConfirmPw]  = useState('')
  const [skillLevel, setSkillLevel] = useState<UserType['skill_level']>('beginner')
  const [showPw,     setShowPw]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPw) { setError('Passwords do not match.'); return }
    if (password.length < 8)    { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    const err = await signUp(name, email, password, skillLevel)
    setLoading(false)
    if (err) { setError(err); return }
    navigate('/auth/verify-email')
  }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Heading */}
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
          Create account
        </h2>
        <p className="text-sm text-gray-500">
          Join the Pickaboo platform and start playing.
        </p>
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3
          rounded-xl border border-gray-200 bg-white hover:bg-gray-50
          hover:border-gray-300 transition-all duration-150 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          text-sm font-medium text-gray-700 shadow-sm"
      >
        {googleLoading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent
            rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">or register with email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2
              w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              className="input pl-9"
              placeholder="Juan dela Cruz"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email */}
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

        {/* Password row — side by side on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                className="input pl-9 pr-10"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 8 chars"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                  text-gray-400 hover:text-gray-700 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Confirm
            </label>
            <input
              className="input"
              type={showPw ? 'text' : 'password'}
              placeholder="Re-enter"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Skill level */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Skill Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SKILL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSkillLevel(opt.value)}
                className={`p-2.5 rounded-xl border-2 text-left transition-all
                  cursor-pointer
                  ${skillLevel === opt.value
                    ? 'border-[#F24E1E] bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <span className="text-base block mb-0.5">{opt.emoji}</span>
                <p className={`text-xs font-semibold
                  ${skillLevel === opt.value ? 'text-[#F24E1E]' : 'text-gray-700'}`}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
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
          disabled={googleLoading}
          className="w-full py-3 rounded-xl mt-1 text-sm font-semibold"
        >
          Create Account
        </Button>
      </form>

      {/* Login link */}
      <p className="text-sm text-gray-500 text-center">
        Already have an account?{' '}
        <Link to="/auth/login"
          className="text-[#F24E1E] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
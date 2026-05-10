import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/Button'

export function LoginPage() {
  const navigate   = useNavigate()
  const { signIn } = useAuthStore()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await signIn(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    navigate('/')
  }

  return (
      <>
        <div className="mb-6">
          {/* <h1 className="text-xl font-extrabold text-text-1 mb-1">Welcome back</h1> */}
          <p className="text-xs text-text-2">Sign in to your account to continue.</p>
        </div>

        {/* Demo hint */}
        {/* <div className="bg-accent-soft border border-accent-mid rounded-lg px-3 py-2.5 mb-5">
          <p className="text-xs text-accent font-medium mb-1.5">Demo accounts · password: <span className="font-mono">password123</span></p>
          <div className="flex flex-col gap-1">
            {[
              { email: 'juan@email.com',       role: 'User'  },
              { email: 'maria@email.com',      role: 'User'  },
              { email: 'admin@pickleball.com', role: 'Admin' },
            ].map(a => (
              <button
                key={a.email}
                type="button"
                onClick={() => setEmail(a.email)}
                className="flex items-center justify-between text-xs bg-white/60 hover:bg-white transition-colors rounded px-2 py-1 cursor-pointer border-none text-left w-full"
              >
                <span className="font-mono text-text-1">{a.email}</span>
                <span className={`font-medium ${a.role === 'Admin' ? 'text-accent' : 'text-text-2'}`}>
                  {a.role}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-text-3 mt-1.5">Click an account to fill the email field.</p>
        </div> */}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-text-2">Password</label>
              <Link to="/forgot-password" className="text-xs text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                className="input pr-10"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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

          {/* Error */}
          {error && (
            <p className="text-xs text-status-error bg-status-errorBg border border-status-error/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full rounded-full mt-1 py-4">
            Sign In
          </Button>
        </form>

        <p className="text-xs text-text-2 text-center mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-medium hover:underline">
            Create one
          </Link>
        </p>
      </>
  )
}
import { useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/Button'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  // const { pendingEmail, verifyEmail } = useAuthStore()
  const { pendingEmail } = useAuthStore()


  function handleVerify() {
    // verifyEmail()
    navigate('/')
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4 text-center py-4">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center">
          <Mail className="w-8 h-8 text-accent" />
        </div>

        {/* Text */}
        <div>
          <h1 className="font-display text-xl text-text-1 mb-2">Verify your email</h1>
          <p className="text-xs text-text-2 leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="font-medium text-text-1">
              {pendingEmail ?? 'your email'}
            </span>.
            Click the link in the email to activate your account.
          </p>
        </div>

        {/* Steps */}
        <div className="w-full bg-bg-surface2 rounded-lg p-4 text-left flex flex-col gap-2.5">
          {[
            'Check your inbox (and spam folder)',
            'Click the confirmation link',
            'You\'ll be signed in automatically',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-accent-mid text-accent flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-xs text-text-2">{step}</p>
            </div>
          ))}
        </div>

        {/* Mock verify button — in production this is handled by Supabase redirect */}
        <div className="w-full flex flex-col gap-2">
          <Button onClick={handleVerify} className="w-full">
            Simulate Email Verified ✓
          </Button>
          <p className="text-[10px] text-text-3">
            This button simulates clicking the email link. In production, Supabase handles this automatically.
          </p>
        </div>

        <p className="text-xs text-text-3">
          Wrong email?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-accent hover:underline bg-transparent border-none cursor-pointer"
          >
            Go back and re-register
          </button>
        </p>
      </div>
    </>
  )
}
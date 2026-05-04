import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm animate-slide-up">
        <p className="font-display text-8xl text-accent mb-2 leading-none">404</p>
        <h1 className="font-display text-xl text-text-1 mb-2">Page not found</h1>
        <p className="text-sm text-text-2 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button onClick={() => navigate('/')}>
            Home
          </Button>
        </div>
      </div>
    </div>
  )
}
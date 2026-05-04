import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface Props { children: ReactNode }

/** Redirects to /login if user is not authenticated */
export function ProtectedRoute({ children }: Props) {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

/** Redirects to / if user is not admin */
export function AdminRoute({ children }: Props) {
  const { user, isAdmin } = useAuthStore()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

/** Redirects already-authenticated users away from login/register */
export function GuestRoute({ children }: Props) {
  const { user } = useAuthStore()

  if (user) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
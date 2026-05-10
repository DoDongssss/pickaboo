import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface Props { children: ReactNode }

// isLoading check is no longer needed here because App.tsx
// blocks rendering all routes until auth resolves.
// By the time any route renders, user is either set or null.

/** Redirects to /login if not authenticated */
export function ProtectedRoute({ children }: Props) {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

/** Redirects to / if not admin */
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

/** Redirects authenticated users away from login/register */
export function GuestRoute({ children }: Props) {
  const { user } = useAuthStore()

  if (user) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
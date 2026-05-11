import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import { MainLayout }  from './components/layout/MainLayout'
import { AdminLayout } from './components/layout/AdminLayout'

// Guards
import { ProtectedRoute, AdminRoute } from './components/auth/ProtectedRoute'

// Auth pages
import { LoginPage }          from './pages/auth/LoginPage'
import { RegisterPage }       from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { VerifyEmailPage }    from './pages/auth/VerifyEmailPage'
import { ResetPasswordPage }  from './pages/auth/ResetPasswordPage'

// User pages
import { HomePage }       from './pages/HomePage'
import { CourtDetailPage } from './pages/CourtDetailPage'
import { BookingPage }    from './pages/BookingPage'
import { MatchesPage }    from './pages/MatchesPage'
import { LivePage }       from './pages/LivePage'
import { ProfilePage }    from './pages/ProfilePage'

// Admin pages
import { AdminDashboard }    from './pages/admin/AdminDashboard'
import { AdminBookings }     from './pages/admin/AdminBookings'
import { AdminPayments }     from './pages/admin/AdminPayments'
import { AdminMatches }      from './pages/admin/AdminMatches'
import { AdminCourtsPage }   from './pages/admin/AdminCourtsPage'
import { AdminAddonsPage }   from './pages/admin/AdminAddonsPage'
import { AdminPricingPage }  from './pages/admin/AdminPricingPage'
import { AdminAmenitiesPage } from './pages/admin/AdminAmenitiesPage'

import { NotFoundPage } from './pages/NotFoundPage'
import { ToastContainer } from './components/ui/Toast'
import { LandingPage } from './pages/LandingPage'
import { AuthLayout } from './components/layout/AuthLayout'
import { LeaderboardPage } from './pages/LeaderboardPage'

// ── Full-screen loading spinner shown while Supabase
//    resolves the session on first load / refresh ──────
export default function App() {
  const { isLoading, init } = useAuthStore()
  const [authTimedOut, setAuthTimedOut] = useState(false)

  useEffect(() => {
    const unsubscribe = init()
    return unsubscribe
  }, [])

  // Safety net — if auth takes more than 8 seconds, unblock the app
  useEffect(() => {
    if (!isLoading) return
    const timer = setTimeout(() => {
      console.warn('[Auth] Session check timed out — unblocking app')
      setAuthTimedOut(true)
    }, 8_000)
    return () => clearTimeout(timer)
  }, [isLoading])

  if (isLoading && !authTimedOut) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#F24E1E] border-t-transparent
            rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    )
  }
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
         {/* ── Public landing page ── */}
        <Route path="/home" element={<LandingPage />} />

        <Route path='/auth' element={<AuthLayout />}>
            <Route path="login"            element={<LoginPage />} />
            <Route path="register"         element={<RegisterPage />} />
            <Route path="forgot-password"   element={<ForgotPasswordPage />} />
            <Route path="reset-password"    element={<ResetPasswordPage />} />
            <Route path="verify-email"      element={<VerifyEmailPage />} />
        </Route>

        {/* ── Guest only ── */}
        {/* <Route path="/login"          element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"       element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password"  element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
        <Route path="/verify-email"    element={<VerifyEmailPage />} /> */}

        {/* ── Authenticated user routes ── */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index                  element={<HomePage />} />
          <Route path="courts/:id"      element={<CourtDetailPage />} />
          <Route path="book/:courtId"   element={<BookingPage />} />
          <Route path="matches"         element={<MatchesPage />} />
          <Route path="live"            element={<LivePage />} />
          <Route path="profile"         element={<ProfilePage />} />
          <Route path="leaderboard"         element={<LeaderboardPage />} />
        </Route>

        {/* ── Admin routes ── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index              element={<AdminDashboard />} />
          <Route path="bookings"   element={<AdminBookings />} />
          <Route path="payments"   element={<AdminPayments />} />
          <Route path="matches"    element={<AdminMatches />} />
          <Route path="courts"     element={<AdminCourtsPage />} />
          <Route path="addons"     element={<AdminAddonsPage />} />
          <Route path="pricing"    element={<AdminPricingPage />} />
          <Route path="amenities"  element={<AdminAmenitiesPage />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  )
}
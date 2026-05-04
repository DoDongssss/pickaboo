import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import { MainLayout } from './components/layout/MainLayout'
import { AdminLayout } from './components/layout/AdminLayout'

// Guards
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/auth/ProtectedRoute'

// Auth pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'

// User pages
import { HomePage } from './pages/HomePage'
import { CourtDetailPage } from './pages/CourtDetailPage'
import { BookingPage } from './pages/BookingPage'
import { MatchesPage } from './pages/MatchesPage'
import { LivePage } from './pages/LivePage'
import { ProfilePage } from './pages/ProfilePage'

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminBookings } from './pages/admin/AdminBookings'
import { AdminPayments } from './pages/admin/AdminPayments'
import { AdminMatches } from './pages/admin/AdminMatches'
import { AdminCourtsPage } from './pages/admin/AdminCourtsPage'
import { AdminAddonsPage } from './pages/admin/AdminAddonsPage'
import { AdminPricingPage } from './pages/admin/AdminPricingPage'
import { AdminAmenitiesPage } from './pages/admin/AdminAmenitiesPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'

// import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Guest routes ── */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password"  element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* ── Protected user routes ── */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<HomePage />} />
          <Route path="courts/:id" element={<CourtDetailPage />} />
          <Route path="book/:courtId" element={<BookingPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="live" element={<LivePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* ── Protected admin routes ── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="matches" element={<AdminMatches />} />
          <Route path="courts" element={<AdminCourtsPage />} />
          <Route path="addons" element={<AdminAddonsPage />} />
          <Route path="pricing" element={<AdminPricingPage />} />
          <Route path="amenities" element={<AdminAmenitiesPage />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
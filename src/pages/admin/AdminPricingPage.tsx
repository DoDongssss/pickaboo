import { AdminCourts } from '../../components/admin/AdminCourts'

// Pricing overrides are managed within AdminCourts component
// This page focuses only on the overrides section
export function AdminPricingPage() {
  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-1 mb-1">Pricing Overrides</h1>
        <p className="text-sm text-text-2">Set date-specific pricing per court — for holidays, weekends, or special events.</p>
      </div>
      <AdminCourts />
    </div>
  )
}

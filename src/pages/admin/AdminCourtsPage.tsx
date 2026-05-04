import { AdminCourts } from '../../components/admin/AdminCourts'

export function AdminCourtsPage() {
  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-1 mb-1">Court Management</h1>
        <p className="text-sm text-text-2">Edit court details, set pricing, location, and operating hours.</p>
      </div>
      <AdminCourts />
    </div>
  )
}

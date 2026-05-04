import { AdminAddons } from '../../components/admin/AdminAddons'

export function AdminAddonsPage() {
  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-1 mb-1">Add-On Management</h1>
        <p className="text-sm text-text-2">Manage bookable extras like paddles, chairs, and water.</p>
      </div>
      <AdminAddons />
    </div>
  )
}

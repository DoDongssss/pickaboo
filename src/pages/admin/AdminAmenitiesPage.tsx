import { AdminAmenities } from '../../components/admin/AdminAmenities'

export function AdminAmenitiesPage() {
  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-1 mb-1">Amenity Management</h1>
        <p className="text-sm text-text-2">Toggle amenity availability per court.</p>
      </div>
      <AdminAmenities />
    </div>
  )
}

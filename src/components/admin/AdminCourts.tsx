import { useState } from 'react'
import { Plus, Edit2, MapPin } from 'lucide-react'
import { useAdminCourts } from '../../hooks/useAdminCourts'
import { uploadCourtImage } from '../../services/adminService'
import type { CourtWithDetails } from '../../types/database.types'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'
import { CourtFormModal, type CourtFormData } from './CourtFormModal'

export function AdminCourts() {
  const toast = useToast()
  const { courts, loading, create, update, refresh } = useAdminCourts()

  const [modalOpen, setModalOpen] = useState(false)
  const [editCourt, setEditCourt] = useState<CourtWithDetails | null>(null)

  function openCreate() { setEditCourt(null); setModalOpen(true) }
  function openEdit(court: CourtWithDetails) { setEditCourt(court); setModalOpen(true) }

  async function handleSave(data: CourtFormData) {
    try {
      if (editCourt) {
        await update(editCourt.id, data)
        toast.success('Court updated')
      } else {
        await create(data)
        toast.success('Court created')
      }
    } catch (err: any) {
      toast.error('Failed to save court', err.message)
      throw err  // re-throw so modal stays open on error
    }
  }

  async function handleImageUpload(
    courtId: string,
    file: File,
    order: 1 | 2 | 3
  ) {
    try {
      await uploadCourtImage(courtId, file, order)
      toast.success('Image uploaded')
      refresh()
    } catch (err: any) {
      toast.error('Upload failed', err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="section-label mb-0">Courts</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-3.5 h-3.5" /> Add Court
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-4 border-accent border-t-transparent
            rounded-full animate-spin" />
        </div>
      )}

      {/* Court list */}
      {!loading && (
        <div className="flex flex-col gap-3 mb-8">
          {courts.map(c => (
            <div key={c.id} className="card p-4">
              <div className="flex items-center gap-4">
                {/* First image thumbnail */}
                {c.court_images?.[0] ? (
                  <img
                    src={c.court_images[0].image_url}
                    alt={c.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-bg-surface2 flex items-center
                    justify-center flex-shrink-0 text-2xl">
                    🏓
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-1">{c.name}</p>
                  <p className="text-xs text-text-2 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {c.address ?? 'No address'}
                  </p>
                  <p className="text-xs text-text-2 mt-0.5">
                    ₱{c.price_per_hour}/hr · {c.open_time}–{c.close_time}
                  </p>
                  <p className="text-xs text-text-3 mt-0.5">
                    {c.court_images?.length ?? 0}/3 images ·{' '}
                    {c.court_amenities?.length ?? 0} amenities
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge ${c.is_active
                    ? 'badge-confirmed' : 'badge-cancelled'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => openEdit(c)}
                    title="Edit court"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Image upload row */}
              {editCourt?.id !== c.id && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                  <p className="text-xs text-text-3 flex-shrink-0">Images:</p>
                  {([1, 2, 3] as const).map(order => {
                    const img = c.court_images?.find(i => i.display_order === order)
                    return (
                      <label
                        key={order}
                        className="relative w-10 h-10 rounded-md border border-dashed
                          border-border hover:border-accent cursor-pointer
                          overflow-hidden flex-shrink-0 transition-colors"
                        title={`Upload image ${order}`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(c.id, file, order)
                          }}
                        />
                        {img ? (
                          <img
                            src={img.image_url}
                            alt={`Image ${order}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center
                            justify-center text-text-3 text-xs">
                            {order}
                          </div>
                        )}
                      </label>
                    )
                  })}
                  <p className="text-xs text-text-3">
                    Click slot to upload/replace
                  </p>
                </div>
              )}
            </div>
          ))}

          {courts.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-sm text-text-2">No courts yet.</p>
              <Button size="sm" variant="soft" className="mt-3" onClick={openCreate}>
                Create your first court
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Court form modal */}
      <CourtFormModal
        open={modalOpen}
        court={editCourt}
        onClose={() => { setModalOpen(false); setEditCourt(null) }}
        onSave={handleSave}
      />
    </div>
  )
}
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useAdminCourts } from '../../hooks/useAdminCourts'
import {
  upsertAmenity,
  toggleAmenity,
  deleteAmenity,
} from '../../services/adminService'
import type { CourtAmenity } from '../../types/database.types'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'

const AMENITY_ICONS: Record<string, string> = {
  toilet:   '🚻',
  shower:   '🚿',
  chair:    '🪑',
  table:    '🍽',
  paddle:   '🏓',
  water:    '💧',
  light:    '💡',
  firstaid: '🩹',
}

export function AdminAmenities() {
  const toast = useToast()
  const { courts, loading: courtsLoading } = useAdminCourts()

  const [selectedCourtId, setSelectedCourtId] = useState<string>('')
  const [amenities,       setAmenities]       = useState<CourtAmenity[]>([])
  const [loadingAmenities, setLoadingAmenities] = useState(false)
  const [newAmenity,      setNewAmenity]      = useState({ name: '', icon: 'chair' })
  const [saving,          setSaving]          = useState(false)

  // Set default court when courts load
  useEffect(() => {
    if (courts.length > 0 && !selectedCourtId) {
      setSelectedCourtId(courts[0].id)
    }
  }, [courts])

  // Load amenities when selected court changes
  useEffect(() => {
    if (!selectedCourtId) return
    loadAmenities()
  }, [selectedCourtId])

  async function loadAmenities() {
    setLoadingAmenities(true)
    try {
      const { data, error } = await supabase
        .from('court_amenities')
        .select('*')
        .eq('court_id', selectedCourtId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setAmenities(data as CourtAmenity[])
    } catch (err: any) {
      toast.error('Failed to load amenities', err.message)
    } finally {
      setLoadingAmenities(false)
    }
  }

  async function handleToggle(amenity: CourtAmenity) {
    try {
      await toggleAmenity(amenity.id, !amenity.is_available)
      setAmenities(prev => prev.map(a =>
        a.id === amenity.id ? { ...a, is_available: !a.is_available } : a
      ))
    } catch (err: any) {
      toast.error('Failed to update', err.message)
    }
  }

  async function handleDelete(amenityId: string) {
    try {
      await deleteAmenity(amenityId)
      setAmenities(prev => prev.filter(a => a.id !== amenityId))
      toast.success('Amenity removed')
    } catch (err: any) {
      toast.error('Failed to remove', err.message)
    }
  }

  async function handleAdd() {
    if (!newAmenity.name || !selectedCourtId) return
    setSaving(true)
    try {
      await upsertAmenity({
        court_id:     selectedCourtId,
        name:         newAmenity.name,
        icon:         newAmenity.icon,
        is_available: true,
      })
      setNewAmenity({ name: '', icon: 'chair' })
      await loadAmenities()
      toast.success('Amenity added')
    } catch (err: any) {
      toast.error('Failed to add amenity', err.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedCourt = courts.find(c => c.id === selectedCourtId)

  return (
    <div>
      {/* Court selector */}
      <div className="flex items-center gap-3 mb-5">
        <label className="text-xs font-medium text-text-2 flex-shrink-0">Court</label>
        <select
          className="input w-auto"
          value={selectedCourtId}
          onChange={e => setSelectedCourtId(e.target.value)}
          disabled={courtsLoading}
        >
          {courts.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {(courtsLoading || loadingAmenities) && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-4 border-accent border-t-transparent
            rounded-full animate-spin" />
        </div>
      )}

      {/* Amenity list */}
      {!courtsLoading && !loadingAmenities && (
        <>
          <div className="flex flex-col gap-2 mb-5">
            {amenities.map(a => (
              <div key={a.id} className="card p-3 flex items-center gap-3">
                <span className="text-xl" role="img" aria-label={a.name}>
                  {AMENITY_ICONS[a.icon ?? ''] ?? '✅'}
                </span>
                <span className="text-sm text-text-1 flex-1">{a.name}</span>
                <span className="text-xs text-text-3 font-mono">{a.icon}</span>

                {/* Available toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox" className="sr-only peer"
                    checked={a.is_available}
                    onChange={() => handleToggle(a)}
                  />
                  <div className="w-9 h-5 bg-border-strong rounded-full peer
                    peer-checked:bg-accent transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full
                    transition-transform peer-checked:translate-x-4" />
                </label>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(a.id)}
                  className="btn btn-ghost btn-sm text-text-3 hover:text-status-error
                    hover:bg-status-errorBg"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}

            {amenities.length === 0 && (
              <div className="card p-6 text-center">
                <p className="text-sm text-text-2">
                  No amenities for {selectedCourt?.name ?? 'this court'} yet.
                </p>
              </div>
            )}
          </div>

          {/* Add amenity form */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-text-2 mb-3">
              Add amenity to {selectedCourt?.name}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                className="input"
                placeholder="Name (e.g. Locker Room)"
                value={newAmenity.name}
                onChange={e => setNewAmenity(p => ({ ...p, name: e.target.value }))}
              />
              <select
                className="input"
                value={newAmenity.icon}
                onChange={e => setNewAmenity(p => ({ ...p, icon: e.target.value }))}
              >
                {Object.entries(AMENITY_ICONS).map(([k, v]) => (
                  <option key={k} value={k}>{v} {k}</option>
                ))}
              </select>
            </div>
            <Button
              size="sm"
              onClick={handleAdd}
              loading={saving}
              disabled={!newAmenity.name}
            >
              <Plus className="w-3.5 h-3.5" /> Add Amenity
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
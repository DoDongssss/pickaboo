import { useState } from 'react'
import { Plus } from 'lucide-react'
import { MOCK_COURTS } from '../../data/mock'
import type { CourtAmenity } from '../../types'
import { Button } from '../ui/Button'

const AMENITY_ICONS: Record<string, string> = {
  toilet: '🚻', shower: '🚿', chair: '🪑', table: '🍽',
  paddle: '🏓', water: '💧', light: '💡', firstaid: '🩹',
}

export function AdminAmenities() {
  const [courts, setCourts] = useState(MOCK_COURTS)
  const [selectedCourtId, setSelectedCourtId] = useState(MOCK_COURTS[0].id)
  const [newAmenity, setNewAmenity] = useState({ name: '', icon: 'chair' })

  const court = courts.find(c => c.id === selectedCourtId)!

  function toggleAmenity(amenityId: string) {
    setCourts(prev => prev.map(c => c.id === selectedCourtId ? {
      ...c,
      amenities: c.amenities.map(a => a.id === amenityId ? { ...a, is_available: !a.is_available } : a)
    } : c))
  }

  function addAmenity() {
    if (!newAmenity.name) return
    const amenity: CourtAmenity = {
      id: `a${Date.now()}`, court_id: selectedCourtId,
      name: newAmenity.name, icon: newAmenity.icon,
      is_available: true, created_at: '',
    }
    setCourts(prev => prev.map(c => c.id === selectedCourtId
      ? { ...c, amenities: [...c.amenities, amenity] } : c))
    setNewAmenity({ name: '', icon: 'chair' })
  }

  return (
    <div>
      {/* Court selector */}
      <div className="flex items-center gap-3 mb-5">
        <label className="text-xs font-medium text-text-2">Court</label>
        <select className="input w-auto" value={selectedCourtId}
          onChange={e => setSelectedCourtId(e.target.value)}>
          {MOCK_COURTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Amenity list */}
      <div className="flex flex-col gap-2 mb-5">
        {court.amenities.map(a => (
          <div key={a.id} className="card p-3 flex items-center gap-3">
            <span className="text-xl">{AMENITY_ICONS[a.icon] ?? '✅'}</span>
            <span className="text-sm text-text-1 flex-1">{a.name}</span>
            <span className="text-xs text-text-3">{a.icon}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer"
                checked={a.is_available}
                onChange={() => toggleAmenity(a.id)} />
              <div className="w-9 h-5 bg-border-strong rounded-full peer peer-checked:bg-accent transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
            </label>
          </div>
        ))}
      </div>

      {/* Add amenity */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-text-2 mb-3">Add amenity to {court.name}</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input className="input" placeholder="Name (e.g. Locker Room)"
            value={newAmenity.name} onChange={e => setNewAmenity(p => ({ ...p, name: e.target.value }))} />
          <select className="input" value={newAmenity.icon}
            onChange={e => setNewAmenity(p => ({ ...p, icon: e.target.value }))}>
            {Object.entries(AMENITY_ICONS).map(([k, v]) => (
              <option key={k} value={k}>{v} {k}</option>
            ))}
          </select>
        </div>
        <Button size="sm" onClick={addAmenity}>
          <Plus className="w-3.5 h-3.5" />Add Amenity
        </Button>
      </div>
    </div>
  )
}

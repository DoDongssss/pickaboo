import { useState } from 'react'
import { Plus, Edit2, MapPin } from 'lucide-react'
import { MOCK_COURTS, MOCK_PRICING_OVERRIDES } from '../../data/mock'
import type { Court, PricingOverride } from '../../types'
import { Button } from '../ui/Button'
import { CourtFormModal, type CourtFormData } from './CourtFormModal'

export function AdminCourts() {
  const [courts,      setCourts]      = useState<Court[]>(MOCK_COURTS)
  const [overrides,   setOverrides]   = useState<PricingOverride[]>(MOCK_PRICING_OVERRIDES)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editCourt,   setEditCourt]   = useState<Court | null>(null)
  const [newOverride, setNewOverride] = useState({ court_id: 'c1', override_date: '', price_per_hour: 0, label: '' })

  function openCreate() { setEditCourt(null); setModalOpen(true) }
  function openEdit(court: Court) { setEditCourt(court); setModalOpen(true) }

  function handleSave(data: CourtFormData) {
    if (editCourt) {
      // Edit existing
      setCourts(prev => prev.map(c =>
        c.id === editCourt.id ? { ...c, ...data } : c
      ))
    } else {
      // Create new
      const newCourt: Court = {
        id:        `c-${Date.now()}`,
        images:    [],
        amenities: [],
        created_at: new Date().toISOString(),
        ...data,
      }
      setCourts(prev => [...prev, newCourt])
    }
  }

  function addOverride() {
    if (!newOverride.override_date || !newOverride.price_per_hour) return
    setOverrides(prev => [...prev, { ...newOverride, id: `po${Date.now()}`, created_at: '' }])
    setNewOverride({ court_id: 'c1', override_date: '', price_per_hour: 0, label: '' })
  }

  return (
    <div>
      {/* Court list header */}
      <div className="flex items-center justify-between mb-3">
        <p className="section-label mb-0">Courts</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-3.5 h-3.5" />
          Add Court
        </Button>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {courts.map(c => (
          <div key={c.id} className="card p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-1">{c.name}</p>
              <p className="text-xs text-text-2 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" />{c.address}
              </p>
              <p className="text-xs text-text-2 mt-0.5">
                ₱{c.price_per_hour}/hr · {c.open_time}–{c.close_time}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`badge ${c.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {c.is_active ? 'Active' : 'Inactive'}
              </span>
              <Button size="sm" variant="ghost" onClick={() => openEdit(c)} title="Edit court">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </div>
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

      {/* Pricing overrides */}
      <div className="flex items-center justify-between mb-3">
        <p className="section-label mb-0">Pricing Overrides</p>
      </div>

      <div className="card overflow-hidden mb-4">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-surface2 border-b border-border">
              {['Court', 'Date', '₱/hr', 'Label', ''].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {overrides.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-xs text-text-3">No overrides set.</td>
              </tr>
            )}
            {overrides.map(o => {
              const court = courts.find(c => c.id === o.court_id)
              return (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-bg-surface2 transition-colors">
                  <td className="px-4 py-3 text-xs text-text-1">{court?.name ?? o.court_id}</td>
                  <td className="px-4 py-3 text-xs text-text-1">{o.override_date}</td>
                  <td className="px-4 py-3 text-xs font-medium text-accent">₱{o.price_per_hour}</td>
                  <td className="px-4 py-3 text-xs text-text-2">{o.label}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost"
                      onClick={() => setOverrides(prev => prev.filter(p => p.id !== o.id))}>
                      Remove
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add override form */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-text-2 mb-3">Add pricing override</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <select className="input" value={newOverride.court_id}
            onChange={e => setNewOverride(p => ({ ...p, court_id: e.target.value }))}>
            {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="input" type="date" value={newOverride.override_date}
            onChange={e => setNewOverride(p => ({ ...p, override_date: e.target.value }))} />
          <input className="input" type="number" placeholder="₱/hr"
            value={newOverride.price_per_hour || ''}
            onChange={e => setNewOverride(p => ({ ...p, price_per_hour: +e.target.value }))} />
          <input className="input" placeholder="Label (e.g. Holiday)"
            value={newOverride.label}
            onChange={e => setNewOverride(p => ({ ...p, label: e.target.value }))} />
        </div>
        <Button size="sm" onClick={addOverride}>
          <Plus className="w-3.5 h-3.5" />
          Add Override
        </Button>
      </div>

      {/* Court form modal */}
      <CourtFormModal
        open={modalOpen}
        court={editCourt}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
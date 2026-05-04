import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { MOCK_COURTS, MOCK_PRICING_OVERRIDES } from '../../data/mock'
import type { PricingOverride } from '../../types'
import { Button } from '../../components/ui/Button'

export function AdminPricingPage() {
  const [overrides,   setOverrides]   = useState<PricingOverride[]>(MOCK_PRICING_OVERRIDES)
  const [newOverride, setNewOverride] = useState({
    court_id:      MOCK_COURTS[0].id,
    override_date: '',
    price_per_hour: 0,
    label:          '',
  })
  const [error, setError] = useState<string | null>(null)

  function addOverride() {
    if (!newOverride.override_date) { setError('Please select a date.'); return }
    if (!newOverride.price_per_hour) { setError('Please enter a price.'); return }

    const duplicate = overrides.find(
      o => o.court_id === newOverride.court_id && o.override_date === newOverride.override_date
    )
    if (duplicate) { setError('An override for this court and date already exists.'); return }

    setOverrides(prev => [...prev, { ...newOverride, id: `po-${Date.now()}`, created_at: new Date().toISOString() }])
    setNewOverride({ court_id: MOCK_COURTS[0].id, override_date: '', price_per_hour: 0, label: '' })
    setError(null)
  }

  function remove(id: string) {
    setOverrides(prev => prev.filter(o => o.id !== id))
  }

  // Group overrides by court for cleaner display
  const grouped = MOCK_COURTS.map(c => ({
    court:     c,
    overrides: overrides.filter(o => o.court_id === c.id),
  })).filter(g => g.overrides.length > 0)

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-1 mb-1">Pricing Overrides</h1>
        <p className="text-sm text-text-2">
          Set date-specific prices per court for holidays, weekends, or special events.
          The system uses these rates first, falling back to the court's base price.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-accent-soft border border-accent-mid rounded-lg px-4 py-3 mb-6">
        <p className="text-xs font-medium text-accent mb-1">How pricing works</p>
        <p className="text-xs text-text-2">
          When a user books, the system checks for an override on the selected date first.
          If found, the override price is used. Otherwise, the court's base price applies.
          Past bookings are never affected by price changes.
        </p>
      </div>

      {/* Existing overrides grouped by court */}
      {grouped.length === 0 ? (
        <div className="card p-8 text-center mb-6">
          <p className="text-sm text-text-2">No pricing overrides set yet.</p>
          <p className="text-xs text-text-3 mt-1">All bookings will use the court's base price.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 mb-6">
          {grouped.map(({ court, overrides: courtOverrides }) => (
            <div key={court.id}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-text-1">{court.name}</p>
                <span className="text-xs text-text-3">Base: ₱{court.price_per_hour}/hr</span>
              </div>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg-surface2 border-b border-border">
                      {['Date', 'Override Price', 'Label', 'vs Base', ''].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {courtOverrides
                      .sort((a, b) => a.override_date.localeCompare(b.override_date))
                      .map(o => {
                        const diff    = o.price_per_hour - court.price_per_hour
                        const pct     = Math.round((diff / court.price_per_hour) * 100)
                        const isHigher = diff > 0
                        return (
                          <tr key={o.id} className="border-b border-border last:border-0 hover:bg-bg-surface2 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-text-1">{o.override_date}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-accent">₱{o.price_per_hour}/hr</td>
                            <td className="px-4 py-3 text-xs text-text-2">{o.label || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium ${isHigher ? 'text-status-error' : 'text-status-success'}`}>
                                {isHigher ? '▲' : '▼'} {Math.abs(pct)}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => remove(o.id)}
                                className="btn btn-ghost btn-icon text-text-3 hover:text-status-error hover:bg-status-errorBg"
                                title="Remove override"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new override */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-text-1 mb-4">Add New Override</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Court */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2">Court</label>
            <select className="input" value={newOverride.court_id}
              onChange={e => { setNewOverride(p => ({ ...p, court_id: e.target.value })); setError(null) }}>
              {MOCK_COURTS.map(c => (
                <option key={c.id} value={c.id}>{c.name} (₱{c.price_per_hour}/hr base)</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2">Date</label>
            <input className="input" type="date" value={newOverride.override_date}
              onChange={e => { setNewOverride(p => ({ ...p, override_date: e.target.value })); setError(null) }} />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2">Override Price (₱/hr)</label>
            <input className="input" type="number" placeholder="e.g. 500"
              value={newOverride.price_per_hour || ''}
              onChange={e => { setNewOverride(p => ({ ...p, price_per_hour: +e.target.value })); setError(null) }} />
          </div>

          {/* Label */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2">Label <span className="text-text-3">(optional)</span></label>
            <input className="input" placeholder="e.g. Holiday Rate, Weekend Rate"
              value={newOverride.label}
              onChange={e => setNewOverride(p => ({ ...p, label: e.target.value }))} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-status-error bg-status-errorBg border border-status-error/20 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        {/* Preview */}
        {newOverride.price_per_hour > 0 && newOverride.override_date && (
          <div className="bg-bg-surface2 rounded-lg px-4 py-2.5 mb-3 text-xs text-text-2">
            Preview: <span className="font-medium text-text-1">
              {MOCK_COURTS.find(c => c.id === newOverride.court_id)?.name}
            </span> on <span className="font-medium text-text-1">{newOverride.override_date}</span> will
            be charged at <span className="font-semibold text-accent">₱{newOverride.price_per_hour}/hr</span>
            {newOverride.label && <span> · {newOverride.label}</span>}
          </div>
        )}

        <Button size="sm" onClick={addOverride}>
          <Plus className="w-3.5 h-3.5" />
          Add Override
        </Button>
      </div>
    </div>
  )
}
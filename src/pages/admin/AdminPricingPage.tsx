import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAdminCourts } from '../../hooks/useAdminCourts'
import {
  getPricingOverrides,
  createPricingOverride,
  deletePricingOverride,
} from '../../services/adminService'
import type { CourtPricingOverride } from '../../types/database.types'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'

export function AdminPricingPage() {
  const toast = useToast()
  const { courts, loading: courtsLoading } = useAdminCourts()

  const [overrides, setOverrides] = useState<CourtPricingOverride[]>([])
  const [loadingOverrides, setLoadingOverrides] = useState(false)
  const [newOverride, setNewOverride] = useState({
    court_id:       '',
    override_date:  '',
    price_per_hour: 0,
    label:          '',
  })
  const [error,    setError]    = useState<string | null>(null)
  const [saving,   setSaving]   = useState(false)

  // When courts load, set default court_id and fetch overrides
  useEffect(() => {
    if (courts.length === 0) return
    if (!newOverride.court_id) {
      setNewOverride(p => ({ ...p, court_id: courts[0].id }))
    }
    loadOverrides()
  }, [courts])

  async function loadOverrides() {
    if (courts.length === 0) return
    setLoadingOverrides(true)
    try {
      const all = await Promise.all(
        courts.map(c => getPricingOverrides(c.id))
      )
      setOverrides(all.flat())
    } catch (err: any) {
      toast.error('Failed to load overrides', err.message)
    } finally {
      setLoadingOverrides(false)
    }
  }

  async function addOverride() {
    if (!newOverride.override_date) { setError('Please select a date.'); return }
    if (!newOverride.price_per_hour) { setError('Please enter a price.'); return }
    if (!newOverride.court_id) { setError('Please select a court.'); return }

    const duplicate = overrides.find(
      o => o.court_id === newOverride.court_id
        && o.override_date === newOverride.override_date
    )
    if (duplicate) {
      setError('An override for this court and date already exists.')
      return
    }

    setSaving(true)
    try {
      await createPricingOverride({
        court_id:       newOverride.court_id,
        override_date:  newOverride.override_date,
        price_per_hour: newOverride.price_per_hour,
        label:          newOverride.label || null,
      })
      toast.success('Override added')
      setNewOverride(p => ({ ...p, override_date: '', price_per_hour: 0, label: '' }))
      setError(null)
      await loadOverrides()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeOverride(id: string) {
    try {
      await deletePricingOverride(id)
      setOverrides(prev => prev.filter(o => o.id !== id))
      toast.success('Override removed')
    } catch (err: any) {
      toast.error('Failed to remove', err.message)
    }
  }

  const grouped = courts.map(c => ({
    court:     c,
    overrides: overrides.filter(o => o.court_id === c.id),
  })).filter(g => g.overrides.length > 0)

  const selectedCourt = courts.find(c => c.id === newOverride.court_id)

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-1 mb-1">Pricing Overrides</h1>
        <p className="text-sm text-text-2">
          Set date-specific prices per court for holidays, weekends, or special events.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-accent-soft border border-accent-mid rounded-lg px-4 py-3 mb-6">
        <p className="text-xs font-medium text-accent mb-1">How pricing works</p>
        <p className="text-xs text-text-2">
          Override price is used if set for the selected date.
          Otherwise, the court's base price applies.
          Past bookings are never affected.
        </p>
      </div>

      {/* Existing overrides */}
      {(courtsLoading || loadingOverrides) && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-4 border-accent border-t-transparent
            rounded-full animate-spin" />
        </div>
      )}

      {!courtsLoading && !loadingOverrides && grouped.length === 0 && (
        <div className="card p-8 text-center mb-6">
          <p className="text-sm text-text-2">No pricing overrides set yet.</p>
          <p className="text-xs text-text-3 mt-1">
            All bookings will use the court's base price.
          </p>
        </div>
      )}

      {!courtsLoading && !loadingOverrides && grouped.length > 0 && (
        <div className="flex flex-col gap-6 mb-6">
          {grouped.map(({ court, overrides: courtOverrides }) => (
            <div key={court.id}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-text-1">{court.name}</p>
                <span className="text-xs text-text-3">
                  Base: ₱{court.price_per_hour}/hr
                </span>
              </div>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg-surface2 border-b border-border">
                      {['Date', 'Override Price', 'Label', 'vs Base', ''].map(h => (
                        <th key={h} className="text-left text-xs font-semibold
                          text-text-3 uppercase tracking-wider px-4 py-2.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {courtOverrides
                      .sort((a, b) => a.override_date.localeCompare(b.override_date))
                      .map(o => {
                        const diff     = o.price_per_hour - court.price_per_hour
                        const pct      = Math.round((diff / court.price_per_hour) * 100)
                        const isHigher = diff > 0
                        return (
                          <tr key={o.id}
                            className="border-b border-border last:border-0
                              hover:bg-bg-surface2 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-text-1">
                              {o.override_date}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-accent">
                              ₱{o.price_per_hour}/hr
                            </td>
                            <td className="px-4 py-3 text-xs text-text-2">
                              {o.label || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium
                                ${isHigher ? 'text-status-error' : 'text-status-success'}`}>
                                {isHigher ? '▲' : '▼'} {Math.abs(pct)}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeOverride(o.id)}
                                className="btn btn-ghost btn-icon text-text-3
                                  hover:text-status-error hover:bg-status-errorBg"
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2">Court</label>
            <select
              className="input"
              value={newOverride.court_id}
              onChange={e => {
                setNewOverride(p => ({ ...p, court_id: e.target.value }))
                setError(null)
              }}
            >
              {courts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (₱{c.price_per_hour}/hr base)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2">Date</label>
            <input
              className="input"
              type="date"
              value={newOverride.override_date}
              onChange={e => {
                setNewOverride(p => ({ ...p, override_date: e.target.value }))
                setError(null)
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2">
              Override Price (₱/hr)
            </label>
            <input
              className="input"
              type="number"
              placeholder="e.g. 500"
              value={newOverride.price_per_hour || ''}
              onChange={e => {
                setNewOverride(p => ({ ...p, price_per_hour: +e.target.value }))
                setError(null)
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2">
              Label <span className="text-text-3">(optional)</span>
            </label>
            <input
              className="input"
              placeholder="e.g. Holiday Rate, Weekend Rate"
              value={newOverride.label}
              onChange={e => setNewOverride(p => ({ ...p, label: e.target.value }))}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-status-error bg-status-errorBg
            border border-status-error/20 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        {newOverride.price_per_hour > 0 && newOverride.override_date && selectedCourt && (
          <div className="bg-bg-surface2 rounded-lg px-4 py-2.5 mb-3 text-xs text-text-2">
            Preview:{' '}
            <span className="font-medium text-text-1">{selectedCourt.name}</span>
            {' on '}
            <span className="font-medium text-text-1">{newOverride.override_date}</span>
            {' → '}
            <span className="font-semibold text-accent">
              ₱{newOverride.price_per_hour}/hr
            </span>
            {newOverride.label && <span> · {newOverride.label}</span>}
          </div>
        )}

        <Button size="sm" onClick={addOverride} loading={saving}>
          <Plus className="w-3.5 h-3.5" />
          Add Override
        </Button>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { MOCK_ADDONS } from '../../data/mock'
import type { Addon } from '../../types'
import { Button } from '../ui/Button'

export function AdminAddons() {
  const [addons, setAddons] = useState<Addon[]>(MOCK_ADDONS)
  const [form, setForm] = useState({ name: '', description: '', price: 0 })

  function toggle(id: string) {
    setAddons(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a))
  }

  function addAddon() {
    if (!form.name || !form.price) return
    setAddons(prev => [...prev, { id: `ad${Date.now()}`, ...form, is_active: true, created_at: '' }])
    setForm({ name: '', description: '', price: 0 })
  }

  return (
    <div>
      <div className="card overflow-hidden mb-5">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-surface2 border-b border-border">
              {['Name','Description','₱/unit','Status','Action'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {addons.map(a => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-bg-surface2 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-text-1">{a.name}</td>
                <td className="px-4 py-3 text-xs text-text-2">{a.description}</td>
                <td className="px-4 py-3 text-sm font-medium text-accent">₱{a.price}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${a.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {a.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(a.id)} className="btn btn-ghost btn-sm">
                    {a.is_active
                      ? <ToggleRight className="w-4 h-4 text-status-success" />
                      : <ToggleLeft className="w-4 h-4 text-text-3" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add form */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-text-2 mb-3">Add new add-on</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input className="input" placeholder="Name" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <input className="input" placeholder="Description" value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <input className="input" type="number" placeholder="Price (₱)"
            value={form.price || ''}
            onChange={e => setForm(p => ({ ...p, price: +e.target.value }))} />
        </div>
        <Button size="sm" onClick={addAddon}>
          <Plus className="w-3.5 h-3.5" />Add Add-on
        </Button>
      </div>
    </div>
  )
}

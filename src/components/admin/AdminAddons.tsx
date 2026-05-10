import { useState, useEffect } from 'react'
import { Plus, ToggleLeft, ToggleRight, Pencil, Check, X } from 'lucide-react'
import { getAllAddons, createAddon, updateAddon } from '../../services/adminService'
import type { Addon } from '../../types/database.types'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'

export function AdminAddons() {
  const toast = useToast()

  const [addons,   setAddons]   = useState<Addon[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editId,   setEditId]   = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', price: 0 })
  const [form,     setForm]     = useState({ name: '', description: '', price: 0 })
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    let cancelled = false
    getAllAddons()
      .then(data => { if (!cancelled) setAddons(data) })
      .catch(err  => toast.error('Failed to load add-ons', err.message))
      .finally(()  => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function handleToggle(addon: Addon) {
    try {
      await updateAddon(addon.id, { is_active: !addon.is_active })
      setAddons(prev => prev.map(a =>
        a.id === addon.id ? { ...a, is_active: !a.is_active } : a
      ))
    } catch (err: any) {
      toast.error('Failed to update', err.message)
    }
  }

  function startEdit(addon: Addon) {
    setEditId(addon.id)
    setEditForm({
      name:        addon.name,
      description: addon.description ?? '',
      price:       addon.price,
    })
  }

  async function saveEdit(addonId: string) {
    setSaving(true)
    try {
      await updateAddon(addonId, {
        name:        editForm.name,
        description: editForm.description || null,
        price:       editForm.price,
      })
      setAddons(prev => prev.map(a =>
        a.id === addonId
          ? { ...a, ...editForm, description: editForm.description || null }
          : a
      ))
      setEditId(null)
      toast.success('Add-on updated')
    } catch (err: any) {
      toast.error('Failed to save', err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAdd() {
    if (!form.name || !form.price) return
    setSaving(true)
    try {
      const addon = await createAddon({
        name:        form.name,
        description: form.description || null,
        price:       form.price,
        is_active:   true,
      })
      setAddons(prev => [addon, ...prev])
      setForm({ name: '', description: '', price: 0 })
      toast.success('Add-on created')
    } catch (err: any) {
      toast.error('Failed to create', err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-4 border-accent border-t-transparent
          rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Add-ons list ── */}
      <div className="flex flex-col gap-2">
        {addons.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-sm text-text-2">No add-ons yet.</p>
            <p className="text-xs text-text-3 mt-1">
              Add your first add-on using the form below.
            </p>
          </div>
        )}

        {addons.map(a => (
          editId === a.id
            ? (
              /* ── Edit row ── */
              <div key={a.id}
                className="card p-3 border-accent/40 bg-accent-soft/10">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    className="input flex-1 min-w-[120px] h-8 text-sm py-1"
                    placeholder="Name"
                    value={editForm.name}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    autoFocus
                  />
                  <input
                    className="input flex-[2] min-w-[160px] h-8 text-sm py-1"
                    placeholder="Description"
                    value={editForm.description}
                    onChange={e => setEditForm(p => ({
                      ...p, description: e.target.value
                    }))}
                  />
                  <input
                    className="input w-28 h-8 text-sm py-1"
                    type="number"
                    placeholder="Price"
                    value={editForm.price || ''}
                    onChange={e => setEditForm(p => ({
                      ...p, price: +e.target.value
                    }))}
                  />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => saveEdit(a.id)}
                      disabled={saving}
                      className="w-8 h-8 rounded-lg bg-status-successBg border
                        border-status-success/30 flex items-center justify-center
                        hover:bg-green-100 transition-colors disabled:opacity-50"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5 text-status-success" />
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="w-8 h-8 rounded-lg bg-bg-surface2 border border-border
                        flex items-center justify-center hover:bg-bg-elevated
                        transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5 text-text-3" />
                    </button>
                  </div>
                </div>
              </div>
            )
            : (
              /* ── Display row ── */
              <div key={a.id}
                className="card p-4 flex items-center gap-3">

                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0
                  ${a.is_active ? 'bg-status-success' : 'bg-border-strong'}`}
                />

                {/* Name + description */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate
                    ${a.is_active ? 'text-text-1' : 'text-text-3'}`}>
                    {a.name}
                  </p>
                  {a.description && (
                    <p className="text-xs text-text-3 truncate mt-0.5">
                      {a.description}
                    </p>
                  )}
                </div>

                {/* Price */}
                <span className="text-sm font-semibold text-accent flex-shrink-0">
                  ₱{a.price.toLocaleString()}
                  <span className="text-xs text-text-3 font-normal">/unit</span>
                </span>

                {/* Status badge */}
                <span className={`badge flex-shrink-0
                  ${a.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {a.is_active ? 'Active' : 'Inactive'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(a)}
                    className="w-7 h-7 rounded-md flex items-center justify-center
                      text-text-3 hover:text-text-1 hover:bg-bg-surface2
                      transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggle(a)}
                    className="w-7 h-7 rounded-md flex items-center justify-center
                      hover:bg-bg-surface2 transition-colors"
                    title={a.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {a.is_active
                      ? <ToggleRight className="w-4 h-4 text-status-success" />
                      : <ToggleLeft  className="w-4 h-4 text-text-3" />
                    }
                  </button>
                </div>
              </div>
            )
        ))}
      </div>

      {/* ── Add new add-on ── */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-text-1 mb-3">Add new add-on</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2">Name</label>
            <input
              className="input"
              placeholder="e.g. Extra Paddle"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2">
              Description <span className="text-text-3">(optional)</span>
            </label>
            <input
              className="input"
              placeholder="e.g. Professional grade"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2">Price per unit (₱)</label>
            <input
              className="input"
              type="number"
              placeholder="e.g. 50"
              value={form.price || ''}
              onChange={e => setForm(p => ({ ...p, price: +e.target.value }))}
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleAdd}
          loading={saving}
          disabled={!form.name || !form.price}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Add-on
        </Button>
      </div>
    </div>
  )
}
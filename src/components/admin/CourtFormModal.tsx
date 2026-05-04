import { useState } from 'react'
import type { Court } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface CourtFormModalProps {
  open:    boolean
  court:   Court | null
  onClose: () => void
  onSave:  (data: CourtFormData) => void
}

export interface CourtFormData {
  name:           string
  description:    string
  address:        string
  latitude:       number
  longitude:      number
  price_per_hour: number
  open_time:      string
  close_time:     string
  is_active:      boolean
}

const EMPTY: CourtFormData = {
  name:           '',
  description:    '',
  address:        '',
  latitude:       7.2047,
  longitude:      124.2310,
  price_per_hour: 300,
  open_time:      '05:00',
  close_time:     '22:00',
  is_active:      true,
}

function courtToForm(court: Court): CourtFormData {
  return {
    name:           court.name,
    description:    court.description,
    address:        court.address,
    latitude:       court.latitude,
    longitude:      court.longitude,
    price_per_hour: court.price_per_hour,
    open_time:      court.open_time,
    close_time:     court.close_time,
    is_active:      court.is_active,
  }
}

// Inner form — remounts whenever `key` changes, resetting state cleanly
function CourtFormInner({ court, onClose, onSave }: Omit<CourtFormModalProps, 'open'>) {
  const [form,   setForm]   = useState<CourtFormData>(() => court ? courtToForm(court) : EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof CourtFormData, string>>>({})

  function set<K extends keyof CourtFormData>(key: K, value: CourtFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.name.trim())        e.name           = 'Court name is required.'
    if (!form.address.trim())     e.address        = 'Address is required.'
    if (form.price_per_hour <= 0) e.price_per_hour = 'Price must be greater than 0.'
    if (form.open_time >= form.close_time) e.close_time = 'Close time must be after open time.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave(form)
    onClose()
  }

  const isEdit = !!court

  return (
    <div className="flex flex-col gap-4">

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-2">Court Name <span className="text-status-error">*</span></label>
        <input className={`input ${errors.name ? 'border-status-error' : ''}`}
          placeholder="e.g. Court A — Main Hall"
          value={form.name} onChange={e => set('name', e.target.value)} />
        {errors.name && <p className="text-xs text-status-error">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-2">Description</label>
        <input className="input" placeholder="e.g. Indoor · Professional net · AC"
          value={form.description} onChange={e => set('description', e.target.value)} />
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-2">Address <span className="text-status-error">*</span></label>
        <input className={`input ${errors.address ? 'border-status-error' : ''}`}
          placeholder="e.g. Purok 3, Libungan, Cotabato"
          value={form.address} onChange={e => set('address', e.target.value)} />
        {errors.address && <p className="text-xs text-status-error">{errors.address}</p>}
      </div>

      {/* Lat / Lng */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-2">Latitude</label>
          <input className="input" type="number" step="0.0001"
            value={form.latitude} onChange={e => set('latitude', parseFloat(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-2">Longitude</label>
          <input className="input" type="number" step="0.0001"
            value={form.longitude} onChange={e => set('longitude', parseFloat(e.target.value))} />
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-2">Price per Hour (₱) <span className="text-status-error">*</span></label>
        <input className={`input ${errors.price_per_hour ? 'border-status-error' : ''}`}
          type="number" placeholder="300"
          value={form.price_per_hour || ''}
          onChange={e => set('price_per_hour', parseFloat(e.target.value))} />
        {errors.price_per_hour && <p className="text-xs text-status-error">{errors.price_per_hour}</p>}
      </div>

      {/* Open / Close time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-2">Open Time</label>
          <input className="input" type="time"
            value={form.open_time} onChange={e => set('open_time', e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-2">Close Time</label>
          <input className={`input ${errors.close_time ? 'border-status-error' : ''}`}
            type="time"
            value={form.close_time} onChange={e => set('close_time', e.target.value)} />
          {errors.close_time && <p className="text-xs text-status-error">{errors.close_time}</p>}
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between bg-bg-surface2 rounded-lg px-4 py-3">
        <div>
          <p className="text-sm font-medium text-text-1">Active</p>
          <p className="text-xs text-text-2">Court is visible and bookable by users</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer"
            checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
          <div className="w-10 h-6 bg-border-strong rounded-full peer peer-checked:bg-accent transition-colors" />
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-border">
        <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button onClick={handleSave} className="flex-1">
          {isEdit ? 'Save Changes' : 'Create Court'}
        </Button>
      </div>
    </div>
  )
}

export function CourtFormModal({ open, court, onClose, onSave }: CourtFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={court ? `Edit — ${court.name}` : 'Create New Court'}
      width="max-w-lg"
    >
      {/* key forces a remount (and state reset) whenever court or open changes */}
      <CourtFormInner
        key={court ? court.id : `new-${open}`}
        court={court}
        onClose={onClose}
        onSave={onSave}
      />
    </Modal>
  )
}
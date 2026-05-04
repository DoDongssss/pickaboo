import { Minus, Plus } from 'lucide-react'
import type { Addon, SelectedAddon } from '../../types'

interface AddOnSelectorProps {
  addons: Addon[]
  selectedAddons: SelectedAddon[]
  onQtyChange: (addonId: string, qty: number) => void
}

export function AddOnSelector({ addons, selectedAddons, onQtyChange }: AddOnSelectorProps) {
  const activeAddons = addons.filter(a => a.is_active)

  function getQty(addonId: string) {
    return selectedAddons.find(sa => sa.addon.id === addonId)?.quantity ?? 0
  }

  const total = selectedAddons.reduce((sum, sa) => sum + sa.addon.price * sa.quantity, 0)

  return (
    <div>
      <div className="flex flex-col gap-2">
        {activeAddons.map(addon => {
          const qty = getQty(addon.id)
          return (
            <div key={addon.id} className="flex items-center justify-between bg-bg-surface border border-border rounded-lg px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-1">{addon.name}</p>
                <p className="text-xs text-text-2">{addon.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-1 w-16 text-right">₱{addon.price}/unit</span>
                {/* Stepper */}
                <div className="flex items-center gap-2 bg-bg-surface2 rounded-lg px-2 py-1">
                  <button
                    onClick={() => onQtyChange(addon.id, Math.max(0, qty - 1))}
                    className="w-6 h-6 flex items-center justify-center text-text-2 hover:text-text-1 transition-colors"
                    disabled={qty === 0}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-semibold text-text-1 w-5 text-center">{qty}</span>
                  <button
                    onClick={() => onQtyChange(addon.id, qty + 1)}
                    className="w-6 h-6 flex items-center justify-center text-text-2 hover:text-accent transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                {/* Subtotal */}
                <span className={`text-sm font-medium w-14 text-right ${qty > 0 ? 'text-accent' : 'text-text-3'}`}>
                  {qty > 0 ? `₱${addon.price * qty}` : '—'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add-ons total */}
      {total > 0 && (
        <div className="flex justify-between items-center mt-3 px-4 py-2 bg-accent-soft border border-accent-mid rounded-lg">
          <span className="text-xs font-medium text-text-2">Add-ons total</span>
          <span className="text-sm font-semibold text-accent">₱{total}</span>
        </div>
      )}
    </div>
  )
}

import type { Court, SelectedAddon } from '../../types/database.types'

// Compute duration in hours between two "HH:MM" strings
function computeDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60
}

interface PriceSummaryProps {
  court: Court
  date: string
  startTime: string
  endTime: string
  pricePerHour: number
  selectedAddons: SelectedAddon[]
}

export function PriceSummary({
  court, date, startTime, endTime, pricePerHour, selectedAddons
}: PriceSummaryProps) {
  const duration    = startTime && endTime ? computeDuration(startTime, endTime) : 0
  const basePrice   = duration * pricePerHour
  const addonsTotal = selectedAddons.reduce((sum, sa) => sum + sa.addon.price * sa.quantity, 0)
  const totalPrice  = basePrice + addonsTotal

  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
      <div className="bg-bg-surface2 px-4 py-3 border-b border-border">
        <p className="text-xs font-semibold text-text-3 uppercase tracking-wider">
          Price Summary
        </p>
      </div>

      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-2">Court</span>
          <span className="text-text-1 font-medium text-right max-w-[60%] truncate">
            {court.name}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-2">Date</span>
          <span className="text-text-1 font-medium">{date}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-2">Time</span>
          <span className="text-text-1 font-medium">
            {startTime} – {endTime}{' '}
            <span className="text-text-3">({duration}h)</span>
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-2">Rate</span>
          <span className="text-text-1 font-medium">₱{pricePerHour}/hr</span>
        </div>
        <div className="flex justify-between text-sm font-medium">
          <span className="text-text-1">Base price</span>
          <span className="text-text-1">₱{basePrice.toLocaleString()}</span>
        </div>

        {selectedAddons.length > 0 && (
          <div className="border-t border-border pt-2 mt-2">
            <p className="text-xs text-text-3 mb-2">Add-ons</p>
            {selectedAddons.map(sa => (
              <div key={sa.addon.id} className="flex justify-between text-sm text-text-2 mb-1">
                <span>{sa.addon.name} ×{sa.quantity}</span>
                <span>₱{(sa.addon.price * sa.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-border-strong pt-3 mt-1 flex justify-between items-center">
          <span className="text-sm font-semibold text-text-1">Total</span>
          <span className="font-display text-xl text-accent">
            ₱{totalPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
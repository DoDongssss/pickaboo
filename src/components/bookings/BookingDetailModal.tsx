import { ImageIcon } from 'lucide-react'
import type { Booking } from '../../types'
import { Modal } from '../ui/Modal'
import { bookingStatusBadge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface BookingDetailModalProps {
  booking: Booking | null
  onClose: () => void
  onApprove?: (id: string) => void
  onReject?:  (id: string) => void
}

export function BookingDetailModal({ booking: b, onClose, onApprove, onReject }: BookingDetailModalProps) {
  if (!b) return null

  return (
    <Modal open={!!b} onClose={onClose} title="Booking Details" width="max-w-md">
      <div className="flex flex-col gap-5">

        {/* Status + ID */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-3 font-mono">#{b.id}</p>
          {bookingStatusBadge(b.status)}
        </div>

        {/* Player info */}
        <section>
          <p className="section-label">Player</p>
          <div className="card p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-soft border border-accent-mid flex items-center justify-center text-sm font-semibold text-accent flex-shrink-0">
              {b.user?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-text-1">{b.user?.name}</p>
              <p className="text-xs text-text-2">{b.user?.email}</p>
              <p className="text-xs text-text-2 capitalize">{b.user?.skill_level}</p>
            </div>
          </div>
        </section>

        {/* Booking details */}
        <section>
          <p className="section-label">Booking</p>
          <div className="bg-bg-surface2 rounded-lg p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-text-3 mb-0.5">Court</p>
              <p className="font-medium text-text-1">{b.court?.name}</p>
            </div>
            <div>
              <p className="text-text-3 mb-0.5">Date</p>
              <p className="font-medium text-text-1">{b.booking_date}</p>
            </div>
            <div>
              <p className="text-text-3 mb-0.5">Time</p>
              <p className="font-medium text-text-1">{b.start_time} – {b.end_time}</p>
            </div>
            <div>
              <p className="text-text-3 mb-0.5">Duration</p>
              <p className="font-medium text-text-1">{b.duration_hours}h</p>
            </div>
          </div>
        </section>

        {/* Price breakdown */}
        <section>
          <p className="section-label">Price Breakdown</p>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-text-2">Base ({b.duration_hours}h × ₱{b.price_per_hour})</span>
              <span className="text-text-1">₱{(b.duration_hours * b.price_per_hour).toLocaleString()}</span>
            </div>

            {/* Add-ons */}
            {b.addons && b.addons.length > 0 && (
              <>
                {b.addons.map(a => (
                  <div key={a.id} className="flex justify-between text-xs">
                    <span className="text-text-2">{a.addon?.name} ×{a.quantity}</span>
                    <span className="text-text-1">₱{a.subtotal}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs">
                  <span className="text-text-2">Add-ons total</span>
                  <span className="text-text-1">₱{b.addons_total}</span>
                </div>
              </>
            )}

            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span className="text-text-1">Total</span>
              <span className="text-accent font-display text-base">₱{b.total_price.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Payment proof */}
        <section>
          <p className="section-label">Payment</p>
          <div className="border border-border rounded-lg overflow-hidden">
            {b.payment_proof_url ? (
              <img src={b.payment_proof_url} alt="Payment proof" className="w-full object-cover max-h-48" />
            ) : (
              <div className="h-28 bg-bg-surface2 flex flex-col items-center justify-center gap-2">
                <ImageIcon className="w-6 h-6 text-text-3" />
                <p className="text-xs text-text-3">No proof uploaded yet</p>
              </div>
            )}
            {b.payment_reference && (
              <div className="px-3 py-2 border-t border-border">
                <p className="text-xs text-text-2">
                  Ref: <span className="font-medium text-text-1">{b.payment_reference}</span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        {b.status === 'FOR_VERIFICATION' && onApprove && onReject && (
          <div className="flex gap-2 pt-1 border-t border-border">
            <button
              onClick={() => { onReject(b.id); onClose() }}
              className="btn btn-secondary flex-1 text-status-error border-status-error/30 hover:bg-status-errorBg gap-1.5"
            >
              Reject
            </button>
            <button
              onClick={() => { onApprove(b.id); onClose() }}
              className="btn btn-primary flex-1 gap-1.5"
            >
              Approve
            </button>
          </div>
        )}

        {b.status !== 'FOR_VERIFICATION' && (
          <Button variant="secondary" onClick={onClose} className="w-full">Close</Button>
        )}
      </div>
    </Modal>
  )
}
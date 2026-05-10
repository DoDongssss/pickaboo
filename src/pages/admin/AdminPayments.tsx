import { useState, useEffect } from 'react'
import { useAdminBookings } from '../../hooks/useAdminBookings'
import type { BookingWithDetails } from '../../types/database.types'
import { useToast } from '../../components/ui/Toast'
import { CheckCircle2, XCircle, ImageIcon, Loader2 } from 'lucide-react'
import { getPaymentProofSignedUrl } from '../../services/bookingService'

export function AdminPayments() {
  const toast = useToast()
  const { bookings, loading, approve, reject } = useAdminBookings()

  const pending   = bookings.filter(b => b.status === 'FOR_VERIFICATION')
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED')

  async function handleApprove(id: string) {
    try {
      await approve(id)
      toast.success('Payment approved', 'Booking is now confirmed.')
    } catch (err: any) {
      toast.error('Failed', err.message)
    }
  }

  async function handleReject(id: string) {
    try {
      await reject(id)
      toast.error('Payment rejected', 'Booking has been cancelled.')
    } catch (err: any) {
      toast.error('Failed', err.message)
    }
  }

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-1 mb-1">Payment Verification</h1>
        <p className="text-sm text-text-2">
          Review uploaded payment proofs and confirm bookings.
        </p>
      </div>

      {/* Pending count */}
      <div className="card p-4 flex items-center gap-4 mb-6
        border-status-warning/30 bg-status-warningBg/40">
        <div className="w-10 h-10 rounded-full bg-status-warningBg flex items-center
          justify-center flex-shrink-0">
          <span className="font-display text-lg text-status-warning">
            {pending.length}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-text-1">Awaiting verification</p>
          <p className="text-xs text-text-2">
            Review each payment proof before confirming
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent
            rounded-full animate-spin" />
        </div>
      )}

      {!loading && pending.length === 0 && (
        <div className="card p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-status-success mx-auto mb-3 opacity-60" />
          <p className="text-sm font-medium text-text-1">All caught up!</p>
          <p className="text-xs text-text-2 mt-1">No payments pending verification.</p>
        </div>
      )}

      {!loading && pending.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pending.map(b => (
            <PaymentCard
              key={b.id}
              booking={b}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Recently confirmed */}
      {!loading && confirmed.length > 0 && (
        <div className="mt-10">
          <p className="section-label">Recently Confirmed</p>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-surface2 border-b border-border">
                  {['Player', 'Court', 'Date', 'Total', 'Ref'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-text-3
                      uppercase tracking-wider px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confirmed.map(b => (
                  <tr key={b.id}
                    className="border-b border-border last:border-0 hover:bg-bg-surface2">
                    <td className="px-4 py-3 text-sm text-text-1">
                      {(b as any).user?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-2">{b.court?.name}</td>
                    <td className="px-4 py-3 text-xs text-text-2">{b.booking_date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-1">
                      ₱{b.total_price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-2">
                      {b.payment_reference ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
  
}

// Replace the PaymentCard component inside AdminPayments.tsx

function PaymentCard({ booking: b, onApprove, onReject }: {
  booking:   BookingWithDetails
  onApprove: (id: string) => void
  onReject:  (id: string) => void
}) {
  const [signedUrl,    setSignedUrl]    = useState<string | null>(null)
  const [loadingProof, setLoadingProof] = useState(false)

  useEffect(() => {
    if (!b.payment_proof_url) { setSignedUrl(null); return }

    const parts    = b.payment_proof_url.split('/')
    const fileName = parts.at(-1) ?? 'proof.png'

    setLoadingProof(true)
    getPaymentProofSignedUrl(b.id, fileName)
      .then(url => setSignedUrl(url))
      .finally(() => setLoadingProof(false))
  }, [b.id, b.payment_proof_url])

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-text-1">
            {(b as any).user?.name ?? '—'}
          </p>
          <p className="text-xs text-text-2">{b.court?.name}</p>
        </div>
        <span className="badge badge-pending">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          For Verification
        </span>
      </div>

      <div className="bg-bg-surface2 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-text-3">Date</p>
          <p className="font-medium text-text-1">{b.booking_date}</p>
        </div>
        <div>
          <p className="text-text-3">Time</p>
          <p className="font-medium text-text-1">{b.start_time}–{b.end_time}</p>
        </div>
        <div>
          <p className="text-text-3">Duration</p>
          <p className="font-medium text-text-1">{b.duration_hours}h</p>
        </div>
        <div>
          <p className="text-text-3">Total</p>
          <p className="font-semibold text-accent">₱{b.total_price.toLocaleString()}</p>
        </div>
      </div>

      {/* Payment proof — signed URL */}
      <div className="border border-border rounded-lg overflow-hidden">
        {loadingProof ? (
          <div className="h-28 bg-bg-surface2 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-text-3" />
          </div>
        ) : signedUrl ? (
          <>
            <img
              src={signedUrl}
              alt="Payment proof"
              className="w-full object-cover max-h-40"
            />
            
             <a href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center py-2 border-t border-border
                text-xs text-accent hover:underline"
            >
              Open full image ↗
            </a>
          </>
        ) : (
          <div className="h-28 bg-bg-surface2 flex flex-col items-center
            justify-center gap-2">
            <ImageIcon className="w-6 h-6 text-text-3" />
            <p className="text-xs text-text-3">No proof uploaded</p>
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

      <div className="flex gap-2">
        <button
          onClick={() => onReject(b.id)}
          className="btn btn-secondary flex-1 text-status-error
            border-status-error/30 hover:bg-status-errorBg gap-1.5"
        >
          <XCircle className="w-3.5 h-3.5" /> Reject
        </button>
        <button
          onClick={() => onApprove(b.id)}
          className="btn btn-primary flex-1 gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
        </button>
      </div>
    </div>
  )
}
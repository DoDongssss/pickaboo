import { useState } from 'react'
import { CheckCircle2, XCircle, Eye } from 'lucide-react'
import { useAdminBookings } from '../../hooks/useAdminBookings'
import type { BookingWithDetails, BookingStatus } from '../../types/database.types'
import { bookingStatusBadge } from '../../components/ui/Badge'
import { BookingDetailModal } from '../../components/admin/BookingDetailModal'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'

const STATUS_FILTERS = [
  'ALL', 'FOR_VERIFICATION', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED'
] as const
// type Filter = typeof STATUS_FILTERS[number]

export function AdminBookings() {
  const toast = useToast()
  const { bookings, filtered, loading, error, statusFilter,
          setStatusFilter, approve, reject } = useAdminBookings()

  const [selected, setSelected] = useState<BookingWithDetails | null>(null)

  async function handleApprove(id: string) {
    try {
      await approve(id)
      toast.success('Booking confirmed', 'Payment verified and booking confirmed.')
    } catch (err: any) {
      toast.error('Failed', err.message)
    }
  }

  async function handleReject(id: string) {
    try {
      await reject(id)
      toast.error('Booking rejected', 'The booking has been cancelled.')
    } catch (err: any) {
      toast.error('Failed', err.message)
    }
  }

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-1 mb-1">Booking Management</h1>
        <p className="text-sm text-text-2">Review, approve, and manage all court bookings.</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',            value: bookings.length,                                                    color: 'text-text-1'          },
          { label: 'For Verification', value: bookings.filter(b => b.status === 'FOR_VERIFICATION').length,       color: 'text-status-warning'  },
          { label: 'Confirmed',        value: bookings.filter(b => b.status === 'CONFIRMED').length,              color: 'text-status-success'  },
          { label: 'Cancelled',        value: bookings.filter(b => b.status === 'CANCELLED').length,              color: 'text-status-error'    },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className={`font-display text-3xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-2 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s as BookingStatus | 'ALL')}
            className={`text-xs px-3 py-1.5 rounded-md border transition-all cursor-pointer
              ${statusFilter === s
                ? 'bg-accent text-white border-accent'
                : 'bg-bg-surface border-border text-text-2 hover:border-border-strong'}`}
          >
            {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-status-errorBg border border-status-error/20 rounded-lg
          px-4 py-3 mb-4">
          <p className="text-sm text-status-error">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent
            rounded-full animate-spin" />
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-surface2 border-b border-border">
                  {['Player', 'Court', 'Date & Time', 'Duration',
                    'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-text-3
                      uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onView={() => setSelected(b)}
                  />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-text-3">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <BookingDetailModal
        booking={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}

function BookingRow({ booking: b, onApprove, onReject, onView }: {
  booking:   BookingWithDetails
  onApprove: (id: string) => void
  onReject:  (id: string) => void
  onView:    () => void
}) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-bg-surface2 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-text-1">
          {(b as any).user?.name ?? '—'}
        </p>
        {b.payment_reference && (
          <p className="text-xs text-text-2">{b.payment_reference}</p>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-text-2 whitespace-nowrap">
        {b.court?.name}
      </td>
      <td className="px-4 py-3 text-xs text-text-2 whitespace-nowrap">
        {b.booking_date} · {b.start_time}–{b.end_time}
      </td>
      <td className="px-4 py-3 text-xs text-text-2">{b.duration_hours}h</td>
      <td className="px-4 py-3 text-sm font-semibold text-text-1">
        ₱{b.total_price.toLocaleString()}
      </td>
      <td className="px-4 py-3">{bookingStatusBadge(b.status)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {b.status === 'FOR_VERIFICATION' && (
            <>
              <button
                onClick={() => onApprove(b.id)}
                className="btn btn-sm text-status-success bg-status-successBg
                  border-none hover:bg-green-100"
                title="Approve"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onReject(b.id)}
                className="btn btn-sm text-status-error bg-status-errorBg
                  border-none hover:bg-red-100"
                title="Reject"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={onView}>
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
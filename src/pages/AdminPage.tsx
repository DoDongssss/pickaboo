import { useState } from 'react'
import { CheckCircle2, XCircle, Eye } from 'lucide-react'
import { MOCK_BOOKINGS, MOCK_MATCHES } from '../data/mock'
import type { Booking, BookingStatus } from '../types'
import { bookingStatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

type Tab = 'bookings' | 'matches'

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('bookings')
  const [bookings, setBookings] = useState(MOCK_BOOKINGS)
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL')

  function approve(id: string) {
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'CONFIRMED' as BookingStatus } : b))
  }
  function reject(id: string) {
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'CANCELLED' as BookingStatus } : b))
  }

  const filteredBookings = bookings.filter(b =>
    statusFilter === 'ALL' ? true : b.status === statusFilter
  )

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-1 mb-1">Admin Panel</h1>
        <p className="text-sm text-text-2">Manage bookings, payments, and matches.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Bookings',   value: bookings.length,                                    color: 'text-text-1'          },
          { label: 'For Verification', value: bookings.filter(b => b.status === 'FOR_VERIFICATION').length, color: 'text-status-warning' },
          { label: 'Confirmed',        value: bookings.filter(b => b.status === 'CONFIRMED').length,        color: 'text-status-success' },
          { label: 'Live Matches',     value: MOCK_MATCHES.filter(m => m.status === 'LIVE').length,         color: 'text-accent'         },
        ].map(c => (
          <div key={c.label} className="card p-4">
            <p className={`font-display text-3xl ${c.color}`}>{c.value}</p>
            <p className="text-xs text-text-2 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-surface2 border border-border rounded-lg p-1 mb-5 w-fit">
        {(['bookings', 'matches'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-150 capitalize cursor-pointer border-none
              ${tab === t ? 'bg-bg-surface text-text-1 shadow-sm' : 'bg-transparent text-text-2 hover:text-text-1'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Bookings tab */}
      {tab === 'bookings' && (
        <>
          {/* Status filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['ALL', 'FOR_VERIFICATION', 'CONFIRMED', 'CANCELLED', 'PENDING_PAYMENT'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-all cursor-pointer
                  ${statusFilter === s
                    ? 'bg-accent text-white border-accent'
                    : 'bg-bg-surface border-border text-text-2 hover:border-border-strong'}`}
              >
                {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-bg-surface2 border-b border-border">
                    <th className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3">Player</th>
                    <th className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3">Court</th>
                    <th className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Slot</th>
                    <th className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(b => (
                    <BookingRow key={b.id} booking={b} onApprove={approve} onReject={reject} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Matches tab */}
      {tab === 'matches' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-surface2 border-b border-border">
                  <th className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3">Match</th>
                  <th className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3">Players</th>
                  <th className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-text-3 uppercase tracking-wider px-4 py-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_MATCHES.map(m => {
                  const latest = m.scores.at(-1)
                  return (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-bg-surface2 transition-colors">
                      <td className="px-4 py-3 text-sm text-text-1">{m.court?.name ?? 'Free Match'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 bg-bg-surface2 text-text-2 rounded-full">{m.type}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-2">{m.players.length} players</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${m.status === 'LIVE' ? 'badge-live' : m.status === 'FINISHED' ? 'badge-waiting' : 'badge-pending'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-current ${m.status === 'LIVE' ? 'animate-pulse-dot' : ''}`} />
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-text-1">
                        {latest ? `${latest.team_a_score} – ${latest.team_b_score}` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function BookingRow({ booking: b, onApprove, onReject }: {
  booking: Booking
  onApprove: (id: string) => void
  onReject:  (id: string) => void
}) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-bg-surface2 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-text-1">{b.user?.name}</p>
        {b.payment_reference && (
          <p className="text-xs text-text-2">{b.payment_reference}</p>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-text-2">{b.court?.name}</td>
      <td className="px-4 py-3 text-xs text-text-2 hidden sm:table-cell">
        {new Date(b.start_time).toLocaleDateString()} ·{' '}
        {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–
        {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </td>
      <td className="px-4 py-3">{bookingStatusBadge(b.status)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {b.status === 'FOR_VERIFICATION' && (
            <>
              <button
                onClick={() => onApprove(b.id)}
                className="btn btn-sm text-status-success bg-status-successBg border-none hover:bg-green-100"
                title="Approve"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onReject(b.id)}
                className="btn btn-sm text-status-error bg-status-errorBg border-none hover:bg-red-100"
                title="Reject"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <Button size="sm" variant="ghost">
            <Eye className="w-3 h-3" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

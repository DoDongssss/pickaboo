import type { BookingStatus, MatchStatus } from '../../types'

type BadgeVariant = 'confirmed' | 'pending' | 'cancelled' | 'live' | 'waiting' | 'finished'

const variantClass: Record<BadgeVariant, string> = {
  confirmed: 'badge badge-confirmed',
  pending:   'badge badge-pending',
  cancelled: 'badge badge-cancelled',
  live:      'badge badge-live',
  waiting:   'badge badge-waiting',
  finished:  'badge badge-waiting',
}

const LABELS: Record<BadgeVariant, string> = {
  confirmed: 'Confirmed',
  pending:   'Pending Payment',
  cancelled: 'Cancelled',
  live:      'LIVE',
  waiting:   'Waiting',
  finished:  'Finished',
}

interface BadgeProps { variant: BadgeVariant }

export function Badge({ variant }: BadgeProps) {
  return (
    <span className={variantClass[variant]}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${variant === 'live' ? 'animate-pulse-dot' : ''}`} />
      {LABELS[variant]}
    </span>
  )
}

export function bookingStatusBadge(status: BookingStatus) {
  const map: Record<BookingStatus, BadgeVariant> = {
    CONFIRMED:        'confirmed',
    FOR_VERIFICATION: 'pending',
    PENDING_PAYMENT:  'pending',
    CANCELLED:        'cancelled',
  }
  const labels: Record<BookingStatus, string> = {
    CONFIRMED:        'Confirmed',
    FOR_VERIFICATION: 'For Verification',
    PENDING_PAYMENT:  'Pending Payment',
    CANCELLED:        'Cancelled',
  }
  const v = map[status]
  return (
    <span className={variantClass[v]}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  )
}

export function matchStatusBadge(status: MatchStatus) {
  const map: Record<MatchStatus, BadgeVariant> = {
    LIVE: 'live', WAITING: 'waiting', FINISHED: 'finished',
  }
  return <Badge variant={map[status]} />
}

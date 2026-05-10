import { useNavigate } from 'react-router-dom'
import { LogOut, Loader2, CalendarCheck, Swords, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useMyBookings } from '../hooks/useMyBookings'
import { useMatches } from '../hooks/useMatches'
import { bookingStatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Skeleton, EmptyState } from '../components/ui/Skeleton'
import { supabase } from '../lib/supabase'
import type { PlayerStats } from '../types/database.types'

const SKILL_COLOR: Record<string, string> = {
  beginner:     'bg-blue-100 text-blue-700',
  intermediate: 'bg-status-warningBg text-status-warning',
  advanced:     'bg-status-successBg text-status-success',
}

// ── Booking card skeleton ────────────────────────────
function BookingCardSkeleton() {
  return (
    <div className="card p-4 flex items-center justify-between gap-3">
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-20 rounded-full flex-shrink-0" />
    </div>
  )
}

// ── Match card skeleton ──────────────────────────────
function MatchCardSkeleton() {
  return (
    <div className="card p-3 flex items-center justify-between gap-3">
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
    </div>
  )
}

export function ProfilePage() {
  const navigate               = useNavigate()
  const { user, isAdmin, signOut } = useAuthStore()

  const { bookings, loading: bookingsLoading } = useMyBookings()
  const { matches,  loading: matchesLoading  } = useMatches()

  const [stats,        setStats]        = useState<PlayerStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!user) { setStatsLoading(false); return }
    supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => setStats(data as PlayerStats ?? null))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false))
  }, [user?.id])

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-text-2 mb-4">You are not signed in.</p>
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    )
  }

  const myMatches = matches.filter(m =>
    m.match_players.some(p => p.user_id === user.id)
  )

  const winRate = stats && stats.total_matches > 0
    ? Math.round((stats.wins / stats.total_matches) * 100)
    : 0

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="animate-slide-up max-w-5xl">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-accent-soft border-2 border-accent-mid
          flex items-center justify-center font-display text-2xl text-accent
          select-none flex-shrink-0">
          {user.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl text-text-1 truncate">{user.name}</h1>
          <p className="text-xs text-text-2 truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full
              ${SKILL_COLOR[user.skill_level] ?? 'bg-bg-surface2 text-text-2'}`}>
              {user.skill_level}
            </span>
            {isAdmin && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full
                bg-accent-soft text-accent">
                Admin
              </span>
            )}
          </div>
        </div>

        <Button size="sm" variant="ghost" onClick={handleSignOut}
          className="flex-shrink-0">
          <LogOut className="w-3 h-3" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 text-center">
              <Skeleton className="h-8 w-10 mx-auto mb-2" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))
        ) : (
          <>
            {/* Booking stats — always show */}
            <div className="card p-4 text-center">
              <p className="font-display text-3xl text-accent">{bookings.length}</p>
              <p className="text-xs text-text-2 mt-1">Bookings</p>
            </div>
            <div className="card p-4 text-center">
              <p className="font-display text-3xl text-status-success">
                {bookings.filter(b => b.status === 'CONFIRMED').length}
              </p>
              <p className="text-xs text-text-2 mt-1">Confirmed</p>
            </div>
            {/* Match stats */}
            <div className="card p-4 text-center">
              <p className="font-display text-3xl text-text-1">
                {stats?.total_matches ?? 0}
              </p>
              <p className="text-xs text-text-2 mt-1">Matches</p>
            </div>
            <div className="card p-4 text-center">
              <p className="font-display text-3xl text-accent">
                {stats ? `${winRate}%` : '—'}
              </p>
              <p className="text-xs text-text-2 mt-1">Win Rate</p>
            </div>
          </>
        )}
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">

        {/* ── LEFT: Bookings (priority) ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-accent" />
              <p className="text-sm font-semibold text-text-1">My Bookings</p>
              {!bookingsLoading && bookings.length > 0 && (
                <span className="text-xs bg-accent text-white px-1.5 py-0.5
                  rounded-full font-medium">
                  {bookings.length}
                </span>
              )}
            </div>
            <Button
              size="sm" variant="ghost"
              onClick={() => navigate('/')}
              className="text-xs"
            >
              Book a court
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>

          {/* Booking filter tabs */}
          {!bookingsLoading && bookings.length > 0 && (
            <BookingsList bookings={bookings} userId={user.id} />
          )}

          {bookingsLoading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!bookingsLoading && bookings.length === 0 && (
            <div className="card">
              <EmptyState
                icon={<CalendarCheck />}
                title="No bookings yet"
                description="Reserve a court and it will appear here."
                action={
                  <Button size="sm" onClick={() => navigate('/')}>
                    Book a Court
                  </Button>
                }
              />
            </div>
          )}
        </section>

        {/* ── RIGHT: Matches ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-text-2" />
              <p className="text-sm font-semibold text-text-1">My Matches</p>
              {!matchesLoading && myMatches.length > 0 && (
                <span className="text-xs bg-bg-surface2 text-text-2 px-1.5 py-0.5
                  rounded-full font-medium">
                  {myMatches.length}
                </span>
              )}
            </div>
            <Button
              size="sm" variant="ghost"
              onClick={() => navigate('/matches')}
              className="text-xs"
            >
              All matches
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>

          {matchesLoading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <MatchCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!matchesLoading && myMatches.length === 0 && (
            <div className="card">
              <EmptyState
                icon={<Swords />}
                title="No matches yet"
                description="Join or create a match to track your games."
                action={
                  <Button size="sm" variant="soft"
                    onClick={() => navigate('/matches')}>
                    Go to Matches
                  </Button>
                }
              />
            </div>
          )}

          {!matchesLoading && myMatches.length > 0 && (
            <div className="flex flex-col gap-2">
              {myMatches.slice(0, 6).map(m => {
                const latest = m.match_scores.at(-1)
                const myTeam = m.match_players.find(
                  p => p.user_id === user.id
                )?.team

                return (
                  <div key={m.id}
                    className="card p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-1 truncate">
                        {(m as any).court?.name ?? 'Free Match'}
                      </p>
                      <p className="text-xs text-text-2">
                        Team {myTeam} · {m.match_players.length} players
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {latest && (
                        <span className="font-display text-sm text-text-1">
                          {latest.team_a_score}–{latest.team_b_score}
                        </span>
                      )}
                      <span className={`badge text-[10px]
                        ${m.status === 'LIVE'     ? 'badge-live'    :
                          m.status === 'WAITING'  ? 'badge-pending' :
                                                    'badge-waiting'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {m.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// ── Bookings list with status filter ────────────────

type BookingFilter = 'ALL' | 'CONFIRMED' | 'FOR_VERIFICATION' | 'PENDING_PAYMENT' | 'CANCELLED'

const BOOKING_FILTERS: { label: string; value: BookingFilter }[] = [
  { label: 'All',          value: 'ALL'              },
  { label: 'Confirmed',    value: 'CONFIRMED'         },
  { label: 'Pending',      value: 'FOR_VERIFICATION'  },
  { label: 'Unpaid',       value: 'PENDING_PAYMENT'   },
  { label: 'Cancelled',    value: 'CANCELLED'         },
]

function BookingsList({
  bookings,
  userId,
}: {
  bookings: ReturnType<typeof useMyBookings>['bookings']
  userId:   string
}) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<BookingFilter>('ALL')

  const filtered = filter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === filter)

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {BOOKING_FILTERS.map(f => {
          const count = f.value === 'ALL'
            ? bookings.length
            : bookings.filter(b => b.status === f.value).length
          if (count === 0 && f.value !== 'ALL') return null
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-all
                cursor-pointer font-medium
                ${filter === f.value
                  ? 'bg-accent text-white border-accent'
                  : 'bg-bg-surface border-border text-text-2 hover:border-border-strong'
                }`}
            >
              {f.label}
              {count > 0 && (
                <span className={`ml-1 ${filter === f.value
                  ? 'text-white/70' : 'text-text-3'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Booking cards */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-sm text-text-2">No bookings in this category.</p>
          </div>
        ) : (
          filtered.map(b => (
            <div
              key={b.id}
              className={`card p-4 flex items-start justify-between gap-3
                transition-colors
                ${b.status === 'CONFIRMED'
                  ? 'border-status-success/20 bg-status-successBg/10'
                  : b.status === 'FOR_VERIFICATION'
                  ? 'border-status-warning/20 bg-status-warningBg/10'
                  : ''
                }`}
            >
              <div className="min-w-0 flex-1">
                {/* Court name */}
                <p className="text-sm font-semibold text-text-1 truncate">
                  {b.court?.name ?? '—'}
                </p>

                {/* Date + time */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-text-2">
                    {b.booking_date}
                  </p>
                  <span className="text-text-3 text-xs">·</span>
                  <p className="text-xs text-text-2">
                    {b.start_time} – {b.end_time}
                  </p>
                  <span className="text-text-3 text-xs">·</span>
                  <p className="text-xs text-text-2">{b.duration_hours}h</p>
                </div>

                {/* Price + add-ons */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-accent">
                    ₱{b.total_price.toLocaleString()}
                  </span>
                  {b.booking_addons && b.booking_addons.length > 0 && (
                    <span className="text-xs text-text-3">
                      + {b.booking_addons.length} add-on
                      {b.booking_addons.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Reference */}
                {b.payment_reference && (
                  <p className="text-xs text-text-3 mt-0.5 font-mono">
                    Ref: {b.payment_reference}
                  </p>
                )}

                {/* Upload proof CTA for pending payment */}
                {b.status === 'PENDING_PAYMENT' && (
                  <button
                    onClick={() => navigate(`/book/${b.court_id}`)}
                    className="mt-2 text-xs text-accent hover:underline"
                  >
                    Upload payment proof →
                  </button>
                )}
              </div>

              {/* Status badge */}
              <div className="flex-shrink-0 pt-0.5">
                {bookingStatusBadge(b.status)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
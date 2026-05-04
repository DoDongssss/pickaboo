import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { MOCK_STATS } from '../data/mock'
import { useAuth } from '../hooks/useAuth'
import { useMatchStore, useSessionBookingsStore } from '../store'
import { bookingStatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

const SKILL_COLOR = {
  beginner:     'bg-blue-100 text-blue-700',
  intermediate: 'bg-status-warningBg text-status-warning',
  advanced:     'bg-status-successBg text-status-success',
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, isAdmin, signOut } = useAuth()
  const { matches }    = useMatchStore()
  const { bookings }   = useSessionBookingsStore() // ✅ moved before early return

  // ✅ Early return AFTER all hooks
  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-text-2 mb-4">You are not signed in.</p>
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    )
  }

  const stats      = MOCK_STATS.find(s => s.user_id === user.id)
  const myBookings = bookings.filter(b => b.user_id === user.id)
  const myMatches  = matches.filter(m => m.players.some(p => p.user_id === user.id))
  const winRate    = stats ? Math.round((stats.wins / stats.total_matches) * 100) : 0

  return (
    <div className="animate-slide-up max-w-xl">

      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-accent-soft border-2 border-accent-mid flex items-center justify-center font-display text-2xl text-accent select-none">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-xl text-text-1">{user.name}</h1>
          <p className="text-xs text-text-2">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SKILL_COLOR[user.skill_level]}`}>
              {user.skill_level}
            </span>
            {isAdmin && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-soft text-accent">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Sign out */}
        <Button size="sm" variant="ghost" onClick={() => { signOut(); navigate('/login') }}>
          <LogOut className="w-3 h-3" />
          Sign out
        </Button>
      </div>

      {/* Match stats */}
      {stats && (
        <>
          <p className="section-label">Match Stats</p>
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total',  value: stats.total_matches },
              { label: 'Wins',   value: stats.wins          },
              { label: 'Losses', value: stats.losses        },
              { label: 'Win %',  value: `${winRate}%`      },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <p className="font-display text-3xl text-accent">{s.value}</p>
                <p className="text-xs text-text-2 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent matches from store */}
      {myMatches.length > 0 && (
        <>
          <p className="section-label">Recent Matches</p>
          <div className="flex flex-col gap-2 mb-8">
            {myMatches.slice(0, 3).map(m => {
              const latest = m.scores.at(-1)
              const myTeam = m.players.find(p => p.user_id === user.id)?.team
              return (
                <div key={m.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-1">
                      {m.court?.name ?? 'Free Match'}
                    </p>
                    <p className="text-xs text-text-2">
                      Team {myTeam} · {m.players.length} players
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {latest && (
                      <span className="font-display text-base text-text-1">
                        {latest.team_a_score} – {latest.team_b_score}
                      </span>
                    )}
                    <span className={`badge ${
                      m.status === 'LIVE'    ? 'badge-live'    :
                      m.status === 'WAITING' ? 'badge-pending' :
                                               'badge-waiting'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {m.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* My bookings */}
      <p className="section-label">My Bookings</p>
      <div className="flex flex-col gap-2">
        {myBookings.length === 0 && (
          <div className="card p-6 text-center">
            <p className="text-sm text-text-2">No bookings yet.</p>
            <Button size="sm" variant="soft" className="mt-3" onClick={() => navigate('/')}>
              Book a Court
            </Button>
          </div>
        )}
        {myBookings.map(b => (
          <div key={b.id} className="card p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-1 truncate">{b.court?.name}</p>
              <p className="text-xs text-text-2">
                {b.booking_date} · {b.start_time}–{b.end_time}
                <span className="ml-2 font-medium text-accent">₱{b.total_price.toLocaleString()}</span>
              </p>
            </div>
            {bookingStatusBadge(b.status)}
          </div>
        ))}
      </div>
    </div>
  )
}
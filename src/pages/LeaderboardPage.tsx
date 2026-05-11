import { useEffect, useState } from 'react'
import { Trophy, Medal, TrendingUp, Loader2, ChevronUp } from 'lucide-react'
import { getLeaderboard, type TimePeriod, type LeaderboardEntry } from '../services/leaderboardService'
import { useAuthStore } from '../store/authStore'

const PERIODS: { label: string; value: TimePeriod }[] = [
  { label: 'Today',    value: 'daily'   },
  { label: 'Weekly',   value: 'weekly'  },
  { label: 'Monthly',  value: 'monthly' },
  { label: 'All Time', value: 'alltime' },
]

const SKILL_COLOR: Record<string, string> = {
  beginner:     'text-blue-400 bg-blue-400/10',
  intermediate: 'text-yellow-400 bg-yellow-400/10',
  advanced:     'text-status-success bg-status-success/10',
}

// ── Rank medal colors ────────────────────────────────
function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-8 h-8 rounded-full bg-yellow-400/15 border border-yellow-400/30
      flex items-center justify-center flex-shrink-0">
      <Trophy className="w-4 h-4 text-yellow-400" />
    </div>
  )
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-full bg-gray-400/15 border border-gray-400/30
      flex items-center justify-center flex-shrink-0">
      <Medal className="w-4 h-4 text-gray-400" />
    </div>
  )
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-full bg-orange-400/15 border border-orange-400/30
      flex items-center justify-center flex-shrink-0">
      <Medal className="w-4 h-4 text-orange-400" />
    </div>
  )
  return (
    <div className="w-8 h-8 rounded-full bg-bg-surface2 border border-border
      flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-text-2">#{rank}</span>
    </div>
  )
}

// ── Avatar initials ──────────────────────────────────
function Avatar({
  name, avatarUrl, isCurrentUser, size = 'md'
}: {
  name:          string
  avatarUrl:     string | null
  isCurrentUser: boolean
  size?:         'sm' | 'md'
}) {
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  const base = `${dim} rounded-full flex items-center justify-center
    font-bold select-none flex-shrink-0`

  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={name}
        className={`${dim} rounded-full object-cover flex-shrink-0
          ${isCurrentUser ? 'ring-2 ring-accent' : ''}`}
      />
    )
  }

  return (
    <div className={`${base}
      ${isCurrentUser
        ? 'bg-accent text-white'
        : 'bg-bg-surface2 border border-border text-text-2'
      }`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// ── Single leaderboard row ───────────────────────────
function LeaderboardRow({
  entry,
  isCurrentUser,
  dimmed = false,
}: {
  entry:         LeaderboardEntry
  isCurrentUser: boolean
  dimmed?:       boolean
}) {
  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl
      transition-colors
      ${isCurrentUser
        ? 'bg-accent/8 border border-accent/25'
        : dimmed
        ? 'opacity-60 bg-bg-surface/40 border border-transparent'
        : 'bg-bg-surface border border-border'
      }
    `}>
      {/* Rank */}
      <RankDisplay rank={entry.rank} />

      {/* Avatar */}
      <Avatar
        name={entry.name}
        avatarUrl={entry.avatar_url}
        isCurrentUser={isCurrentUser}
      />

      {/* Name + skill */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold truncate
            ${isCurrentUser ? 'text-accent' : 'text-text-1'}`}>
            {entry.name}
            {isCurrentUser && (
              <span className="ml-1.5 text-[10px] font-medium text-accent/70">
                (you)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-medium px-1.5 py-0.5
            rounded-full capitalize ${SKILL_COLOR[entry.skill_level] ?? ''}`}>
            {entry.skill_level}
          </span>
          <span className="text-[10px] text-text-3">
            {entry.total_matches} match{entry.total_matches !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Wins */}
        <div className="text-center">
          <p className={`text-base font-display font-bold leading-none
            ${isCurrentUser ? 'text-accent' : 'text-text-1'}`}>
            {entry.wins}
          </p>
          <p className="text-[10px] text-text-3 mt-0.5">Wins</p>
        </div>

        {/* Win rate */}
        <div className="text-center min-w-[44px]">
          <p className={`text-base font-display font-bold leading-none
            ${entry.win_rate >= 60
              ? 'text-status-success'
              : entry.win_rate >= 40
              ? 'text-status-warning'
              : 'text-text-2'
            }`}>
            {entry.win_rate}%
          </p>
          <p className="text-[10px] text-text-3 mt-0.5">Win rate</p>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────

export function LeaderboardPage() {
  const { user } = useAuthStore()

  const [period,  setPeriod]  = useState<TimePeriod>('alltime')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getLeaderboard(period)
      .then(data => {
        if (!cancelled) setEntries(data)
      })
      .catch(err => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [period])

  // Top 10
  const top10 = entries.slice(0, 10)

  // Current user's entry — only if outside top 10
  const myEntry = user
    ? entries.find(e => e.user_id === user.id)
    : null
  const myRank        = myEntry?.rank ?? null
  const iInTop10      = myRank !== null && myRank <= 10
  const showMyEntry   = !!myEntry && !iInTop10

  // Period label for empty state
//   const periodLabel = PERIODS.find(p => p.value === period)?.label ?? ''

  return (
    <div className="animate-slide-up max-w-2xl">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border
          border-yellow-400/20 flex items-center justify-center flex-shrink-0">
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-text-1 leading-none mb-0.5">
            Leaderboard
          </h1>
          <p className="text-sm text-text-2">
            Ranked by wins · tiebroken by win rate
          </p>
        </div>
      </div>

      {/* ── Period tabs ── */}
      <div className="flex gap-1 bg-bg-surface2 border border-border
        rounded-xl p-1 mb-6">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg
              transition-all duration-150 cursor-pointer border-none
              ${period === p.value
                ? 'bg-bg-surface text-text-1 shadow-sm'
                : 'bg-transparent text-text-3 hover:text-text-2'
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
          <p className="text-xs text-text-3">Loading rankings…</p>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="card p-6 text-center">
          <p className="text-sm text-status-error mb-1">Failed to load leaderboard</p>
          <p className="text-xs text-text-3">{error}</p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && entries.length === 0 && (
        <div className="card p-12 text-center">
          <TrendingUp className="w-10 h-10 text-text-3 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-text-1 mb-1">
            No rankings yet
          </p>
          <p className="text-xs text-text-2">
            {period === 'daily'
              ? 'No matches have been completed today.'
              : period === 'weekly'
              ? 'No matches completed this week.'
              : period === 'monthly'
              ? 'No matches completed this month.'
              : 'No matches have been completed yet.'
            }
          </p>
        </div>
      )}

      {/* ── Top 10 list ── */}
      {!loading && !error && top10.length > 0 && (
        <div className="flex flex-col gap-2">

          {/* Top 3 podium highlight */}
          {top10.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {/* 2nd place */}
              <div className="flex flex-col items-center gap-2 pt-4">
                <Avatar
                  name={top10[1].name}
                  avatarUrl={top10[1].avatar_url}
                  isCurrentUser={top10[1].user_id === user?.id}
                  size="md"
                />
                <div className="text-center">
                  <p className="text-xs font-semibold text-text-1 truncate max-w-[80px]">
                    {top10[1].name.split(' ')[0]}
                  </p>
                  <p className="text-lg font-display font-bold text-gray-400">
                    {top10[1].wins}W
                  </p>
                </div>
                <div className="w-full bg-gray-400/20 border border-gray-400/20
                  rounded-t-lg flex items-center justify-center py-3">
                  <span className="text-2xl font-display font-black text-gray-400">
                    2
                  </span>
                </div>
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-2xl">👑</div>
                <Avatar
                  name={top10[0].name}
                  avatarUrl={top10[0].avatar_url}
                  isCurrentUser={top10[0].user_id === user?.id}
                  size="md"
                />
                <div className="text-center">
                  <p className="text-xs font-semibold text-text-1 truncate max-w-[80px]">
                    {top10[0].name.split(' ')[0]}
                  </p>
                  <p className="text-lg font-display font-bold text-yellow-400">
                    {top10[0].wins}W
                  </p>
                </div>
                <div className="w-full bg-yellow-400/15 border border-yellow-400/20
                  rounded-t-lg flex items-center justify-center py-5">
                  <span className="text-2xl font-display font-black text-yellow-400">
                    1
                  </span>
                </div>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center gap-2 pt-6">
                <Avatar
                  name={top10[2].name}
                  avatarUrl={top10[2].avatar_url}
                  isCurrentUser={top10[2].user_id === user?.id}
                  size="md"
                />
                <div className="text-center">
                  <p className="text-xs font-semibold text-text-1 truncate max-w-[80px]">
                    {top10[2].name.split(' ')[0]}
                  </p>
                  <p className="text-lg font-display font-bold text-orange-400">
                    {top10[2].wins}W
                  </p>
                </div>
                <div className="w-full bg-orange-400/15 border border-orange-400/20
                  rounded-t-lg flex items-center justify-center py-2">
                  <span className="text-2xl font-display font-black text-orange-400">
                    3
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ranks 1–10 list */}
          {top10.map(entry => (
            <LeaderboardRow
              key={entry.user_id}
              entry={entry}
              isCurrentUser={entry.user_id === user?.id}
            />
          ))}

          {/* ── Current user outside top 10 ── */}
          {showMyEntry && (
            <>
              {/* Divider with ellipsis */}
              <div className="flex items-center gap-3 py-2 px-2">
                <div className="flex-1 h-px bg-border border-dashed" />
                <div className="flex items-center gap-1.5 text-xs text-text-3">
                  <ChevronUp className="w-3 h-3" />
                  <span>{myEntry!.rank - 10} more above you</span>
                  <ChevronUp className="w-3 h-3" />
                </div>
                <div className="flex-1 h-px bg-border border-dashed" />
              </div>

              {/* My rank row */}
              <LeaderboardRow
                entry={myEntry!}
                isCurrentUser
              />

              {/* Motivational nudge */}
              <p className="text-center text-xs text-text-3 mt-1">
                {myEntry!.rank <= 20
                  ? `You're close! ${myEntry!.rank - 10} more win${myEntry!.rank - 10 > 1 ? 's' : ''} could get you into top 10.`
                  : `Keep playing to climb the ranks. You're at #${myEntry!.rank}.`
                }
              </p>
            </>
          )}

          {/* User is in top 10 but highlight note */}
          {iInTop10 && (
            <p className="text-center text-xs text-accent/70 mt-2">
              🎉 You're in the top 10!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
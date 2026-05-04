import { Users, Play, Edit3 } from 'lucide-react'
import type { Match } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import { matchStatusBadge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface MatchCardProps {
  match:          Match
  onView?:        (match: Match) => void
  onStart?:       (match: Match) => void
  onUpdateScore?: (match: Match) => void
}

export function MatchCard({ match, onView, onStart, onUpdateScore }: MatchCardProps) {
  const { user } = useAuth()
  const teamA = match.players.filter(p => p.team === 'A')
  const teamB = match.players.filter(p => p.team === 'B')

  // Only players assigned to this match can start or update score
  const isParticipant = !!user && match.players.some(p => p.user_id === user.id)

  const latestScore = match.scores.at(-1)
  const aScore = latestScore?.team_a_score ?? 0
  const bScore = latestScore?.team_b_score ?? 0
  const aWins  = aScore > bScore

  return (
    <div className={`card p-4 flex flex-col gap-3 ${match.status === 'LIVE' ? 'border-accent/30 bg-accent-soft/20' : ''}`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-text-1">
            {match.type === 'COURT' ? match.court?.name : 'Free Match'}
          </p>
          <p className="text-xs text-text-2">
            {match.scores.length > 0 ? `Set ${match.scores.length}` : 'No sets yet'} · {match.players.length} players
          </p>
        </div>
        {matchStatusBadge(match.status)}
      </div>

      {/* Score */}
      {match.status !== 'WAITING' && match.scores.length > 0 && (
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="text-center">
            <p className="text-xs text-text-2 mb-1">
              {teamA.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team A'}
            </p>
            <span className={`font-display text-4xl leading-none ${aWins ? 'text-accent' : 'text-text-1'}`}>
              {aScore}
            </span>
          </div>
          <span className="text-border-strong text-xl font-light">—</span>
          <div className="text-center">
            <p className="text-xs text-text-2 mb-1">
              {teamB.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team B'}
            </p>
            <span className={`font-display text-4xl leading-none ${!aWins && bScore > 0 ? 'text-accent' : 'text-text-1'}`}>
              {bScore}
            </span>
          </div>
        </div>
      )}

      {/* Waiting state — show player list */}
      {match.status === 'WAITING' && (
        <div className="flex flex-col gap-1.5 py-1">
          <div className="flex items-center gap-2 text-xs text-text-2">
            <Users className="w-3.5 h-3.5" />
            <span>{match.players.length} / 4 players</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {match.players.map(p => (
              <span key={p.id}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                  ${p.team === 'A' ? 'bg-accent-soft text-accent' : 'bg-blue-50 text-blue-600'}`}>
                {p.user?.name.split(' ')[0]} · {p.team}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <p className="text-xs text-text-2">
          {match.status === 'FINISHED' && match.ended_at
            ? `Ended ${new Date(match.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : match.status === 'LIVE' && match.started_at
            ? `Started ${new Date(match.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Waiting for players'}
        </p>

        <div className="flex gap-1.5">
          {/* WAITING → only participants can start */}
          {match.status === 'WAITING' && onStart && isParticipant && (
            <Button size="sm" onClick={() => onStart(match)}>
              <Play className="w-3 h-3" />
              Start
            </Button>
          )}

          {/* LIVE → only participants can update score */}
          {match.status === 'LIVE' && onUpdateScore && isParticipant && (
            <Button size="sm" variant="soft" onClick={() => onUpdateScore(match)}>
              <Edit3 className="w-3 h-3" />
              Score
            </Button>
          )}

          {/* LIVE → anyone can watch */}
          {match.status === 'LIVE' && onView && (
            <Button size="sm" variant="ghost" onClick={() => onView(match)}>
              Watch
            </Button>
          )}

          {/* FINISHED → anyone can view */}
          {match.status === 'FINISHED' && (
            <Button size="sm" variant="ghost" onClick={() => onView?.(match)}>
              View
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { Users, Play, Edit3, Trophy } from 'lucide-react'
import type { MatchWithDetails } from '../../types/database.types'
import { useAuthStore } from '../../store/authStore'
import { matchStatusBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ScoreUpdater } from '../match/ScoreUpdater'

interface MatchCardProps {
  match:          MatchWithDetails
  onView?:        (match: MatchWithDetails) => void
  onStart?:       (match: MatchWithDetails) => void
  onUpdateScore?: (match: MatchWithDetails) => void
  onRefresh?:     () => void
}

export function MatchCard({
  match, onView, onStart, onRefresh
}: MatchCardProps) {
  const { user } = useAuthStore()

  const [viewOpen,  setViewOpen]  = useState(false)
  const [scoreOpen, setScoreOpen] = useState(false)

  const teamA = match.match_players.filter(p => p.team === 'A')
  const teamB = match.match_players.filter(p => p.team === 'B')

  const isParticipant = !!user && match.match_players.some(p => p.user_id === user.id)

  // Latest set scores (for LIVE display)
  const latestScore = match.match_scores.at(-1)
  const aScore      = latestScore?.team_a_score ?? 0
  const bScore      = latestScore?.team_b_score ?? 0

  // Sets won (for FINISHED display)
  const aWins = match.match_scores.filter(s => s.team_a_score > s.team_b_score).length
  const bWins = match.match_scores.filter(s => s.team_b_score > s.team_a_score).length

  const teamAName = teamA.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team A'
  const teamBName = teamB.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team B'

  return (
    <>
      <div className={`card p-4 flex flex-col gap-3
        ${match.status === 'LIVE' ? 'border-accent/30 bg-accent-soft/20' : ''}`}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-1">
              {match.type === 'COURT'
                ? (match as any).court?.name ?? 'Court Match'
                : 'Free Match'}
            </p>
            <p className="text-xs text-text-2">
              {match.match_scores.length > 0
                ? `${match.match_scores.length} set${match.match_scores.length > 1 ? 's' : ''}`
                : 'No sets yet'
              } · {match.match_players.length} players
            </p>
          </div>
          {matchStatusBadge(match.status)}
        </div>

        {/* ── LIVE: show current set score ── */}
        {match.status === 'LIVE' && match.match_scores.length > 0 && (
          <div className="flex flex-col gap-2">
            {/* Set pills */}
            <div className="flex gap-1 flex-wrap justify-center">
              {match.match_scores.map(s => (
                <span
                  key={s.set_number}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                    ${s.set_number === latestScore?.set_number
                      ? 'bg-accent text-white'
                      : 'bg-bg-surface2 text-text-2'}`}
                >
                  S{s.set_number}: {s.team_a_score}–{s.team_b_score}
                </span>
              ))}
            </div>
            {/* Current set score */}
            <div className="flex items-center justify-center gap-6 py-1">
              <div className="text-center">
                <p className="text-xs text-text-2 mb-1">{teamAName}</p>
                <span className={`font-display text-4xl leading-none
                  ${aScore >= bScore ? 'text-accent' : 'text-text-1'}`}>
                  {aScore}
                </span>
              </div>
              <span className="text-border-strong text-xl font-light">—</span>
              <div className="text-center">
                <p className="text-xs text-text-2 mb-1">{teamBName}</p>
                <span className={`font-display text-4xl leading-none
                  ${bScore > aScore ? 'text-accent' : 'text-text-1'}`}>
                  {bScore}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── FINISHED: show sets won + all set scores ── */}
        {match.status === 'FINISHED' && match.match_scores.length > 0 && (
          <div className="flex flex-col gap-2">
            {/* Sets won */}
            <div className="flex items-center justify-center gap-6 py-1">
              <div className="text-center">
                <p className="text-xs text-text-2 mb-1">{teamAName}</p>
                <span className={`font-display text-4xl leading-none
                  ${aWins > bWins ? 'text-accent' : 'text-text-1'}`}>
                  {aWins}
                </span>
              </div>
              <div className="text-center">
                <Trophy className="w-4 h-4 text-text-3 mx-auto mb-1" />
                <p className="text-[10px] text-text-3">Sets</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-2 mb-1">{teamBName}</p>
                <span className={`font-display text-4xl leading-none
                  ${bWins > aWins ? 'text-accent' : 'text-text-1'}`}>
                  {bWins}
                </span>
              </div>
            </div>
            {/* All set scores breakdown */}
            <div className="flex gap-1 flex-wrap justify-center">
              {match.match_scores
                .sort((a, b) => a.set_number - b.set_number)
                .map(s => (
                  <span key={s.set_number}
                    className="text-[10px] px-2 py-0.5 rounded-full
                      bg-bg-surface2 text-text-2 font-medium">
                    S{s.set_number}: {s.team_a_score}–{s.team_b_score}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* ── WAITING: show players ── */}
        {match.status === 'WAITING' && (
          <div className="flex flex-col gap-1.5 py-1">
            <div className="flex items-center gap-2 text-xs text-text-2">
              <Users className="w-3.5 h-3.5" />
              <span>{match.match_players.length} / 4 players</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {match.match_players.map(p => (
                <span key={p.id}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                    ${p.team === 'A'
                      ? 'bg-accent-soft text-accent'
                      : 'bg-blue-50 text-blue-600'}`}>
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
              ? `Ended ${new Date(match.ended_at).toLocaleTimeString([],
                  { hour: '2-digit', minute: '2-digit' })}`
              : match.status === 'LIVE' && match.started_at
              ? `Started ${new Date(match.started_at).toLocaleTimeString([],
                  { hour: '2-digit', minute: '2-digit' })}`
              : 'Waiting for players'}
          </p>
          <div className="flex gap-1.5">
            {match.status === 'WAITING' && onStart && isParticipant && (
              <Button size="sm" onClick={() => onStart(match)}>
                <Play className="w-3 h-3" /> Start
              </Button>
            )}
            {match.status === 'LIVE' && isParticipant && (
              <Button size="sm" variant="soft"
                onClick={() => setScoreOpen(true)}>
                <Edit3 className="w-3 h-3" /> Score
              </Button>
            )}
            {match.status === 'LIVE' && (
              <Button size="sm" variant="ghost"
                onClick={() => onView?.(match)}>
                Watch
              </Button>
            )}
            {/* FIXED: View button now opens inline modal */}
            {match.status === 'FINISHED' && (
              <Button size="sm" variant="ghost"
                onClick={() => setViewOpen(true)}>
                View
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Inline score updater — uses local open state */}
      <ScoreUpdater
        match={match}
        open={scoreOpen}
        onClose={() => setScoreOpen(false)}
        onUpdate={() => { onRefresh?.(); setScoreOpen(false) }}
      />

      {/* Finished match detail modal */}
      {viewOpen && (
        <FinishedMatchModal
          match={match}
          onClose={() => setViewOpen(false)}
        />
      )}
    </>
  )
}

// ── Finished match detail modal ──────────────────────

import { Modal } from '../ui/Modal'

function FinishedMatchModal({
  match,
  onClose,
}: {
  match:   MatchWithDetails
  onClose: () => void
}) {
  const teamA = match.match_players.filter(p => p.team === 'A')
  const teamB = match.match_players.filter(p => p.team === 'B')

  const aWins = match.match_scores.filter(s => s.team_a_score > s.team_b_score).length
  const bWins = match.match_scores.filter(s => s.team_b_score > s.team_a_score).length

  const teamAName = teamA.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team A'
  const teamBName = teamB.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team B'

  const winner = aWins > bWins ? teamAName : bWins > aWins ? teamBName : null

  return (
    <Modal open onClose={onClose} title="Match Result" width="max-w-sm">
      <div className="flex flex-col gap-5">

        {/* Winner banner */}
        {winner && (
          <div className="bg-accent-soft border border-accent-mid rounded-lg
            px-4 py-3 text-center">
            <Trophy className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xs text-text-2">Winner</p>
            <p className="text-sm font-semibold text-accent">{winner}</p>
          </div>
        )}
        {!winner && (
          <div className="bg-bg-surface2 rounded-lg px-4 py-3 text-center">
            <p className="text-sm font-medium text-text-1">Draw</p>
          </div>
        )}

        {/* Sets won */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-xs text-text-2 mb-1">{teamAName}</p>
            <span className={`font-display text-5xl
              ${aWins > bWins ? 'text-accent' : 'text-text-1'}`}>
              {aWins}
            </span>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-3">Sets won</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-2 mb-1">{teamBName}</p>
            <span className={`font-display text-5xl
              ${bWins > aWins ? 'text-accent' : 'text-text-1'}`}>
              {bWins}
            </span>
          </div>
        </div>

        {/* Set-by-set breakdown */}
        <div>
          <p className="text-xs font-semibold text-text-3 uppercase
            tracking-wider mb-2">
            Set Scores
          </p>
          <div className="flex flex-col gap-1.5">
            {match.match_scores
              .sort((a, b) => a.set_number - b.set_number)
              .map(s => {
                const aWon = s.team_a_score > s.team_b_score
                const bWon = s.team_b_score > s.team_a_score
                return (
                  <div key={s.set_number}
                    className="flex items-center justify-between bg-bg-surface2
                      rounded-lg px-3 py-2">
                    <span className={`text-sm font-semibold w-8 text-center
                      ${aWon ? 'text-accent' : 'text-text-2'}`}>
                      {s.team_a_score}
                    </span>
                    <span className="text-xs text-text-3">
                      Set {s.set_number}
                    </span>
                    <span className={`text-sm font-semibold w-8 text-center
                      ${bWon ? 'text-accent' : 'text-text-2'}`}>
                      {s.team_b_score}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Players */}
        <div className="grid grid-cols-2 gap-3">
          {(['A', 'B'] as const).map(team => {
            const players = match.match_players.filter(p => p.team === team)
            return (
              <div key={team}>
                <p className="text-xs font-semibold text-text-3 mb-1">
                  Team {team}
                </p>
                {players.map(p => (
                  <p key={p.id} className="text-xs text-text-2">
                    {p.user?.name ?? '—'}
                  </p>
                ))}
              </div>
            )
          })}
        </div>

        <Button variant="secondary" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </Modal>
  )
}
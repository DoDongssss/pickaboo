import { useState } from 'react'
import { Radio, Edit3 } from 'lucide-react'
import type { MatchWithDetails } from '../types/database.types'
import { useMatches } from '../hooks/useMatches'
import { useRealtimeScores } from '../hooks/useRealtimeScores'
import { useAuthStore } from '../store/authStore'
import { ScoreUpdater } from '../components/match/ScoreUpdater'
import { Button } from '../components/ui/Button'

// ── Sub-component: one live scoreboard with realtime scores ──

function LiveScoreboard({
  match,
  onUpdateScore,
}: {
  match: MatchWithDetails
  onUpdateScore: () => void
  onRefresh: () => void
}) {
  // Subscribe to realtime score updates for this match
  const scores = useRealtimeScores(match.id, match.match_scores)

  const { user } = useAuthStore()
  const isParticipant = !!user && match.match_players.some(p => p.user_id === user.id)

  const teamA = match.match_players.filter(p => p.team === 'A')
  const teamB = match.match_players.filter(p => p.team === 'B')

  const latestScore = scores.at(-1)
  const aScore = latestScore?.team_a_score ?? 0
  const bScore = latestScore?.team_b_score ?? 0

  return (
    <div className="card border-accent/30 bg-gradient-to-br from-accent-soft/40
      to-bg-surface overflow-hidden">

      {/* Live banner */}
      <div className="bg-accent px-4 py-2 flex items-center gap-2">
        <span className="live-dot" />
        <span className="text-xs font-semibold text-white tracking-wider">
          LIVE MATCH
        </span>
        <span className="ml-auto text-xs text-white/70">
          {(match as any).court?.name ?? 'Free Match'}
        </span>
      </div>

      <div className="p-6">
        {/* Set pills */}
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          {scores.map(s => (
            <div
              key={s.set_number}
              className={`text-xs px-2 py-0.5 rounded-full font-medium
                ${s.set_number === (latestScore?.set_number ?? 1)
                  ? 'bg-accent text-white'
                  : 'bg-bg-surface2 text-text-2'}`}
            >
              Set {s.set_number}: {s.team_a_score}–{s.team_b_score}
            </div>
          ))}
        </div>

        {/* Score display */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <p className="text-xs font-medium text-text-2 mb-2">
              {teamA.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team A'}
            </p>
            <span className={`font-display text-7xl leading-none transition-all duration-300
              ${aScore >= bScore ? 'text-accent' : 'text-text-1'}`}>
              {aScore}
            </span>
          </div>
          <div className="text-border-strong font-display text-3xl select-none">—</div>
          <div className="text-center">
            <p className="text-xs font-medium text-text-2 mb-2">
              {teamB.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team B'}
            </p>
            <span className={`font-display text-7xl leading-none transition-all duration-300
              ${bScore > aScore ? 'text-accent' : 'text-text-1'}`}>
              {bScore}
            </span>
          </div>
        </div>

        {isParticipant && (
          <div className="flex justify-center">
            <Button variant="soft" size="sm" onClick={onUpdateScore}>
              <Edit3 className="w-3.5 h-3.5" /> Update Score
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────

export function LivePage() {
  const { matches, loading, refresh } = useMatches()

  const liveMatches     = matches.filter(m => m.status === 'LIVE')
  const finishedMatches = matches.filter(m => m.status === 'FINISHED')

  const [scoreMatch, setScoreMatch] = useState<MatchWithDetails | null>(null)

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-text-1 mb-1 flex items-center gap-2">
            <Radio className="w-5 h-5 text-accent" />
            Live Matches
          </h1>
          <p className="text-sm text-text-2">Real-time scores · Updates instantly</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent
            rounded-full animate-spin" />
        </div>
      )}

      {/* Live scoreboards */}
      {!loading && liveMatches.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3 opacity-30">📡</p>
          <p className="text-sm font-medium text-text-1">No live matches right now</p>
          <p className="text-xs text-text-2 mt-1">Go to Matches and start one.</p>
        </div>
      )}

      {!loading && liveMatches.length > 0 && (
        <div className="flex flex-col gap-4">
          {liveMatches.map(match => (
            <LiveScoreboard
              key={match.id}
              match={match}
              onUpdateScore={() => setScoreMatch(match)}
              onRefresh={refresh}
            />
          ))}
        </div>
      )}

      {/* Recently finished */}
      {!loading && finishedMatches.length > 0 && (
        <div className="mt-10">
          <p className="section-label">Recently Finished</p>
          <div className="flex flex-col gap-3">
            {finishedMatches.map(match => {
              const teamA = match.match_players.filter(p => p.team === 'A')
              const teamB = match.match_players.filter(p => p.team === 'B')

              // Sets won — not last set score
              const aWins = match.match_scores.filter(
                s => s.team_a_score > s.team_b_score
              ).length
              const bWins = match.match_scores.filter(
                s => s.team_b_score > s.team_a_score
              ).length

              const teamAName = teamA.map(p => p.user?.name.split(' ')[0]).join('/') || 'Team A'
              const teamBName = teamB.map(p => p.user?.name.split(' ')[0]).join('/') || 'Team B'

              return (
                <div key={match.id} className="card p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-1">
                        {(match as any).court?.name ?? 'Free Match'}
                      </p>
                      <p className="text-xs text-text-2 truncate">
                        {teamAName} vs {teamBName}
                      </p>
                    </div>

                    {/* Sets won */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`font-display text-2xl
                        ${aWins > bWins ? 'text-accent' : 'text-text-2'}`}>
                        {aWins}
                      </span>
                      <span className="text-text-3 text-sm">–</span>
                      <span className={`font-display text-2xl
                        ${bWins > aWins ? 'text-accent' : 'text-text-2'}`}>
                        {bWins}
                      </span>
                      <span className="text-xs text-text-3">sets</span>
                    </div>

                    {/* Per-set breakdown */}
                    <div className="flex gap-1 flex-shrink-0">
                      {match.match_scores
                        .sort((a, b) => a.set_number - b.set_number)
                        .map(s => (
                          <span key={s.set_number}
                            className="text-[10px] px-1.5 py-0.5 rounded
                              bg-bg-surface2 text-text-3 font-mono">
                            {s.team_a_score}–{s.team_b_score}
                          </span>
                        ))}
                    </div>

                    <span className="badge badge-waiting flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      Finished
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Score updater */}
      {scoreMatch && (
        <ScoreUpdater
          match={scoreMatch}
          open={!!scoreMatch}
          onClose={() => setScoreMatch(null)}
          onUpdate={refresh}
        />
      )}
    </div>
  )
}
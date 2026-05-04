import { useState } from 'react'
import { Radio, Edit3 } from 'lucide-react'
import type { Match } from '../types'
import { useMatchStore } from '../store'
import { useAuth } from '../hooks/useAuth'
import { useRealtimeScores } from '../hooks/useRealtimeScores'
import { ScoreUpdater } from '../components/match/ScoreUpdater'
import { Button } from '../components/ui/Button'

// Sub-component: renders one live scoreboard and subscribes to realtime ticks
function LiveScoreboard({ match, onUpdateScore }: { match: Match; onUpdateScore: () => void }) {
  useRealtimeScores(match.id)

  const { user } = useAuth()
  const isParticipant = !!user && match.players.some(p => p.user_id === user.id)

  const teamA = match.players.filter(p => p.team === 'A')
  const teamB = match.players.filter(p => p.team === 'B')
  const latestScore = match.scores.at(-1)
  const aScore = latestScore?.team_a_score ?? 0
  const bScore = latestScore?.team_b_score ?? 0

  return (
    <div className="card border-accent/30 bg-gradient-to-br from-accent-soft/40 to-white overflow-hidden">
      {/* Live banner */}
      <div className="bg-accent px-4 py-2 flex items-center gap-2">
        <span className="live-dot" />
        <span className="text-xs font-semibold text-white tracking-wider">LIVE MATCH</span>
        <span className="ml-auto text-xs text-white/70">
          {match.court?.name ?? 'Free Match'}
        </span>
      </div>

      <div className="p-6">
        {/* Set indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {match.scores.map(s => (
            <div key={s.set_number}
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

        {/* Update score — only visible to match participants */}
        {isParticipant && (
          <div className="flex justify-center">
            <Button variant="soft" size="sm" onClick={onUpdateScore}>
              <Edit3 className="w-3.5 h-3.5" />
              Update Score
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function LivePage() {
  const { matches } = useMatchStore()

  const liveMatches     = matches.filter(m => m.status === 'LIVE')
  const finishedMatches = matches.filter(m => m.status === 'FINISHED')

  const [scoreMatch, setScoreMatch] = useState<Match | null>(null)

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-text-1 mb-1 flex items-center gap-2">
            <Radio className="w-5 h-5 text-accent" />
            Live Matches
          </h1>
          <p className="text-sm text-text-2">
            Real-time scores · Auto-updates every 6s
          </p>
        </div>
      </div>

      {/* Live scoreboards */}
      {liveMatches.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3 opacity-30">📡</p>
          <p className="text-sm font-medium text-text-1">No live matches right now</p>
          <p className="text-xs text-text-2 mt-1">Go to Matches and start one.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {liveMatches.map(match => (
            <LiveScoreboard
              key={match.id}
              match={match}
              onUpdateScore={() => setScoreMatch(match)}
            />
          ))}
        </div>
      )}

      {/* Recently finished */}
      {finishedMatches.length > 0 && (
        <div className="mt-10">
          <p className="section-label">Recently Finished</p>
          <div className="flex flex-col gap-3">
            {finishedMatches.map(match => {
              const teamA   = match.players.filter(p => p.team === 'A')
              const teamB   = match.players.filter(p => p.team === 'B')
              const aWins   = match.scores.filter(s => s.team_a_score > s.team_b_score).length
              const bWins   = match.scores.filter(s => s.team_b_score > s.team_a_score).length
              return (
                <div key={match.id} className="card p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-text-1">
                      {match.court?.name ?? 'Free Match'}
                    </p>
                    <p className="text-xs text-text-2">
                      {teamA.map(p => p.user?.name.split(' ')[0]).join('/')} vs{' '}
                      {teamB.map(p => p.user?.name.split(' ')[0]).join('/')}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-xl text-text-1">{aWins} – {bWins}</p>
                    <p className="text-xs text-text-3">Sets won</p>
                  </div>
                  <span className="badge badge-waiting">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    Finished
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Score updater modal */}
      {scoreMatch && (
        <ScoreUpdater
          match={matches.find(m => m.id === scoreMatch.id) ?? scoreMatch}
          open={!!scoreMatch}
          onClose={() => setScoreMatch(null)}
        />
      )}
    </div>
  )
}
import { useState } from 'react'
import { Plus, Swords } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Match, MatchStatus } from '../types'
import { useMatchStore } from '../store'
import { MatchCard } from '../components/matches/MatchCard'
import { CreateMatchModal } from '../components/match/CreateMatchModal'
import { ScoreUpdater } from '../components/match/ScoreUpdater'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Skeleton'

type Filter = 'ALL' | MatchStatus

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',      value: 'ALL'      },
  { label: 'Live',     value: 'LIVE'     },
  { label: 'Waiting',  value: 'WAITING'  },
  { label: 'Finished', value: 'FINISHED' },
]

export function MatchesPage() {
  const navigate = useNavigate()
  const { matches, addMatch, setMatchStatus } = useMatchStore()

  const [filter,     setFilter]     = useState<Filter>('ALL')
  const [createOpen, setCreateOpen] = useState(false)
  const [scoreMatch, setScoreMatch] = useState<Match | null>(null)

  const filtered = matches.filter(m =>
    filter === 'ALL' ? true : m.status === filter
  )

  function handleView(match: Match) {
    if (match.status === 'LIVE') navigate('/live')
  }

  function handleStartMatch(match: Match) {
    setMatchStatus(match.id, 'LIVE')
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-text-1 mb-1">Matches</h1>
          <p className="text-sm text-text-2">Create, manage, and track matches.</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          New Match
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-bg-surface2 border border-border rounded-lg p-1 mb-6 w-fit">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 cursor-pointer border-none
              ${filter === f.value
                ? 'bg-bg-surface text-text-1 shadow-sm'
                : 'bg-transparent text-text-2 hover:text-text-1'}`}
          >
            {f.label}
            {f.value !== 'ALL' && (
              <span className="ml-1.5 text-[10px] bg-bg-surface2 text-text-3 px-1.5 py-0.5 rounded-full">
                {matches.filter(m => m.status === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Match grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Swords />}
          title="No matches found"
          description="Try a different filter or create a new match."
          action={<Button size="sm" onClick={() => setCreateOpen(true)}>Create Match</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((match, i) => (
            <div
              key={match.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
            >
              <MatchCard
                match={match}
                onView={handleView}
                onStart={() => handleStartMatch(match)}
                onUpdateScore={() => setScoreMatch(match)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create match modal */}
      <CreateMatchModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(match) => { addMatch(match); setCreateOpen(false) }}
      />

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

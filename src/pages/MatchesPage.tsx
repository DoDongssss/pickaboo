import { useState } from 'react'
import { Plus, Swords, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { MatchWithDetails, MatchStatus } from '../types/database.types'
import { useMatches } from '../hooks/useMatches'
import { startMatch } from '../services/matchService'
import { useToast } from '../components/ui/Toast'
import { MatchCard } from '../components/matches/MatchCard'
import { CreateMatchModal } from '../components/match/CreateMatchModal'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Skeleton'

type Filter = 'ALL' | MatchStatus

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',      value: 'ALL'      },
  { label: 'Live',     value: 'LIVE'     },
  { label: 'Waiting',  value: 'WAITING'  },
  { label: 'Finished', value: 'FINISHED' },
]

function todayISO() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatDateLabel(iso: string) {
  if (iso === todayISO()) return 'Today'

  const prev = new Date(iso + 'T12:00:00')
  prev.setDate(prev.getDate() + 1)
  if (prev.toISOString().slice(0, 10) === todayISO()) return 'Yesterday'

  return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function stepDate(iso: string, delta: 1 | -1) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

export function MatchesPage() {
  const navigate = useNavigate()
  const toast    = useToast()

  const [filter,     setFilter]     = useState<Filter>('ALL')
  const [date,       setDate]       = useState<string>(todayISO())
  const [page,       setPage]       = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  function changeFilter(f: Filter)  { setFilter(f); setPage(1) }
  function changeDate(d: string)    { setDate(d);   setPage(1) }

  const { matches, loading, total, pageCount, refresh } = useMatches({
    status: filter,
    date,
    page,
  })

  async function handleStartMatch(match: MatchWithDetails) {
    try {
      await startMatch(match.id)
      toast.success('Match started!', 'The match is now live.')
      refresh()
    } catch (err: any) {
      toast.error('Failed to start', err.message)
    }
  }

  function handleView(match: MatchWithDetails) {
    if (match.status === 'LIVE') navigate('/live')
  }

  const isToday = date === todayISO()

  return (
    <div className="animate-slide-up">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-text-1 mb-1">Matches</h1>
          <p className="text-sm text-text-2">Create, manage, and track matches.</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> New Match
        </Button>
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-4 h-4 text-text-3 flex-shrink-0" />

        <button
          onClick={() => changeDate(stepDate(date, -1))}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-border
            bg-bg-surface text-text-2 hover:border-border-strong hover:text-text-1
            transition-all cursor-pointer"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Styled date pill with hidden native input on top */}
        <div className="relative">
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={e => e.target.value && changeDate(e.target.value)}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <span className="px-3 py-1.5 rounded-md border border-border bg-bg-surface
            text-xs font-medium text-text-1 pointer-events-none select-none block">
            {formatDateLabel(date)}
          </span>
        </div>

        <button
          onClick={() => !isToday && changeDate(stepDate(date, 1))}
          disabled={isToday}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-border
            bg-bg-surface text-text-2 hover:border-border-strong hover:text-text-1
            transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next day"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {!isToday && (
          <button
            onClick={() => changeDate(todayISO())}
            className="text-xs text-accent hover:underline cursor-pointer"
          >
            Back to today
          </button>
        )}

        {!loading && (
          <span className="ml-auto text-xs text-text-3">
            {total} match{total !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 bg-bg-surface2 border border-border rounded-lg
        p-1 mb-6 w-fit">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => changeFilter(f.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all
              duration-150 cursor-pointer border-none
              ${filter === f.value
                ? 'bg-bg-surface text-text-1 shadow-sm'
                : 'bg-transparent text-text-2 hover:text-text-1'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Match list */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent
            rounded-full animate-spin" />
        </div>
      )}

      {!loading && matches.length === 0 && (
        <EmptyState
          icon={<Swords />}
          title="No matches found"
          description={`No${filter !== 'ALL' ? ` ${filter.toLowerCase()}` : ''} matches on ${formatDateLabel(date)}.`}
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              Create Match
            </Button>
          }
        />
      )}

      {!loading && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match, i) => (
            <div
              key={match.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
            >
              <MatchCard
                match={match}
                onView={handleView}
                onStart={() => handleStartMatch(match)}
                onRefresh={refresh}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border
              bg-bg-surface text-text-2 hover:border-border-strong hover:text-text-1
              transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-md border
                text-xs font-medium transition-all cursor-pointer
                ${p === page
                  ? 'bg-accent text-white border-accent'
                  : 'bg-bg-surface border-border text-text-2 hover:border-border-strong hover:text-text-1'}`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border
              bg-bg-surface text-text-2 hover:border-border-strong hover:text-text-1
              transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs text-text-3 ml-1">
            Page {page} of {pageCount}
          </span>
        </div>
      )}

      <CreateMatchModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false)
          refresh()
        }}
      />
    </div>
  )
}
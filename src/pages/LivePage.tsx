import { useState, useRef } from 'react'
import { Radio, Edit3, ChevronLeft, ChevronRight } from 'lucide-react'
import type { MatchWithDetails } from '../types/database.types'
import { useMatches } from '../hooks/useMatches'
import { useRealtimeScores } from '../hooks/useRealtimeScores'
import { useAuthStore } from '../store/authStore'
import { ScoreUpdater } from '../components/match/ScoreUpdater'

// ── Helpers ──────────────────────────────────────────────

function todayISO() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// ── Pagination ───────────────────────────────────────────

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page:      number
  pageCount: number
  onChange:  (p: number) => void
}) {
  if (pageCount <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
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
          onClick={() => onChange(p)}
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
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className="w-8 h-8 flex items-center justify-center rounded-md border border-border
          bg-bg-surface text-text-2 hover:border-border-strong hover:text-text-1
          transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <span className="text-xs text-text-3 ml-1">Page {page} of {pageCount}</span>
    </div>
  )
}

// ── Single carousel card ─────────────────────────────────

function LiveScoreCard({
  match,
  index,
  onUpdateScore,
}: {
  match:         MatchWithDetails
  index:         number
  onUpdateScore: () => void
}) {
  const scores        = useRealtimeScores(match.id, match.match_scores)
  const { user }      = useAuthStore()
  const isParticipant = !!user && match.match_players.some(p => p.user_id === user.id)

  const teamA       = match.match_players.filter(p => p.team === 'A')
  const teamB       = match.match_players.filter(p => p.team === 'B')
  const latestScore = scores.at(-1)
  const aScore      = latestScore?.team_a_score ?? 0
  const bScore      = latestScore?.team_b_score ?? 0
  const aWinning    = aScore > bScore
  const bWinning    = bScore > aScore

  return (
    <div
      className="flex-shrink-0 w-[300px] sm:w-[340px] rounded-2xl overflow-hidden
        border border-border bg-bg-surface shadow-sm flex flex-col"
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Top bar */}
      <div className="bg-accent px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-xs font-bold text-white tracking-widest">LIVE</span>
          <span className="text-xs text-white/60 font-medium">#{index + 1}</span>
        </div>
        <span className="text-xs text-white/70 truncate max-w-[140px]">
          {(match as any).court?.name ?? 'Free Match'}
        </span>
      </div>

      {/* Score area */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-5 gap-3">

        {/* Teams + scores */}
        <div className="flex items-center justify-between w-full gap-2">

          {/* Team A */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <p className="text-[11px] font-medium text-text-2 truncate w-full text-center">
              {teamA.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team A'}
            </p>
            <span className={`font-display text-6xl leading-none transition-all duration-300
              ${aWinning ? 'text-accent' : 'text-text-1'}`}>
              {aScore}
            </span>
            {aWinning && (
              <span className="text-[10px] font-semibold text-accent tracking-wide">LEADING</span>
            )}
            {!aWinning && <span className="text-[10px] text-transparent select-none">·</span>}
          </div>

          {/* VS divider */}
          <span className="text-text-3 font-display text-2xl select-none flex-shrink-0">—</span>

          {/* Team B */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <p className="text-[11px] font-medium text-text-2 truncate w-full text-center">
              {teamB.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team B'}
            </p>
            <span className={`font-display text-6xl leading-none transition-all duration-300
              ${bWinning ? 'text-accent' : 'text-text-1'}`}>
              {bScore}
            </span>
            {bWinning && (
              <span className="text-[10px] font-semibold text-accent tracking-wide">LEADING</span>
            )}
            {!bWinning && <span className="text-[10px] text-transparent select-none">·</span>}
          </div>
        </div>

        {/* Set pills */}
        {scores.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {scores.map(s => (
              <span
                key={s.set_number}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                  ${s.set_number === (latestScore?.set_number ?? 1)
                    ? 'bg-accent text-white'
                    : 'bg-bg-surface2 text-text-3'}`}
              >
                S{s.set_number}: {s.team_a_score}–{s.team_b_score}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Update score — participants only */}
      {isParticipant && (
        <div className="px-4 pb-4">
          <button
            onClick={onUpdateScore}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg
              border border-accent/30 bg-accent-soft text-accent text-xs font-medium
              hover:bg-accent hover:text-white transition-all cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            Update Score
          </button>
        </div>
      )}
    </div>
  )
}

// ── Carousel wrapper ─────────────────────────────────────

function LiveCarousel({
  matches,
  onUpdateScore,
}: {
  matches:       MatchWithDetails[]
  onUpdateScore: (m: MatchWithDetails) => void
}) {
  const scrollRef         = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  const CARD_WIDTH = 340 + 12 // card width + gap

  function scrollTo(index: number) {
    const clamped = Math.max(0, Math.min(matches.length - 1, index))
    scrollRef.current?.scrollTo({ left: clamped * CARD_WIDTH, behavior: 'smooth' })
    setCurrent(clamped)
  }

  return (
    <div>
      {/* Header row: count + arrow controls */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-text-3">
          {matches.length} match{matches.length !== 1 ? 'es' : ''} in progress
        </span>

        {matches.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollTo(current - 1)}
              disabled={current === 0}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-border
                bg-bg-surface text-text-2 hover:border-border-strong hover:text-text-1
                transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-text-3 min-w-[40px] text-center">
              {current + 1} / {matches.length}
            </span>
            <button
              onClick={() => scrollTo(current + 1)}
              disabled={current === matches.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-border
                bg-bg-surface text-text-2 hover:border-border-strong hover:text-text-1
                transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3"
        style={{
          scrollSnapType:  'x mandatory',
          scrollbarWidth:  'none',
          msOverflowStyle: 'none',
        }}
        onScroll={e => {
          const idx = Math.round(e.currentTarget.scrollLeft / CARD_WIDTH)
          setCurrent(Math.max(0, Math.min(matches.length - 1, idx)))
        }}
      >
        {matches.map((match, i) => (
          <LiveScoreCard
            key={match.id}
            match={match}
            index={i}
            onUpdateScore={() => onUpdateScore(match)}
          />
        ))}
        {/* trailing spacer */}
        <div className="flex-shrink-0 w-1" />
      </div>

      {/* Dot indicators */}
      {matches.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {matches.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`rounded-full transition-all duration-200 cursor-pointer
                ${i === current
                  ? 'w-5 h-1.5 bg-accent'
                  : 'w-1.5 h-1.5 bg-border-strong hover:bg-accent/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────

const TODAY = todayISO()

export function LivePage() {
  const [livePage,     setLivePage]     = useState(1)
  const [finishedPage, setFinishedPage] = useState(1)
  const [scoreMatch,   setScoreMatch]   = useState<MatchWithDetails | null>(null)

  const {
    matches:   liveMatches,
    loading:   liveLoading,
    pageCount: livePageCount,
    refresh:   refreshLive,
  } = useMatches({ status: 'LIVE', date: TODAY, page: livePage, perPage: 10 })

  const {
    matches:   finishedMatches,
    loading:   finishedLoading,
    pageCount: finishedPageCount,
    refresh:   refreshFinished,
  } = useMatches({ status: 'FINISHED', date: TODAY, page: finishedPage, perPage: 5 })

  function refresh() {
    refreshLive()
    refreshFinished()
  }

  const loading = liveLoading && finishedLoading

  return (
    <div className="animate-slide-up">

      {/* Header */}
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

      {/* Carousel */}
      {!liveLoading && liveMatches.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3 opacity-30">📡</p>
          <p className="text-sm font-medium text-text-1">No live matches right now</p>
          <p className="text-xs text-text-2 mt-1">Go to Matches and start one.</p>
        </div>
      )}

      {!liveLoading && liveMatches.length > 0 && (
        <>
          <LiveCarousel
            matches={liveMatches}
            onUpdateScore={setScoreMatch}
          />
          <Pagination
            page={livePage}
            pageCount={livePageCount}
            onChange={p => { setLivePage(p) }}
          />
        </>
      )}

      {/* Recently finished */}
      {!finishedLoading && finishedMatches.length > 0 && (
        <div className="mt-10">
          <p className="section-label">Recently Finished</p>
          <div className="flex flex-col gap-3">
            {finishedMatches.map(match => {
              const teamA = match.match_players.filter(p => p.team === 'A')
              const teamB = match.match_players.filter(p => p.team === 'B')

              const aWins     = match.match_scores.filter(s => s.team_a_score > s.team_b_score).length
              const bWins     = match.match_scores.filter(s => s.team_b_score > s.team_a_score).length
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

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`font-display text-2xl ${aWins > bWins ? 'text-accent' : 'text-text-2'}`}>
                        {aWins}
                      </span>
                      <span className="text-text-3 text-sm">–</span>
                      <span className={`font-display text-2xl ${bWins > aWins ? 'text-accent' : 'text-text-2'}`}>
                        {bWins}
                      </span>
                      <span className="text-xs text-text-3">sets</span>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {match.match_scores
                        .sort((a, b) => a.set_number - b.set_number)
                        .map(s => (
                          <span key={s.set_number}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-bg-surface2 text-text-3 font-mono">
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
          <Pagination
            page={finishedPage}
            pageCount={finishedPageCount}
            onChange={p => setFinishedPage(p)}
          />
        </div>
      )}

      {/* Score updater modal */}
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
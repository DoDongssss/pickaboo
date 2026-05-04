import { useState } from 'react'
import { Plus, Minus, CheckCircle2, Lock } from 'lucide-react'
import type { Match } from '../../types'
import { useMatchStore } from '../../store'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface ScoreUpdaterProps {
  match:   Match
  open:    boolean
  onClose: () => void
}

export function ScoreUpdater({ match, open, onClose }: ScoreUpdaterProps) {
  const { updateScore, setMatchStatus } = useMatchStore()
  const { user } = useAuth()

  const isParticipant = !!user && match.players.some(p => p.user_id === user.id)

  const currentSet  = match.scores.at(-1)
  const setNumber   = currentSet?.set_number ?? 1
  const [aScore, setAScore] = useState(currentSet?.team_a_score ?? 0)
  const [bScore, setBScore] = useState(currentSet?.team_b_score ?? 0)
  const [saved, setSaved]   = useState(false)

  const teamA = match.players.filter(p => p.team === 'A')
  const teamB = match.players.filter(p => p.team === 'B')

  const teamALabel = teamA.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team A'
  const teamBLabel = teamB.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team B'

  function saveScore() {
    updateScore(match.id, setNumber, aScore, bScore)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function addSet() {
    const nextSet = setNumber + 1
    updateScore(match.id, nextSet, 0, 0)
    setAScore(0)
    setBScore(0)
  }

  function endMatch() {
    updateScore(match.id, setNumber, aScore, bScore)
    setMatchStatus(match.id, 'FINISHED')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Update Score" width="max-w-sm">
      {/* Guard — non-participants see a blocked state */}
      {!isParticipant ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-bg-surface2 flex items-center justify-center">
            <Lock className="w-5 h-5 text-text-3" />
          </div>
          <p className="text-sm font-medium text-text-1">Access restricted</p>
          <p className="text-xs text-text-2">Only players in this match can update the score.</p>
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
        </div>
      ) : (
      <div className="flex flex-col gap-5">

        {/* Set indicator */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-2">
            Set <span className="font-semibold text-text-1">{setNumber}</span>
          </p>
          <div className="flex gap-1">
            {match.scores.map(s => (
              <div
                key={s.set_number}
                className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center
                  ${s.set_number === setNumber ? 'bg-accent text-white' : 'bg-bg-surface2 text-text-2'}`}
              >
                {s.set_number}
              </div>
            ))}
          </div>
        </div>

        {/* Score controls */}
        <div className="grid grid-cols-2 gap-4">
          {/* Team A */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-medium text-text-2 text-center">{teamALabel}</p>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setAScore(s => s + 1)}
                className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
              <span className="font-display text-5xl text-text-1 leading-none">{aScore}</span>
              <button
                onClick={() => setAScore(s => Math.max(0, s - 1))}
                disabled={aScore === 0}
                className="w-10 h-10 rounded-full border border-border bg-bg-surface flex items-center justify-center hover:bg-bg-surface2 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4 text-text-2" />
              </button>
            </div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-medium text-text-2 text-center">{teamBLabel}</p>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setBScore(s => s + 1)}
                className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
              <span className="font-display text-5xl text-text-1 leading-none">{bScore}</span>
              <button
                onClick={() => setBScore(s => Math.max(0, s - 1))}
                disabled={bScore === 0}
                className="w-10 h-10 rounded-full border border-border bg-bg-surface flex items-center justify-center hover:bg-bg-surface2 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4 text-text-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1 border-t border-border">
          <Button onClick={saveScore} className="w-full gap-2">
            {saved
              ? <><CheckCircle2 className="w-4 h-4" />Saved!</>
              : 'Save Score'
            }
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={addSet} className="text-xs">
              + New Set
            </Button>
            <Button variant="ghost" onClick={endMatch} className="text-xs text-status-error hover:bg-status-errorBg">
              End Match
            </Button>
          </div>
        </div>
      </div>
      )}
    </Modal>
  )
}
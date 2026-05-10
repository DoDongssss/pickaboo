import { useState, useEffect } from 'react'
import { Plus, Minus, CheckCircle2, Lock } from 'lucide-react'
import type { MatchWithDetails } from '../../types/database.types'
import { useAuthStore } from '../../store/authStore'
import { upsertScore, endMatch } from '../../services/matchService'
import { useToast } from '../ui/Toast'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface ScoreUpdaterProps {
  match:    MatchWithDetails
  open:     boolean
  onClose:  () => void
  onUpdate: () => void
}

export function ScoreUpdater({ match, open, onClose, onUpdate }: ScoreUpdaterProps) {
  const { user } = useAuthStore()
  const toast    = useToast()

  const isParticipant = !!user && match.match_players.some(p => p.user_id === user.id)

  // Sort scores to always get the true latest set
  const sortedScores = [...match.match_scores].sort((a, b) => a.set_number - b.set_number)
  const currentSet   = sortedScores.at(-1)
  const setNumber    = currentSet?.set_number ?? 1

  const [aScore, setAScore] = useState(currentSet?.team_a_score ?? 0)
  const [bScore, setBScore] = useState(currentSet?.team_b_score ?? 0)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  // ── Sync scores when match data refreshes ──
  // Fixes: scores showing 0-0 after refresh or adding a new set
  useEffect(() => {
    const latest = [...match.match_scores]
      .sort((a, b) => a.set_number - b.set_number)
      .at(-1)
    setAScore(latest?.team_a_score ?? 0)
    setBScore(latest?.team_b_score ?? 0)
  }, [match.match_scores])

  const teamA      = match.match_players.filter(p => p.team === 'A')
  const teamB      = match.match_players.filter(p => p.team === 'B')
  const teamALabel = teamA.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team A'
  const teamBLabel = teamB.map(p => p.user?.name.split(' ')[0]).join(' & ') || 'Team B'

  async function saveScore() {
    setSaving(true)
    try {
      await upsertScore(match.id, setNumber, aScore, bScore)
      setSaved(true)
      toast.success('Score saved', `Set ${setNumber}: ${aScore} – ${bScore}`)
      onUpdate()
      setTimeout(() => setSaved(false), 1500)
    } catch (err: any) {
      toast.error('Failed to save', err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddSet() {
    // Save current set first
    setSaving(true)
    try {
      await upsertScore(match.id, setNumber, aScore, bScore)
      const nextSet = setNumber + 1
      await upsertScore(match.id, nextSet, 0, 0)
      toast.success(`Set ${nextSet} started`)
      onUpdate()
      // Local state resets via the useEffect above when match refreshes
    } catch (err: any) {
      toast.error('Failed to add set', err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleEndMatch() {
    setSaving(true)
    try {
      await upsertScore(match.id, setNumber, aScore, bScore)
      await endMatch(match.id)
      toast.success('Match finished', 'Final scores recorded.')
      onUpdate()
      onClose()
    } catch (err: any) {
      toast.error('Failed to end match', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Update Score" width="max-w-sm">
      {!isParticipant ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-bg-surface2
            flex items-center justify-center">
            <Lock className="w-5 h-5 text-text-3" />
          </div>
          <p className="text-sm font-medium text-text-1">Access restricted</p>
          <p className="text-xs text-text-2">
            Only players in this match can update the score.
          </p>
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">

          {/* Set history */}
          {sortedScores.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-text-3 font-medium">All sets</p>
              <div className="flex gap-1.5 flex-wrap">
                {sortedScores.map(s => (
                  <div key={s.set_number}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg
                      text-xs font-medium
                      ${s.set_number === setNumber
                        ? 'bg-accent text-white'
                        : 'bg-bg-surface2 text-text-2'}`}>
                    <span>S{s.set_number}</span>
                    <span className="opacity-70">
                      {s.team_a_score}–{s.team_b_score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current set label */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-2">
              Editing{' '}
              <span className="font-semibold text-text-1">Set {setNumber}</span>
            </p>
          </div>

          {/* Score controls */}
          <div className="grid grid-cols-2 gap-4">
            {/* Team A */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs font-medium text-text-2 text-center">
                {teamALabel}
              </p>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setAScore(s => s + 1)}
                  className="w-10 h-10 rounded-full bg-accent text-white flex
                    items-center justify-center hover:opacity-90
                    transition-opacity cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <span className="font-display text-5xl text-text-1 leading-none
                  min-w-[60px] text-center">
                  {aScore}
                </span>
                <button
                  onClick={() => setAScore(s => Math.max(0, s - 1))}
                  disabled={aScore === 0}
                  className="w-10 h-10 rounded-full border border-border bg-bg-surface
                    flex items-center justify-center hover:bg-bg-surface2
                    disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4 text-text-2" />
                </button>
              </div>
            </div>

            {/* Team B */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs font-medium text-text-2 text-center">
                {teamBLabel}
              </p>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setBScore(s => s + 1)}
                  className="w-10 h-10 rounded-full bg-accent text-white flex
                    items-center justify-center hover:opacity-90
                    transition-opacity cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <span className="font-display text-5xl text-text-1 leading-none
                  min-w-[60px] text-center">
                  {bScore}
                </span>
                <button
                  onClick={() => setBScore(s => Math.max(0, s - 1))}
                  disabled={bScore === 0}
                  className="w-10 h-10 rounded-full border border-border bg-bg-surface
                    flex items-center justify-center hover:bg-bg-surface2
                    disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4 text-text-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1 border-t border-border">
            <Button onClick={saveScore} loading={saving} className="w-full gap-2">
              {saved
                ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                : `Save Set ${setNumber} Score`
              }
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={handleAddSet}
                loading={saving} className="text-xs">
                + New Set
              </Button>
              <Button variant="ghost" onClick={handleEndMatch}
                loading={saving}
                className="text-xs text-status-error hover:bg-status-errorBg">
                End Match
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
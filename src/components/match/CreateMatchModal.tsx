import { useState } from 'react'
import { UserPlus, Check } from 'lucide-react'
import type { Match, MatchType, Team, PlayerRole } from '../../types'
import { MOCK_USERS, MOCK_COURTS, CURRENT_USER } from '../../data/mock'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface CreateMatchModalProps {
  open:    boolean
  onClose: () => void
  onCreated: (match: Match) => void
}

interface PlayerEntry {
  userId: string
  team:   Team
  role:   PlayerRole
}

export function CreateMatchModal({ open, onClose, onCreated }: CreateMatchModalProps) {
  const [step, setStep]         = useState<1 | 2>(1)
  const [type, setType]         = useState<MatchType>('FREE')
  const [courtId, setCourtId]   = useState(MOCK_COURTS[0].id)
  const [players, setPlayers]   = useState<PlayerEntry[]>([
    { userId: CURRENT_USER.id, team: 'A', role: 'player' },
  ])

  function togglePlayer(userId: string) {
    if (players.some(p => p.userId === userId)) {
      setPlayers(prev => prev.filter(p => p.userId !== userId))
    } else {
      const team: Team = players.filter(p => p.role !== 'scorekeeper').length < 2 ? 'A' : 'B'
      setPlayers(prev => [...prev, { userId, team, role: 'player' }])
    }
  }

  function setPlayerTeam(userId: string, team: Team) {
    setPlayers(prev => prev.map(p => p.userId === userId ? { ...p, team } : p))
  }

  function create() {
    const match: Match = {
      id:         `m-${Date.now()}`,
      type,
      court_id:   type === 'COURT' ? courtId : undefined,
      court:      type === 'COURT' ? MOCK_COURTS.find(c => c.id === courtId) : undefined,
      status:     'WAITING',
      created_by: CURRENT_USER.id,
      players: players.map((p, i) => ({
        id:       `mp-${Date.now()}-${i}`,
        match_id: `m-${Date.now()}`,
        user_id:  p.userId,
        user:     MOCK_USERS.find(u => u.id === p.userId),
        team:     p.team,
        role:     p.role,
      })),
      scores:     [],
      created_at: new Date().toISOString(),
    }
    onCreated(match)
    onClose()
    setStep(1)
    setPlayers([{ userId: CURRENT_USER.id, team: 'A', role: 'player' }])
  }

  const canCreate = players.length >= 2

  return (
    <Modal open={open} onClose={onClose} title="Create a Match" width="max-w-lg">

      {/* Step 1 — Match type + court */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-text-2 mb-2">Match type</p>
            <div className="grid grid-cols-2 gap-2">
              {(['FREE', 'COURT'] as MatchType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all cursor-pointer
                    ${type === t
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-border bg-bg-surface text-text-2 hover:border-border-strong'}`}
                >
                  {t === 'FREE' ? '🎾 Free Match' : '🏟 Court Match'}
                  <p className="text-xs font-normal mt-0.5 text-text-3">
                    {t === 'FREE' ? 'No booking required' : 'Linked to a booking'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {type === 'COURT' && (
            <div>
              <p className="text-xs font-medium text-text-2 mb-2">Select Court</p>
              <select className="input" value={courtId} onChange={e => setCourtId(e.target.value)}>
                {MOCK_COURTS.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <Button onClick={() => setStep(2)} className="w-full">
            Next — Add Players
          </Button>
        </div>
      )}

      {/* Step 2 — Player selection */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-text-2">Select players and assign teams. Minimum 2 players required.</p>

          <div className="flex flex-col gap-2">
            {MOCK_USERS.map(user => {
              const entry   = players.find(p => p.userId === user.id)
              const selected = !!entry

              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all
                    ${selected
                      ? 'border-accent bg-accent-soft/30'
                      : 'border-border hover:border-border-strong cursor-pointer'}`}
                  onClick={() => !selected && togglePlayer(user.id)}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-accent-soft border border-accent-mid flex items-center justify-center text-xs font-semibold text-accent flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>

                  {/* Name + skill */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-1 truncate">{user.name}</p>
                    <p className="text-xs text-text-2 capitalize">{user.skill_level}</p>
                  </div>

                  {/* Team selector (only when selected) */}
                  {selected && (
                    <div className="flex items-center gap-1.5">
                      {(['A', 'B'] as Team[]).map(team => (
                        <button
                          key={team}
                          onClick={e => { e.stopPropagation(); setPlayerTeam(user.id, team) }}
                          className={`w-7 h-7 rounded-md text-xs font-bold border transition-all cursor-pointer
                            ${entry.team === team
                              ? 'bg-accent text-white border-accent'
                              : 'bg-bg-surface border-border text-text-2 hover:border-border-strong'}`}
                        >
                          {team}
                        </button>
                      ))}
                      <button
                        onClick={e => { e.stopPropagation(); togglePlayer(user.id) }}
                        className="w-7 h-7 rounded-md text-xs border border-status-error/30 bg-status-errorBg text-status-error hover:bg-red-100 transition-all cursor-pointer flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {!selected && (
                    <UserPlus className="w-4 h-4 text-text-3 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Team summary */}
          <div className="bg-bg-surface2 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
            {(['A', 'B'] as Team[]).map(team => (
              <div key={team}>
                <p className="font-semibold text-text-1 mb-1">Team {team}</p>
                {players.filter(p => p.team === team).map(p => {
                  const u = MOCK_USERS.find(u => u.id === p.userId)
                  return <p key={p.userId} className="text-text-2">{u?.name.split(' ')[0]}</p>
                })}
                {players.filter(p => p.team === team).length === 0 && (
                  <p className="text-text-3 italic">Empty</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
            <Button onClick={create} disabled={!canCreate} className="flex-1">
              <Check className="w-3.5 h-3.5" />
              Create Match
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

import { useState, useEffect } from 'react'
import { UserPlus, Check, Search } from 'lucide-react'
import type { MatchWithDetails, MatchType, Team, PlayerRole, CourtWithDetails } from '../../types/database.types'
import { useAuthStore } from '../../store/authStore'
import { createMatch, addMatchPlayer, getMatchById } from '../../services/matchService'
import { getCourts } from '../../services/courtService'
import { supabase } from '../../lib/supabase'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'
import type { User } from '../../types/database.types'

interface CreateMatchModalProps {
  open:      boolean
  onClose:   () => void
  onCreated: (match: MatchWithDetails) => void
}

interface PlayerEntry {
  userId: string
  team:   Team
  role:   PlayerRole
}

export function CreateMatchModal({ open, onClose, onCreated }: CreateMatchModalProps) {
  const { user: currentUser } = useAuthStore()
  const toast = useToast()

  const [step,     setStep]    = useState<1 | 2>(1)
  const [type,     setType]    = useState<MatchType>('FREE')
  const [courtId,  setCourtId] = useState('')
  const [courts,   setCourts]  = useState<CourtWithDetails[]>([])
  const [users,    setUsers]   = useState<User[]>([])
  const [players,  setPlayers] = useState<PlayerEntry[]>(
    currentUser ? [{ userId: currentUser.id, team: 'A', role: 'player' }] : []
  )
  const [loading,  setLoading] = useState(false)
  const [search,   setSearch]  = useState('')

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  // Load courts + users when modal opens
  useEffect(() => {
    if (!open) return

    getCourts().then(data => {
      setCourts(data)
      if (data.length > 0) setCourtId(data[0].id)
    }).catch(() => {})

    supabase
      .from('users')
      .select('id, name, email, skill_level, avatar_url, role, created_at')
      .order('name')
      .then(({ data }) => {
        if (data) setUsers(data as User[])
      })
  }, [open])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(1)
      setType('FREE')
      setSearch('')
      setPlayers(currentUser
        ? [{ userId: currentUser.id, team: 'A', role: 'player' }]
        : []
      )
    }
  }, [open, currentUser])

  function togglePlayer(userId: string) {
    if (players.some(p => p.userId === userId)) {
      // Can't remove self
      if (userId === currentUser?.id) return
      setPlayers(prev => prev.filter(p => p.userId !== userId))
    } else {
      const team: Team = players.filter(p => p.role !== 'scorekeeper').length < 2
        ? 'A' : 'B'
      setPlayers(prev => [...prev, { userId, team, role: 'player' }])
    }
  }

  function setPlayerTeam(userId: string, team: Team) {
    setPlayers(prev => prev.map(p => p.userId === userId ? { ...p, team } : p))
  }

  async function create() {
    if (!currentUser) return
    setLoading(true)
    try {
      // 1. Create match row
      const match = await createMatch({
        type,
        courtId:   type === 'COURT' ? courtId : undefined,
        bookingId: undefined,
      })

      // 2. Add all selected players
      await Promise.all(
        players.map(p =>
          addMatchPlayer(match.id, p.userId, p.team, p.role)
        )
      )

      // 3. Fetch full match with players + scores for parent
      const full = await getMatchById(match.id)
      onCreated(full)
      toast.success('Match created!', `${players.length} player(s) assigned.`)
      onClose()
    } catch (err: any) {
      toast.error('Failed to create match', err.message)
    } finally {
      setLoading(false)
    }
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
              <select
                className="input"
                value={courtId}
                onChange={e => setCourtId(e.target.value)}
              >
                {courts.map(c => (
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
          <p className="text-xs text-text-2">
            Select players and assign teams. Minimum 2 players required.
          </p>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-8 w-full text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3
                  hover:text-text-1 transition-colors text-xs leading-none"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <p className="text-xs text-text-3 italic text-center py-4">
                No players match "{search}"
              </p>
            ) : (
              filteredUsers.map(u => {
                const entry    = players.find(p => p.userId === u.id)
                const selected = !!entry
                const isSelf   = u.id === currentUser?.id

                return (
                  <div
                    key={u.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all
                      ${selected
                        ? 'border-accent bg-accent-soft/30'
                        : 'border-border hover:border-border-strong cursor-pointer'}`}
                    onClick={() => !selected && togglePlayer(u.id)}
                  >
                    <div className="w-8 h-8 rounded-full bg-accent-soft border border-accent-mid
                      flex items-center justify-center text-xs font-semibold text-accent flex-shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-1 truncate">
                        {u.name} {isSelf && <span className="text-text-3">(you)</span>}
                      </p>
                      <p className="text-xs text-text-2 capitalize">{u.skill_level}</p>
                    </div>

                    {selected && (
                      <div className="flex items-center gap-1.5">
                        {(['A', 'B'] as Team[]).map(team => (
                          <button
                            key={team}
                            onClick={e => { e.stopPropagation(); setPlayerTeam(u.id, team) }}
                            className={`w-7 h-7 rounded-md text-xs font-bold border
                              transition-all cursor-pointer
                              ${entry.team === team
                                ? 'bg-accent text-white border-accent'
                                : 'bg-bg-surface border-border text-text-2 hover:border-border-strong'}`}
                          >
                            {team}
                          </button>
                        ))}
                        {!isSelf && (
                          <button
                            onClick={e => { e.stopPropagation(); togglePlayer(u.id) }}
                            className="w-7 h-7 rounded-md text-xs border border-status-error/30
                              bg-status-errorBg text-status-error hover:bg-red-100
                              transition-all cursor-pointer flex items-center justify-center"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    )}

                    {!selected && (
                      <UserPlus className="w-4 h-4 text-text-3 flex-shrink-0" />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Team summary */}
          <div className="bg-bg-surface2 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
            {(['A', 'B'] as Team[]).map(team => (
              <div key={team}>
                <p className="font-semibold text-text-1 mb-1">Team {team}</p>
                {players.filter(p => p.team === team).map(p => {
                  const u = users.find(u => u.id === p.userId)
                  return (
                    <p key={p.userId} className="text-text-2">
                      {u?.name.split(' ')[0]}
                    </p>
                  )
                })}
                {players.filter(p => p.team === team).length === 0 && (
                  <p className="text-text-3 italic">Empty</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
              Back
            </Button>
            <Button
              onClick={create}
              loading={loading}
              disabled={!canCreate}
              className="flex-1"
            >
              <Check className="w-3.5 h-3.5" />
              Create Match
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
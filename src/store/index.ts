import { create } from 'zustand'
import type { Court, Match, MatchScore, SelectedAddon } from '../types'
import { MOCK_MATCHES } from '../data/mock'

// ─────────────────────────────────────────
// Booking Store
// ─────────────────────────────────────────
interface BookingState {
  selectedCourt: Court | null
  selectedDate: string
  startTime: string
  endTime: string
  selectedAddons: SelectedAddon[]

  setSelectedCourt: (c: Court | null) => void
  setSelectedDate:  (d: string) => void
  setStartTime:     (t: string) => void
  setEndTime:       (t: string) => void
  setAddonQty:      (addonId: string, qty: number, addon: SelectedAddon['addon']) => void
  reset:            () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedCourt:  null,
  selectedDate:   new Date().toISOString().split('T')[0],
  startTime:      '',
  endTime:        '',
  selectedAddons: [],

  setSelectedCourt: (c) => set({ selectedCourt: c }),
  setSelectedDate:  (d) => set({ selectedDate: d, startTime: '', endTime: '' }),
  setStartTime:     (t) => set({ startTime: t }),
  setEndTime:       (t) => set({ endTime: t }),

  setAddonQty: (addonId, qty, addon) => set(state => ({
    selectedAddons:
      qty === 0
        ? state.selectedAddons.filter(sa => sa.addon.id !== addonId)
        : state.selectedAddons.some(sa => sa.addon.id === addonId)
          ? state.selectedAddons.map(sa =>
              sa.addon.id === addonId ? { ...sa, quantity: qty } : sa
            )
          : [...state.selectedAddons, { addon, quantity: qty }],
  })),

  reset: () => set({
    selectedCourt:  null,
    selectedDate:   '',
    startTime:      '',
    endTime:        '',
    selectedAddons: [],
  }),
}))

// ─────────────────────────────────────────
// Court Store
// ─────────────────────────────────────────
interface CourtState {
  selectedCourtId: string | null
  setSelectedCourtId: (id: string | null) => void
}

export const useCourtStore = create<CourtState>((set) => ({
  selectedCourtId:    null,
  setSelectedCourtId: (id) => set({ selectedCourtId: id }),
}))

// ─────────────────────────────────────────
// Match Store
// ─────────────────────────────────────────
interface MatchState {
  matches:       Match[]
  activeMatchId: string | null

  setActiveMatch: (id: string | null) => void
  addMatch:       (match: Match) => void
  updateScore:    (matchId: string, setNumber: number, teamAScore: number, teamBScore: number) => void
  setMatchStatus: (matchId: string, status: Match['status']) => void
  addPlayer:      (matchId: string, player: Match['players'][number]) => void
}

export const useMatchStore = create<MatchState>((set) => ({
  matches:       MOCK_MATCHES,
  activeMatchId: null,

  setActiveMatch: (id) => set({ activeMatchId: id }),

  addMatch: (match) => set(state => ({
    matches: [match, ...state.matches],
  })),

  updateScore: (matchId, setNumber, teamAScore, teamBScore) =>
    set(state => ({
      matches: state.matches.map(m => {
        if (m.id !== matchId) return m
        const exists = m.scores.find(s => s.set_number === setNumber)
        const updated: MatchScore = {
          id:           exists?.id ?? `score-${Date.now()}`,
          match_id:     matchId,
          set_number:   setNumber,
          team_a_score: teamAScore,
          team_b_score: teamBScore,
          updated_at:   new Date().toISOString(),
        }
        return {
          ...m,
          scores: exists
            ? m.scores.map(s => s.set_number === setNumber ? updated : s)
            : [...m.scores, updated],
        }
      }),
    })),

  setMatchStatus: (matchId, status) =>
    set(state => ({
      matches: state.matches.map(m =>
        m.id === matchId
          ? {
              ...m,
              status,
              started_at: status === 'LIVE'     ? new Date().toISOString() : m.started_at,
              ended_at:   status === 'FINISHED' ? new Date().toISOString() : m.ended_at,
            }
          : m
      ),
    })),

  addPlayer: (matchId, player) =>
    set(state => ({
      matches: state.matches.map(m =>
        m.id === matchId ? { ...m, players: [...m.players, player] } : m
      ),
    })),
}))
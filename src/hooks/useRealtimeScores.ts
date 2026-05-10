import { useState, useEffect } from 'react'
import { subscribeToMatchScores } from '../services/matchService'
import type { MatchScore } from '../types'

/**
 * Subscribes to real-time score updates for a match.
 * Merges INSERT and UPDATE events into local state.
 * Cleans up the Supabase channel on unmount.
 *
 * Backend rule: Realtime is enabled on match_scores (INSERT + UPDATE).
 * Always return the unsubscribe function from useEffect.
 */
export function useRealtimeScores(matchId: string, initialScores: MatchScore[] = []) {
  const [scores, setScores] = useState<MatchScore[]>(initialScores)

  // Keep scores in sync if initialScores changes (e.g. first load)
  useEffect(() => {
    setScores(initialScores)
  }, [JSON.stringify(initialScores)])

  useEffect(() => {
    if (!matchId) return

    const unsubscribe = subscribeToMatchScores(matchId, (newScore) => {
      setScores(prev => {
        const exists = prev.find(s => s.set_number === newScore.set_number)
        return exists
          ? prev.map(s => s.set_number === newScore.set_number ? newScore : s)
          : [...prev, newScore]
      })
    })

    return unsubscribe
  }, [matchId])

  return scores
}
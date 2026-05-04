import { useEffect } from 'react'
import { useMatchStore } from '../store'

/**
 * Simulates a Supabase Realtime subscription on match_scores.
 * When connected to Supabase this will be replaced with:
 *
 * supabase.channel('match-scores')
 *   .on('postgres_changes', {
 *     event: '*', schema: 'public',
 *     table: 'match_scores',
 *     filter: `match_id=eq.${matchId}`
 *   }, handleScoreUpdate)
 *   .subscribe()
 */
export function useRealtimeScores(matchId: string) {
  const { matches, updateScore } = useMatchStore()

  useEffect(() => {
    const match = matches.find(m => m.id === matchId)

    if (!match || match.status !== 'LIVE') return

    const interval = setInterval(() => {
      const currentMatch = useMatchStore.getState().matches.find(m => m.id === matchId)
      if (!currentMatch) return

      const latestSet = currentMatch.scores.at(-1)
      if (!latestSet) return

      const aScore = latestSet.team_a_score
      const bScore = latestSet.team_b_score

      const incrementA = Math.random() > 0.5

      updateScore(
        matchId,
        latestSet.set_number,
        incrementA ? Math.min(aScore + 1, 15) : aScore,
        incrementA ? bScore : Math.min(bScore + 1, 15),
      )
    }, 6000)

    return () => clearInterval(interval)
  }, [matchId, matches, updateScore])
}
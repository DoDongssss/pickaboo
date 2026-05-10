import { subscribeToMatchScores } from './matchService'
import type { MatchScore } from '../types'

/**
 * Re-exports subscribeToMatchScores for convenience.
 * Usage in useRealtimeScores hook:
 *
 *   useEffect(() => {
 *     const unsubscribe = subscribeToScores(matchId, handler)
 *     return unsubscribe  // cleanup on unmount
 *   }, [matchId])
 */
export async function subscribeToScores(
  matchId: string,
  onUpdate: (score: MatchScore) => void
): Promise<() => void> {
  return subscribeToMatchScores(matchId, onUpdate)
}
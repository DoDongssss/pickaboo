import { useEffect, useState } from 'react'
import { getMatches, getLiveMatches } from '../services/matchService'
import type { MatchWithDetails } from '../types/database.types'

interface State {
  matches: MatchWithDetails[]
  loading: boolean
  error:   string | null
}

export function useMatches(liveOnly = false) {
  const [state,    setState]    = useState<State>({ matches: [], loading: true, error: null })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let cancelled = false
    // setState(prev => ({ ...prev, loading: true }))

    const fetcher = liveOnly ? getLiveMatches : getMatches
    fetcher()
      .then(matches => {
        if (!cancelled) setState({ matches, loading: false, error: null })
      })
      .catch(err => {
        if (!cancelled) setState({ matches: [], loading: false, error: err.message })
      })

    return () => { cancelled = true }
  }, [liveOnly, revision])

  // refresh() bumps revision → re-runs the effect
  const refresh = () => setRevision(r => r + 1)

  return { ...state, refresh }
}
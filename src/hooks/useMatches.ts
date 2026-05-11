import { useEffect, useState } from 'react'
import { getMatches } from '../services/matchService'
import type { MatchWithDetails, MatchStatus } from '../types/database.types'

interface MatchFilters {
  status?:  MatchStatus | 'ALL'
  date?:    string        // 'YYYY-MM-DD'
  page?:    number
  perPage?: number
}

interface State {
  matches:   MatchWithDetails[]
  total:     number
  pageCount: number
  loading:   boolean
  error:     string | null
}

const DEFAULT_PER_PAGE = 10

export function useMatches({
  status  = 'ALL',
  date,
  page    = 1,
  perPage = DEFAULT_PER_PAGE,
}: MatchFilters = {}) {
  const [state,    setState]    = useState<State>({ matches: [], total: 0, pageCount: 1, loading: true, error: null })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let cancelled = false

    getMatches({ status, date, page, perPage })
      .then(({ matches, total }) => {
        if (cancelled) return
        setState({
          matches,
          total,
          pageCount: Math.max(1, Math.ceil(total / perPage)),
          loading:   false,
          error:     null,
        })
      })
      .catch(err => {
        if (cancelled) return
        setState({ matches: [], total: 0, pageCount: 1, loading: false, error: err.message })
      })

    return () => { cancelled = true }
  }, [status, date, page, perPage, revision])

  const refresh = () => setRevision(r => r + 1)

  return { ...state, refresh }
}
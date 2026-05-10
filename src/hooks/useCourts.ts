import { useEffect, useState } from 'react'
import { getCourts, getCourtById } from '../services/courtService'
import type { CourtWithDetails } from '../types/database.types'

interface ListState {
  courts:  CourtWithDetails[]
  loading: boolean
  error:   string | null
}

interface DetailState {
  court:   CourtWithDetails | null
  loading: boolean
  error:   string | null
}

export function useCourts(): ListState {
  const [state, setState] = useState<ListState>({
    courts:  [],
    loading: true,
    error:   null,
  })

  useEffect(() => {
    let cancelled = false

    getCourts()
      .then((courts) => {
        if (!cancelled) setState({ courts, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled) setState({ courts: [], loading: false, error: err.message })
      })

    return () => { cancelled = true }
  }, [])

  return state
}

export function useCourtById(courtId: string | null | undefined): DetailState {
  const [state, setState] = useState<DetailState>({
    court:   null,
    // If no courtId on mount, don't show loading spinner
    loading: !!courtId,
    error:   null,
  })

  useEffect(() => {
    // No id → clear state immediately, no loading
    if (!courtId) {
      setState({ court: null, loading: false, error: null })
      return
    }

    let cancelled = false
    setState({ court: null, loading: true, error: null })

    getCourtById(courtId)
      .then((court) => {
        if (!cancelled) setState({ court, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled) setState({ court: null, loading: false, error: err.message })
      })

    return () => { cancelled = true }
  }, [courtId])

  return state
}
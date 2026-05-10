import { useEffect, useState, useCallback } from 'react'
import { getAllCourts } from '../services/courtService'
import { createCourt, updateCourt } from '../services/adminService'
import type { CourtWithDetails, Court } from '../types/database.types'

interface State {
  courts: CourtWithDetails[]
  loading: boolean
  error: string | null
}

export function useAdminCourts() {
  const [state, setState] = useState<State>({
    courts: [],
    loading: true,
    error: null,
  })

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }))
    getAllCourts()
      .then((courts) => setState({ courts, loading: false, error: null }))
      .catch((err) => setState({ courts: [], loading: false, error: err.message }))
  }, [])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (
    court: Omit<Court, 'id' | 'created_at'>
  ) => {
    await createCourt(court)
    load()
  }, [load])

  const update = useCallback(async (
    courtId: string,
    updates: Partial<Omit<Court, 'id' | 'created_at'>>
  ) => {
    await updateCourt(courtId, updates)
    load()
  }, [load])

  return { ...state, create, update, refresh: load }
}
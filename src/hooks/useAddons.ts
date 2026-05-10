import { useEffect, useState } from 'react'
import { getActiveAddons } from '../services/addonService'
import type { Addon } from '../types/database.types'

interface State {
  addons: Addon[]
  loading: boolean
  error: string | null
}

export function useAddons(): State {
  const [state, setState] = useState<State>({
    addons: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    getActiveAddons()
      .then((addons) => setState({ addons, loading: false, error: null }))
      .catch((err) => setState({ addons: [], loading: false, error: err.message }))
  }, [])

  return state
}
import { useEffect, useState } from 'react'
import { getResolvedPrice } from '../services/courtService'

interface State {
  pricePerHour: number
  label:        string | null
  loading:      boolean
  error:        string | null
}

export function useResolvedPrice(
  courtId: string | null | undefined,
  date:    string | null | undefined
): State {
  const [state, setState] = useState<State>({
    pricePerHour: 0,
    label:        null,
    loading:      false,
    error:        null,
  })

  useEffect(() => {
    if (!courtId || !date) {
      setState({ pricePerHour: 0, label: null, loading: false, error: null })
      return
    }

    let cancelled = false
    setState(prev => ({ ...prev, loading: true, error: null }))

    getResolvedPrice(courtId, date)
      .then(({ price_per_hour, label }) => {
        if (!cancelled)
          setState({ pricePerHour: price_per_hour, label, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled)
          setState({ pricePerHour: 0, label: null, loading: false, error: err.message })
      })

    return () => { cancelled = true }
  }, [courtId, date])

  return state
}
import { useEffect, useState } from 'react'
import { getMyBookings, cancelBooking } from '../services/bookingService'
import type { BookingWithDetails } from '../types/database.types'

interface State {
  bookings: BookingWithDetails[]
  loading:  boolean
  error:    string | null
}

export function useMyBookings() {
  const [state, setState] = useState<State>({
    bookings: [],
    loading: true,
    error: null
  })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let cancelled = false
    // setState(prev => ({ ...prev, loading: true }))

    getMyBookings()
      .then(bookings => {
        if (!cancelled) setState({ bookings, loading: false, error: null })
      })
      .catch(err => {
        if (!cancelled) setState({ bookings: [], loading: false, error: err.message })
      })

    return () => { cancelled = true }
  }, [revision])

  const refresh = () => setRevision(r => r + 1)

  const cancel = async (bookingId: string) => {
    await cancelBooking(bookingId)
    refresh()
  }

  return { ...state, cancel, refresh }
}
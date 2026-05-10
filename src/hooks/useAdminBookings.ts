import { useEffect, useState } from 'react'
import { getAllBookings, approveBooking, rejectBooking } from '../services/adminService'
import type { BookingWithDetails, BookingStatus } from '../types/database.types'

interface State {
  bookings:     BookingWithDetails[]
  filtered:     BookingWithDetails[]
  loading:      boolean
  error:        string | null
  statusFilter: BookingStatus | 'ALL'
}

function applyFilter(
  bookings: BookingWithDetails[],
  filter:   BookingStatus | 'ALL'
): BookingWithDetails[] {
  if (filter === 'ALL') return bookings
  return bookings.filter(b => b.status === filter)
}

export function useAdminBookings() {
  const [state,    setState]    = useState<State>({
    bookings:     [],
    filtered:     [],
    loading:      true,
    error:        null,
    statusFilter: 'ALL',
  })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState(prev => ({ ...prev, loading: true }))

    getAllBookings()
      .then(bookings => {
        if (!cancelled) setState(prev => ({
          ...prev,
          bookings,
          filtered: applyFilter(bookings, prev.statusFilter),
          loading:  false,
          error:    null,
        }))
      })
      .catch(err => {
        if (!cancelled) setState(prev => ({
          ...prev, loading: false, error: err.message
        }))
      })

    return () => { cancelled = true }
  }, [revision])

  const refresh = () => setRevision(r => r + 1)

  const setStatusFilter = (filter: BookingStatus | 'ALL') => {
    setState(prev => ({
      ...prev,
      statusFilter: filter,
      filtered:     applyFilter(prev.bookings, filter),
    }))
  }

  const approve = async (id: string) => {
    await approveBooking(id)
    refresh()
  }

  const reject = async (id: string) => {
    await rejectBooking(id)
    refresh()
  }

  return { ...state, setStatusFilter, approve, reject, refresh }
}
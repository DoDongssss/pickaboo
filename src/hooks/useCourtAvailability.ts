import { useEffect, useState } from 'react'
import { getOccupiedSlots } from '../services/courtService'

interface TimeSlot {
  start: string
  end:   string
}

interface State {
  occupiedSlots:    TimeSlot[]
  availableWindows: TimeSlot[]
  loading:          boolean
  error:            string | null
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function toTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

function computeAvailableWindows(
  openTime:  string,
  closeTime: string,
  occupied:  TimeSlot[]
): TimeSlot[] {
  const open  = toMinutes(openTime)
  const close = toMinutes(closeTime)

  const sorted = [...occupied]
    .map(s => ({ start: toMinutes(s.start), end: toMinutes(s.end) }))
    .sort((a, b) => a.start - b.start)

  const free: TimeSlot[] = []
  let cursor = open

  for (const slot of sorted) {
    if (slot.start > cursor) {
      free.push({ start: toTimeString(cursor), end: toTimeString(slot.start) })
    }
    cursor = Math.max(cursor, slot.end)
  }

  if (cursor < close) {
    free.push({ start: toTimeString(cursor), end: toTimeString(close) })
  }

  return free
}

export function useCourtAvailability(
  courtId:   string | null | undefined,
  date:      string | null | undefined,
  openTime:  string,
  closeTime: string
): State {
  const [state, setState] = useState<State>({
    occupiedSlots:    [],
    availableWindows: [],
    loading:          false,
    error:            null,
  })

  useEffect(() => {
    if (!courtId || !date) {
      setState({
        occupiedSlots:    [],
        availableWindows: [],
        loading:          false,
        error:            null,
      })
      return
    }

    let cancelled = false
    setState(prev => ({ ...prev, loading: true, error: null }))

    getOccupiedSlots(courtId, date)
      .then((slots) => {
        if (cancelled) return
        const occupied  = slots.map(s => ({ start: s.start_time, end: s.end_time }))
        const available = computeAvailableWindows(openTime, closeTime, occupied)
        setState({ occupiedSlots: occupied, availableWindows: available, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled)
          setState({ occupiedSlots: [], availableWindows: [], loading: false, error: err.message })
      })

    return () => { cancelled = true }
  }, [courtId, date])

  return state
}
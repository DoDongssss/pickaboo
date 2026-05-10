import { useMemo } from 'react'
import { getOccupiedSlots, timeToMinutes, minutesToTime } from '../../data/mock'

interface TimeWindow { start: string; end: string }

/**
 * Returns occupied slots and free windows for a given court + date.
 * When Supabase is connected, replace getOccupiedSlots() with a
 * Supabase query on the bookings table.
 */
export function useCourtAvailability(courtId: string, date: string, openTime: string, closeTime: string) {
  const occupiedSlots = useMemo(
    () => getOccupiedSlots(courtId, date),
    [courtId, date]
  )

  const freeWindows = useMemo((): TimeWindow[] => {
    if (!date) return []

    const openMin  = timeToMinutes(openTime)
    const closeMin = timeToMinutes(closeTime)

    // Sort occupied slots by start time
    const sorted = [...occupiedSlots].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
    )

    const windows: TimeWindow[] = []
    let cursor = openMin

    for (const slot of sorted) {
      const slotStart = timeToMinutes(slot.start)
      const slotEnd   = timeToMinutes(slot.end)

      if (cursor < slotStart) {
        windows.push({ start: minutesToTime(cursor), end: minutesToTime(slotStart) })
      }
      cursor = Math.max(cursor, slotEnd)
    }

    if (cursor < closeMin) {
      windows.push({ start: minutesToTime(cursor), end: minutesToTime(closeMin) })
    }

    return windows
  }, [occupiedSlots, openTime, closeTime, date])

  return { occupiedSlots, freeWindows }
}

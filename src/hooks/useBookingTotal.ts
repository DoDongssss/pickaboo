import { useMemo } from 'react'
import type { SelectedAddon } from '../types'
import { durationHours } from '../data/mock'

interface UseBookingTotalOptions {
  startTime:      string
  endTime:        string
  pricePerHour:   number
  selectedAddons: SelectedAddon[]
}

export function useBookingTotal({
  startTime,
  endTime,
  pricePerHour,
  selectedAddons,
}: UseBookingTotalOptions) {
  return useMemo(() => {
    const duration    = startTime && endTime ? durationHours(startTime, endTime) : 0
    const basePrice   = duration * pricePerHour
    const addonsTotal = selectedAddons.reduce(
      (sum, sa) => sum + sa.addon.price * sa.quantity,
      0
    )
    const totalPrice = basePrice + addonsTotal

    return { duration, basePrice, addonsTotal, totalPrice }
  }, [startTime, endTime, pricePerHour, selectedAddons])
}

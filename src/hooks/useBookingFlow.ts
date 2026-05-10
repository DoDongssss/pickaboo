import { useState, useCallback } from 'react'
import {
  createBookingLock,
  createBooking,
  uploadPaymentProof,
  cleanExpiredLocks,
} from '../services/bookingService'
import type { Booking, SelectedAddon } from '../types/database.types'

export type BookingStep =
  | 'SELECT_DATE'
  | 'SELECT_TIME'
  | 'SELECT_ADDONS'
  | 'CONFIRM'
  | 'PAYMENT'
  | 'DONE'

interface BookingFlowState {
  step: BookingStep
  courtId: string | null
  selectedDate: string | null       // "YYYY-MM-DD"
  startTime: string | null          // "HH:MM"
  endTime: string | null            // "HH:MM"
  durationHours: number
  pricePerHour: number
  selectedAddons: SelectedAddon[]
  addonsTotal: number
  totalPrice: number
  lockId: string | null
  booking: Booking | null
  loading: boolean
  error: string | null
}

const initialState: BookingFlowState = {
  step: 'SELECT_DATE',
  courtId: null,
  selectedDate: null,
  startTime: null,
  endTime: null,
  durationHours: 0,
  pricePerHour: 0,
  selectedAddons: [],
  addonsTotal: 0,
  totalPrice: 0,
  lockId: null,
  booking: null,
  loading: false,
  error: null,
}

// Compute duration in hours between two "HH:MM" strings
function computeDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60
}

export function useBookingFlow(courtId: string) {
  const [state, setState] = useState<BookingFlowState>({
    ...initialState,
    courtId,
  })

  // ── Step 1: Select date ──
  const selectDate = useCallback((date: string) => {
    setState((prev) => ({
      ...prev,
      selectedDate: date,
      startTime: null,
      endTime: null,
      durationHours: 0,
      step: 'SELECT_TIME',
    }))
  }, [])

  // ── Step 2: Select time range + lock the slot ──
  const selectTimeRange = useCallback(async (
    startTime: string,
    endTime: string,
    pricePerHour: number
  ) => {
    if (!state.selectedDate) return

    const duration = computeDuration(startTime, endTime)
    if (duration <= 0) {
      setState((prev) => ({ ...prev, error: 'End time must be after start time' }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      await cleanExpiredLocks()

      const lockId = await createBookingLock(
        courtId,
        state.selectedDate,
        startTime,
        endTime
      )

      const basePrice = duration * pricePerHour
      setState((prev) => ({
        ...prev,
        startTime,
        endTime,
        durationHours: duration,
        pricePerHour,
        lockId,
        totalPrice: basePrice,
        step: 'SELECT_ADDONS',
        loading: false,
      }))
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message ?? 'Failed to lock slot. It may already be taken.',
      }))
    }
  }, [courtId, state.selectedDate])

  // ── Step 3: Update add-on selection ──
  const updateAddon = useCallback((addon: SelectedAddon['addon'], quantity: number) => {
    setState((prev) => {
      const existing = prev.selectedAddons.filter((s) => s.addon.id !== addon.id)
      const updated = quantity > 0
        ? [...existing, { addon, quantity }]
        : existing

      const addonsTotal = updated.reduce((sum, s) => sum + s.addon.price * s.quantity, 0)
      const totalPrice = prev.durationHours * prev.pricePerHour + addonsTotal

      return { ...prev, selectedAddons: updated, addonsTotal, totalPrice }
    })
  }, [])

  const proceedToConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'CONFIRM' }))
  }, [])

  // ── Step 4: Confirm — create the booking ──
  const confirmBooking = useCallback(async () => {
    const { selectedDate, startTime, endTime, durationHours, pricePerHour, selectedAddons, lockId } = state
    if (!selectedDate || !startTime || !endTime || !lockId) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const booking = await createBooking({
        courtId,
        date: selectedDate,
        startTime,
        endTime,
        durationHours,
        pricePerHour,
        selectedAddons,
        lockId,
      })

      setState((prev) => ({
        ...prev,
        booking,
        step: 'PAYMENT',
        loading: false,
      }))
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message ?? 'Booking failed. The slot may have been taken.',
      }))
    }
  }, [courtId, state])

  // ── Step 5: Upload payment proof ──
  const submitPaymentProof = useCallback(async (file: File) => {
    if (!state.booking) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      await uploadPaymentProof(state.booking.id, file)
      setState((prev) => ({ ...prev, step: 'DONE', loading: false }))
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message ?? 'Failed to upload payment proof.',
      }))
    }
  }, [state.booking])

  // ── Go back one step ──
  const goBack = useCallback(() => {
    setState((prev) => {
      const steps: BookingStep[] = [
        'SELECT_DATE', 'SELECT_TIME', 'SELECT_ADDONS', 'CONFIRM', 'PAYMENT'
      ]
      const idx = steps.indexOf(prev.step)
      return { ...prev, step: idx > 0 ? steps[idx - 1] : prev.step }
    })
  }, [])

  // ── Reset entire flow ──
  const reset = useCallback(() => {
    setState({ ...initialState, courtId })
  }, [courtId])

  return {
    ...state,
    selectDate,
    selectTimeRange,
    updateAddon,
    proceedToConfirm,
    confirmBooking,
    submitPaymentProof,
    goBack,
    reset,
  }
}
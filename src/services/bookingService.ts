import { supabase } from '../lib/supabase'
import type {
  Booking,
  BookingWithDetails,
  SelectedAddon,
} from '../types/database.types'

export async function createBookingLock(
  courtId:   string,
  date:      string,
  startTime: string,
  endTime:   string
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('booking_locks')
    .insert({
      court_id:     courtId,
      user_id:      user.id,
      booking_date: date,
      start_time:   startTime,
      end_time:     endTime,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function createBooking(params: {
  courtId:        string
  date:           string
  startTime:      string
  endTime:        string
  durationHours:  number
  pricePerHour:   number
  selectedAddons: SelectedAddon[]
  lockId:         string
}): Promise<Booking> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const {
    courtId, date, startTime, endTime,
    durationHours, pricePerHour, selectedAddons, lockId,
  } = params

  const addonsTotal = selectedAddons.reduce(
    (sum, s) => sum + s.addon.price * s.quantity, 0
  )
  const totalPrice = durationHours * pricePerHour + addonsTotal

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id:       user.id,
      court_id:      courtId,
      booking_date:  date,
      start_time:    startTime,
      end_time:      endTime,
      duration_hours: durationHours,
      price_per_hour: pricePerHour,
      addons_total:   addonsTotal,
      total_price:    totalPrice,
    })
    .select()
    .single()

  if (bookingError) throw bookingError

  if (selectedAddons.length > 0) {
    const addonRows = selectedAddons.map(s => ({
      booking_id: booking.id,
      addon_id:   s.addon.id,
      quantity:   s.quantity,
      unit_price: s.addon.price,
      subtotal:   s.addon.price * s.quantity,
    }))
    const { error: addonError } = await supabase
      .from('booking_addons')
      .insert(addonRows)
    if (addonError) throw addonError
  }

  await supabase.from('booking_locks').delete().eq('id', lockId)

  return booking as Booking
}

// ── Fix: reference is now saved to the booking row ──
export async function uploadPaymentProof(
  bookingId: string,
  file:      File,
  reference: string = ''
): Promise<void> {
  const ext  = file.name.split('.').pop()
  const path = `${bookingId}/proof.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(path, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      payment_proof_url:  publicUrl,
      payment_reference:  reference.trim() || null,  // ← saved here
      status:             'FOR_VERIFICATION',
    })
    .eq('id', bookingId)

  if (updateError) throw updateError
}

export async function getPaymentProofSignedUrl(
  bookingId: string,
  fileName:  string = 'proof.png'
): Promise<string | null> {
  const path = `${bookingId}/${fileName}`
  const { data, error } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(path, 60 * 60)
  if (error || !data) return null
  return data.signedUrl
}

export async function getMyBookings(): Promise<BookingWithDetails[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      court: courts ( * ),
      booking_addons (
        *,
        addon: addons ( * )
      )
    `)
    .order('booking_date', { ascending: false })
  if (error) throw error
  return data as BookingWithDetails[]
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'CANCELLED' })
    .eq('id', bookingId)
  if (error) throw error
}

export async function cleanExpiredLocks(): Promise<void> {
  await supabase
    .from('booking_locks')
    .delete()
    .lt('expires_at', new Date().toISOString())
}
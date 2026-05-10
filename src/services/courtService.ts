import { supabase } from '../lib/supabase'
import type {
  CourtWithDetails,
  CourtPricingOverride,
} from '../types/database.types'

// ── Fetch all active courts with images + amenities ──

export async function getCourts(): Promise<CourtWithDetails[]> {
  const { data, error } = await supabase
    .from('courts')
    .select(`
      *,
      court_images ( id, image_url, display_order ),
      court_amenities ( id, name, icon, is_available )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as CourtWithDetails[]
}

// ── Fetch single court with full details ──

export async function getCourtById(courtId: string): Promise<CourtWithDetails> {
  const { data, error } = await supabase
    .from('courts')
    .select(`
      *,
      court_images ( id, image_url, display_order ),
      court_amenities ( id, name, icon, is_available )
    `)
    .eq('id', courtId)
    .single()

  if (error) throw error
  return data as CourtWithDetails
}

// ── Get occupied time slots for a court on a date ──
// Fetches confirmed/pending bookings + active locks directly.
// Used by useCourtAvailability to compute free windows.

export async function getOccupiedSlots(
  courtId: string,
  date: string
): Promise<{ start_time: string; end_time: string }[]> {

  // Only fetch time columns — not user data or payment info
  const { data: bookings, error: bookingError } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('court_id', courtId)
    .eq('booking_date', date)
    .not('status', 'eq', 'CANCELLED')

  if (bookingError) throw bookingError

  const { data: locks, error: lockError } = await supabase
    .from('booking_locks')
    .select('start_time, end_time')
    .eq('court_id', courtId)
    .eq('booking_date', date)
    .gt('expires_at', new Date().toISOString())

  if (lockError) throw lockError

  return [
    ...(bookings ?? []),
    ...(locks ?? []),
  ]
}

// ── Resolve effective price for a court on a date ──
// Checks court_pricing_overrides first, falls back to
// courts.price_per_hour. Mirrors the DB trigger logic
// but as a readable frontend query.

export async function getResolvedPrice(
  courtId: string,
  date: string  // "YYYY-MM-DD"
): Promise<{ price_per_hour: number; label: string | null }> {
  // Check for a pricing override on this specific date
  const { data: override } = await supabase
    .from('court_pricing_overrides')
    .select('price_per_hour, label')
    .eq('court_id', courtId)
    .eq('override_date', date)
    .maybeSingle()

  if (override) {
    return { price_per_hour: override.price_per_hour, label: override.label }
  }

  // Fall back to base court price
  const { data: court, error } = await supabase
    .from('courts')
    .select('price_per_hour')
    .eq('id', courtId)
    .single()

  if (error) throw error
  return { price_per_hour: court.price_per_hour, label: null }
}

// ── Admin: fetch all courts including inactive ──

export async function getAllCourts(): Promise<CourtWithDetails[]> {
  const { data, error } = await supabase
    .from('courts')
    .select(`
      *,
      court_images ( id, image_url, display_order ),
      court_amenities ( id, name, icon, is_available )
    `)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as CourtWithDetails[]
}

// ── Pricing overrides for a court (admin) ──

export async function getPricingOverrides(
  courtId: string
): Promise<CourtPricingOverride[]> {
  const { data, error } = await supabase
    .from('court_pricing_overrides')
    .select('*')
    .eq('court_id', courtId)
    .order('override_date', { ascending: true })

  if (error) throw error
  return data as CourtPricingOverride[]
}
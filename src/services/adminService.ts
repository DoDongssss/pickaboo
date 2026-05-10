import { supabase } from '../lib/supabase'
import type {
  BookingWithDetails,
  Court,
  CourtAmenity,
  CourtPricingOverride,
  Addon,
} from '../types/database.types'

// ── BOOKINGS ────────────────────────────────────────

export async function getAllBookings(): Promise<BookingWithDetails[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      court: courts ( * ),
      user: users ( id, name, email, avatar_url ),
      booking_addons (
        *,
        addon: addons ( * )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as BookingWithDetails[]
}

export async function approveBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'CONFIRMED' })
    .eq('id', bookingId)

  if (error) throw error
}

export async function rejectBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'CANCELLED' })
    .eq('id', bookingId)

  if (error) throw error
}

// ── COURTS ──────────────────────────────────────────

export async function createCourt(
  court: Omit<Court, 'id' | 'created_at'>
): Promise<Court> {
  const { data, error } = await supabase
    .from('courts')
    .insert(court)
    .select()
    .single()

  if (error) throw error
  return data as Court
}

export async function updateCourt(
  courtId: string,
  updates: Partial<Omit<Court, 'id' | 'created_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('courts')
    .update(updates)
    .eq('id', courtId)

  if (error) throw error
}

export async function uploadCourtImage(
  courtId:      string,
  file:         File,
  displayOrder: number
): Promise<void> {
  const ext  = file.name.split('.').pop()
  const path = `${courtId}/image-${displayOrder}.${ext}`

  // Upload to storage (upsert: true replaces existing file)
  const { error: uploadError } = await supabase.storage
    .from('court-images')
    .upload(path, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('court-images')
    .getPublicUrl(path)

  // Check if a row already exists for this court + display_order
  const { data: existing } = await supabase
    .from('court_images')
    .select('id')
    .eq('court_id', courtId)
    .eq('display_order', displayOrder)
    .maybeSingle()

  if (existing) {
    // Update the existing row
    const { error } = await supabase
      .from('court_images')
      .update({ image_url: publicUrl })
      .eq('id', existing.id)

    if (error) throw error
  } else {
    // Insert a new row
    const { error } = await supabase
      .from('court_images')
      .insert({
        court_id:      courtId,
        image_url:     publicUrl,
        display_order: displayOrder,
      })

    if (error) throw error
  }
}

// ── AMENITIES ───────────────────────────────────────

export async function upsertAmenity(
  amenity: Omit<CourtAmenity, 'id' | 'created_at'>
): Promise<void> {
  const { error } = await supabase
    .from('court_amenities')
    .insert(amenity)

  if (error) throw error
}

export async function toggleAmenity(
  amenityId: string,
  isAvailable: boolean
): Promise<void> {
  const { error } = await supabase
    .from('court_amenities')
    .update({ is_available: isAvailable })
    .eq('id', amenityId)

  if (error) throw error
}

export async function deleteAmenity(amenityId: string): Promise<void> {
  const { error } = await supabase
    .from('court_amenities')
    .delete()
    .eq('id', amenityId)

  if (error) throw error
}

// ── PRICING OVERRIDES ────────────────────────────────

export async function createPricingOverride(
  override: Omit<CourtPricingOverride, 'id' | 'created_at'>
): Promise<void> {
  const { error } = await supabase
    .from('court_pricing_overrides')
    .insert(override)

  if (error) throw error
}

export async function deletePricingOverride(overrideId: string): Promise<void> {
  const { error } = await supabase
    .from('court_pricing_overrides')
    .delete()
    .eq('id', overrideId)

  if (error) throw error
}

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

// ── ADD-ONS ──────────────────────────────────────────

export async function getAllAddons(): Promise<Addon[]> {
  const { data, error } = await supabase
    .from('addons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Addon[]
}

export async function createAddon(
  addon: Omit<Addon, 'id' | 'created_at'>
): Promise<Addon> {
  const { data, error } = await supabase
    .from('addons')
    .insert(addon)
    .select()
    .single()

  if (error) throw error
  return data as Addon
}

export async function updateAddon(
  addonId: string,
  updates: Partial<Omit<Addon, 'id' | 'created_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('addons')
    .update(updates)
    .eq('id', addonId)

  if (error) throw error
}

export async function deleteAddon(addonId: string): Promise<void> {
  const { error } = await supabase
    .from('addons')
    .delete()
    .eq('id', addonId)

  if (error) throw error
}
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'
export type UserRole = 'user' | 'admin'
export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'FOR_VERIFICATION'
  | 'CONFIRMED'
  | 'CANCELLED'
export type MatchType = 'COURT' | 'FREE'
export type MatchStatus = 'WAITING' | 'LIVE' | 'FINISHED'
export type Team = 'A' | 'B'
export type PlayerRole = 'player' | 'scorekeeper'

// ── Tables ──────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  skill_level: SkillLevel
  role: UserRole
  created_at: string
}

export interface Court {
  id: string
  name: string
  description: string | null
  is_active: boolean
  latitude: number | null
  longitude: number | null
  address: string | null
  price_per_hour: number
  open_time: string   // "HH:MM"
  close_time: string  // "HH:MM"
  created_at: string
}

export interface CourtImage {
  id: string
  court_id: string
  image_url: string
  display_order: number
  created_at: string
}

export interface CourtAmenity {
  id: string
  court_id: string
  name: string
  icon: string | null
  is_available: boolean
  created_at: string
}

export interface CourtPricingOverride {
  id: string
  court_id: string
  override_date: string  // "YYYY-MM-DD"
  price_per_hour: number
  label: string | null
  created_at: string
}

export interface Addon {
  id: string
  name: string
  description: string | null
  price: number
  is_active: boolean
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  court_id: string
  booking_date: string   // "YYYY-MM-DD"
  start_time: string     // "HH:MM"
  end_time: string       // "HH:MM"
  duration_hours: number
  price_per_hour: number
  addons_total: number
  total_price: number
  status: BookingStatus
  payment_proof_url: string | null
  payment_reference: string | null
  expires_at: string
  created_at: string
}

export interface BookingAddon {
  id: string
  booking_id: string
  addon_id: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface BookingLock {
  id: string
  court_id: string
  user_id: string
  booking_date: string
  start_time: string
  end_time: string
  expires_at: string
}

export interface Match {
  id: string
  type: MatchType
  court_id: string | null
  booking_id: string | null
  status: MatchStatus
  created_by: string
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export interface MatchPlayer {
  id: string
  match_id: string
  user_id: string
  team: Team
  role: PlayerRole
}

export interface MatchScore {
  id: string
  match_id: string
  set_number: number
  team_a_score: number
  team_b_score: number
  updated_at: string
}

export interface PlayerStats {
  id: string
  user_id: string
  total_matches: number
  wins: number
  losses: number
  updated_at: string
}

// ── Composite types (used by UI) ─────────────────────

export interface CourtWithDetails extends Court {
  court_images: CourtImage[]
  court_amenities: CourtAmenity[]
}

export interface BookingWithDetails extends Booking {
  court: Court
  booking_addons: (BookingAddon & { addon: Addon })[]
}

export interface MatchWithDetails extends Match {
  match_players: (MatchPlayer & { user: User })[]
  match_scores: MatchScore[]
}

export interface SelectedAddon {
  addon: Addon
  quantity: number
}
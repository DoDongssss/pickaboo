export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'
export type BookingStatus = 'PENDING_PAYMENT' | 'FOR_VERIFICATION' | 'CONFIRMED' | 'CANCELLED'
export type MatchType   = 'COURT' | 'FREE'
export type MatchStatus = 'WAITING' | 'LIVE' | 'FINISHED'
export type Team        = 'A' | 'B'
export type PlayerRole  = 'player' | 'scorekeeper'

export interface User {
  id: string; name: string; email: string; avatar_url?: string
  skill_level: SkillLevel; created_at: string
}

export interface CourtImage {
  id: string; court_id: string; image_url: string; display_order: 1|2|3
}

export interface CourtAmenity {
  id: string; court_id: string; name: string; icon: string
  is_available: boolean; created_at: string
}

export interface Court {
  id: string; name: string; description: string; is_active: boolean
  latitude: number; longitude: number; address: string
  price_per_hour: number; open_time: string; close_time: string
  images: CourtImage[]; amenities: CourtAmenity[]; created_at: string
}

export interface Addon {
  id: string; name: string; description: string
  price: number; is_active: boolean; created_at: string
}

export interface BookingAddon {
  id: string; booking_id: string; addon_id: string; addon?: Addon
  quantity: number; unit_price: number; subtotal: number; created_at: string
}

export interface Booking {
  id: string; user_id: string; court_id: string; court?: Court; user?: User
  booking_date: string; start_time: string; end_time: string; duration_hours: number
  price_per_hour: number; addons_total: number; total_price: number
  status: BookingStatus; payment_proof_url?: string; payment_reference?: string
  addons?: BookingAddon[]; expires_at: string; created_at: string
}

export interface PricingOverride {
  id: string; court_id: string; override_date: string
  price_per_hour: number; label: string; created_at: string
}

export interface MatchPlayer {
  id: string; match_id: string; user_id: string; user?: User
  team: Team; role: PlayerRole
}

export interface MatchScore {
  id: string; match_id: string; set_number: number
  team_a_score: number; team_b_score: number; updated_at: string
}

export interface Match {
  id: string; type: MatchType; court_id?: string; court?: Court
  booking_id?: string; status: MatchStatus; created_by: string
  players: MatchPlayer[]; scores: MatchScore[]
  started_at?: string; ended_at?: string; created_at: string
}

export interface PlayerStats {
  id: string; user_id: string; total_matches: number
  wins: number; losses: number; updated_at: string
}

export interface SelectedAddon { addon: Addon; quantity: number }

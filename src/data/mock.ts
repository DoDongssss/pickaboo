import type { Court, Booking, Match, User, PlayerStats, Addon, PricingOverride } from '../types'

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Juan dela Cruz',  email: 'juan@email.com',          skill_level: 'intermediate', created_at: '2024-01-10' },
  { id: 'u2', name: 'Maria Santos',    email: 'maria@email.com',         skill_level: 'advanced',     created_at: '2024-01-12' },
  { id: 'u3', name: 'Rodel Reyes',     email: 'rodel@email.com',         skill_level: 'beginner',     created_at: '2024-02-01' },
  { id: 'u4', name: 'Ana Lim',         email: 'ana@email.com',           skill_level: 'intermediate', created_at: '2024-02-15' },
  { id: 'u5', name: 'Carlo Mendoza',   email: 'carlo@email.com',         skill_level: 'advanced',     created_at: '2024-03-01' },
  { id: 'u6', name: 'Admin User',      email: 'admin@pickleball.com',    skill_level: 'advanced',     created_at: '2024-01-01' },
]

// All mock accounts use this password
export const MOCK_PASSWORD = 'password123'

export const MOCK_COURTS: Court[] = [
  {
    id: 'c1', name: 'Court A — Main Hall', is_active: true,
    description: 'Indoor · Professional net · Air-conditioned',
    latitude: 7.2047, longitude: 124.2310,
    address: 'Purok 3, Libungan, Cotabato',
    price_per_hour: 300, open_time: '05:00', close_time: '22:00',
    images: [{ id: 'ci1', court_id: 'c1', image_url: '', display_order: 1 }],
    amenities: [
      { id: 'a1', court_id: 'c1', name: 'Restroom',         icon: 'toilet',   is_available: true,  created_at: '' },
      { id: 'a2', court_id: 'c1', name: 'Washing Area',     icon: 'shower',   is_available: true,  created_at: '' },
      { id: 'a3', court_id: 'c1', name: 'Chairs',           icon: 'chair',    is_available: true,  created_at: '' },
      { id: 'a4', court_id: 'c1', name: 'Drinking Water',   icon: 'water',    is_available: true,  created_at: '' },
      { id: 'a5', court_id: 'c1', name: 'Court Lighting',   icon: 'light',    is_available: true,  created_at: '' },
      { id: 'a6', court_id: 'c1', name: 'First Aid',        icon: 'firstaid', is_available: false, created_at: '' },
    ],
    created_at: '2024-01-01',
  },
  {
    id: 'c2', name: 'Court B — East Wing', is_active: true,
    description: 'Indoor · Tournament grade · Electronic scoreboard',
    latitude: 7.2052, longitude: 124.2325,
    address: 'Purok 5, Libungan, Cotabato',
    price_per_hour: 350, open_time: '06:00', close_time: '22:00',
    images: [{ id: 'ci2', court_id: 'c2', image_url: '', display_order: 1 }],
    amenities: [
      { id: 'a7',  court_id: 'c2', name: 'Restroom',       icon: 'toilet',  is_available: true, created_at: '' },
      { id: 'a8',  court_id: 'c2', name: 'Tables',         icon: 'table',   is_available: true, created_at: '' },
      { id: 'a9',  court_id: 'c2', name: 'Paddle Rack',    icon: 'paddle',  is_available: true, created_at: '' },
      { id: 'a10', court_id: 'c2', name: 'Court Lighting', icon: 'light',   is_available: true, created_at: '' },
    ],
    created_at: '2024-01-01',
  },
  {
    id: 'c3', name: 'Court C — Outdoor', is_active: true,
    description: 'Open air · Natural light · Shaded spectator stands',
    latitude: 7.2035, longitude: 124.2298,
    address: 'Brgy. Calagan, Libungan, Cotabato',
    price_per_hour: 200, open_time: '05:00', close_time: '20:00',
    images: [{ id: 'ci3', court_id: 'c3', image_url: '', display_order: 1 }],
    amenities: [
      { id: 'a11', court_id: 'c3', name: 'Chairs',    icon: 'chair',    is_available: true, created_at: '' },
      { id: 'a12', court_id: 'c3', name: 'Tables',    icon: 'table',    is_available: true, created_at: '' },
      { id: 'a13', court_id: 'c3', name: 'First Aid', icon: 'firstaid', is_available: true, created_at: '' },
    ],
    created_at: '2024-01-01',
  },
]

export const MOCK_ADDONS: Addon[] = [
  { id: 'ad1', name: 'Extra Paddle',  description: 'Tournament-grade pickleball paddle', price: 50, is_active: true,  created_at: '' },
  { id: 'ad2', name: 'Chair Rental',  description: 'Plastic chair for spectators',        price: 30, is_active: true,  created_at: '' },
  { id: 'ad3', name: 'Water Bottle',  description: '500ml cold drinking water',            price: 20, is_active: true,  created_at: '' },
  { id: 'ad4', name: 'Towel Rental',  description: 'Fresh towel for your session',         price: 25, is_active: true,  created_at: '' },
  { id: 'ad5', name: 'Ball Pack (3)', description: 'Set of 3 pickleballs',                 price: 80, is_active: false, created_at: '' },
]

export const MOCK_PRICING_OVERRIDES: PricingOverride[] = [
  { id: 'po1', court_id: 'c1', override_date: '2026-05-01', price_per_hour: 400, label: 'Labor Day Rate', created_at: '' },
  { id: 'po2', court_id: 'c2', override_date: '2026-05-01', price_per_hour: 450, label: 'Labor Day Rate', created_at: '' },
]

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1', user_id: 'u1', court_id: 'c1', user: MOCK_USERS[0], court: MOCK_COURTS[0],
    booking_date: '2026-05-01', start_time: '10:00', end_time: '12:00',
    duration_hours: 2, price_per_hour: 400, addons_total: 130, total_price: 930,
    status: 'FOR_VERIFICATION', payment_reference: 'GCash #98123',
    addons: [
      { id: 'ba1', booking_id: 'b1', addon_id: 'ad1', addon: MOCK_ADDONS[0], quantity: 2, unit_price: 50, subtotal: 100, created_at: '' },
      { id: 'ba2', booking_id: 'b1', addon_id: 'ad3', addon: MOCK_ADDONS[2], quantity: 3, unit_price: 10, subtotal: 30,  created_at: '' },
    ],
    expires_at: '2026-05-01T11:00:00', created_at: '2026-04-30T08:00:00',
  },
  {
    id: 'b2', user_id: 'u2', court_id: 'c2', user: MOCK_USERS[1], court: MOCK_COURTS[1],
    booking_date: '2026-05-01', start_time: '14:00', end_time: '16:00',
    duration_hours: 2, price_per_hour: 350, addons_total: 0, total_price: 700,
    status: 'CONFIRMED', payment_reference: 'Maya #44512',
    expires_at: '2026-05-01T15:00:00', created_at: '2026-04-29T10:00:00',
  },
  {
    id: 'b3', user_id: 'u3', court_id: 'c3', user: MOCK_USERS[2], court: MOCK_COURTS[2],
    booking_date: '2026-05-02', start_time: '08:00', end_time: '10:00',
    duration_hours: 2, price_per_hour: 200, addons_total: 0, total_price: 400,
    status: 'CANCELLED', expires_at: '2026-05-02T09:00:00', created_at: '2026-04-28T09:00:00',
  },
  {
    id: 'b4', user_id: 'u4', court_id: 'c1', user: MOCK_USERS[3], court: MOCK_COURTS[0],
    booking_date: '2026-05-02', start_time: '10:00', end_time: '13:00',
    duration_hours: 3, price_per_hour: 300, addons_total: 80, total_price: 980,
    status: 'PENDING_PAYMENT', expires_at: '2026-05-01T21:00:00', created_at: '2026-04-30T16:00:00',
  },
  {
    id: 'b5', user_id: 'u5', court_id: 'c2', user: MOCK_USERS[4], court: MOCK_COURTS[1],
    booking_date: '2026-05-03', start_time: '08:00', end_time: '11:00',
    duration_hours: 3, price_per_hour: 350, addons_total: 50, total_price: 1100,
    status: 'CONFIRMED', payment_reference: 'BDO #77231',
    expires_at: '2026-05-02T22:00:00', created_at: '2026-04-30T12:00:00',
  },
]

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1', type: 'COURT', court_id: 'c1', booking_id: 'b2',
    court: MOCK_COURTS[0], status: 'LIVE', created_by: 'u1',
    players: [
      { id: 'mp1', match_id: 'm1', user_id: 'u1', user: MOCK_USERS[0], team: 'A', role: 'player' },
      { id: 'mp2', match_id: 'm1', user_id: 'u2', user: MOCK_USERS[1], team: 'A', role: 'scorekeeper' },
      { id: 'mp3', match_id: 'm1', user_id: 'u3', user: MOCK_USERS[2], team: 'B', role: 'player' },
      { id: 'mp4', match_id: 'm1', user_id: 'u4', user: MOCK_USERS[3], team: 'B', role: 'player' },
    ],
    scores: [
      { id: 's1', match_id: 'm1', set_number: 1, team_a_score: 11, team_b_score: 8, updated_at: '' },
      { id: 's2', match_id: 'm1', set_number: 2, team_a_score: 7,  team_b_score: 9, updated_at: '' },
    ],
    started_at: '2026-04-30T14:05:00', created_at: '2026-04-30T14:00:00',
  },
  {
    id: 'm2', type: 'FREE', status: 'WAITING', created_by: 'u5',
    players: [{ id: 'mp5', match_id: 'm2', user_id: 'u5', user: MOCK_USERS[4], team: 'A', role: 'player' }],
    scores: [], created_at: '2026-04-30T15:00:00',
  },
  {
    id: 'm3', type: 'COURT', court_id: 'c2', court: MOCK_COURTS[1], status: 'FINISHED',
    created_by: 'u2',
    players: [
      { id: 'mp6', match_id: 'm3', user_id: 'u2', user: MOCK_USERS[1], team: 'A', role: 'player' },
      { id: 'mp7', match_id: 'm3', user_id: 'u4', user: MOCK_USERS[3], team: 'A', role: 'player' },
      { id: 'mp8', match_id: 'm3', user_id: 'u1', user: MOCK_USERS[0], team: 'B', role: 'player' },
      { id: 'mp9', match_id: 'm3', user_id: 'u3', user: MOCK_USERS[2], team: 'B', role: 'player' },
    ],
    scores: [
      { id: 's3', match_id: 'm3', set_number: 1, team_a_score: 11, team_b_score: 5, updated_at: '' },
      { id: 's4', match_id: 'm3', set_number: 2, team_a_score: 11, team_b_score: 7, updated_at: '' },
    ],
    started_at: '2026-04-30T10:00:00', ended_at: '2026-04-30T11:30:00',
    created_at: '2026-04-30T09:55:00',
  },
]

export const MOCK_STATS: PlayerStats[] = [
  { id: 'ps1', user_id: 'u1', total_matches: 12, wins: 7,  losses: 5, updated_at: '' },
  { id: 'ps2', user_id: 'u2', total_matches: 20, wins: 15, losses: 5, updated_at: '' },
  { id: 'ps3', user_id: 'u3', total_matches: 4,  wins: 1,  losses: 3, updated_at: '' },
  { id: 'ps4', user_id: 'u4', total_matches: 8,  wins: 4,  losses: 4, updated_at: '' },
  { id: 'ps5', user_id: 'u5', total_matches: 16, wins: 11, losses: 5, updated_at: '' },
]

export const CURRENT_USER = MOCK_USERS[0]

// ── Helpers ──
export function getEffectivePrice(courtId: string, date: string): number {
  const override = MOCK_PRICING_OVERRIDES.find(o => o.court_id === courtId && o.override_date === date)
  if (override) return override.price_per_hour
  return MOCK_COURTS.find(c => c.id === courtId)?.price_per_hour ?? 0
}

export function getOccupiedSlots(courtId: string, date: string) {
  return MOCK_BOOKINGS
    .filter(b => b.court_id === courtId && b.booking_date === date && b.status !== 'CANCELLED')
    .map(b => ({ start: b.start_time, end: b.end_time }))
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(m: number): string {
  const h = Math.floor(m / 60).toString().padStart(2, '0')
  const min = (m % 60).toString().padStart(2, '0')
  return `${h}:${min}`
}

export function durationHours(start: string, end: string): number {
  return (timeToMinutes(end) - timeToMinutes(start)) / 60
}

export const TIME_SLOTS = ['08:00','10:00','12:00','14:00','16:00','18:00']
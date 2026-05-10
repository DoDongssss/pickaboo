-- ============================================
-- MATCHES
-- ============================================

CREATE TYPE public.match_type AS ENUM ('COURT', 'FREE');

CREATE TYPE public.match_status AS ENUM ('WAITING', 'LIVE', 'FINISHED');

CREATE TABLE public.matches (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       public.match_type NOT NULL DEFAULT 'FREE',
  court_id   UUID REFERENCES public.courts(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  status     public.match_status NOT NULL DEFAULT 'WAITING',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ,
  ended_at   TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- MATCH PLAYERS
-- ============================================

CREATE TABLE public.match_players (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team     TEXT NOT NULL CHECK (team IN ('A', 'B')),
  role     TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'scorekeeper')),

  -- One player per match
  UNIQUE (match_id, user_id)
);

-- ============================================
-- MATCH SCORES (Realtime)
-- ============================================

CREATE TABLE public.match_scores (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id     UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  set_number   INT NOT NULL DEFAULT 1 CHECK (set_number > 0),
  team_a_score INT NOT NULL DEFAULT 0 CHECK (team_a_score >= 0),
  team_b_score INT NOT NULL DEFAULT 0 CHECK (team_b_score >= 0),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One score row per set per match
  UNIQUE (match_id, set_number)
);

-- ============================================
-- PLAYER STATS
-- ============================================

CREATE TABLE public.player_stats (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  total_matches INT NOT NULL DEFAULT 0,
  wins          INT NOT NULL DEFAULT 0,
  losses        INT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create player_stats row when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.player_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_init_stats
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_player_stats();

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Bookings: fast overlap detection + date queries
CREATE INDEX idx_bookings_court_date
  ON public.bookings (court_id, booking_date, start_time, end_time);

CREATE INDEX idx_bookings_user
  ON public.bookings (user_id);

CREATE INDEX idx_bookings_status
  ON public.bookings (status);

-- Booking add-ons: fast lookup per booking
CREATE INDEX idx_booking_addons_booking
  ON public.booking_addons (booking_id);

-- Court amenities: fast lookup per court
CREATE INDEX idx_court_amenities_court
  ON public.court_amenities (court_id);

-- Court images: fast lookup per court
CREATE INDEX idx_court_images_court
  ON public.court_images (court_id);

-- Pricing overrides: fast date lookup per court
CREATE INDEX idx_pricing_overrides_court_date
  ON public.court_pricing_overrides (court_id, override_date);

-- Matches: filter by status for live page
CREATE INDEX idx_matches_status
  ON public.matches (status);

-- Match scores: fast realtime lookup per match
CREATE INDEX idx_match_scores_match
  ON public.match_scores (match_id);

-- Booking locks: expiry cleanup queries
CREATE INDEX idx_booking_locks_expires
  ON public.booking_locks (expires_at);
-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_images           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_amenities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_pricing_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_addons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_locks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_scores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats           ENABLE ROW LEVEL SECURITY;


-- ============================================
-- USERS TABLE
-- ============================================

-- Anyone logged in can view any profile (needed for match player display)
CREATE POLICY "users_select_authenticated"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin can update any user (e.g. promote to admin, change skill level)
CREATE POLICY "users_update_admin"
  ON public.users FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Insert handled by trigger only — no direct inserts allowed
-- (the handle_new_user trigger runs as SECURITY DEFINER, bypasses RLS)


-- ============================================
-- COURTS TABLE
-- ============================================

-- Public can view active courts
CREATE POLICY "courts_select_public"
  ON public.courts FOR SELECT
  USING (is_active = true);

-- Admin can view all courts (including inactive)
CREATE POLICY "courts_select_admin"
  ON public.courts FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admin only: create, update, delete courts
CREATE POLICY "courts_insert_admin"
  ON public.courts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "courts_update_admin"
  ON public.courts FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "courts_delete_admin"
  ON public.courts FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- COURT IMAGES
-- ============================================

-- Public can view all court images
CREATE POLICY "court_images_select_public"
  ON public.court_images FOR SELECT
  USING (true);

-- Admin only: manage images
CREATE POLICY "court_images_insert_admin"
  ON public.court_images FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "court_images_update_admin"
  ON public.court_images FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "court_images_delete_admin"
  ON public.court_images FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- COURT AMENITIES
-- ============================================

-- Public can view amenities
CREATE POLICY "court_amenities_select_public"
  ON public.court_amenities FOR SELECT
  USING (true);

-- Admin only: manage amenities
CREATE POLICY "court_amenities_insert_admin"
  ON public.court_amenities FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "court_amenities_update_admin"
  ON public.court_amenities FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "court_amenities_delete_admin"
  ON public.court_amenities FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- COURT PRICING OVERRIDES
-- ============================================

-- Authenticated users can view overrides (needed during booking flow)
CREATE POLICY "pricing_overrides_select_authenticated"
  ON public.court_pricing_overrides FOR SELECT
  TO authenticated
  USING (true);

-- Admin only: manage overrides
CREATE POLICY "pricing_overrides_insert_admin"
  ON public.court_pricing_overrides FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "pricing_overrides_update_admin"
  ON public.court_pricing_overrides FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "pricing_overrides_delete_admin"
  ON public.court_pricing_overrides FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- ADD-ONS
-- ============================================

-- Authenticated users can view active add-ons (booking flow)
CREATE POLICY "addons_select_authenticated"
  ON public.addons FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admin can view all add-ons including inactive
CREATE POLICY "addons_select_admin"
  ON public.addons FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admin only: manage add-ons catalog
CREATE POLICY "addons_insert_admin"
  ON public.addons FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "addons_update_admin"
  ON public.addons FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "addons_delete_admin"
  ON public.addons FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- BOOKINGS
-- ============================================

-- Users can view their own bookings
CREATE POLICY "bookings_select_own"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin can view all bookings
CREATE POLICY "bookings_select_admin"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Authenticated users can create their own bookings
CREATE POLICY "bookings_insert_own"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update own booking (e.g. upload payment proof)
-- but only if still in PENDING_PAYMENT or FOR_VERIFICATION
CREATE POLICY "bookings_update_own"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status IN ('PENDING_PAYMENT', 'FOR_VERIFICATION')
  )
  WITH CHECK (user_id = auth.uid());

-- Admin can update any booking (approve, reject, etc.)
CREATE POLICY "bookings_update_admin"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Only admin can hard delete bookings
CREATE POLICY "bookings_delete_admin"
  ON public.bookings FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- BOOKING ADD-ONS
-- ============================================

-- Users can view add-ons on their own bookings
CREATE POLICY "booking_addons_select_own"
  ON public.booking_addons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_addons.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Admin can view all booking add-ons
CREATE POLICY "booking_addons_select_admin"
  ON public.booking_addons FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Users can insert add-ons only for their own bookings
CREATE POLICY "booking_addons_insert_own"
  ON public.booking_addons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_addons.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Admin can manage all booking add-ons
CREATE POLICY "booking_addons_delete_admin"
  ON public.booking_addons FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- BOOKING LOCKS
-- ============================================

-- Users can view their own locks
CREATE POLICY "booking_locks_select_own"
  ON public.booking_locks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin can view all locks
CREATE POLICY "booking_locks_select_admin"
  ON public.booking_locks FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Authenticated users can create locks for themselves
CREATE POLICY "booking_locks_insert_own"
  ON public.booking_locks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own locks (cancel/release)
CREATE POLICY "booking_locks_delete_own"
  ON public.booking_locks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admin can delete any lock
CREATE POLICY "booking_locks_delete_admin"
  ON public.booking_locks FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- MATCHES
-- ============================================

-- Public can view LIVE matches (live scoreboard page)
CREATE POLICY "matches_select_live_public"
  ON public.matches FOR SELECT
  USING (status = 'LIVE');

-- Authenticated users can view all matches
CREATE POLICY "matches_select_authenticated"
  ON public.matches FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create matches
CREATE POLICY "matches_insert_authenticated"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Match creator or admin can update match
CREATE POLICY "matches_update_own_or_admin"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_admin()
  );

-- Admin only: delete matches
CREATE POLICY "matches_delete_admin"
  ON public.matches FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- MATCH PLAYERS
-- ============================================

-- Authenticated users can view match players
CREATE POLICY "match_players_select_authenticated"
  ON public.match_players FOR SELECT
  TO authenticated
  USING (true);

-- Match creator or admin can add players
CREATE POLICY "match_players_insert_authorized"
  ON public.match_players FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_players.match_id
      AND (matches.created_by = auth.uid() OR public.is_admin())
    )
  );

-- Match creator or admin can remove players
CREATE POLICY "match_players_delete_authorized"
  ON public.match_players FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_players.match_id
      AND (matches.created_by = auth.uid() OR public.is_admin())
    )
  );


-- ============================================
-- MATCH SCORES
-- ============================================

-- Public can view scores (live scoreboard)
CREATE POLICY "match_scores_select_public"
  ON public.match_scores FOR SELECT
  USING (true);

-- Only match participants (scorekeeper/player) or admin can insert scores
CREATE POLICY "match_scores_insert_participant"
  ON public.match_scores FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_match_participant(match_id)
    OR public.is_admin()
  );

-- Only match participants or admin can update scores
CREATE POLICY "match_scores_update_participant"
  ON public.match_scores FOR UPDATE
  TO authenticated
  USING (
    public.is_match_participant(match_id)
    OR public.is_admin()
  );

-- Admin only: delete scores
CREATE POLICY "match_scores_delete_admin"
  ON public.match_scores FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================
-- PLAYER STATS
-- ============================================

-- Anyone authenticated can view player stats
CREATE POLICY "player_stats_select_authenticated"
  ON public.player_stats FOR SELECT
  TO authenticated
  USING (true);

-- Stats are updated by triggers/admin only — no direct user updates
CREATE POLICY "player_stats_update_admin"
  ON public.player_stats FOR UPDATE
  TO authenticated
  USING (public.is_admin());